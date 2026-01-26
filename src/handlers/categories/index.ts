import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const db = getPrisma();
    if (!db) {
        if (req.method === 'GET') {
            return res.json([]);
        }
        return res.status(500).json({ error: 'Database unavailable' });
    }

    try {
        // GET - List all categories (flat, no hierarchy)
        if (req.method === 'GET') {
            const categories = await db.category.findMany({
                where: {
                    // Exclude "Electronics" category
                    NOT: {
                        name: {
                            equals: 'Electronics',
                            mode: 'insensitive'
                        }
                    }
                },
                include: {
                    _count: { select: { products: true } }
                },
                orderBy: { sortOrder: 'asc' }
            });

            return res.json(categories);
        }

        // POST - Create new category
        if (req.method === 'POST') {
            const { name, description, image, sortOrder } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Category name is required' });
            }

            // Generate unique slug
            let slug = generateSlug(name);
            const existingSlug = await db.category.findUnique({ where: { slug } });
            if (existingSlug) {
                slug = `${slug}-${Date.now()}`;
            }

            // Get max sortOrder
            const maxSort = await db.category.findFirst({
                orderBy: { sortOrder: 'desc' },
                select: { sortOrder: true }
            });

            const category = await db.category.create({
                data: {
                    name,
                    slug,
                    description,
                    image,
                    parentId: null, // No parent - flat structure
                    sortOrder: sortOrder ?? ((maxSort?.sortOrder ?? 0) + 1)
                },
                include: {
                    _count: { select: { products: true } }
                }
            });

            return res.status(201).json(category);
        }

        // PUT - Update category or bulk update (for reordering)
        if (req.method === 'PUT') {
            const { categories } = req.body;

            if (Array.isArray(categories)) {
                // Bulk update sort orders
                for (const cat of categories) {
                    await db.category.update({
                        where: { id: cat.id },
                        data: {
                            sortOrder: cat.sortOrder
                        }
                    });
                }
                return res.json({ success: true, updated: categories.length });
            }

            // Single category update
            const { id } = req.query;
            const { name, description, image } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'Category ID required' });
            }

            const updated = await db.category.update({
                where: { id: String(id) },
                data: {
                    name,
                    description,
                    image,
                    slug: generateSlug(name)
                },
                include: {
                    _count: { select: { products: true } }
                }
            });

            return res.json(updated);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Categories API Error:', error);
        if (req.method === 'GET') {
            return res.json([]);
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
}
