// @ts-nocheck
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getPool, withTransaction } = require('../_utils/db');
const jwt = require('jsonwebtoken');
const { sendRoleChangeEmail, sendWelcomeEmail } = require('../_utils/mailer');
const { ensureSlug, normalizeCommissionRate, generateId } = require('../_utils/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

const pool = getPool();

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
                const [rows] = await pool.execute('SELECT id, email, name, phone, address, latitude, longitude, role, createdAt FROM User WHERE id = ?', [id]);
                if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
                return res.json(rows[0]);
            }

            const [rows] = await pool.execute('SELECT id, email, name, phone, address, latitude, longitude, role, createdAt FROM User ORDER BY createdAt DESC');
            return res.json(rows);
        }

        if (req.method === 'POST') {
            const { email, name, phone, address, role, password, sendInvite, shopName, shopDescription } = req.body;

            if (!email || !name) {
                return res.status(400).json({ error: 'Email and name are required' });
            }

            // Check if email already exists
            const [existingUsers] = await pool.execute('SELECT id FROM User WHERE email = ?', [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'A user with this email already exists' });
            }

            // Generate password - either use provided or generate random
            let userPassword = password;
            let generatedPassword = null;
            if (sendInvite || !password) {
                generatedPassword = crypto.randomBytes(8).toString('hex');
                userPassword = generatedPassword;
            }

            const hashedPassword = await bcrypt.hash(userPassword, 10);
            const userId = generateId('user');
            const userRole = role || 'CUSTOMER';

            let shopId = null;
            let shopSlug = null;

            await withTransaction(async (client) => {
                // Create user
                await client.execute(`
                    INSERT INTO User (id, email, password, name, phone, address, role, emailVerified, createdAt, updatedAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [userId, email, hashedPassword, name, phone || null, address || null, userRole, true]);

                // If SHOP_OWNER, create shop
                if (userRole === 'SHOP_OWNER' && shopName) {
                    shopSlug = await ensureSlug(shopName);
                    shopId = generateId('shop');
                    const membershipId = generateId('shop_member');
                    const commissionRate = normalizeCommissionRate(null);

                    await client.execute(`
                        INSERT INTO Shop (id, name, slug, description, email, phone, address, status, defaultCommissionRate, ownerId, createdAt, updatedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?, NOW(), NOW())
                    `, [shopId, shopName, shopSlug, shopDescription || null, email, phone || null, address || null, commissionRate, userId]);

                    await client.execute(`
                        INSERT INTO ShopMember (id, userId, shopId, role, createdAt, updatedAt)
                        VALUES (?, ?, ?, 'OWNER', NOW(), NOW())
                    `, [membershipId, userId, shopId]);
                }
            });

            // Send welcome email
            try {
                await sendWelcomeEmail({
                    to: email,
                    name,
                    role: userRole,
                    password: sendInvite ? generatedPassword : null,
                    shopName: shopId ? shopName : null
                });
            } catch (mailError) {
                console.error('Failed to send welcome email:', mailError);
            }

            const [newUser] = await pool.execute('SELECT id, email, name, phone, address, role, createdAt FROM User WHERE id = ?', [userId]);

            return res.status(201).json({
                user: newUser[0],
                shop: shopId ? { id: shopId, name: shopName, slug: shopSlug } : null
            });
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, phone, address, role, latitude, longitude } = req.body;

            if (!id) return res.status(400).json({ error: 'User ID is required' });

            // Get current user data to detect role change
            const [currentUsers] = await pool.execute('SELECT email, name, role FROM User WHERE id = ?', [id]);
            if (currentUsers.length === 0) return res.status(404).json({ error: 'User not found' });
            const currentUser = currentUsers[0];
            const previousRole = currentUser.role;

            await pool.execute(`
                UPDATE User
                SET name = COALESCE(?, name),
                    phone = COALESCE(?, phone),
                    address = COALESCE(?, address),
                    role = COALESCE(?, role),
                    latitude = COALESCE(?, latitude),
                    longitude = COALESCE(?, longitude),
                    updatedAt = NOW()
                WHERE id = ?
            `, [
                name || null,
                phone || null,
                address || null,
                role || null,
                latitude != null ? latitude : null,
                longitude != null ? longitude : null,
                id
            ]);

            const [rows] = await pool.execute('SELECT id, email, name, phone, address, latitude, longitude, role FROM User WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

            // Send role change email if role was updated
            if (role && role !== previousRole) {
                try {
                    await sendRoleChangeEmail({
                        to: rows[0].email,
                        name: rows[0].name,
                        newRole: role
                    });
                } catch (mailError) {
                    console.error('Failed to send role change email:', mailError);
                }
            }

            return res.json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'User ID is required' });

            // Remove foreign key references before deleting
            await pool.execute('DELETE FROM ReviewLog WHERE adminId = ?', [id]);
            await pool.execute('DELETE FROM ReviewLog WHERE reviewId IN (SELECT id FROM Review WHERE userId = ?)', [id]);
            await pool.execute('DELETE FROM Review WHERE userId = ?', [id]);
            await pool.execute('DELETE FROM Wishlist WHERE userId = ?', [id]);
            await pool.execute('DELETE FROM CartItem WHERE userId = ?', [id]);
            await pool.execute('DELETE FROM OrderLog WHERE userId = ?', [id]);
            await pool.execute('UPDATE `Order` SET userId = NULL WHERE userId = ?', [id]);
            await pool.execute('DELETE FROM ShopMember WHERE userId = ?', [id]);
            await pool.execute('UPDATE Shop SET ownerId = NULL WHERE ownerId = ?', [id]);
            await pool.execute('UPDATE ShopInvitation SET invitedById = NULL WHERE invitedById = ?', [id]);
            await pool.execute('DELETE FROM User WHERE id = ?', [id]);
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
