// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    createError,
    SHOP_ADMIN_ROLES,
} = require('../_utils/auth');
const {
    recordOrderLedgerEntries,
    LEDGER_TYPE_REVERSAL,
} = require('../_utils/ledger');

const pool = getPool();
const VALID_STATUSES = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

const normalizeIdParam = (value) => {
    if (Array.isArray(value)) return value[0];
    return value;
};

const fetchOrderSummary = async (executor, orderId) => {
    const runner = executor || pool;
    const { rows } = await runner.query(
        'SELECT id, "orderNumber", "shopId", status FROM "Order" WHERE id = $1',
        [orderId],
    );
    return rows[0] || null;
};

const fetchOrderItemsForLedger = async (executor, orderId) => {
    const { rows } = await executor.query(
        `
        SELECT
            oi.id,
            oi."productId",
            oi.quantity,
            oi.price AS "unitPrice",
            oi."commissionRateApplied" AS "commissionRate",
            oi."commissionAmount",
            oi."netRevenue",
            COALESCE(p.name, 'Product') AS "productName"
        FROM "OrderItem" oi
        LEFT JOIN "Product" p ON p.id = oi."productId"
        WHERE oi."orderId" = $1
    `,
        [orderId],
    );
    return rows;
};

const hasShopOrderAccess = (user, shopId) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (!shopId) return false;
    return (user.shopMemberships || []).some(
        (membership) => membership.shopId === shopId && SHOP_ADMIN_ROLES.includes(membership.role),
    );
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const orderId = normalizeIdParam(req.query.id);
    if (!orderId) {
        return res.status(400).json({ error: 'Order id is required' });
    }

    try {
        const user = await requireAuth(req);

        if (req.method === 'PATCH') {
            const { status } = req.body || {};
            if (!status || !VALID_STATUSES.has(status)) {
                return res.status(400).json({ error: 'A valid status is required' });
            }

            const updated = await withTransaction(async (client) => {
                const order = await fetchOrderSummary(client, orderId);
                if (!order) {
                    throw createError(404, 'Order not found');
                }
                if (!hasShopOrderAccess(user, order.shopId)) {
                    throw createError(403, 'You do not have permission to update this order');
                }

                const previousStatus = order.status;
                await client.query(
                    'UPDATE "Order" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
                    [status, orderId],
                );

                if (status === 'CANCELLED' && previousStatus !== 'CANCELLED' && order.shopId) {
                    const items = await fetchOrderItemsForLedger(client, orderId);
                    await recordOrderLedgerEntries(client, {
                        shopId: order.shopId,
                        orderId,
                        orderNumber: order.orderNumber,
                        items,
                        entryType: LEDGER_TYPE_REVERSAL,
                    });
                }

                const { rows } = await client.query(
                    'SELECT id, status, "orderNumber", "shopPayoutStatus", "updatedAt" FROM "Order" WHERE id = $1',
                    [orderId],
                );
                return rows[0];
            });

            return res.status(200).json(updated);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Order detail API error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
