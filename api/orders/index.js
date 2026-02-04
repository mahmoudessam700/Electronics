// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    getRequestContext,
    createError,
    generateId,
    SHOP_ADMIN_ROLES,
} = require('../_utils/auth');
const { calculateCommission } = require('../_utils/pricing');
const {
    recordOrderLedgerEntries,
    LEDGER_TYPE_REVERSAL,
} = require('../_utils/ledger');

const pool = getPool();

const ORDER_STATUS_SET = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const SHOP_PAYOUT_STATUS_SET = new Set(['NOT_REQUESTED', 'QUEUED', 'PAID_OUT', 'WITHHELD']);

const normalizeQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const getOrderWithItems = async (orderId) => {
    const [orderRows] = await pool.execute('SELECT * FROM `Order` WHERE id = ?', [orderId]);
    const order = orderRows[0];
    if (!order) return null;

    const [itemRows] = await pool.execute(`
        SELECT oi.*, p.name AS productName, p.image AS productImage
        FROM OrderItem oi
        LEFT JOIN Product p ON p.id = oi.productId
        WHERE oi.orderId = ?
    `, [orderId]);

    const [logRows] = await pool.execute(`
        SELECT ol.*, u.name AS userName, u.role AS userRole
        FROM OrderLog ol
        LEFT JOIN User u ON u.id = ol.userId
        WHERE ol.orderId = ?
        ORDER BY ol.createdAt DESC
    `, [orderId]);

    return {
        ...order,
        items: itemRows,
        logs: logRows,
    };
};

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

const prepareOrderItems = async (items = []) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw createError(400, 'At least one item is required');
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    if (uniqueProductIds.length === 0) {
        throw createError(400, 'Each item must include a productId');
    }

    const placeholders = uniqueProductIds.map(() => '?').join(',');
    const [rows] = await pool.execute(`
        SELECT p.id, p.name, p.price, p.shopId, p.commissionRate, p.tracksInventory, p.inventoryQuantity,
               sh.defaultCommissionRate AS shopCommissionRate
        FROM Product p
        LEFT JOIN Shop sh ON sh.id = p.shopId
        WHERE p.id IN (${placeholders})
    `, uniqueProductIds);

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

        if (product.tracksInventory && product.inventoryQuantity < quantity) {
            throw createError(400, `Insufficient stock for ${product.name}. Available: ${product.inventoryQuantity}`);
        }

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

