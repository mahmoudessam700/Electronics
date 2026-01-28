const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { id, parentId } = req.query;

            // Single category detail
            if (id) {
                const { rows } = await pool.query(`
                    SELECT c.*, 
                           (SELECT json_agg(p.*) FROM "Product" p WHERE p."categoryId" = c.id) as products
                    FROM "Category" c 
                    WHERE c.id = $1
                `, [id]);

                if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
                return res.json(rows[0]);
            }

            // List categories with tree support
            const { rows } = await pool.query(`
                SELECT c.*, 
                       (SELECT count(*) FROM "Product" p WHERE p."categoryId" = c.id)::int as product_count
                FROM "Category" c
                ORDER BY c."sortOrder" ASC
            `);

            const buildTree = (items, pId = null) => {
                return items
                    .filter(item => item.parentId === pId)
                    .map(item => ({
                        ...item,
                        children: buildTree(items, item.id),
                        _count: { products: item.product_count }
                    }));
            };

            // If parentId=null is passed, return the tree
            if (parentId === 'null') {
                return res.json(buildTree(rows, null));
            }

            // Otherwise return flat list or filtered by parentId
            if (parentId) {
                const filtered = rows.filter(c => c.parentId === parentId);
                return res.json(filtered.map(c => ({
                    ...c,
                    _count: { products: c.product_count }
                })));
            }

            // Return flat list with _count for consistency
            return res.json(rows.map(c => ({
                ...c,
                _count: { products: c.product_count }
            })));
        }

        if (req.method === 'POST') {
            const { name, nameEn, nameAr, description, image, parentId, sortOrder } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const id = `cat_${Date.now()}`;

            const { rows } = await pool.query(`
                INSERT INTO "Category" (id, name, "nameEn", "nameAr", slug, description, image, "parentId", "sortOrder", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                RETURNING *
            `, [id, name, nameEn || name, nameAr || null, slug, description || null, image || null, parentId || null, sortOrder || 0]);

            return res.status(201).json(rows[0]);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, nameEn, nameAr, description, image, parentId, sortOrder, categories: batchUpdates } = req.body;

            // Batch update for reordering
            if (batchUpdates && Array.isArray(batchUpdates)) {
                await pool.query('BEGIN');
                try {
                    for (const update of batchUpdates) {
                        await pool.query(`
                            UPDATE "Category"
                            SET "sortOrder" = $2,
                                "parentId" = $3,
                                "updatedAt" = NOW()
                            WHERE id = $1
                        `, [update.id, update.sortOrder, update.parentId || null]);
                    }
                    await pool.query('COMMIT');
                    return res.json({ success: true });
                } catch (e) {
                    await pool.query('ROLLBACK');
                    throw e;
                }
            }

            if (!id) return res.status(400).json({ error: 'ID is required' });

            const { rows } = await pool.query(`
                UPDATE "Category"
                SET name = COALESCE($2, name),
                    "nameEn" = COALESCE($3, "nameEn"),
                    "nameAr" = COALESCE($4, "nameAr"),
                    description = COALESCE($5, description),
                    image = COALESCE($6, image),
                    "parentId" = COALESCE($7, "parentId"),
                    "sortOrder" = COALESCE($8, "sortOrder"),
                    "updatedAt" = NOW()
                WHERE id = $1
                RETURNING *
            `, [id, name, nameEn, nameAr, description, image, parentId, sortOrder]);

            return res.json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID is required' });

            await pool.query('DELETE FROM "Category" WHERE id = $1', [id]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Categories API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
