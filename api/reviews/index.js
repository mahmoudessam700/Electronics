// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    createError,
    generateId,
} = require('../_utils/auth');

const pool = getPool();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const { productId, status, logs, reviewId } = req.query;

            if (logs === 'true') {
                const user = await requireAuth(req);
                if (user.role !== 'ADMIN') {
                    throw createError(403, 'Unauthorized');
                }

                let logQuery = `
                    SELECT l.*, u.name as "adminName"
                    FROM "ReviewLog" l
                    LEFT JOIN "User" u ON u.id = l."adminId"
                `;
                const logParams = [];
                if (reviewId) {
                    logParams.push(reviewId);
                    logQuery += ` WHERE l."reviewId" = $${logParams.length}`;
                }
                logQuery += ' ORDER BY l."createdAt" DESC';

                const { rows } = await pool.query(logQuery, logParams);
                return res.json(rows);
            }

            let query = `
                SELECT r.*, u.name as "userName", p.name as "productName"
                FROM "Review" r
                INNER JOIN "User" u ON u.id = r."userId"
                INNER JOIN "Product" p ON p.id = r."productId"
            `;
            const params = [];
            
            if (productId || status) {
                query += ' WHERE ';
                const conditions = [];
                if (productId) {
                    params.push(productId);
                    conditions.push(`r."productId" = $${params.length}`);
                }
                if (status) {
                    params.push(status);
                    conditions.push(`r.status = $${params.length}`);
                }
                query += conditions.join(' AND ');
            }
            
            query += ' ORDER BY r."createdAt" DESC';
            const { rows } = await pool.query(query, params);
            return res.json(rows);
        }

        if (req.method === 'POST') {
            const user = await requireAuth(req);
            const { rating, comment, productId } = req.body || {};
            
            if (!rating || !productId) {
                throw createError(400, 'Rating and Product ID are required');
            }

            const reviewId = generateId('rev');
            const { rows } = await pool.query(
                `INSERT INTO "Review" (id, rating, comment, "userId", "productId", status, "createdAt", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())
                 RETURNING *`,
                [reviewId, rating, comment || null, user.id, productId]
            );

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
                // Get old status
                const { rows: current } = await client.query('SELECT status FROM "Review" WHERE id = $1', [id]);
                if (!current.length) throw createError(404, 'Review not found');
                const oldStatus = current[0].status;

                // Update review
                const { rows: updated } = await client.query(
                    'UPDATE "Review" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
                    [status, id]
                );

                // Log the change
                const logId = generateId('revlog');
                await client.query(
                    `INSERT INTO "ReviewLog" (id, "reviewId", "adminId", "oldStatus", "newStatus", reason, "createdAt")
                     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                    [logId, id, user.id, oldStatus, status, reason || null]
                );

                return updated[0];
            });

            return res.json(result);
        }

        if (req.method === 'DELETE') {
            const user = await requireAuth(req);
            const { id } = req.query;
            
            // Check if user owns the review or is admin
            const { rows: existing } = await pool.query('SELECT "userId" FROM "Review" WHERE id = $1', [id]);
            if (!existing.length) throw createError(404, 'Review not found');
            
            if (user.role !== 'ADMIN' && existing[0].userId !== user.id) {
                throw createError(403, 'Unauthorized');
            }

            await pool.query('DELETE FROM "Review" WHERE id = $1', [id]);
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Reviews API Error:', error);
        return res.status(error.statusCode || 500).json({ error: error.message });
    }
};
