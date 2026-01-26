const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixProductLinks() {
    try {
        console.log('Fetching hierarchy...');
        const { rows: categories } = await pool.query('SELECT id, name FROM "Category"');

        const catMap = {};
        categories.forEach(c => {
            catMap[c.name.toLowerCase()] = c.id;
        });

        // Mapping logic
        const mapping = {
            'storage': 'hard drives',
            'audio': 'headphones',
            'cables': 'cables',
            'peripherals': 'mice', // Defaulting to Mice for general peripherals
            'hubs': 'cables',      // Mapping Hubs to Cables for now
            'adapters': 'cables'   // Mapping Adapters to Cables for now
        };

        console.log('Updating products...');
        const { rows: products } = await pool.query('SELECT id, category FROM "Product" WHERE "categoryId" IS NULL');

        let updatedCount = 0;
        for (const prod of products) {
            if (!prod.category) continue;

            const targetName = mapping[prod.category.toLowerCase()] || prod.category.toLowerCase();
            const targetId = catMap[targetName];

            if (targetId) {
                await pool.query('UPDATE "Product" SET "categoryId" = $1 WHERE id = $2', [targetId, prod.id]);
                updatedCount++;
            }
        }

        console.log(`Success! Linked ${updatedCount} products to categories.`);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

fixProductLinks();
