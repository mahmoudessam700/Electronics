// @ts-nocheck
const { getPool, withTransaction } = require('../../_utils/db');
const {
    requireAuth,
    ensureRole,
    createError,
    generateId,
} = require('../../_utils/auth');
const {
    getLatestBalance,
    recordPayoutLedgerEntry,
} = require('../../_utils/ledger');

const pool = getPool();
const VALID_STATUSES = new Set(['PENDING', 'SCHEDULED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED']);
const CREATION_STATUSES = new Set(['PENDING', 'SCHEDULED', 'PROCESSING', 'PAID']);
const TERMINAL_STATUSES = new Set(['PAID', 'FAILED', 'CANCELLED']);
const RELEASE_STATUSES = new Set(['FAILED', 'CANCELLED']);

const normalizeValue = (value) => (Array.isArray(value) ? value[0] : value);

const parseScheduledDate = (value) => {
    if (typeof value === 'undefined') return undefined;
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(400, 'Invalid scheduledFor date');
    }
    return date;
};

const fetchPayout = async (executor, payoutId, { forUpdate = false } = {}) => {
    const runner = executor || pool;
    const lock = forUpdate ? 'FOR UPDATE' : '';
    const { rows } = await runner.query(
        `
        SELECT sp.*, s.name AS "shopName", s.slug AS "shopSlug"
        FROM "ShopPayout" sp
        LEFT JOIN "Shop" s ON s.id = sp."shopId"
        WHERE sp.id = $1
        ${lock}
    `,
        [payoutId],
    );
    return rows[0] || null;
};

const markOrdersPaidOut = async (client, payoutId) => {
    const result = await client.query(
        `
        UPDATE "Order"
        SET "shopPayoutStatus" = 'PAID_OUT',
            "updatedAt" = NOW()
        WHERE "shopPayoutId" = $1
          AND "shopPayoutStatus" <> 'PAID_OUT'
    `,
        [payoutId],
    );
    return result.rowCount || 0;
};

const releaseOrdersFromPayout = async (client, payoutId) => {
    const result = await client.query(
        `
        UPDATE "Order"
        SET "shopPayoutStatus" = 'NOT_REQUESTED',
            "shopPayoutId" = NULL,
            "updatedAt" = NOW()
        WHERE "shopPayoutId" = $1
    `,
        [payoutId],
    );
    return result.rowCount || 0;
};

