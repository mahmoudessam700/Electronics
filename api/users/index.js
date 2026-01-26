const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

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

    // Basic Admin Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }

        if (req.method === 'GET') {
            const { id } = req.query;
            if (id) {
                const { rows } = await pool.query('SELECT id, email, name, phone, address, latitude, longitude, role, "createdAt" FROM "User" WHERE id = $1', [id]);
                if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
                return res.json(rows[0]);
            }

            const { rows } = await pool.query('SELECT id, email, name, phone, address, latitude, longitude, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC');
            return res.json(rows);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, phone, address, role, latitude, longitude } = req.body;

            if (!id) return res.status(400).json({ error: 'User ID is required' });

            const { rows } = await pool.query(`
                UPDATE "User"
                SET name = COALESCE($2, name),
                    phone = COALESCE($3, phone),
                    address = COALESCE($4, address),
                    role = COALESCE($5, role),
                    latitude = COALESCE($6, latitude),
                    longitude = COALESCE($7, longitude),
                    "updatedAt" = NOW()
                WHERE id = $1
                RETURNING id, email, name, phone, address, latitude, longitude, role
            `, [id, name, phone, address, role, latitude, longitude]);

            if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'User ID is required' });

            // Prevent self-deletion if possible, but for simplicity we allow it.
            // In a real app, you'd check if (decoded.userId === id).

            await pool.query('DELETE FROM "User" WHERE id = $1', [id]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Users API Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
