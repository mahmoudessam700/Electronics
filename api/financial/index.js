const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
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
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Financial API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
