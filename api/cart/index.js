// @ts-nocheck
const { getPool } = require('../_utils/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

const pool = getPool();

// Helper to verify JWT and get user ID
function getUserFromToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (err) {
        return null;
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') return res.status(200).end();

    const userId = getUserFromToken(req);
    
    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // GET - Fetch user's cart
        if (req.method === 'GET') {
            const [rows] = await pool.execute(`
                SELECT ci.id, ci.productId, ci.quantity, ci.createdAt,
                       p.name, p.price, p.originalPrice, p.image, p.isPrime, p.deliveryDate, p.rating, p.reviewCount, p.category
                FROM CartItem ci
                JOIN Product p ON ci.productId = p.id
                WHERE ci.userId = ?
                ORDER BY ci.createdAt DESC
            `, [userId]);

            const cartItems = rows.map(row => ({
                product: {
                    id: row.productId,
                    name: row.name,
                    price: row.price,
                    originalPrice: row.originalPrice,
                    image: row.image,
                    isPrime: row.isPrime,
                    deliveryDate: row.deliveryDate,
                    rating: row.rating,
                    reviewCount: row.reviewCount,
                    category: row.category
                },
                quantity: row.quantity
            }));

            return res.status(200).json(cartItems);
        }

        // POST - Add item to cart or update quantity
        if (req.method === 'POST') {
            const { productId, quantity = 1 } = req.body;
            
            if (!productId) {
                return res.status(400).json({ error: 'Product ID is required' });
            }

            // Check if item already exists in cart
            const [existing] = await pool.execute(
                'SELECT id, quantity FROM CartItem WHERE userId = ? AND productId = ?',
                [userId, productId]
            );

            if (existing.length > 0) {
                // Update quantity
                const newQuantity = existing[0].quantity + quantity;
                await pool.execute(
                    'UPDATE CartItem SET quantity = ?, updatedAt = NOW() WHERE id = ?',
                    [newQuantity, existing[0].id]
                );
            } else {
                // Insert new item
                const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await pool.execute(
                    'INSERT INTO CartItem (id, userId, productId, quantity, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
                    [id, userId, productId, quantity]
                );
            }

            return res.status(200).json({ success: true });
        }

        // PUT - Update item quantity
        if (req.method === 'PUT') {
            const { productId, quantity } = req.body;
            
            if (!productId || quantity === undefined) {
                return res.status(400).json({ error: 'Product ID and quantity are required' });
            }

            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                await pool.execute(
                    'DELETE FROM CartItem WHERE userId = ? AND productId = ?',
                    [userId, productId]
                );
            } else {
                await pool.execute(
                    'UPDATE CartItem SET quantity = ?, updatedAt = NOW() WHERE userId = ? AND productId = ?',
                    [quantity, userId, productId]
                );
            }

            return res.status(200).json({ success: true });
        }

        // DELETE - Remove item from cart or clear cart
        if (req.method === 'DELETE') {
            const { productId, clearAll } = req.query;
            
            if (clearAll === 'true') {
                // Clear entire cart
                await pool.execute('DELETE FROM CartItem WHERE userId = ?', [userId]);
            } else if (productId) {
                // Remove specific item
                await pool.execute(
                    'DELETE FROM CartItem WHERE userId = ? AND productId = ?',
                    [userId, productId]
                );
            } else {
                return res.status(400).json({ error: 'Product ID or clearAll flag is required' });
            }

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Cart API error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
