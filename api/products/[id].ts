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
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const product = await prisma.product.findUnique({
                where: { id: id as string },
            });

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(200).json(product);
        } catch (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Failed to fetch product' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
