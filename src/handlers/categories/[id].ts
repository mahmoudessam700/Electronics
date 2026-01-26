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

// Generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Category ID is required' });
    }

    const db = getPrisma();
    if (!db) {
        return res.status(500).json({ error: 'Database unavailable' });
    }

    try {
        // GET - Get single category with products
        if (req.method === 'GET') {
            const category = await db.category.findUnique({
                where: { id: String(id) },
                include: {
                    parent: true,
                    children: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                            _count: { select: { products: true } }
                        }
                    },
                    products: true,
                    _count: { select: { products: true } }
                }
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            return res.json(category);
        }

        // PUT - Update category
        if (req.method === 'PUT') {
            const { name, description, image, parentId, sortOrder } = req.body;

            const updateData: any = {};
            if (name !== undefined) {
                updateData.name = name;
                updateData.slug = generateSlug(name) + '-' + Date.now();
            }
            if (description !== undefined) updateData.description = description;
            if (image !== undefined) updateData.image = image;
            if (parentId !== undefined) updateData.parentId = parentId || null;
            if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

            const category = await db.category.update({
                where: { id: String(id) },
                data: updateData,
                include: {
                    parent: true,
                    children: true,
                    _count: { select: { products: true } }
                }
            });

            return res.json(category);
        }

        // DELETE - Delete category
        if (req.method === 'DELETE') {
            // First, move all products to "uncategorized" (null categoryId)
            await db.product.updateMany({
                where: { categoryId: String(id) },
                data: { categoryId: null, category: null }
            });

            // Move children to parent of deleted category
            const categoryToDelete = await db.category.findUnique({
                where: { id: String(id) },
                select: { parentId: true }
            });

            await db.category.updateMany({
                where: { parentId: String(id) },
                data: { parentId: categoryToDelete?.parentId || null }
            });

            // Delete the category
            await db.category.delete({
                where: { id: String(id) }
            });

            return res.status(200).json({ success: true, message: 'Category deleted' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Category API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
