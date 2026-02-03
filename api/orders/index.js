// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    getRequestContext,
    createError,
    generateId,
} = require('../_utils/auth');
const { calculateCommission } = require('../_utils/pricing');
const { recordOrderLedgerEntries } = require('../_utils/ledger');

const pool = getPool();

const ORDER_STATUS_SET = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const SHOP_PAYOUT_STATUS_SET = new Set(['NOT_REQUESTED', 'QUEUED', 'PAID_OUT', 'WITHHELD']);

const normalizeQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const baseOrderSelect = `
    SELECT o.*,
           (
               SELECT json_agg(
                   json_build_object(
                       'id', oi.id,
                       'orderId', oi."orderId",
                       'productId', oi."productId",
                       'quantity', oi.quantity,
                       'price', oi.price,
                       'commissionRateApplied', oi."commissionRateApplied",
                       'commissionAmount', oi."commissionAmount",
                       'netRevenue', oi."netRevenue",
                       'productName', COALESCE(p.name, oi."productId"),
                       'productImage', p.image
                   )
               )
               FROM "OrderItem" oi
               LEFT JOIN "Product" p ON p.id = oi."productId"
               WHERE oi."orderId" = o.id
           ) AS items
    FROM "Order" o
`;

const getScope = (user) => {
    if (user.role === 'ADMIN') {
        return { mode: 'ADMIN' };
    }

    const memberships = user.shopMemberships || [];
    if ((user.role === 'SHOP_OWNER' || user.role === 'SHOP_STAFF') && memberships.length > 0) {
        return { mode: 'SHOP', shopIds: memberships.map((entry) => entry.shopId) };
    }

    return { mode: 'CUSTOMER', userId: user.id };
};

const ensureShopScope = (scope) => {
    if (scope.mode === 'SHOP' && (!scope.shopIds || scope.shopIds.length === 0)) {
        throw createError(403, 'No shop access configured for this account');
    }
};

const getOrderWithItems = async (whereClause, params) => {
    const { rows } = await pool.query(`${baseOrderSelect} ${whereClause}`, params);
    return rows[0] || null;
};

