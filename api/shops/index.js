// @ts-nocheck
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    ensureRole,
    ensureShopAccess,
    ensureShopRole,
    ensureSlug,
    normalizeCommissionRate,
    generateId,
    createError,
    SHOP_ADMIN_ROLES,
} = require('../_utils/auth');

const pool = getPool();

const baseShopSelect = `
    SELECT s.*,
        (
            SELECT COUNT(*)
            FROM "ShopMember" sm
            WHERE sm."shopId" = s.id AND sm.status = 'ACTIVE'
        ) AS "memberCount",
        (
            SELECT COUNT(*)
            FROM "ShopInvitation" si
            WHERE si."shopId" = s.id AND si.status = 'PENDING'
        ) AS "pendingInvitations",
        (
            SELECT COALESCE(SUM(l.amount), 0)
            FROM "ShopCommissionLedger" l
            WHERE l."shopId" = s.id
        ) AS "ledgerBalance"
    FROM "Shop" s
`;

const formatShopRow = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        logo: row.logo,
        email: row.email,
        phone: row.phone,
        address: row.address,
        status: row.status,
        kycStatus: row.kycStatus,
        defaultCommissionRate: row.defaultCommissionRate !== null
            ? Number(row.defaultCommissionRate)
            : 0,
        payoutSchedule: row.payoutSchedule,
        lastPayoutDate: row.lastPayoutDate,
        nextPayoutDate: row.nextPayoutDate,
        ownerId: row.ownerId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        metrics: {
            memberCount: Number(row.memberCount || 0),
            pendingInvitations: Number(row.pendingInvitations || 0),
            ledgerBalance: Number(row.ledgerBalance || 0),
        },
    };
};

const getShopById = async (id) => {
    const { rows } = await pool.query(`${baseShopSelect} WHERE s.id = $1`, [id]);
    return formatShopRow(rows[0]);
};

const buildShopListQuery = (user, { status, kycStatus, search }) => {
    const whereClauses = [];
    const params = [];

    if (status) {
        params.push(status);
        whereClauses.push(`s.status = $${params.length}`);
    }

    if (kycStatus) {
        params.push(kycStatus);
        whereClauses.push(`s."kycStatus" = $${params.length}`);
    }

    if (search) {
        params.push(`%${search.toLowerCase()}%`);
        whereClauses.push(`(LOWER(s.name) LIKE $${params.length} OR LOWER(s.slug) LIKE $${params.length})`);
    }

    if (user.role !== 'ADMIN') {
        const shopIds = (user.shopMemberships || []).map((membership) => membership.shopId);
        if (!shopIds.length) {
            return { query: `${baseShopSelect} WHERE 1 = 0`, params: [] };
        }
        params.push(shopIds);
        whereClauses.push(`s.id = ANY($${params.length}::text[])`);
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `${baseShopSelect} ${where} ORDER BY s."createdAt" DESC`;
    return { query, params };
};

const upsertOwnerMembership = async (client, shopId, ownerId) => {
    if (!ownerId) return;
    await client.query(
        `
        INSERT INTO "ShopMember" (id, "userId", "shopId", role, status)
        VALUES ($1, $2, $3, 'OWNER', 'ACTIVE')
        ON CONFLICT ("userId", "shopId")
        DO UPDATE SET role = 'OWNER', status = 'ACTIVE', "updatedAt" = NOW()
    `,
        [generateId('shop_member'), ownerId, shopId]
    );
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const user = await requireAuth(req);
            const { id } = req.query;

            if (id) {
                if (user.role !== 'ADMIN') {
                    ensureShopAccess(user, id);
                }
                const shop = await getShopById(id);
                if (!shop) return res.status(404).json({ error: 'Shop not found' });
                return res.json(shop);
            }

            const { query, params } = buildShopListQuery(user, req.query || {});
            const { rows } = await pool.query(query, params);
            return res.json(rows.map(formatShopRow));
        }

        if (req.method === 'POST') {
            const user = await requireAuth(req);
            ensureRole(user, ['ADMIN']);

            const {
                name,
                description,
                logo,
                email,
                phone,
                address,
                slug,
                ownerId,
                defaultCommissionRate,
                payoutSchedule,
                status = 'PENDING',
                kycStatus = 'UNVERIFIED',
            } = req.body || {};

            if (!name) {
                return res.status(400).json({ error: 'Shop name is required' });
            }

            const resolvedSlug = await ensureSlug(slug || name);
            const commissionRate = normalizeCommissionRate(defaultCommissionRate);
            const shopId = generateId('shop');

            await withTransaction(async (client) => {
                await client.query(
                    `
                    INSERT INTO "Shop" (
                        id, name, slug, description, logo, email, phone, address,
                        status, "kycStatus", "defaultCommissionRate", "payoutSchedule",
                        "ownerId", "createdAt", "updatedAt"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8,
                        $9, $10, $11, $12,
                        $13, NOW(), NOW()
                    )
                `,
                    [
                        shopId,
                        name,
                        resolvedSlug,
                        description || null,
                        logo || null,
                        email || null,
                        phone || null,
                        address || null,
                        status,
                        kycStatus,
                        commissionRate,
                        payoutSchedule || 'MANUAL',
                        ownerId || null,
                    ]
                );

                if (ownerId) {
                    await upsertOwnerMembership(client, shopId, ownerId);
                }
            });

            const created = await getShopById(shopId);
            return res.status(201).json(created);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Shop ID is required' });

            const user = await requireAuth(req);
            const isAdmin = user.role === 'ADMIN';
            if (!isAdmin) {
                ensureShopRole(user, id, SHOP_ADMIN_ROLES);
            }

            const {
                name,
                description,
                logo,
                email,
                phone,
                address,
                defaultCommissionRate,
                status,
                kycStatus,
                payoutSchedule,
                ownerId,
            } = req.body || {};

            const updates = {};
            const generalFields = { name, description, logo, email, phone, address };
            Object.entries(generalFields).forEach(([key, value]) => {
                if (value !== undefined) {
                    updates[key] = value || null;
                }
            });

            if (defaultCommissionRate !== undefined) {
                updates.defaultCommissionRate = normalizeCommissionRate(defaultCommissionRate);
            }

            if (isAdmin) {
                if (status !== undefined) updates.status = status;
                if (kycStatus !== undefined) updates.kycStatus = kycStatus;
                if (payoutSchedule !== undefined) updates.payoutSchedule = payoutSchedule;
                if (ownerId !== undefined) updates.ownerId = ownerId || null;
            }

            const keys = Object.keys(updates);
            if (!keys.length) {
                return res.status(400).json({ error: 'No changes provided' });
            }

            await withTransaction(async (client) => {
                const setClauses = keys.map((key, index) => {
                    const column = key === 'defaultCommissionRate'
                        ? '"defaultCommissionRate"'
                        : key === 'payoutSchedule'
                            ? '"payoutSchedule"'
                            : key === 'kycStatus'
                                ? '"kycStatus"'
                                : key === 'ownerId'
                                    ? '"ownerId"'
                                    : key;
                    return `${column} = $${index + 1}`;
                });

                const values = keys.map((key) => updates[key]);
                values.push(id);

                await client.query(
                    `
                    UPDATE "Shop"
                    SET ${setClauses.join(', ')}, "updatedAt" = NOW()
                    WHERE id = $${values.length}
                `,
                    values
                );

                if (isAdmin && ownerId) {
                    await upsertOwnerMembership(client, id, ownerId);
                }
            });

            const updated = await getShopById(id);
            return res.json(updated);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Shops API Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
