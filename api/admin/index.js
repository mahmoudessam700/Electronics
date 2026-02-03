// @ts-nocheck
// Consolidated admin API for suppliers and financial management
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const normalizeValue = (value) => (Array.isArray(value) ? value[0] : value);

// ============ SUPPLIERS HANDLERS ============
const handleSuppliers = async (req, res) => {
    if (req.method === 'GET') {
        const { id } = req.query;

        if (id) {
            const { rows } = await pool.query('SELECT * FROM "Supplier" WHERE id = $1', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
            return res.json(rows[0]);
        }

        const { rows } = await pool.query('SELECT * FROM "Supplier" ORDER BY name ASC');
        return res.json(rows);
    }

    if (req.method === 'POST') {
        const { name, contact, email, phone, address } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const id = `sup_${Date.now()}`;
        const { rows } = await pool.query(`
            INSERT INTO "Supplier" (id, name, contact, email, phone, address, "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *
        `, [id, name, contact || null, email || null, phone || null, address || null]);

        return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
        const { id } = req.query;
        const { name, contact, email, phone, address } = req.body;

        if (!id) return res.status(400).json({ error: 'ID is required' });

        const { rows } = await pool.query(`
            UPDATE "Supplier"
            SET name = COALESCE($2, name),
                contact = COALESCE($3, contact),
                email = COALESCE($4, email),
                phone = COALESCE($5, phone),
                address = COALESCE($6, address),
                "updatedAt" = NOW()
            WHERE id = $1
            RETURNING *
        `, [id, name, contact, email, phone, address]);

        if (rows.length === 0) return res.status(404).json({ error: 'Supplier not found' });
        return res.json(rows[0]);
    }

    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'ID is required' });

        await pool.query('UPDATE "Product" SET "supplierId" = NULL WHERE "supplierId" = $1', [id]);
        await pool.query('DELETE FROM "Supplier" WHERE id = $1', [id]);

        return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ FINANCIAL HANDLERS ============
const handleFinancial = async (req, res) => {
    if (req.method === 'GET') {
        const { type, cycleId } = req.query;

        if (type === 'cycles') {
            const { rows } = await pool.query('SELECT * FROM "FinancialCycle" ORDER BY "startDate" DESC');
            return res.json(rows);
        }

        if (type === 'expenses') {
            const query = cycleId 
                ? 'SELECT * FROM "Expense" WHERE "cycleId" = $1 ORDER BY "createdAt" DESC'
                : 'SELECT * FROM "Expense" ORDER BY "createdAt" DESC';
            const params = cycleId ? [cycleId] : [];
            const { rows } = await pool.query(query, params);
            return res.json(rows);
        }

        if (type === 'payouts') {
            const query = cycleId 
                ? 'SELECT * FROM "SupplierPayout" WHERE "cycleId" = $1 ORDER BY "createdAt" DESC'
                : 'SELECT * FROM "SupplierPayout" ORDER BY "createdAt" DESC';
            const params = cycleId ? [cycleId] : [];
            const { rows } = await pool.query(query, params);
            return res.json(rows);
        }

        // Default: Get active cycle summary
        const { rows: cycles } = await pool.query('SELECT * FROM "FinancialCycle" WHERE status = \'OPEN\' LIMIT 1');
        return res.json(cycles[0] || null);
    }

    if (req.method === 'POST') {
        const { type } = req.query;

        if (type === 'cycle') {
            const { name, startDate } = req.body;
            const { rows } = await pool.query(`
                INSERT INTO "FinancialCycle" (id, name, "startDate", status, "updatedAt")
                VALUES ($1, $2, $3, 'OPEN', NOW())
                RETURNING *
            `, [`cycle_${Date.now()}`, name, startDate || new Date()]);
            return res.status(201).json(rows[0]);
        }

        if (type === 'expense') {
            const { description, amount, category, cycleId } = req.body;
            const { rows } = await pool.query(`
                INSERT INTO "Expense" (id, description, amount, category, "cycleId")
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [`exp_${Date.now()}`, description, amount, category, cycleId]);
            
            // Update cycle totals
            await pool.query('UPDATE "FinancialCycle" SET "totalExpenses" = "totalExpenses" + $1 WHERE id = $2', [amount, cycleId]);
            
            return res.status(201).json(rows[0]);
        }

        return res.status(400).json({ error: 'Invalid type parameter' });
    }

    if (req.method === 'PUT') {
        const { id, action } = req.query;

        if (action === 'close') {
            const { rows } = await pool.query(`
                UPDATE "FinancialCycle" 
                SET status = 'CLOSED', "endDate" = NOW(), "updatedAt" = NOW()
                WHERE id = $1
                RETURNING *
            `, [id]);
            return res.json(rows[0]);
        }

        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ DASHBOARD HANDLERS ============
const handleDashboard = async (req, res) => {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const stats = await pool.query(`
        SELECT 
            (SELECT COALESCE(SUM("totalAmount"), 0) FROM "Order") as "totalRevenue",
            (SELECT COUNT(*) FROM "Order") as "totalOrders",
            (SELECT COUNT(*) FROM "Product") as "totalProducts",
            (SELECT COUNT(*) FROM "User" WHERE role = 'CUSTOMER') as "totalCustomers"
    `);

    const recentSales = await pool.query(`
        SELECT o.id, o."totalAmount" as amount, u.name, u.email
        FROM "Order" o
        LEFT JOIN "User" u ON o."userId" = u.id
        ORDER BY o."createdAt" DESC
        LIMIT 5
    `);

    const recentOrders = await pool.query(`
        SELECT o.id, o."customerName" as customer, o."createdAt" as date, o.status, o."totalAmount" as amount
        FROM "Order" o
        ORDER BY o."createdAt" DESC
        LIMIT 4
    `);

    const revenueOverview = await pool.query(`
        SELECT 
            TO_CHAR(date_trunc('month', months.m), 'Mon') as month,
            COALESCE(SUM(o."totalAmount"), 0) as revenue
        FROM generate_series(
            date_trunc('month', NOW()) - INTERVAL '11 months',
            date_trunc('month', NOW()),
            '1 month'::interval
        ) AS months(m)
        LEFT JOIN "Order" o ON date_trunc('month', o."createdAt") = months.m
        GROUP BY months.m
        ORDER BY months.m
    `);

    return res.json({
        stats: stats.rows[0],
        recentSales: recentSales.rows.map(s => ({
            ...s,
            initials: (s.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        })),
        recentOrders: recentOrders.rows.map(o => ({
            ...o,
            date: new Date(o.date).toLocaleString(), // Simple format
        })),
        revenueOverview: revenueOverview.rows
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

        return res.status(400).json({ 
            error: 'Resource parameter required', 
            hint: 'Use ?resource=suppliers, ?resource=financial, or ?resource=dashboard' 
        });
    } catch (error) {
        console.error('Admin API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
