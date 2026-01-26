const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { serialize } = require('cookie');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;
    const actionName = Array.isArray(action) ? action[0] : action;

    try {
        if (actionName === 'login') {
            if (req.method !== 'POST') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const prisma = new PrismaClient({
                datasourceUrl: process.env.DATABASE_URL
            });

            try {
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                if (!user.password.startsWith('$2')) {
                    // Handle legacy passwords if any, or plain text for dev
                    if (user.password !== password) {
                        return res.status(401).json({ error: 'Invalid credentials' });
                    }
                } else {
                    const isValidPassword = await bcrypt.compare(password, user.password);
                    if (!isValidPassword) {
                        return res.status(401).json({ error: 'Invalid credentials' });
                    }
                }

                if (!user.emailVerified) {
                    return res.status(401).json({ error: 'Please verify your email address before signing in.' });
                }

                const token = jwt.sign(
                    { userId: user.id, email: user.email, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                res.setHeader(
                    'Set-Cookie',
                    serialize('auth_token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 60 * 60 * 24 * 7,
                        path: '/',
                    })
                );

                return res.status(200).json({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                    token
                });
            } finally {
                await prisma.$disconnect();
            }
        }

        // Placeholder for other actions
        return res.status(501).json({ error: 'Action not implemented in JS fallback yet: ' + actionName });

    } catch (error) {
        console.error('JS Auth Handler Error:', error);
        res.status(500).json({
            error: `System Error: ${error.message}`
        });
    }
};
