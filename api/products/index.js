// @ts-nocheck
const { getPool } = require('../_utils/db');
const {
    requireAuth,
    resolveShopContext,
    ensureShopAccess,
    normalizeCommissionRate,
    generateId,
    createError,
} = require('../_utils/auth');
const { calculateCommission } = require('../_utils/pricing');

const pool = getPool();

const baseSelect = `
    SELECT p.*,
           c.name as "subcategoryName",
           cp.name as "parentCategoryName",
           s.name as "supplierName",
           sh.name as "shopName",
           sh.slug as "shopSlug",
           sh."defaultCommissionRate" as "shopCommissionRate",
           COALESCE(r."avgRating", p.rating) as "rating",
           COALESCE(r."reviewCount", p."reviewCount") as "reviewCount"
    FROM "Product" p
    LEFT JOIN "Category" c ON p."categoryId" = c.id
    LEFT JOIN "Category" cp ON c."parentId" = cp.id
    LEFT JOIN "Supplier" s ON p."supplierId" = s.id
    LEFT JOIN "Shop" sh ON p."shopId" = sh.id
    LEFT JOIN (
        SELECT "productId", AVG(rating) as "avgRating", COUNT(id) as "reviewCount"
        FROM "Review"
        WHERE status = 'APPROVED'
        GROUP BY "productId"
    ) r ON p.id = r."productId"
`;

const formatProductRow = (row) => {
    if (!row) return null;
    const { shopName, shopSlug, shopCommissionRate, ...product } = row;
    const { rate, commissionAmount, displayPrice } = calculateCommission(row.price, row.commissionRate, shopCommissionRate);
    return {
        ...product,
        shopName,
        shopSlug,
        shop: row.shopId ? { id: row.shopId, name: shopName, slug: shopSlug } : null,
        commissionRateApplied: rate,
        commissionAmount,
        displayPrice,
        rating: parseFloat(row.rating || 0),
        reviewCount: parseInt(row.reviewCount || 0, 10),
    };
};

const getProductWithRelations = async (id) => {
    const { rows } = await pool.query(`${baseSelect} WHERE p.id = $1`, [id]);
    return formatProductRow(rows[0]);
};

