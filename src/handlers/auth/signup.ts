import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmailVerificationEmail } from '../../lib/mail';

// Lazy initialization of Prisma
let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient | null {
    if (!prisma) {
        try {
            prisma = new PrismaClient();
        } catch (e) {
            console.error('Failed to initialize Prisma:', e);
            return null;
        }
    }
    return prisma;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const db = getPrisma();
    if (!db) {
        return res.status(500).json({ error: 'Database unavailable' });
    }

    try {
        const { email, password, name, phone } = req.body;

        // Validate required fields
        if (!email || !password || !name || !phone) {
            return res.status(400).json({ error: 'All fields are required: name, email, phone, and password' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: 'Please enter a valid phone number' });
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Determine role
        const isFirstUser = (await db.user.count()) === 0;
        const role = isFirstUser || email.includes('admin') ? 'ADMIN' : 'CUSTOMER';

        // Create user (not verified yet)
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role,
                emailVerified: false,
                emailVerificationToken,
                emailVerificationExpires,
            },
        });

        // Send verification email
        try {
            await sendEmailVerificationEmail(user.email, user.name || 'Customer', emailVerificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the signup, just log it
        }

        return res.status(201).json({
            success: true,
            message: 'Account created successfully! Please check your email to verify your account.',
            requiresVerification: true,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