const listAdminPayouts = async ({ shopId, status }) => {
    const params = [];
    const conditions = [];
    if (shopId) {
        params.push(shopId);
        conditions.push(`sp."shopId" = $${params.length}`);
    }
    if (status) {
        params.push(status);
        conditions.push(`sp.status = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
        `
        SELECT sp.*, s.name AS "shopName", s.slug AS "shopSlug",
               COALESCE(stats."orderCount", 0) AS "orderCount",
               COALESCE(stats."orderTotal", 0) AS "orderTotal"
        FROM "ShopPayout" sp
        LEFT JOIN "Shop" s ON s.id = sp."shopId"
        LEFT JOIN (
            SELECT "shopPayoutId",
                   COUNT(*) AS "orderCount",
                   COALESCE(SUM(("totalAmount" - "commissionTotal")), 0)::double precision AS "orderTotal"
            FROM "Order"
            WHERE "shopPayoutId" IS NOT NULL
            GROUP BY "shopPayoutId"
        ) AS stats ON stats."shopPayoutId" = sp.id
        ${whereClause}
        ORDER BY sp."createdAt" DESC
        LIMIT 200
    `,
        params,
    );
    return rows;
};

const fetchShop = async (client, shopId) => {
    const { rows } = await client.query('SELECT id FROM "Shop" WHERE id = $1', [shopId]);
    return rows[0] || null;
};

const fetchPayoutPreference = async (client, shopId) => {
    const { rows } = await client.query(
        'SELECT id FROM "ShopPayoutPreference" WHERE "shopId" = $1',
        [shopId],
    );
    return rows[0]?.id || null;
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const user = await requireAuth(req);
        ensureRole(user, ['ADMIN']);

        const payoutId = normalizeValue(req.query.id);

        if (req.method === 'GET') {
            // Single payout by ID
            if (payoutId) {
                const payout = await fetchPayout(pool, payoutId);
                if (!payout) {
                    return res.status(404).json({ error: 'Payout not found' });
                }
                return res.status(200).json({ payout });
            }

            // List payouts
            const shopId = normalizeValue(req.query.shopId);
            const status = normalizeValue(req.query.status);
            if (status && !VALID_STATUSES.has(status)) {
                throw createError(400, 'Invalid status filter');
            }
            const payouts = await listAdminPayouts({ shopId, status });
            return res.status(200).json({ payouts });
        }

        if (req.method === 'PATCH') {
            if (!payoutId) {
                return res.status(400).json({ error: 'Payout id is required' });
            }

            const { status, notes, reference, scheduledFor } = req.body || {};
            if (!status && typeof notes === 'undefined' && typeof reference === 'undefined' && typeof scheduledFor === 'undefined') {
                return res.status(400).json({ error: 'At least one field must be provided' });
            }
            if (status && !VALID_STATUSES.has(status)) {
                throw createError(400, 'Invalid status value');
            }

            const result = await withTransaction(async (client) => {
                const payout = await fetchPayout(client, payoutId, { forUpdate: true });
                if (!payout) {
                    throw createError(404, 'Payout not found');
                }

                if (status && payout.status !== status) {
                    if (TERMINAL_STATUSES.has(payout.status)) {
                        throw createError(409, 'Cannot modify a payout that is already finalized');
                    }
                    if (payout.status === 'PROCESSING' && status === 'SCHEDULED') {
                        throw createError(400, 'Invalid status transition');
                    }
                }

                const scheduleValue = parseScheduledDate(scheduledFor);
                const updates = [];
                const params = [];
                const pushUpdate = (clause, value) => {
                    updates.push(`${clause} = $${params.length + 1}`);
                    params.push(value);
                };

                if (status && payout.status !== status) {
                    pushUpdate('status', status);
                    if (status === 'PAID') {
                        pushUpdate('"processedAt"', new Date());
                    }
                }

                if (typeof notes !== 'undefined') {
                    const trimmed = notes ? String(notes).trim() : null;
                    pushUpdate('notes', trimmed);
                }

                if (typeof reference !== 'undefined') {
                    const trimmedRef = reference ? String(reference).trim() : null;
                    if (!trimmedRef) {
                        throw createError(400, 'Reference cannot be empty');
                    }
                    pushUpdate('reference', trimmedRef);
                }

                if (typeof scheduleValue !== 'undefined') {
                    pushUpdate('"scheduledFor"', scheduleValue);
                }

                let updatedRow = payout;
                let ledgerEntry = null;
                let orderSync = null;

                if (updates.length > 0) {
                    params.push(payoutId);
                    const { rows } = await client.query(
                        `
                        UPDATE "ShopPayout"
                        SET ${updates.join(', ')}, "updatedAt" = NOW()
                        WHERE id = $${params.length}
                        RETURNING id, "shopId", amount, currency, status, "scheduledFor", "processedAt",
                                  reference, notes, "preferenceId", "createdAt", "updatedAt"
                    `,
                        params,
                    );
                    updatedRow = rows[0];
                }

                const finalStatus = updatedRow.status;
                if (status && payout.status !== status) {
                    if (status === 'PAID') {
                        const count = await markOrdersPaidOut(client, payout.id);
                        orderSync = { type: 'PAID_OUT', count };
                    } else if (
                        RELEASE_STATUSES.has(status) &&
                        !RELEASE_STATUSES.has(payout.status)
                    ) {
                        const count = await releaseOrdersFromPayout(client, payout.id);
                        orderSync = { type: 'RELEASED', count };
                    }
                }

                if (
                    status &&
                    RELEASE_STATUSES.has(status) &&
                    !RELEASE_STATUSES.has(payout.status)
                ) {
                    const releaseReference = updatedRow.reference || payout.reference;
                    ledgerEntry = await recordPayoutLedgerEntry(client, {
                        shopId: payout.shopId,
                        payoutId: payout.id,
                        amount: payout.amount,
                        reference: releaseReference,
                        description: `Payout ${releaseReference} ${status.toLowerCase()}`,
                        metadata: { source: 'admin', reason: status },
                        direction: 'CREDIT',
                    });
                }

                const balance = await getLatestBalance(client, payout.shopId);
                return {
                    payout: updatedRow,
                    ledgerEntry,
                    balance,
                    previousStatus: payout.status,
                    currentStatus: finalStatus,
                    ordersUpdated: orderSync,
                };
            });

            return res.status(200).json(result);
        }

        if (req.method === 'POST') {
            const { shopId, amount, currency = 'EGP', notes, scheduledFor, status, reference: providedReference } = req.body || {};
            if (!shopId) {
                throw createError(400, 'shopId is required');
            }
            const numericAmount = Number(amount);
            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                throw createError(400, 'A positive amount is required');
            }
            const desiredStatus = status || 'PENDING';
            if (!CREATION_STATUSES.has(desiredStatus)) {
                throw createError(400, 'Invalid status for payout creation');
            }
            const scheduleDate = parseScheduledDate(scheduledFor);
            const reference = (providedReference || '').trim() || `SP-${Date.now()}`;

            const result = await withTransaction(async (client) => {
                const shop = await fetchShop(client, shopId);
                if (!shop) {
                    throw createError(404, 'Shop not found');
                }
                const currentBalance = await getLatestBalance(client, shopId);
                if (numericAmount > currentBalance) {
                    throw createError(422, 'Requested amount exceeds available balance');
                }

                const preferenceId = await fetchPayoutPreference(client, shopId);
                const payoutId = generateId('sp');
                const processedAt = desiredStatus === 'PAID' ? new Date() : null;

                const { rows } = await client.query(
                    `
                    INSERT INTO "ShopPayout" (
                        id, "shopId", amount, currency, status, "scheduledFor", "processedAt",
                        reference, notes, "preferenceId", "createdAt", "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                    RETURNING id, "shopId", amount, currency, status, "scheduledFor", "processedAt",
                              reference, notes, "preferenceId", "createdAt", "updatedAt"
                `,
                    [
                        payoutId,
                        shopId,
                        numericAmount,
                        currency,
                        desiredStatus,
                        scheduleDate,
                        processedAt,
                        reference,
                        notes || null,
                        preferenceId,
                    ],
                );

                const ledgerEntry = await recordPayoutLedgerEntry(client, {
                    shopId,
                    payoutId,
                    amount: numericAmount,
                    reference,
                    description: notes || `Payout ${reference}`,
                    metadata: { initiatedBy: user.id, source: 'admin' },
                });

                return {
                    payout: rows[0],
                    ledgerEntry,
                    balance: ledgerEntry?.balanceAfter ?? currentBalance - numericAmount,
                };
            });

            return res.status(201).json(result);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Admin shop payouts API error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