const getProductMeta = async (id) => {
    const { rows } = await pool.query('SELECT id, "shopId" FROM "Product" WHERE id = $1', [id]);
    return rows[0];
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { id, categoryId, category, shopId } = req.query;

            if (id) {
                const product = await getProductWithRelations(id);
                if (!product) return res.status(404).json({ error: 'Product not found' });
                return res.json(product);
            }

            let query = baseSelect;
            const params = [];
            const conditions = [];

            if (categoryId) {
                params.push(categoryId);
                conditions.push(`p."categoryId" = $${params.length}`);
            } else if (category) {
                params.push(category);
                conditions.push(`(p.category = $${params.length} OR c.name = $${params.length})`);
            }

            if (shopId) {
                params.push(shopId);
                conditions.push(`p."shopId" = $${params.length}`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY p."createdAt" DESC';

            const { rows } = await pool.query(query, params);
            return res.json(rows.map(formatProductRow));
        }

        if (req.method === 'POST') {
            const user = await requireAuth(req);
            const {
                name,
                nameEn,
                nameAr,
                price,
                costPrice,
                originalPrice,
                description,
                descriptionAr,
                category,
                categoryId,
                supplierId,
                image,
                inStock,
                shopId: bodyShopId,
                commissionRate,
                tracksInventory,
                inventoryQuantity,
            } = req.body;

            if (!name || price === undefined || price === null || !image) {
                return res.status(400).json({ error: 'Name, price, and image are required' });
            }

            const { shopId } = resolveShopContext(user, bodyShopId);

            let commissionRateValue = null;
            if (Object.prototype.hasOwnProperty.call(req.body, 'commissionRate')) {
                commissionRateValue = commissionRate === null ? null : normalizeCommissionRate(commissionRate);
            }

            const productId = generateId('prod');

            await pool.query(`
                INSERT INTO "Product" (
                    id, name, "nameEn", "nameAr", price, "costPrice", "originalPrice",
                    description, "descriptionAr", category, "categoryId", "supplierId",
                    image, "inStock", "shopId", "commissionRate", 
                    "tracksInventory", "inventoryQuantity", "updatedAt"
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12,
                    $13, $14, $15, $16,
                    $17, $18, NOW()
                )
            `, [
                productId,
                name,
                nameEn || name,
                nameAr || null,
                price,
                costPrice || 0,
                originalPrice || null,
                description || null,
                descriptionAr || null,
                category || null,
                categoryId || null,
                supplierId || null,
                image,
                inStock ?? true,
                shopId,
                commissionRateValue,
                tracksInventory ?? false,
                inventoryQuantity ?? 0,
            ]);

            const created = await getProductWithRelations(productId);
            return res.status(201).json(created);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Product ID is required' });

            const user = await requireAuth(req);
            const productMeta = await getProductMeta(id);
            if (!productMeta) return res.status(404).json({ error: 'Product not found' });

            if (productMeta.shopId) {
                ensureShopAccess(user, productMeta.shopId);
            } else if (user.role !== 'ADMIN') {
                throw createError(403, 'Only admins can modify unassigned products');
            }

            const {
                name,
                nameEn,
                nameAr,
                price,
                costPrice,
                originalPrice,
                description,
                descriptionAr,
                category,
                categoryId,
                supplierId,
                image,
                inStock,
                commissionRate,
                tracksInventory,
                inventoryQuantity,
            } = req.body;

            const hasCommissionRate = Object.prototype.hasOwnProperty.call(req.body, 'commissionRate');
            let commissionRateValue = null;
            if (hasCommissionRate) {
                commissionRateValue = commissionRate === null ? null : normalizeCommissionRate(commissionRate);
            }

            await pool.query(`
                UPDATE "Product"
                SET name = COALESCE($2, name),
                    "nameEn" = COALESCE($3, "nameEn"),
                    "nameAr" = COALESCE($4, "nameAr"),
                    price = COALESCE($5, price),
                    "costPrice" = COALESCE($6, "costPrice"),
                    "originalPrice" = COALESCE($7, "originalPrice"),
                    description = COALESCE($8, description),
                    "descriptionAr" = COALESCE($9, "descriptionAr"),
                    category = COALESCE($10, category),
                    "categoryId" = COALESCE($11, "categoryId"),
                    "supplierId" = COALESCE($12, "supplierId"),
                    image = COALESCE($13, image),
                    "inStock" = COALESCE($14, "inStock"),
                    "commissionRate" = CASE WHEN $15 THEN $16 ELSE "commissionRate" END,
                    "tracksInventory" = COALESCE($17, "tracksInventory"),
                    "inventoryQuantity" = COALESCE($18, "inventoryQuantity"),
                    "updatedAt" = NOW()
                WHERE id = $1
            `, [
                id,
                name,
                nameEn,
                nameAr,
                price,
                costPrice,
                originalPrice,
                description,
                descriptionAr,
                category,
                categoryId,
                supplierId,
                image,
                inStock,
                hasCommissionRate,
                commissionRateValue,
                tracksInventory,
                inventoryQuantity,
            ]);

            const updated = await getProductWithRelations(id);
            return res.json(updated);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Product ID is required' });

            const user = await requireAuth(req);
            const productMeta = await getProductMeta(id);
            if (!productMeta) return res.status(404).json({ error: 'Product not found' });

            if (productMeta.shopId) {
                ensureShopAccess(user, productMeta.shopId);
            } else if (user.role !== 'ADMIN') {
                throw createError(403, 'Only admins can delete unassigned products');
            }

            await pool.query('DELETE FROM "Product" WHERE id = $1', [id]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Products API Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
