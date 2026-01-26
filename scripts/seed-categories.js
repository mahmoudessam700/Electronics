// Run with: node scripts/seed-categories.js
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL not set');
    }

    console.log('Connecting to database...');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    // Define categories
    const categories = [
        { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', sortOrder: 0 },
    ];

    const subcategories = [
        { name: 'PCs', slug: 'pcs', parentSlug: 'electronics', sortOrder: 1 },
        { name: 'Laptops', slug: 'laptops', parentSlug: 'electronics', sortOrder: 2 },
        { name: 'Mice', slug: 'mice', parentSlug: 'electronics', sortOrder: 3 },
        { name: 'Keyboards', slug: 'keyboards', parentSlug: 'electronics', sortOrder: 4 },
        { name: 'Headphones', slug: 'headphones', parentSlug: 'electronics', sortOrder: 5 },
        { name: 'Cables', slug: 'cables', parentSlug: 'electronics', sortOrder: 6 },
        { name: 'Mouse Pads', slug: 'mouse-pads', parentSlug: 'electronics', sortOrder: 7 },
        { name: 'Hard Drives', slug: 'hard-drives', parentSlug: 'electronics', sortOrder: 8 },
    ];

    console.log('Creating parent categories...');
    for (const cat of categories) {
        const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
            await prisma.category.create({ data: cat });
            console.log(`  ✅ Created: ${cat.name}`);
        } else {
            console.log(`  ⏭️  Skipped (exists): ${cat.name}`);
        }
    }

    console.log('Creating subcategories...');
    for (const sub of subcategories) {
        const existing = await prisma.category.findUnique({ where: { slug: sub.slug } });
        if (!existing) {
            const parent = await prisma.category.findUnique({ where: { slug: sub.parentSlug } });
            if (parent) {
                await prisma.category.create({
                    data: {
                        name: sub.name,
                        slug: sub.slug,
                        parentId: parent.id,
                        sortOrder: sub.sortOrder
                    }
                });
                console.log(`  ✅ Created: ${sub.name} (under ${sub.parentSlug})`);
            }
        } else {
            console.log(`  ⏭️  Skipped (exists): ${sub.name}`);
        }
    }

    console.log('\n✅ Categories seeded successfully!');

    // List all categories
    const allCats = await prisma.category.findMany({
        include: { children: true },
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' }
    });

    console.log('\nCurrent categories:');
    for (const cat of allCats) {
        console.log(`  📁 ${cat.name}`);
        for (const child of cat.children) {
            console.log(`     └─ ${child.name}`);
        }
    }

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
