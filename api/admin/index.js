// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const { requireAuth, ensureRole, createError, generateId } = require('../_utils/auth');
const { getLatestBalance, recordPayoutLedgerEntry } = require('../_utils/ledger');

const pool = getPool();

const normalizeValue = (value) => (Array.isArray(value) ? value[0] : value);

// ============ SUPPLIERS HANDLERS ============
const handleSuppliers = async (req, res) => {
    if (req.method === 'GET') {
        const { id } = req.query;

        if (id) {
            const [rows] = await pool.execute('SELECT * FROM Supplier WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
            return res.json(rows[0]);
        }

        const [rows] = await pool.execute('SELECT * FROM Supplier ORDER BY name ASC');
        return res.json(rows);
    }

    if (req.method === 'POST') {
        const { name, contact, email, phone, address } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const id = `sup_${Date.now()}`;
        await pool.execute(`
            INSERT INTO Supplier (id, name, contact, email, phone, address, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [id, name, contact || null, email || null, phone || null, address || null]);

        const [rows] = await pool.execute('SELECT * FROM Supplier WHERE id = ?', [id]);
        return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
        const { id } = req.query;
        const { name, contact, email, phone, address } = req.body;

        if (!id) return res.status(400).json({ error: 'ID is required' });

        await pool.execute(`
            UPDATE Supplier
            SET name = COALESCE(?, name),
                contact = COALESCE(?, contact),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                address = COALESCE(?, address),
                updatedAt = NOW()
            WHERE id = ?
        `, [name, contact, email, phone, address, id]);

        const [rows] = await pool.execute('SELECT * FROM Supplier WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
        return res.json(rows[0]);
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        await pool.execute('UPDATE Product SET supplierId = NULL WHERE supplierId = ?', [id]);
        await pool.execute('DELETE FROM Supplier WHERE id = ?', [id]);

        return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ FINANCIAL HANDLERS ============
const handleFinancial = async (req, res) => {
    if (req.method === 'GET') {
        const { type, cycleId } = req.query;

        if (type === 'cycles') {
            const [rows] = await pool.execute('SELECT * FROM FinancialCycle ORDER BY startDate DESC');
            return res.json(rows);
        }

        if (type === 'expenses') {
            if (cycleId) {
                const [rows] = await pool.execute('SELECT * FROM Expense WHERE cycleId = ? ORDER BY createdAt DESC', [cycleId]);
                return res.json(rows);
            }
            const [rows] = await pool.execute('SELECT * FROM Expense ORDER BY createdAt DESC');
            return res.json(rows);
        }

        if (type === 'payouts') {
            if (cycleId) {
                const [rows] = await pool.execute('SELECT * FROM SupplierPayout WHERE cycleId = ? ORDER BY createdAt DESC', [cycleId]);
                return res.json(rows);
            }
            const [rows] = await pool.execute('SELECT * FROM SupplierPayout ORDER BY createdAt DESC');
            return res.json(rows);
        }

        // Default: Get active cycle summary
        const [cycles] = await pool.execute('SELECT * FROM FinancialCycle WHERE status = \'OPEN\' LIMIT 1');
        return res.json(cycles[0] || null);
    }

    if (req.method === 'POST') {
        const { type } = req.query;

        if (type === 'cycle') {
            const { name, startDate } = req.body;
            const id = `cycle_${Date.now()}`;
            await pool.execute(`
                INSERT INTO FinancialCycle (id, name, startDate, status, updatedAt)
                VALUES (?, ?, ?, 'OPEN', NOW())
            `, [id, name, startDate || new Date()]);
            const [rows] = await pool.execute('SELECT * FROM FinancialCycle WHERE id = ?', [id]);
            return res.status(201).json(rows[0]);
        }

        if (type === 'expense') {
            const { description, amount, category, cycleId } = req.body;
            const id = `exp_${Date.now()}`;
            await pool.execute(`
                INSERT INTO Expense (id, description, amount, category, cycleId)
                VALUES (?, ?, ?, ?, ?)
            `, [id, description, amount, category, cycleId]);
            
            // Update cycle totals
            await pool.execute('UPDATE FinancialCycle SET totalExpenses = totalExpenses + ? WHERE id = ?', [amount, cycleId]);
            
            const [rows] = await pool.execute('SELECT * FROM Expense WHERE id = ?', [id]);
            return res.status(201).json(rows[0]);
        }

        return res.status(400).json({ error: 'Invalid type parameter' });
    }

    if (req.method === 'PUT') {
        const { id, action } = req.query;

        if (action === 'close') {
            await pool.execute(`
                UPDATE FinancialCycle 
                SET status = 'CLOSED', endDate = NOW(), updatedAt = NOW()
                WHERE id = ?
            `, [id]);
            const [rows] = await pool.execute('SELECT * FROM FinancialCycle WHERE id = ?', [id]);
            return res.json(rows[0]);
        }

        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ SHOP PAYOUTS HANDLERS ============
const VALID_STATUSES = new Set(['PENDING', 'SCHEDULED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED']);
const TERMINAL_STATUSES = new Set(['PAID', 'FAILED', 'CANCELLED']);
const RELEASE_STATUSES = new Set(['FAILED', 'CANCELLED']);

const handleShopPayouts = async (req, res) => {
    const payoutId = normalizeValue(req.query.id);
    
    if (req.method === 'GET') {
        if (payoutId) {
            const [rows] = await pool.execute(`
                SELECT sp.*, s.name AS shopName, s.slug AS shopSlug
                FROM ShopPayout sp
                LEFT JOIN Shop s ON s.id = sp.shopId
                WHERE sp.id = ?
            `, [payoutId]);
            if (!rows[0]) return res.status(404).json({ error: 'Payout not found' });
            return res.json({ payout: rows[0] });
        }
        
        const shopId = normalizeValue(req.query.shopId);
        const status = normalizeValue(req.query.status);
        const params = [];
        const conditions = [];
        if (shopId) {
            conditions.push(`sp.shopId = ?`);
            params.push(shopId);
        }
        if (status) {
            conditions.push(`sp.status = ?`);
            params.push(status);
        }
        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        
        const [rows] = await pool.execute(`
            SELECT sp.*, s.name AS shopName, s.slug AS shopSlug,
                   COALESCE(stats.orderCount, 0) AS orderCount,
                   COALESCE(stats.orderTotal, 0) AS orderTotal
            FROM ShopPayout sp
            LEFT JOIN Shop s ON s.id = sp.shopId
            LEFT JOIN (
                SELECT shopPayoutId,
                       COUNT(*) AS orderCount,
                       COALESCE(SUM((totalAmount - commissionTotal)), 0) AS orderTotal
                FROM \`Order\`
                WHERE shopPayoutId IS NOT NULL
                GROUP BY shopPayoutId
            ) AS stats ON stats.shopPayoutId = sp.id
            ${whereClause}
            ORDER BY sp.createdAt DESC
            LIMIT 200
        `, params);
        return res.json({ payouts: rows });
    }
    
    if (req.method === 'PATCH') {
        if (!payoutId) return res.status(400).json({ error: 'Payout id required' });
        const { status, notes, reference, scheduledFor } = req.body || {};
        
        return withTransaction(async (client) => {
            const [payouts] = await client.execute(
                'SELECT * FROM ShopPayout WHERE id = ? FOR UPDATE',
                [payoutId]
            );
            const payout = payouts[0];
            if (!payout) return res.status(404).json({ error: 'Payout not found' });
            
            const updates = [];
            const params = [];
            if (status && payout.status !== status) {
                updates.push(`status = ?`);
                params.push(status);
                if (status === 'PAID') {
                    updates.push(`processedAt = ?`);
                    params.push(new Date());
                }
            }
            if (notes !== undefined) {
                updates.push(`notes = ?`);
                params.push(notes || null);
            }
            if (reference !== undefined) {
                updates.push(`reference = ?`);
                params.push(reference || payout.reference);
            }
            if (scheduledFor !== undefined) {
                const date = scheduledFor ? new Date(scheduledFor) : null;
                updates.push(`scheduledFor = ?`);
                params.push(date);
            }
            
            if (updates.length > 0) {
                params.push(payoutId);
                await client.execute(
                    `UPDATE ShopPayout SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
                    params
                );
            }
            
            if (status === 'PAID' && payout.status !== 'PAID') {
                await client.execute(
                    'UPDATE `Order` SET shopPayoutStatus = \'PAID_OUT\', updatedAt = NOW() WHERE shopPayoutId = ?',
                    [payoutId]
                );
            } else if (RELEASE_STATUSES.has(status) && !RELEASE_STATUSES.has(payout.status)) {
                await client.execute(
                    'UPDATE `Order` SET shopPayoutStatus = \'NOT_REQUESTED\', shopPayoutId = NULL, updatedAt = NOW() WHERE shopPayoutId = ?',
                    [payoutId]
                );
                await recordPayoutLedgerEntry(client, {
                    shopId: payout.shopId,
                    payoutId: payout.id,
                    amount: payout.amount,
                    reference: reference || payout.reference,
                    description: `Payout ${status.toLowerCase()}`,
                    direction: 'CREDIT'
                });
            }
            
            const balance = await getLatestBalance(client, payout.shopId);
            return res.json({ success: true, balance });
        });
    }
    
    if (req.method === 'POST') {
        const { shopId, amount, currency = 'EGP', notes, status = 'PENDING', reference } = req.body || {};
        if (!shopId || !amount) return res.status(400).json({ error: 'shopId and amount required' });
        
        return withTransaction(async (client) => {
            const balance = await getLatestBalance(client, shopId);
            if (amount > balance) return res.status(422).json({ error: 'Insufficient balance' });
            
            const payoutId = generateId('sp');
            const ref = reference || `SP-${Date.now()}`;
            await client.execute(`
                INSERT INTO ShopPayout (id, shopId, amount, currency, status, reference, notes, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [payoutId, shopId, amount, currency, status, ref, notes || null]);
            
            await recordPayoutLedgerEntry(client, {
                shopId, payoutId, amount, reference: ref,
                description: notes || `Payout ${ref}`
            });
            
            return res.status(201).json({ success: true, payoutId });
        });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ DASHBOARD HANDLERS ============
const handleDashboard = async (req, res) => {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const [stats] = await pool.execute(`
        SELECT 
            (SELECT COALESCE(SUM(totalAmount), 0) FROM \`Order\`) as totalRevenue,
            (SELECT COUNT(*) FROM \`Order\`) as totalOrders,
            (SELECT COUNT(*) FROM Product) as totalProducts,
            (SELECT COUNT(*) FROM User WHERE role = 'CUSTOMER') as totalCustomers
    `);

    const [recentSales] = await pool.execute(`
        SELECT o.id, o.totalAmount as amount, u.name, u.email
        FROM \`Order\` o
        LEFT JOIN User u ON o.userId = u.id
        ORDER BY o.createdAt DESC
        LIMIT 5
    `);

    const [recentOrders] = await pool.execute(`
        SELECT o.id, o.customerName as customer, o.createdAt as date, o.status, o.totalAmount as amount
        FROM \`Order\` o
        ORDER BY o.createdAt DESC
        LIMIT 4
    `);

    // For MySQL, we need a different approach for the monthly series
    const [revenueOverview] = await pool.execute(`
        SELECT 
            DATE_FORMAT(o.createdAt, '%b') as month,
            COALESCE(SUM(o.totalAmount), 0) as revenue
        FROM \`Order\` o
        WHERE o.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY YEAR(o.createdAt), MONTH(o.createdAt), month
        ORDER BY YEAR(o.createdAt), MONTH(o.createdAt)
    `);

    return res.json({
        stats: stats[0],
        recentSales: recentSales.map(s => ({
            ...s,
            initials: (s.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        })),
        recentOrders: recentOrders.map(o => ({
            ...o,
            date: new Date(o.date).toLocaleString(),
        })),
        revenueOverview
    });
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const resource = normalizeValue(req.query.resource);

        if (resource === 'suppliers') {
            return handleSuppliers(req, res);
        }

        if (resource === 'financial') {
            return handleFinancial(req, res);
        }

        if (resource === 'dashboard') {
            return handleDashboard(req, res);
        }

        if (resource === 'shop-payouts') {
            return handleShopPayouts(req, res);
        }

        return res.status(400).json({ 
            error: 'Resource parameter required', 
            hint: 'Use ?resource=suppliers, ?resource=financial, ?resource=dashboard, or ?resource=shop-payouts' 
        });
    } catch (error) {
        console.error('Admin API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