const prepareOrderItems = async (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw createError(400, 'At least one item is required');
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    if (uniqueProductIds.length === 0) {
        throw createError(400, 'Each item must include a productId');
    }

    const { rows } = await pool.query(`
         SELECT p.id,
             p.name,
             p.price,
             p."shopId",
             p."commissionRate",
             sh."defaultCommissionRate" AS "shopCommissionRate"
        FROM "Product" p
        LEFT JOIN "Shop" sh ON sh.id = p."shopId"
        WHERE p.id = ANY($1::text[])
    `, [uniqueProductIds]);

    if (rows.length !== uniqueProductIds.length) {
        throw createError(400, 'One or more products were not found');
    }

    const productMap = new Map(rows.map((row) => [row.id, row]));
    const shopKeySet = new Set(rows.map((row) => row.shopId || 'GLOBAL'));
    if (shopKeySet.size > 1) {
        throw createError(400, 'Orders can only contain products from a single shop');
    }

    const shopId = rows[0] ? rows[0].shopId : null;
    let subtotal = 0;
    let commissionTotal = 0;

    const preparedItems = items.map((item) => {
        if (!item.productId) {
            throw createError(400, 'Item missing productId');
        }
        const product = productMap.get(item.productId);
        if (!product) {
            throw createError(400, 'Invalid product in cart');
        }
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const pricing = calculateCommission(product.price, product.commissionRate, product.shopCommissionRate);
        const unitPrice = product.price;
        const commissionPerUnit = pricing.commissionAmount;
        const commissionAmount = commissionPerUnit * quantity;
        const grossLineAmount = unitPrice * quantity;
        const netRevenue = grossLineAmount - commissionAmount;

        subtotal += grossLineAmount;
        commissionTotal += commissionAmount;

        return {
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice,
            commissionRate: pricing.rate,
            commissionPerUnit,
            commissionAmount,
            netRevenue,
            displayPricePerUnit: pricing.displayPrice,
        };
    });

    return {
        shopId,
        items: preparedItems,
        subtotal,
        commissionTotal,
        displayTotal: subtotal + commissionTotal,
    };
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const user = await requireAuth(req);
            const scope = getScope(user);
            ensureShopScope(scope);

            const { id } = req.query;
            const requestedShopId = normalizeQueryValue(req.query.shopId);
            const statusFilter = normalizeQueryValue(req.query.status);
            const payoutStatusFilter = normalizeQueryValue(req.query.payoutStatus);
            const payoutIdFilter = normalizeQueryValue(req.query.shopPayoutId || req.query.payoutId);

            if (statusFilter && !ORDER_STATUS_SET.has(statusFilter)) {
                throw createError(400, 'Invalid status filter');
            }
            if (payoutStatusFilter && !SHOP_PAYOUT_STATUS_SET.has(payoutStatusFilter)) {
                throw createError(400, 'Invalid payout status filter');
            }
            if (payoutIdFilter && scope.mode === 'CUSTOMER') {
                throw createError(400, 'shopPayoutId filter is not available for this account');
            }

            if (id) {
                let whereClause = 'WHERE (o.id = $1 OR o."orderNumber" = $1)';
                const params = [id];

                if (scope.mode === 'SHOP') {
                    params.push(scope.shopIds);
                    whereClause += ` AND o."shopId" = ANY($${params.length}::text[])`;
                } else if (scope.mode === 'CUSTOMER') {
                    params.push(scope.userId);
                    whereClause += ` AND o."userId" = $${params.length}`;
                }

                const order = await getOrderWithItems(whereClause, params);
                if (!order) return res.status(404).json({ error: 'Order not found' });
                return res.json(order);
            }

            const conditions = [];
            const params = [];

            if (scope.mode === 'SHOP' && !requestedShopId) {
                params.push(scope.shopIds);
                conditions.push(`o."shopId" = ANY($${params.length}::text[])`);
            } else if (scope.mode === 'CUSTOMER') {
                params.push(scope.userId);
                conditions.push(`o."userId" = $${params.length}`);
            }

            if (requestedShopId) {
                if (scope.mode === 'ADMIN') {
                    params.push(requestedShopId);
                    conditions.push(`o."shopId" = $${params.length}`);
                } else if (scope.mode === 'SHOP') {
                    if (!(scope.shopIds || []).includes(requestedShopId)) {
                        throw createError(403, 'You do not have access to this shop');
                    }
                    params.push(requestedShopId);
                    conditions.push(`o."shopId" = $${params.length}`);
                } else {
                    throw createError(400, 'shopId filter is not available for this account');
                }
            }

            if (statusFilter) {
                params.push(statusFilter);
                conditions.push(`o.status = $${params.length}`);
            }

            if (payoutStatusFilter) {
                params.push(payoutStatusFilter);
                conditions.push(`o."shopPayoutStatus" = $${params.length}`);
            }

            if (payoutIdFilter) {
                params.push(payoutIdFilter);
                conditions.push(`o."shopPayoutId" = $${params.length}`);
            }

            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const query = `${baseOrderSelect} ${whereClause} ORDER BY o."createdAt" DESC`;
            const { rows } = await pool.query(query, params);
            return res.json(rows);
        }

        if (req.method === 'POST') {
            const { items, totalAmount, customerName, customerEmail, customerPhone, shippingAddress } = req.body;

            const { user } = await getRequestContext(req);
            const userId = user?.id || null;

            const orderComputation = await prepareOrderItems(items);
            const orderId = generateId('ord');
            const orderNumber = `AD${Math.floor(100000 + Math.random() * 900000)}`;
            const finalTotal = Number(totalAmount) || orderComputation.displayTotal;
            const enrichedItems = orderComputation.items.map((item) => ({
                ...item,
                id: generateId('oi'),
            }));

            await withTransaction(async (client) => {
                await client.query(`
                    INSERT INTO "Order" (
                        id, "orderNumber", "totalAmount", "commissionTotal",
                        "customerName", "customerEmail", "customerPhone", "shippingAddress",
                        "userId", "shopId", "shopPayoutStatus", "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                `, [
                    orderId,
                    orderNumber,
                    finalTotal,
                    orderComputation.commissionTotal,
                    customerName || null,
                    customerEmail || null,
                    customerPhone || null,
                    shippingAddress || null,
                    userId,
                    orderComputation.shopId,
                    'NOT_REQUESTED',
                ]);

                for (const item of enrichedItems) {
                    await client.query(`
                        INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price, "commissionRateApplied", "commissionAmount", "netRevenue")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        item.id,
                        orderId,
                        item.productId,
                        item.quantity,
                        item.unitPrice,
                        item.commissionRate || 0,
                        item.commissionAmount || 0,
                        item.netRevenue || 0,
                    ]);
                }

                await recordOrderLedgerEntries(client, {
                    shopId: orderComputation.shopId,
                    orderId,
                    orderNumber,
                    items: enrichedItems,
                });
            });

            try {
                const tax = finalTotal * 0.14;
                const netProfit = finalTotal - tax;

                await pool.query(`
                    UPDATE "FinancialCycle"
                    SET "totalRevenue" = "totalRevenue" + $1,
                        "totalTax" = "totalTax" + $2,
                        "netProfit" = "netProfit" + $3
                    WHERE status = 'OPEN'
                `, [finalTotal, tax, netProfit]);
            } catch (financialError) {
                console.error('Failed to update financial cycle:', financialError);
            }

            const createdOrder = await getOrderWithItems('WHERE o.id = $1', [orderId]);
            return res.status(201).json(createdOrder);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Orders API Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
