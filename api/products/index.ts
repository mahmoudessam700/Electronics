import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        try {
            const { category, search, limit } = req.query;

            const products = await prisma.product.findMany({
                where: {
                    ...(category && { category: category as string }),
                    ...(search && {
                        name: {
                            contains: search as string,
                            mode: 'insensitive',
                        },
                    }),
                },
                take: limit ? parseInt(limit as string) : undefined,
                orderBy: { createdAt: 'desc' },
            });

            return res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            return res.status(500).json({ error: 'Failed to fetch products' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
