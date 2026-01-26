import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Lazy initialization of Prisma
let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient | null {
    if (!prisma) {
        try {
            const connectionString = process.env.DATABASE_URL;
            if (!connectionString) {
                console.error('DATABASE_URL not set');
                return null;
            }
            const pool = new Pool({ connectionString });
            const adapter = new PrismaPg(pool);
            prisma = new PrismaClient({ adapter });
        } catch (e) {
            console.error('Failed to initialize Prisma:', e);
            return null;
        }
    }
    return prisma;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const db = getPrisma();

    if (!db) {
        return res.status(500).json({ error: 'Database unavailable' });
    }

    try {
        if (req.method === 'GET') {
            const orders = await db.order.findMany({
                orderBy: { createdAt: 'desc' },
                include: { items: { include: { product: true } } }
            });
            return res.json(orders);
        }

        if (req.method === 'PATCH') {
            const { id } = req.query;
            const { status } = req.body;

            const order = await db.order.update({
                where: { id: String(id) },
                data: { status },
            });
            return res.json(order);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