const VALID_STATUSES_FOR_UPDATE = new Set(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

const fetchOrderSummary = async (executor, orderId) => {
    const runner = executor || pool;
    const [rows] = await runner.execute('SELECT id, orderNumber, shopId, status FROM `Order` WHERE id = ?', [orderId]);
    return rows[0] || null;
};

const fetchOrderItemsForLedger = async (executor, orderId) => {
    const [rows] = await executor.execute(`
        SELECT oi.id, oi.productId, oi.quantity, oi.price AS unitPrice,
               oi.commissionRateApplied AS commissionRate, oi.commissionAmount, oi.netRevenue,
               COALESCE(p.name, 'Product') AS productName
        FROM OrderItem oi
        LEFT JOIN Product p ON p.id = oi.productId
        WHERE oi.orderId = ?
    `, [orderId]);
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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
                // Try to find by id or orderNumber
                const [orderRows] = await pool.execute('SELECT * FROM `Order` WHERE id = ? OR orderNumber = ?', [id, id]);
                let order = orderRows[0];
                
                if (order) {
                    // Check access
                    if (scope.mode === 'SHOP' && !scope.shopIds.includes(order.shopId)) {
                        return res.status(404).json({ error: 'Order not found' });
                    }
                    if (scope.mode === 'CUSTOMER' && order.userId !== scope.userId) {
                        return res.status(404).json({ error: 'Order not found' });
                    }
                    
                    // Fetch items and logs
                    const fullOrder = await getOrderWithItems(order.id);
                    return res.json(fullOrder);
                }
                return res.status(404).json({ error: 'Order not found' });
            }

            // List orders with filters
            const conditions = [];
            const params = [];

            if (scope.mode === 'SHOP' && !requestedShopId) {
                const placeholders = scope.shopIds.map(() => '?').join(',');
                conditions.push(`shopId IN (${placeholders})`);
                params.push(...scope.shopIds);
            } else if (scope.mode === 'CUSTOMER') {
                conditions.push('userId = ?');
                params.push(scope.userId);
            }

            if (requestedShopId) {
                if (scope.mode === 'ADMIN') {
                    conditions.push('shopId = ?');
                    params.push(requestedShopId);
                } else if (scope.mode === 'SHOP') {
                    if (!(scope.shopIds || []).includes(requestedShopId)) {
                        throw createError(403, 'You do not have access to this shop');
                    }
                    conditions.push('shopId = ?');
                    params.push(requestedShopId);
                } else {
                    throw createError(400, 'shopId filter is not available for this account');
                }
            }

            if (statusFilter) {
                conditions.push('status = ?');
                params.push(statusFilter);
            }

            if (payoutStatusFilter) {
                conditions.push('shopPayoutStatus = ?');
                params.push(payoutStatusFilter);
            }

            if (payoutIdFilter) {
                conditions.push('shopPayoutId = ?');
                params.push(payoutIdFilter);
            }

            const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
            const [orders] = await pool.execute(`SELECT * FROM \`Order\` ${whereClause} ORDER BY createdAt DESC`, params);
            
            // Fetch items for each order
            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                const [items] = await pool.execute(`
                    SELECT oi.*, p.name AS productName, p.image AS productImage
                    FROM OrderItem oi
                    LEFT JOIN Product p ON p.id = oi.productId
                    WHERE oi.orderId = ?
                `, [order.id]);
                return { ...order, items };
            }));

            return res.json(ordersWithItems);
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
                await client.execute(`
                    INSERT INTO \`Order\` (id, orderNumber, totalAmount, commissionTotal, customerName, customerEmail, customerPhone, shippingAddress, userId, shopId, shopPayoutStatus, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NOT_REQUESTED', NOW())
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
                ]);

                for (const item of enrichedItems) {
                    await client.execute(`
                        INSERT INTO OrderItem (id, orderId, productId, quantity, price, commissionRateApplied, commissionAmount, netRevenue)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

                    await client.execute(`
                        UPDATE Product
                        SET inventoryQuantity = inventoryQuantity - ?,
                            inStock = CASE WHEN (inventoryQuantity - ?) <= 0 THEN false ELSE inStock END
                        WHERE id = ? AND tracksInventory = true
                    `, [item.quantity, item.quantity, item.productId]);
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

                await pool.execute(`
                    UPDATE FinancialCycle
                    SET totalRevenue = totalRevenue + ?,
                        totalTax = totalTax + ?,
                        netProfit = netProfit + ?
                    WHERE status = 'OPEN'
                `, [finalTotal, tax, netProfit]);
            } catch (financialError) {
                console.error('Failed to update financial cycle:', financialError);
            }

            const createdOrder = await getOrderWithItems(orderId);
            return res.status(201).json(createdOrder);
        }

        if (req.method === 'PATCH') {
            const user = await requireAuth(req);
            const { id } = req.query;
            const orderId = normalizeQueryValue(id);
            
            if (!orderId) {
                return res.status(400).json({ error: 'Order id is required' });
            }

            const { status } = req.body || {};
            if (!status || !VALID_STATUSES_FOR_UPDATE.has(status)) {
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

                let timestampField = null;
                if (status === 'CONFIRMED') timestampField = 'confirmedAt';
                else if (status === 'PROCESSING') timestampField = 'processingAt';
                else if (status === 'SHIPPED') timestampField = 'shippedAt';
                else if (status === 'DELIVERED') timestampField = 'deliveredAt';
                else if (status === 'CANCELLED') timestampField = 'cancelledAt';

                if (timestampField) {
                    await client.execute(`UPDATE \`Order\` SET status = ?, ${timestampField} = NOW(), updatedAt = NOW() WHERE id = ?`, [status, orderId]);
                } else {
                    await client.execute('UPDATE `Order` SET status = ?, updatedAt = NOW() WHERE id = ?', [status, orderId]);
                }

                await client.execute(`
                    INSERT INTO OrderLog (id, orderId, userId, oldStatus, newStatus, createdAt)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `, [generateId('olog'), orderId, user.id, previousStatus, status]);

                if (status === 'CANCELLED' && previousStatus !== 'CANCELLED' && order.shopId) {
                    const items = await fetchOrderItemsForLedger(client, orderId);
                    
                    for (const item of items) {
                        await client.execute(`
                            UPDATE Product
                            SET inventoryQuantity = inventoryQuantity + ?,
                                inStock = true
                            WHERE id = ? AND tracksInventory = true
                        `, [item.quantity, item.productId]);
                    }

                    await recordOrderLedgerEntries(client, {
                        shopId: order.shopId,
                        orderId,
                        orderNumber: order.orderNumber,
                        items,
                        entryType: LEDGER_TYPE_REVERSAL,
                    });
                }

                const [rows] = await client.execute('SELECT id, status, orderNumber, shopPayoutStatus, updatedAt FROM `Order` WHERE id = ?', [orderId]);
                return rows[0];
            });

            return res.status(200).json(updated);
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
