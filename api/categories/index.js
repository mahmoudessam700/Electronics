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
            const { id, parentId, includeProducts } = req.query;

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

            // List categories
            let query = `
                SELECT c.*, 
                       (SELECT count(*) FROM "Product" p WHERE p."categoryId" = c.id)::int as product_count
                FROM "Category" c
            `;
            const params = [];

            if (parentId === 'null') {
                query += ' WHERE c."parentId" IS NULL';
            } else if (parentId) {
                params.push(parentId);
                query += ' WHERE c."parentId" = $1';
            }

            query += ' ORDER BY c."sortOrder" ASC';

            const { rows } = await pool.query(query, params);

            // Map keys to match Prisma naming if needed by frontend (product_count vs _count.products)
            const result = rows.map(cat => ({
                ...cat,
                _count: { products: cat.product_count }
            }));

            return res.json(result);
        }

        if (req.method === 'POST') {
            const { name, description, image, parentId, sortOrder } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });

            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const id = `cat_${Date.now()}`;

            const { rows } = await pool.query(`
                INSERT INTO "Category" (id, name, slug, description, image, "parentId", "sortOrder", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING *
            `, [id, name, slug, description || null, image || null, parentId || null, sortOrder || 0]);

            return res.status(201).json(rows[0]);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, description, image, parentId, sortOrder } = req.body;
            if (!id) return res.status(400).json({ error: 'ID is required' });

            const { rows } = await pool.query(`
                UPDATE "Category"
                SET name = COALESCE($2, name),
                    description = COALESCE($3, description),
                    image = COALESCE($4, image),
                    "parentId" = COALESCE($5, "parentId"),
                    "sortOrder" = COALESCE($6, "sortOrder"),
                    "updatedAt" = NOW()
                WHERE id = $1
                RETURNING *
            `, [id, name, description, image, parentId, sortOrder]);

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
