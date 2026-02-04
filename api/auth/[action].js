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
const { sendEmailVerificationEmail, sendShopPendingEmail } = require('../_utils/mailer');

const pool = getPool();

const getUserWithLock = async (client, email, forUpdate = false) => {
    const runner = client || pool;
    const lock = forUpdate ? 'FOR UPDATE' : '';
    const [rows] = await runner.execute(
        `SELECT * FROM User WHERE email = ? ${lock}`,
        [email],
    );
    return rows[0] || null;
};

const getUserByToken = async (token, forUpdate = false) => {
    const lock = forUpdate ? 'FOR UPDATE' : '';
    const [rows] = await pool.execute(
        `SELECT * FROM User WHERE emailVerificationToken = ? ${lock}`,
        [token],
    );
    return rows[0] || null;
};

const setVerificationToken = async (client, userId) => {
    const runner = client || pool;
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await runner.execute(
        `UPDATE User
         SET emailVerificationToken = ?,
             emailVerificationExpires = ?,
             updatedAt = NOW()
         WHERE id = ?`,
        [token, expires, userId],
    );
    return { token, expires };
};

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

            const [rows] = await pool.execute('SELECT * FROM User WHERE email = ?', [email]);
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
            const [rows] = await pool.execute('SELECT id, email, name, phone, address, image, latitude, longitude, role FROM User WHERE id = ?', [decoded.userId]);
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

            const [existingUsers] = await pool.execute('SELECT id FROM User WHERE email = ?', [email]);
            if (existingUsers.length > 0) {
                return res.status(400).json({ error: 'An account with this email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM User');
            const count = parseInt(userCount[0].count);
            const role = (count === 0 || email.includes('admin')) ? 'ADMIN' : 'CUSTOMER';

            const userId = `user_${Date.now()}`;

            await pool.execute(`
                INSERT INTO User (
                    id, email, password, name, phone, address, latitude, longitude, 
                    role, emailVerified, emailVerificationToken, emailVerificationExpires, 
                    createdAt, updatedAt
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                userId, email, hashedPassword, name, phone, address || null,
                latitude || null, longitude || null, role,
                false, null, null
            ]);

            const [newUser] = await pool.execute('SELECT id, email, name, role FROM User WHERE id = ?', [userId]);

            const userPayload = await buildAuthUserResponse(newUser[0]);
            const { token: verificationToken } = await setVerificationToken(null, newUser[0].id);
            try {
                await sendEmailVerificationEmail({ to: email, name, token: verificationToken });
            } catch (mailError) {
                console.error('Failed to send verification email:', mailError);
            }

            return res.status(201).json({
                success: true,
                message: 'Account created successfully! Please check your email to verify your account.',
                requiresVerification: true,
                user: userPayload
            });
        }

        if (actionName === 'verify-email') {
            if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
            const token = req.query.token || req.query.t;
            if (!token || typeof token !== 'string') {
                return res.status(400).json({ error: 'Verification token is required' });
            }

            const user = await getUserByToken(token);
            if (!user) {
                return res.status(400).json({ error: 'Invalid or expired verification token' });
            }

            if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
                return res.status(400).json({ error: 'Verification token has expired. Please request a new one.' });
            }

            await pool.execute(
                `UPDATE User
                 SET emailVerified = TRUE,
                     emailVerificationToken = NULL,
                     emailVerificationExpires = NULL,
                     updatedAt = NOW()
                 WHERE id = ?`,
                [user.id],
            );

            return res.redirect(302, '/sign-in?verified=true');
        }

        if (actionName === 'resend-verification') {
            if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
            const { email } = req.body || {};
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            const user = await getUserWithLock(null, email);
            if (!user) {
                return res.status(200).json({ success: true });
            }

            if (user.emailVerified) {
                return res.status(400).json({ error: 'Email already verified' });
            }

            const now = new Date();
            if (user.updatedAt) {
                const lastUpdated = new Date(user.updatedAt);
                if (!Number.isNaN(lastUpdated.getTime())) {
                    const secondsSince = (now.getTime() - lastUpdated.getTime()) / 1000;
                    if (secondsSince < 120) {
                        return res.status(429).json({ error: 'Please wait a couple of minutes before trying again' });
                    }
                }
            }

            const { token: newToken } = await setVerificationToken(null, user.id);

            try {
                await sendEmailVerificationEmail({ to: email, name: user.name, token: newToken });
            } catch (mailError) {
                console.error('Failed to resend verification email:', mailError);
            }

            return res.status(200).json({ success: true });
        }

        if (actionName === 'register-shop') {
            if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

            const {
                email,
                password,
                name,
                phone,
                address,
                latitude,
                longitude,
                shopName,
                shopDescription,
                shopSlug,
                defaultCommissionRate
            } = req.body;

            if (!email || !password || !name || !shopName) {
                return res.status(400).json({ error: 'Name, email, password and shop name are required' });
            }

            const [existingUsers] = await pool.execute('SELECT id FROM User WHERE email = ?', [email]);
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
                await client.execute(`
                    INSERT INTO User (
                        id, email, password, name, phone, address, latitude, longitude, role,
                        emailVerified, emailVerificationToken, emailVerificationExpires,
                        createdAt, updatedAt
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NOW(), NOW())
                `, [
                    userId,
                    email,
                    hashedPassword,
                    name,
                    phone || null,
                    address || null,
                    latitude || null,
                    longitude || null,
                    'SHOP_OWNER',
                    true
                ]);

                const [createdUsers] = await client.execute(
                    'SELECT id, email, name, role FROM User WHERE id = ?',
                    [userId]
                );

                await client.execute(`
                    INSERT INTO Shop (
                        id, name, slug, description, email, phone, address, latitude, longitude, status,
                        defaultCommissionRate, ownerId, createdAt, updatedAt
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    shopId,
                    shopName,
                    slug,
                    shopDescription || null,
                    email,
                    phone || null,
                    address || null,
                    latitude || null,
                    longitude || null,
                    'PENDING',
                    commissionRate,
                    userId
                ]);

                await client.execute(`
                    INSERT INTO ShopMember (
                        id, userId, shopId, role, createdAt, updatedAt
                    )
                    VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [membershipId, userId, shopId, 'OWNER']);

                return createdUsers[0];
            });

            const userPayload = await buildAuthUserResponse(result);

            // Send email notifying shop owner that their application is pending
            try {
                await sendShopPendingEmail({ to: email, name, shopName });
            } catch (mailError) {
                console.error('Failed to send shop pending email:', mailError);
            }

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

            await pool.execute(`
                UPDATE User
                SET name = COALESCE(?, name),
                    phone = COALESCE(?, phone),
                    address = COALESCE(?, address),
                    image = COALESCE(?, image),
                    latitude = COALESCE(?, latitude),
                    longitude = COALESCE(?, longitude),
                    updatedAt = NOW()
                WHERE id = ?
            `, [name, phone, address, image, latitude, longitude, decoded.userId]);

            const [rows] = await pool.execute(
                'SELECT id, email, name, phone, address, image, latitude, longitude, role FROM User WHERE id = ?',
                [decoded.userId]
            );

            if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.json({ success: true, user: rows[0] });
        }

        return res.status(501).json({ error: 'Action not implemented: ' + actionName });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ error: `Database Error: ${error.message}` });
    }
};
