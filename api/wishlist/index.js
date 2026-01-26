const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;

        if (req.method === 'GET') {
            const { rows } = await pool.query(`
                SELECT w.id, w."productId", w."createdAt",
                       p.name, p.price, p.image, p."originalPrice"
                FROM "Wishlist" w
                JOIN "Product" p ON w."productId" = p.id
                WHERE w."userId" = $1
                ORDER BY w."createdAt" DESC
            `, [userId]);
            return res.json(rows);
        }

        if (req.method === 'POST') {
            const { productId } = req.body;
            if (!productId) return res.status(400).json({ error: 'Product ID is required' });

            // Check if already in wishlist
            const existing = await pool.query('SELECT id FROM "Wishlist" WHERE "userId" = $1 AND "productId" = $2', [userId, productId]);
            if (existing.rows.length > 0) {
                return res.status(200).json({ message: 'Product already in wishlist', alreadyExists: true });
            }

            const id = `wish_${Date.now()}`;
            const { rows } = await pool.query(`
                INSERT INTO "Wishlist" (id, "userId", "productId", "createdAt")
                VALUES ($1, $2, $3, NOW())
                RETURNING *
            `, [id, userId, productId]);

            return res.status(201).json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { productId } = req.query;
            if (!productId) return res.status(400).json({ error: 'Product ID is required' });

            await pool.query('DELETE FROM "Wishlist" WHERE "userId" = $1 AND "productId" = $2', [userId, productId]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Wishlist API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
