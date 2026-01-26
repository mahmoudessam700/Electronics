import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_URL_START: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) + '...' : 'none',
    };

    let dbStatus = 'unknown';
    let dbError = null;

    try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        const userCount = await prisma.user.count();
        dbStatus = `connected, users: ${userCount}`;
        await prisma.$disconnect();
    } catch (e: any) {
        dbStatus = 'failed';
        dbError = e.message;
        console.error('Debug DB Error:', e);
    }

    res.status(200).json({
        status: 'debug',
        env: envVars,
        dbStatus,
        dbError
    });
}
