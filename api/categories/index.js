// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');

const pool = getPool();

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
                const [rows] = await pool.execute(`
                    SELECT c.* 
                    FROM Category c 
                    WHERE c.id = ?
                `, [id]);

                if (rows.length === 0) return res.status(404).json({ error: 'Category not found' });
                
                // Get products for this category
                const [products] = await pool.execute('SELECT * FROM Product WHERE categoryId = ?', [id]);
                rows[0].products = products;
                
                return res.json(rows[0]);
            }

            // List categories with tree support
            const [rows] = await pool.execute(`
                SELECT c.*, 
                       (SELECT COUNT(*) FROM Product p WHERE p.categoryId = c.id) as product_count
                FROM Category c
                ORDER BY c.sortOrder ASC
            `);

            const buildTree = (items, pId = null) => {
                return items
                    .filter(item => item.parentId === pId)
                    .map(item => ({
                        ...item,
                        children: buildTree(items, item.id),
                        _count: { products: Number(item.product_count) }
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
                    _count: { products: Number(c.product_count) }
                })));
            }

            // Return flat list with _count for consistency
            return res.json(rows.map(c => ({
                ...c,
                _count: { products: Number(c.product_count) }
            })));
        }

        if (req.method === 'POST') {
            const { name, nameEn, nameAr, description, image, parentId, sortOrder } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const id = `cat_${Date.now()}`;

            await pool.execute(`
                INSERT INTO Category (id, name, nameEn, nameAr, slug, description, image, parentId, sortOrder, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [id, name, nameEn || name, nameAr || null, slug, description || null, image || null, parentId || null, sortOrder || 0]);

            const [rows] = await pool.execute('SELECT * FROM Category WHERE id = ?', [id]);
            return res.status(201).json(rows[0]);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, nameEn, nameAr, description, image, parentId, sortOrder, categories: batchUpdates } = req.body;

            // Batch update for reordering
            if (batchUpdates && Array.isArray(batchUpdates)) {
                await withTransaction(async (conn) => {
                    for (const update of batchUpdates) {
                        await conn.execute(`
                            UPDATE Category
                            SET sortOrder = ?,
                                parentId = ?,
                                updatedAt = NOW()
                            WHERE id = ?
                        `, [update.sortOrder, update.parentId || null, update.id]);
                    }
                });
                return res.json({ success: true });
            }

            if (!id) return res.status(400).json({ error: 'ID is required' });

            await pool.execute(`
                UPDATE Category
                SET name = COALESCE(?, name),
                    nameEn = COALESCE(?, nameEn),
                    nameAr = COALESCE(?, nameAr),
                    description = COALESCE(?, description),
                    image = COALESCE(?, image),
                    parentId = COALESCE(?, parentId),
                    sortOrder = COALESCE(?, sortOrder),
                    updatedAt = NOW()
                WHERE id = ?
            `, [name, nameEn, nameAr, description, image, parentId, sortOrder, id]);

            const [rows] = await pool.execute('SELECT * FROM Category WHERE id = ?', [id]);
            return res.json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID is required' });

            await pool.execute('DELETE FROM Category WHERE id = ?', [id]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Categories API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
