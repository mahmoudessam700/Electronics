const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { serialize } = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

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

            const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

            res.setHeader('Set-Cookie', serialize('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            }));

            return res.status(200).json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
        }

        if (actionName === 'me') {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) return res.status(401).json({ error: 'Unauthorized' });

            const decoded = jwt.verify(token, JWT_SECRET);
            const { rows } = await pool.query('SELECT id, email, name, phone, address, image, latitude, longitude, role FROM "User" WHERE id = $1', [decoded.userId]);
            if (!rows[0]) return res.status(404).json({ error: 'User not found' });
            return res.status(200).json({ user: rows[0] });
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
