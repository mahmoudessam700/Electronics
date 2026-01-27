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
            const { id, categoryId, category } = req.query;

            // Detail view
            if (id) {
                const { rows } = await pool.query(`
                    SELECT p.*, 
                           c.name as "subcategoryName",
                           cp.name as "parentCategoryName",
                           s.name as "supplierName"
                    FROM "Product" p 
                    LEFT JOIN "Category" c ON p."categoryId" = c.id 
                    LEFT JOIN "Category" cp ON c."parentId" = cp.id
                    LEFT JOIN "Supplier" s ON p."supplierId" = s.id
                    WHERE p.id = $1
                `, [id]);

                if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
                return res.json(rows[0]);
            }

            // List view with filters
            let query = `
                SELECT p.*, 
                       c.name as "subcategoryName",
                       cp.name as "parentCategoryName",
                       s.name as "supplierName"
                FROM "Product" p 
                LEFT JOIN "Category" c ON p."categoryId" = c.id 
                LEFT JOIN "Category" cp ON c."parentId" = cp.id
                LEFT JOIN "Supplier" s ON p."supplierId" = s.id
            `;
            const params = [];
            const conditions = [];

            if (categoryId) {
                params.push(categoryId);
                conditions.push(`p."categoryId" = $${params.length}`);
            } else if (category) {
                params.push(category);
                conditions.push(`p.category = $${params.length} OR c.name = $${params.length}`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY p."createdAt" DESC';

            const { rows } = await pool.query(query, params);
            return res.json(rows);
        }

        if (req.method === 'POST') {
            const { name, price, costPrice, originalPrice, description, category, categoryId, supplierId, image, inStock } = req.body;

            if (!name || price === undefined || !image) {
                return res.status(400).json({ error: 'Name, price, and image are required' });
            }

            const { rows } = await pool.query(`
                INSERT INTO "Product" (id, name, price, "costPrice", "originalPrice", description, category, "categoryId", "supplierId", image, "inStock", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                RETURNING *
            `, [
                `prod_${Date.now()}`,
                name,
                price,
                costPrice || 0,
                originalPrice || null,
                description || null,
                category || null,
                categoryId || null,
                supplierId || null,
                image,
                inStock ?? true
            ]);

            return res.status(201).json(rows[0]);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            const { name, price, costPrice, originalPrice, description, category, categoryId, supplierId, image, inStock } = req.body;

            if (!id) return res.status(400).json({ error: 'Product ID is required' });

            const { rows } = await pool.query(`
                UPDATE "Product" 
                SET name = COALESCE($2, name),
                    price = COALESCE($3, price),
                    "costPrice" = COALESCE($4, "costPrice"),
                    "originalPrice" = COALESCE($5, "originalPrice"),
                    description = COALESCE($6, description),
                    category = COALESCE($7, category),
                    "categoryId" = COALESCE($8, "categoryId"),
                    "supplierId" = COALESCE($9, "supplierId"),
                    image = COALESCE($10, image),
                    "inStock" = COALESCE($11, "inStock"),
                    "updatedAt" = NOW()
                WHERE id = $1
                RETURNING *
            `, [id, name, price, costPrice, originalPrice, description, category, categoryId, supplierId, image, inStock]);

            if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
            return res.json(rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Product ID is required' });

            await pool.query('DELETE FROM "Product" WHERE id = $1', [id]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Products API Error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
