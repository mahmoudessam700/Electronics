/**
 * Migration script to populate nameEn and nameAr for existing categories
 * Run with: node scripts/migrate-category-names.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Predefined translations for existing categories
const CATEGORY_TRANSLATIONS = {
    'PCs': { nameEn: 'PCs', nameAr: 'أجهزة الكمبيوتر' },
    'Laptops': { nameEn: 'Laptops', nameAr: 'أجهزة اللابتوب' },
    'Mice': { nameEn: 'Mice', nameAr: 'الفأرات' },
    'Keyboards': { nameEn: 'Keyboards', nameAr: 'لوحات المفاتيح' },
    'Headphones': { nameEn: 'Headphones', nameAr: 'سماعات الرأس' },
    'Cables': { nameEn: 'Cables', nameAr: 'الكابلات' },
    'Mouse Pads': { nameEn: 'Mouse Pads', nameAr: 'وسائد الماوس' },
    'Hard Drives': { nameEn: 'Hard Drives', nameAr: 'الأقراص الصلبة' },
    'Electronics': { nameEn: 'Electronics', nameAr: 'الإلكترونيات' },
};

async function migrateCategories() {
    console.log('Starting category name migration...\n');

    try {
        // Get all categories
        const { rows: categories } = await pool.query('SELECT id, name, "nameEn", "nameAr" FROM "Category"');
        
        console.log(`Found ${categories.length} categories\n`);

        for (const category of categories) {
            const translation = CATEGORY_TRANSLATIONS[category.name];
            
            if (translation) {
                // Only update if nameEn or nameAr is not already set
                const needsUpdate = !category.nameEn || !category.nameAr;
                
                if (needsUpdate) {
                    await pool.query(`
                        UPDATE "Category"
                        SET "nameEn" = COALESCE("nameEn", $2),
                            "nameAr" = COALESCE("nameAr", $3),
                            "updatedAt" = NOW()
                        WHERE id = $1
                    `, [category.id, translation.nameEn, translation.nameAr]);
                    
                    console.log(`✓ Updated "${category.name}": nameEn="${translation.nameEn}", nameAr="${translation.nameAr}"`);
                } else {
                    console.log(`- Skipped "${category.name}" (already has translations)`);
                }
            } else {
                console.log(`⚠ No translation defined for "${category.name}" - using name as nameEn`);
                
                if (!category.nameEn) {
                    await pool.query(`
                        UPDATE "Category"
                        SET "nameEn" = $2,
                            "updatedAt" = NOW()
                        WHERE id = $1
                    `, [category.id, category.name]);
                }
            }
        }

        console.log('\n✅ Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrateCategories();
