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

            // Note: Product.supplierId is set to NULL automatically by Prisma onDelete: SetNull 
            // but since we are using raw SQL, we should be careful. 
            // In Prisma schema we defined SetNull, but raw SQL DELETE needs to handle it if FK exists.

            await pool.query('UPDATE "Product" SET "supplierId" = NULL WHERE "supplierId" = $1', [id]);
            await pool.query('DELETE FROM "Supplier" WHERE id = $1', [id]);

            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Suppliers API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
