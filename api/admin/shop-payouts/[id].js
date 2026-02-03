// @ts-nocheck
const { getPool, withTransaction } = require('../../_utils/db');
const {
    requireAuth,
    ensureRole,
    createError,
} = require('../../_utils/auth');
const {
    getLatestBalance,
    recordPayoutLedgerEntry,
} = require('../../_utils/ledger');

const pool = getPool();
const VALID_STATUSES = new Set(['PENDING', 'SCHEDULED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED']);
const TERMINAL_STATUSES = new Set(['PAID', 'FAILED', 'CANCELLED']);
const RELEASE_STATUSES = new Set(['FAILED', 'CANCELLED']);

const normalizeId = (value) => (Array.isArray(value) ? value[0] : value);

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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const payoutId = normalizeId(req.query.id);
    if (!payoutId) {
        return res.status(400).json({ error: 'Payout id is required' });
    }

    try {
        const user = await requireAuth(req);
        ensureRole(user, ['ADMIN']);

        if (req.method === 'GET') {
            const payout = await fetchPayout(pool, payoutId);
            if (!payout) {
                return res.status(404).json({ error: 'Payout not found' });
            }
            return res.status(200).json({ payout });
        }

        if (req.method === 'PATCH') {
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

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Admin shop payout detail API error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
