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
    // Set CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const db = getPrisma();

    if (!db) {
        console.error('Prisma client not available');
        if (req.method === 'GET' && !req.query.id) {
            return res.json([]);
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }

    try {
        if (req.method === 'GET') {
            const { id, categoryId, category } = req.query;

            if (id) {
                const product = await db.product.findUnique({
                    where: { id: String(id) },
                    include: { categoryRef: true }
                });
                return res.json(product);
            }

            // Build filter
            const where: any = {};
            if (categoryId) {
                where.categoryId = String(categoryId);
            }
            if (category) {
                where.category = String(category);
            }

            const products = await db.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: { categoryRef: true }
            });
            return res.json(products);
        }

        if (req.method === 'POST') {
            const { name, price, originalPrice, description, category, categoryId, image, inStock } = req.body;

            if (!name || !price || !image) {
                return res.status(400).json({ error: 'Name, price, and image are required' });
            }

            const product = await db.product.create({
                data: {
                    name,
                    price,
                    originalPrice: originalPrice || null,
                    description,
                    category,
                    categoryId: categoryId || null,
                    image,
                    inStock: inStock ?? true
                },
            });
            return res.status(201).json(product);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, price, originalPrice, description, category, categoryId, image, inStock } = req.body;

            const product = await db.product.update({
                where: { id: String(id) },
                data: {
                    name,
                    price,
                    originalPrice: originalPrice || null,
                    description,
                    category,
                    categoryId: categoryId || null,
                    image,
                    inStock
                },
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
        if (req.method === 'GET' && !req.query.id) {
            return res.json([]);
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}
