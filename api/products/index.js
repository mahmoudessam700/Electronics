// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
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

// ============ REVIEWS HANDLERS ============
const handleReviews = async (req, res) => {
    if (req.method === 'GET') {
        const { productId, status, logs, reviewId } = req.query;

        if (logs === 'true') {
            const user = await requireAuth(req);
            if (user.role !== 'ADMIN') throw createError(403, 'Unauthorized');

            let logQuery = `
                SELECT l.*, u.name as adminName
                FROM ReviewLog l
                LEFT JOIN User u ON u.id = l.adminId
            `;
            const logParams = [];
            if (reviewId) {
                logQuery += ` WHERE l.reviewId = ?`;
                logParams.push(reviewId);
            }
            logQuery += ' ORDER BY l.createdAt DESC';

            const [rows] = await pool.execute(logQuery, logParams);
            return res.json(rows);
        }

        let query = `
            SELECT r.*, u.name as userName, p.name as productName
            FROM Review r
            INNER JOIN User u ON u.id = r.userId
            INNER JOIN Product p ON p.id = r.productId
        `;
        const params = [];
        const conditions = [];

        if (productId) {
            conditions.push(`r.productId = ?`);
            params.push(productId);
        }
        if (status) {
            conditions.push(`r.status = ?`);
            params.push(status);
        }

        if (conditions.length) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY r.createdAt DESC';
        const [rows] = await pool.execute(query, params);
        return res.json(rows);
    }

    if (req.method === 'POST') {
        const user = await requireAuth(req);
        const { rating, comment, productId } = req.body || {};

        if (!rating || !productId) {
            throw createError(400, 'Rating and Product ID are required');
        }

        const reviewId = generateId('rev');
        await pool.execute(
            `INSERT INTO Review (id, rating, comment, userId, productId, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
            [reviewId, rating, comment || null, user.id, productId]
        );

        const [rows] = await pool.execute('SELECT * FROM Review WHERE id = ?', [reviewId]);
        return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
        const user = await requireAuth(req);
        if (user.role !== 'ADMIN') {
            throw createError(403, 'Only admins can update review status');
        }

        const { id } = req.query;
        const { status, reason } = req.body || {};

        if (!id || !status) {
            throw createError(400, 'Review ID and status are required');
        }

        const result = await withTransaction(async (client) => {
            const [current] = await client.execute('SELECT status FROM Review WHERE id = ?', [id]);
            if (!current.length) throw createError(404, 'Review not found');
            const oldStatus = current[0].status;

            await client.execute(
                'UPDATE Review SET status = ?, updatedAt = NOW() WHERE id = ?',
                [status, id]
            );

            const logId = generateId('revlog');
            await client.execute(
                `INSERT INTO ReviewLog (id, reviewId, adminId, oldStatus, newStatus, reason, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [logId, id, user.id, oldStatus, status, reason || null]
            );

            const [updated] = await client.execute('SELECT * FROM Review WHERE id = ?', [id]);
            return updated[0];
        });

        return res.json(result);
    }

    if (req.method === 'DELETE') {
        const user = await requireAuth(req);
        const { id } = req.query;

        const [existing] = await pool.execute('SELECT userId FROM Review WHERE id = ?', [id]);
        if (!existing.length) throw createError(404, 'Review not found');

        if (user.role !== 'ADMIN' && existing[0].userId !== user.id) {
            throw createError(403, 'Unauthorized');
        }

        await pool.execute('DELETE FROM ReviewLog WHERE reviewId = ?', [id]);
        await pool.execute('DELETE FROM Review WHERE id = ?', [id]);
        return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ PRODUCTS HANDLERS ============

const baseSelect = `
    SELECT p.*,
           c.name as subcategoryName,
           cp.name as parentCategoryName,
           s.name as supplierName,
           sh.name as shopName,
           sh.slug as shopSlug,
           sh.defaultCommissionRate as shopCommissionRate,
           COALESCE(r.avgRating, p.rating) as rating,
           COALESCE(r.reviewCount, p.reviewCount) as reviewCount
    FROM Product p
    LEFT JOIN Category c ON p.categoryId = c.id
    LEFT JOIN Category cp ON c.parentId = cp.id
    LEFT JOIN Supplier s ON p.supplierId = s.id
    LEFT JOIN Shop sh ON p.shopId = sh.id
    LEFT JOIN (
        SELECT productId, AVG(rating) as avgRating, COUNT(id) as reviewCount
        FROM Review
        WHERE status = 'APPROVED'
        GROUP BY productId
    ) r ON p.id = r.productId
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
    const [rows] = await pool.execute(`${baseSelect} WHERE p.id = ?`, [id]);
    return formatProductRow(rows[0]);
};

const getProductMeta = async (id) => {
    const [rows] = await pool.execute('SELECT id, shopId FROM Product WHERE id = ?', [id]);
    return rows[0];
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // Check if this is a reviews request
        const resource = req.query.resource || req.query.type;
        if (resource === 'reviews') {
            return handleReviews(req, res);
        }

        // Handle products
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
                conditions.push(`p.categoryId = ?`);
                params.push(categoryId);
            } else if (category) {
                conditions.push(`(p.category = ? OR c.name = ?)`);
                params.push(category, category);
            }

            if (shopId) {
                conditions.push(`p.shopId = ?`);
                params.push(shopId);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY p.createdAt DESC';

            const [rows] = await pool.execute(query, params);
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

            await pool.execute(`
                INSERT INTO Product (
                    id, name, nameEn, nameAr, price, costPrice, originalPrice,
                    description, descriptionAr, category, categoryId, supplierId,
                    image, inStock, shopId, commissionRate, 
                    tracksInventory, inventoryQuantity, updatedAt
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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

            await pool.execute(`
                UPDATE Product
                SET name = COALESCE(?, name),
                    nameEn = COALESCE(?, nameEn),
                    nameAr = COALESCE(?, nameAr),
                    price = COALESCE(?, price),
                    costPrice = COALESCE(?, costPrice),
                    originalPrice = COALESCE(?, originalPrice),
                    description = COALESCE(?, description),
                    descriptionAr = COALESCE(?, descriptionAr),
                    category = COALESCE(?, category),
                    categoryId = COALESCE(?, categoryId),
                    supplierId = COALESCE(?, supplierId),
                    image = COALESCE(?, image),
                    inStock = COALESCE(?, inStock),
                    commissionRate = CASE WHEN ? THEN ? ELSE commissionRate END,
                    tracksInventory = COALESCE(?, tracksInventory),
                    inventoryQuantity = COALESCE(?, inventoryQuantity),
                    updatedAt = NOW()
                WHERE id = ?
            `, [
                name || null,
                nameEn || null,
                nameAr || null,
                price != null ? price : null,
                costPrice != null ? costPrice : null,
                originalPrice != null ? originalPrice : null,
                description || null,
                descriptionAr || null,
                category || null,
                categoryId || null,
                supplierId || null,
                image || null,
                inStock != null ? inStock : null,
                hasCommissionRate ? true : false,
                commissionRateValue,
                tracksInventory != null ? tracksInventory : null,
                inventoryQuantity != null ? inventoryQuantity : null,
                id,
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

            // Remove foreign key references before deleting
            await pool.execute('DELETE FROM ReviewLog WHERE reviewId IN (SELECT id FROM Review WHERE productId = ?)', [id]);
            await pool.execute('DELETE FROM Review WHERE productId = ?', [id]);
            await pool.execute('DELETE FROM Wishlist WHERE productId = ?', [id]);
            await pool.execute('DELETE FROM CartItem WHERE productId = ?', [id]);
            await pool.execute('UPDATE ShopCommissionLedger SET productId = NULL WHERE productId = ?', [id]);
            await pool.execute('DELETE FROM OrderItem WHERE productId = ?', [id]);
            await pool.execute('DELETE FROM Product WHERE id = ?', [id]);
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
