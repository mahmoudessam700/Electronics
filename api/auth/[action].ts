import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import signup from '../../src/handlers/auth/signup';
import me from '../../src/handlers/auth/me';
import forgotPassword from '../../src/handlers/auth/forgot-password';
import resetPassword from '../../src/handlers/auth/reset-password';
import verifyEmail from '../../src/handlers/auth/verify-email';

// Lazy init
let prisma: PrismaClient | null = null;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const db = getPrisma();

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(401).json({ error: 'Please verify your email address before signing in. Check your inbox for the verification link.' });
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
    } catch (error: any) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { action } = req.query;
    const actionName = Array.isArray(action) ? action[0] : action;

    try {
        switch (actionName) {
            case 'login':
                return await handleLogin(req, res);
            case 'signup':
                return await signup(req, res);
            case 'me':
                return await me(req, res);
            case 'forgot-password':
                return await forgotPassword(req, res);
            case 'reset-password':
                return await resetPassword(req, res);
            case 'verify-email':
                return await verifyEmail(req, res);
            default:
                return res.status(404).json({ error: 'Endpoint not found' });
        }
    } catch (error: any) {
        console.error(`Error in auth handler [${actionName}]:`, error);
        if (!res.headersSent) {
            return res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
}
