const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { id } = req.query;
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            let userId = null;
            let isAdmin = false;

            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.userId;
                    isAdmin = decoded.role === 'ADMIN';
                } catch (e) {
                    console.error('JWT verify failed in orders API:', e);
                }
            }

            if (id) {
                const query = isAdmin ?
                    `SELECT o.*, (SELECT json_agg(oi.*) FROM "OrderItem" oi WHERE oi."orderId" = o.id) as items FROM "Order" o WHERE o.id = $1 OR o."orderNumber" = $1` :
                    `SELECT o.*, (SELECT json_agg(oi.*) FROM "OrderItem" oi WHERE oi."orderId" = o.id) as items FROM "Order" o WHERE (o.id = $1 OR o."orderNumber" = $1) AND o."userId" = $2`;

                const params = isAdmin ? [id] : [id, userId];
                const { rows } = await pool.query(query, params);

                if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
                return res.json(rows[0]);
            }

            const query = isAdmin ?
                'SELECT * FROM "Order" ORDER BY "createdAt" DESC' :
                'SELECT * FROM "Order" WHERE "userId" = $1 ORDER BY "createdAt" DESC';

            const params = isAdmin ? [] : [userId];
            const { rows } = await pool.query(query, params);
            return res.json(rows);
        }

        if (req.method === 'POST') {
            const { items, totalAmount, customerName, customerEmail, customerPhone, shippingAddress } = req.body;
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            let userId = null;

            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.userId;
                } catch (e) { }
            }

            if (!items || !totalAmount) {
                return res.status(400).json({ error: 'Items and totalAmount are required' });
            }

            const orderId = `ord_${Date.now()}`;
            const orderNumber = `AD${Math.floor(100000 + Math.random() * 900000)}`;

            // Transaction-ish (sequential)
            await pool.query('BEGIN');
            try {
                const { rows } = await pool.query(`
                    INSERT INTO "Order" (id, "orderNumber", "totalAmount", "customerName", "customerEmail", "customerPhone", "shippingAddress", "userId", "updatedAt")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    RETURNING *
                `, [orderId, orderNumber, totalAmount, customerName, customerEmail, customerPhone, shippingAddress, userId]);

                for (const item of items) {
                    await pool.query(`
                        INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [`oi_${Math.random().toString(36).substr(2, 9)}`, orderId, item.productId, item.quantity, item.price]);
                }

                await pool.query('COMMIT');
                return res.status(201).json(rows[0]);
            } catch (e) {
                await pool.query('ROLLBACK');
                throw e;
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Orders API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
