const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function organizeCategories() {
    const categories = [
        'PCs', 'Laptops', 'Mice', 'Keyboards',
        'Headphones', 'Cables', 'Mouse Pads', 'Hard Drives'
    ];

    try {
        console.log('Connecting to database...');

        // 1. Ensure "Electronics" exists
        let { rows: electronicsRows } = await pool.query(
            'SELECT id FROM "Category" WHERE name = $1 OR slug = $2',
            ['Electronics', 'electronics']
        );

        let electronicsId;
        if (electronicsRows.length === 0) {
            console.log('Creating "Electronics" category...');
            const { rows } = await pool.query(
                'INSERT INTO "Category" (id, name, slug, "sortOrder", "updatedAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
                [`cat_${Date.now()}`, 'Electronics', 'electronics', 0]
            );
            electronicsId = rows[0].id;
        } else {
            electronicsId = electronicsRows[0].id;
            console.log(`"Electronics" found with ID: ${electronicsId}`);
        }

        // 2. Link subcategories
        for (const name of categories) {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            const { rows: existing } = await pool.query(
                'SELECT id FROM "Category" WHERE name = $1 OR slug = $2',
                [name, slug]
            );

            if (existing.length > 0) {
                console.log(`Updating "${name}" to be under "Electronics"...`);
                await pool.query(
                    'UPDATE "Category" SET "parentId" = $1, "updatedAt" = NOW() WHERE id = $2',
                    [electronicsId, existing[0].id]
                );
            } else {
                console.log(`Creating "${name}" under "Electronics"...`);
                await pool.query(
                    'INSERT INTO "Category" (id, name, slug, "parentId", "sortOrder", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW())',
                    [`cat_${Math.random().toString(36).substr(2, 9)}`, name, slug, electronicsId, 0]
                );
            }
        }

        console.log('Hierarchy successfully organized!');
    } catch (err) {
        console.error('Error organizing categories:', err);
    } finally {
        await pool.end();
    }
}

organizeCategories();
