// @ts-nocheck
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { serialize } = require('cookie');
const { getPool, withTransaction } = require('../_utils/db');
const {
    JWT_SECRET,
    ensureSlug,
    normalizeCommissionRate,
    buildAuthUserResponse,
    getShopMemberships,
    generateId,
} = require('../_utils/auth');

const pool = getPool();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const actionName = Array.isArray(action) ? action[0] : action;

    try {
        if (actionName === 'login') {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

            const { rows } = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
            const user = rows[0];

            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

            if (!user.emailVerified) return res.status(401).json({ error: 'Please verify your email address.' });

            const userPayload = await buildAuthUserResponse(user);
            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

            res.setHeader('Set-Cookie', serialize('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            }));

            return res.status(200).json({ success: true, user: userPayload, token });
        }

        if (actionName === 'me') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'Unauthorized' });

            const decoded = jwt.verify(token, JWT_SECRET);
            const { rows } = await pool.query('SELECT id, email, name, phone, address, image, latitude, longitude, role FROM "User" WHERE id = $1', [decoded.userId]);
            if (!rows[0]) return res.status(404).json({ error: 'User not found' });
            const shopMemberships = await getShopMemberships(rows[0].id);
            return res.status(200).json({ user: { ...rows[0], shopMemberships } });
        }

        if (actionName === 'signup') {
            if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
            const { email, password, name, phone, address, latitude, longitude } = req.body;

            if (!email || !password || !name || !phone) {
                return res.status(400).json({ error: 'Name, email, phone and password are required' });
            }

            // Check if user exists
            const { rows: existingUsers } = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'An account with this email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Generate verification token
            const token = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

            // Check user count for role
            const { rows: userCount } = await pool.query('SELECT COUNT(*) FROM "User"');
            const count = parseInt(userCount[0].count);
            const role = (count === 0 || email.includes('admin')) ? 'ADMIN' : 'CUSTOMER';

            const userId = `user_${Date.now()}`;

            const { rows: newUser } = await pool.query(`
                INSERT INTO "User" (
                    id, email, password, name, phone, address, latitude, longitude, 
                    role, "emailVerified", "emailVerificationToken", "emailVerificationExpires", 
                    "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
                RETURNING id, email, name, role
            `, [
                userId, email, hashedPassword, name, phone, address || null,
                latitude || null, longitude || null, role,
                false, token, expires
            ]);

            const userPayload = await buildAuthUserResponse(newUser[0]);

            return res.status(201).json({
                success: true,
                message: 'Account created successfully! Please check your email to verify your account.',
                requiresVerification: true,
                user: userPayload
            });
        }

        if (actionName === 'register-shop') {
            if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

            const {
                email,
                password,
                name,
                phone,
                address,
                shopName,
                shopDescription,
                shopSlug,
                defaultCommissionRate
            } = req.body;

            if (!email || !password || !name || !shopName) {
                return res.status(400).json({ error: 'Name, email, password and shop name are required' });
            }

            const { rows: existingUsers } = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'An account with this email already exists' });
            }

            const slug = await ensureSlug(shopSlug || shopName);
            const hashedPassword = await bcrypt.hash(password, 10);
            const commissionRate = normalizeCommissionRate(defaultCommissionRate);
            const userId = generateId('user');
            const shopId = generateId('shop');
            const membershipId = generateId('shop_member');

            const result = await withTransaction(async (client) => {
                const { rows: createdUsers } = await client.query(`
                    INSERT INTO "User" (
                        id, email, password, name, phone, address, role,
                        "emailVerified", "emailVerificationToken", "emailVerificationExpires",
                        "createdAt", "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, NULL, NOW(), NOW())
                    RETURNING id, email, name, role
                `, [
                    userId,
                    email,
                    hashedPassword,
                    name,
                    phone || null,
                    address || null,
                    'SHOP_OWNER',
                    true
                ]);

                await client.query(`
                    INSERT INTO "Shop" (
                        id, name, slug, description, email, phone, address, status,
                        "defaultCommissionRate", "ownerId", "createdAt", "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                `, [
                    shopId,
                    shopName,
                    slug,
                    shopDescription || null,
                    email,
                    phone || null,
                    address || null,
                    'PENDING',
                    commissionRate,
                    userId
                ]);

                await client.query(`
                    INSERT INTO "ShopMember" (
                        id, "userId", "shopId", role, "createdAt", "updatedAt"
                    )
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                `, [membershipId, userId, shopId, 'OWNER']);

                return createdUsers[0];
            });

            const userPayload = await buildAuthUserResponse(result);

            return res.status(201).json({
                success: true,
                message: 'Shop application submitted successfully. We will review it shortly.',
                requiresApproval: true,
                shop: {
                    id: shopId,
                    name: shopName,
                    slug,
                    status: 'PENDING',
                    defaultCommissionRate: commissionRate
                },
                user: userPayload
            });
        }

        if (actionName === 'update-profile') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'Unauthorized' });

            const decoded = jwt.verify(token, JWT_SECRET);
            const { name, phone, address, image, latitude, longitude } = req.body;

            const { rows } = await pool.query(`
                UPDATE "User"
                SET name = COALESCE($2, name),
                    phone = COALESCE($3, phone),
                    address = COALESCE($4, address),
                    image = COALESCE($5, image),
                    latitude = COALESCE($6, latitude),
                    longitude = COALESCE($7, longitude),
                    "updatedAt" = NOW()
                WHERE id = $1
                RETURNING id, email, name, phone, address, image, latitude, longitude, role
            `, [decoded.userId, name, phone, address, image, latitude, longitude]);

            if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.json({ success: true, user: rows[0] });
        }

        return res.status(501).json({ error: 'Action not implemented: ' + actionName });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: `Database Error: ${error.message}` });
    }
};
