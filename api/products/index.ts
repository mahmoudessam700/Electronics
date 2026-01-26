import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

// Lazy initialization of Prisma to prevent function invocation failures
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
    // Set CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const db = getPrisma();

    // If Prisma failed to initialize, return empty array for GET, error for others
    if (!db) {
        console.error('Prisma client not available');
        if (req.method === 'GET' && !req.query.id) {
            return res.json([]);
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }

    try {
        if (req.method === 'GET') {
            const { id } = req.query;
            if (id) {
                const product = await db.product.findUnique({ where: { id: String(id) } });
                return res.json(product);
            }
            const products = await db.product.findMany({ orderBy: { createdAt: 'desc' } });
            return res.json(products);
        }

        if (req.method === 'POST') {
            const { name, price, description, category, image, inStock } = req.body;
            const product = await db.product.create({
                data: { name, price, description, category, image, inStock },
            });
            return res.status(201).json(product);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, price, description, category, image, inStock } = req.body;
            const product = await db.product.update({
                where: { id: String(id) },
                data: { name, price, description, category, image, inStock },
            });
            return res.json(product);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            await db.product.delete({ where: { id: String(id) } });
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        // For GET requests, return empty array instead of error (graceful degradation)
        if (req.method === 'GET' && !req.query.id) {
            return res.json([]);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
