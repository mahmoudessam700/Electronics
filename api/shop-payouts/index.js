// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    resolveShopContext,
    ensureShopRole,
    createError,
    generateId,
    SHOP_FINANCE_ROLES,
} = require('../_utils/auth');
const {
    getLatestBalance,
    recordPayoutLedgerEntry,
} = require('../_utils/ledger');

const pool = getPool();

const normalizeQueryValue = (value) => {
    if (Array.isArray(value)) return value[0];
    return value;
};

const listPayouts = async ({ shopId, status }) => {
    const params = [shopId];
    let whereClause = 'WHERE sp."shopId" = $1';
    if (status) {
        params.push(status);
        whereClause += ` AND sp.status = $${params.length}`;
    }

    const { rows } = await pool.query(
        `
        SELECT sp.id, sp."shopId", sp.amount, sp.currency, sp.status, sp."scheduledFor", sp."processedAt",
               sp.reference, sp.notes, sp."preferenceId", sp."createdAt", sp."updatedAt",
               COALESCE(stats."orderCount", 0) AS "orderCount",
               COALESCE(stats."orderTotal", 0) AS "orderTotal"
        FROM "ShopPayout" sp
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
        LIMIT 100
    `,
        params,
    );
    return rows;
};

const summarizeAwaitingOrders = async (executor, shopId) => {
    const runner = executor || pool;
    const { rows } = await runner.query(
        `
        SELECT COUNT(*)::int AS count,
               COALESCE(SUM(("totalAmount" - "commissionTotal")), 0) AS amount
        FROM "Order"
        WHERE "shopId" = $1
          AND status = 'DELIVERED'
          AND "shopPayoutStatus" = 'NOT_REQUESTED'
    `,
        [shopId],
    );
    const summary = rows[0] || { count: 0, amount: 0 };
    summary.amount = Number(summary.amount) || 0;
    summary.count = Number(summary.count) || 0;
    return summary;
};

const fetchAttachableOrders = async (client, shopId) => {
    const { rows } = await client.query(
        `
        SELECT id, "totalAmount", "commissionTotal"
        FROM "Order"
        WHERE "shopId" = $1
          AND status = 'DELIVERED'
          AND "shopPayoutStatus" = 'NOT_REQUESTED'
        ORDER BY "createdAt" ASC
        FOR UPDATE
    `,
        [shopId],
    );
    return rows
        .map((row) => {
            const gross = Number(row.totalAmount) || 0;
            const commission = Number(row.commissionTotal) || 0;
            const netAmount = gross - commission;
            return { id: row.id, netAmount: Math.max(netAmount, 0) };
        })
        .filter((entry) => entry.netAmount > 0);
};

const selectOrdersForAmount = (orders, requestedAmount) => {
    if (!orders.length) {
        return { selected: [], total: 0 };
    }
    const desired = Number(requestedAmount);
    const fullAmount = orders.reduce((sum, order) => sum + order.netAmount, 0);
    const target = Number.isFinite(desired) && desired > 0 ? desired : fullAmount;
    const selected = [];
    let runningTotal = 0;
    for (const order of orders) {
        selected.push(order);
        runningTotal += order.netAmount;
        if (runningTotal + 1e-6 >= target) {
            break;
        }
    }
    return { selected, total: runningTotal };
};

const parseScheduledDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(400, 'Invalid scheduledFor date');
    }
    return date;
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const user = await requireAuth(req);
        const providedShopId = normalizeQueryValue(req.query.shopId);
        const context = resolveShopContext(user, providedShopId);

        if (req.method === 'GET') {
            ensureShopRole(user, context.shopId, SHOP_FINANCE_ROLES);
            const status = normalizeQueryValue(req.query.status);
            const payouts = await listPayouts({ shopId: context.shopId, status });
            const balance = await getLatestBalance(pool, context.shopId);
            const eligibleOrders = await summarizeAwaitingOrders(pool, context.shopId);
            return res.status(200).json({ payouts, balance, eligibleOrders });
        }

        if (req.method === 'POST') {
            ensureShopRole(user, context.shopId, SHOP_FINANCE_ROLES);
            const { amount, currency = 'EGP', notes, scheduledFor, reference: providedReference } = req.body || {};
            const requestedAmount = Number(amount);
            if (amount && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) {
                throw createError(400, 'Invalid requested amount');
            }

            const reference = (providedReference || '').trim() || `SP-${Date.now()}`;
            const scheduleDate = parseScheduledDate(scheduledFor);

            const result = await withTransaction(async (client) => {
                const currentBalance = await getLatestBalance(client, context.shopId);
                const attachableOrders = await fetchAttachableOrders(client, context.shopId);
                if (!attachableOrders.length) {
                    throw createError(422, 'No delivered orders are ready for payout');
                }

                const totalAttachable = attachableOrders.reduce((sum, entry) => sum + entry.netAmount, 0);
                if (requestedAmount > totalAttachable) {
                    throw createError(422, 'Requested amount exceeds delivered balance');
                }

                const desiredTarget = Number.isFinite(requestedAmount) && requestedAmount > 0 ? requestedAmount : totalAttachable;
                const cappedTarget = Math.min(desiredTarget, currentBalance);
                if (cappedTarget <= 0) {
                    throw createError(422, 'Insufficient balance for payout');
                }
                const { selected, total } = selectOrdersForAmount(attachableOrders, cappedTarget);

                if (!selected.length || total <= 0) {
                    throw createError(422, 'No payable orders matched the request');
                }

                const orderIds = selected.map((entry) => entry.id);
                const payoutId = generateId('sp');
                const preferenceId = await fetchPayoutPreference(client, context.shopId);

                const { rows } = await client.query(
                    `
                    INSERT INTO "ShopPayout" (
                        id, "shopId", amount, currency, status, "scheduledFor", reference, notes, "preferenceId", "createdAt", "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $7, $8, NOW(), NOW())
                    RETURNING id, "shopId", amount, currency, status, "scheduledFor", "processedAt",
                              reference, notes, "preferenceId", "createdAt", "updatedAt"
                `,
                    [
                        payoutId,
                        context.shopId,
                        total,
                        currency,
                        scheduleDate,
                        reference,
                        notes || null,
                        preferenceId,
                    ],
                );

                await client.query(
                    `
                    UPDATE "Order"
                    SET "shopPayoutId" = $1,
                        "shopPayoutStatus" = 'QUEUED',
                        "updatedAt" = NOW()
                    WHERE id = ANY($2::text[])
                `,
                    [payoutId, orderIds],
                );

                const ledgerEntry = await recordPayoutLedgerEntry(client, {
                    shopId: context.shopId,
                    payoutId,
                    amount: total,
                    reference,
                    description: notes || `Payout ${reference}`,
                    metadata: { initiatedBy: user.id, orderIds },
                });

                return {
                    payout: {
                        ...rows[0],
                        orderCount: orderIds.length,
                        orderTotal: total,
                    },
                    ledgerEntry,
                    balance: ledgerEntry?.balanceAfter ?? currentBalance - total,
                    ordersAttached: { ids: orderIds, count: orderIds.length, total },
                };
            });

            return res.status(201).json(result);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Shop payouts API error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
