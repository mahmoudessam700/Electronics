// @ts-nocheck
const crypto = require('crypto');
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
    resolveShopContext,
    SHOP_ADMIN_ROLES,
    SHOP_FINANCE_ROLES,
} = require('../_utils/auth');
const {
    getLatestBalance,
    recordPayoutLedgerEntry,
} = require('../_utils/ledger');

const pool = getPool();

const normalizeQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

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

// ============ SHOP PAYOUTS HELPERS ============
const listPayouts = async ({ shopId, status }) => {
    const params = [shopId];
    let whereClause = 'WHERE sp."shopId" = $1';
    if (status) {
        params.push(status);
        whereClause += ` AND sp.status = $${params.length}`;
    }

    const { rows } = await pool.query(
        `
        SELECT sp.id, sp."shopId", sp.amount, sp.currency, sp.status, sp."scheduledFor", sp."processedAt",
               sp.reference, sp.notes, sp."preferenceId", sp."createdAt", sp."updatedAt",
               COALESCE(stats."orderCount", 0) AS "orderCount",
               COALESCE(stats."orderTotal", 0) AS "orderTotal"
        FROM "ShopPayout" sp
        LEFT JOIN (
            SELECT "shopPayoutId",
                   COUNT(*) AS "orderCount",
                   COALESCE(SUM(("totalAmount" - "commissionTotal")), 0)::double precision AS "orderTotal"
            FROM "Order"
            WHERE "shopPayoutId" IS NOT NULL
            GROUP BY "shopPayoutId"
        ) AS stats ON stats."shopPayoutId" = sp.id
        ${whereClause}
        ORDER BY sp."createdAt" DESC
        LIMIT 100
    `,
        params,
    );
    return rows;
};

const summarizeAwaitingOrders = async (executor, shopId) => {
    const runner = executor || pool;
    const { rows } = await runner.query(
        `
        SELECT COUNT(*)::int AS count,
               COALESCE(SUM(("totalAmount" - "commissionTotal")), 0) AS amount
        FROM "Order"
        WHERE "shopId" = $1
          AND status = 'DELIVERED'
          AND "shopPayoutStatus" = 'NOT_REQUESTED'
    `,
        [shopId],
    );
    const summary = rows[0] || { count: 0, amount: 0 };
    summary.amount = Number(summary.amount) || 0;
    summary.count = Number(summary.count) || 0;
    return summary;
};

const fetchAttachableOrders = async (client, shopId) => {
    const { rows } = await client.query(
        `
        SELECT id, "totalAmount", "commissionTotal"
        FROM "Order"
        WHERE "shopId" = $1
          AND status = 'DELIVERED'
          AND "shopPayoutStatus" = 'NOT_REQUESTED'
        ORDER BY "createdAt" ASC
        FOR UPDATE
    `,
        [shopId],
    );
    return rows
        .map((row) => {
            const gross = Number(row.totalAmount) || 0;
            const commission = Number(row.commissionTotal) || 0;
            const netAmount = gross - commission;
            return { id: row.id, netAmount: Math.max(netAmount, 0) };
        })
        .filter((entry) => entry.netAmount > 0);
};

const selectOrdersForAmount = (orders, requestedAmount) => {
    if (!orders.length) {
        return { selected: [], total: 0 };
    }
    const desired = Number(requestedAmount);
    const fullAmount = orders.reduce((sum, order) => sum + order.netAmount, 0);
    const target = Number.isFinite(desired) && desired > 0 ? desired : fullAmount;
    const selected = [];
    let runningTotal = 0;
    for (const order of orders) {
        selected.push(order);
        runningTotal += order.netAmount;
        if (runningTotal + 1e-6 >= target) {
            break;
        }
    }
    return { selected, total: runningTotal };
};

const parseScheduledDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw createError(400, 'Invalid scheduledFor date');
    }
    return date;
};

const fetchPayoutPreference = async (client, shopId) => {
    const { rows } = await client.query(
        'SELECT id FROM "ShopPayoutPreference" WHERE "shopId" = $1',
        [shopId],
    );
    return rows[0]?.id || null;
};

// ============ SHOP MEMBERS HELPERS ============
const formatMemberRow = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        shopId: row.shopId,
        userId: row.userId,
        role: row.role,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
            id: row.userId,
            name: row.userName,
            email: row.userEmail,
            image: row.userImage,
        },
    };
};

const formatInvitationRow = (row, { includeToken = false } = {}) => {
    if (!row) return null;
    const base = {
        id: row.id,
        shopId: row.shopId,
        email: row.email,
        role: row.role,
        status: row.status,
        expiresAt: row.expiresAt,
        acceptedAt: row.acceptedAt,
        revokedAt: row.revokedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        invitedBy: row.invitedById
            ? {
                  id: row.invitedById,
                  name: row.invitedByName,
                  email: row.invitedByEmail,
              }
            : null,
    };
    if (includeToken) {
        base.token = row.token;
    }
    return base;
};

const getMembersForShop = async (shopId) => {
    const { rows } = await pool.query(
        `
        SELECT sm.*, sm."shopId" AS "shopId",
               u.name AS "userName",
               u.email AS "userEmail",
               u.image AS "userImage"
        FROM "ShopMember" sm
        INNER JOIN "User" u ON u.id = sm."userId"
        WHERE sm."shopId" = $1
        ORDER BY
            CASE sm.role
                WHEN 'OWNER' THEN 0
                WHEN 'MANAGER' THEN 1
                WHEN 'FINANCE' THEN 2
                ELSE 3
            END,
            u.name NULLS LAST
    `,
        [shopId]
    );
    return rows.map(formatMemberRow);
};

const getInvitationsForShop = async (shopId) => {
    const { rows } = await pool.query(
        `
        SELECT si.*, si."shopId" AS "shopId",
               inviter.name AS "invitedByName",
               inviter.email AS "invitedByEmail"
        FROM "ShopInvitation" si
        LEFT JOIN "User" inviter ON inviter.id = si."invitedById"
        WHERE si."shopId" = $1
        ORDER BY si."createdAt" DESC
    `,
        [shopId]
    );
    return rows.map((row) => formatInvitationRow(row));
};

const getMemberMeta = async (memberId) => {
    const { rows } = await pool.query(
        `
        SELECT sm.*, u.email AS "userEmail", u.name AS "userName"
        FROM "ShopMember" sm
        INNER JOIN "User" u ON u.id = sm."userId"
        WHERE sm.id = $1
    `,
        [memberId]
    );
    return rows[0] || null;
};

const getInvitationMeta = async (invitationId) => {
    const { rows } = await pool.query(
        `
        SELECT si.*
        FROM "ShopInvitation" si
        WHERE si.id = $1
    `,
        [invitationId]
    );
    return rows[0] || null;
};

const ensureAdditionalOwnerExists = async (shopId, excludeMemberId) => {
    const { rows } = await pool.query(
        `
        SELECT id
        FROM "ShopMember"
        WHERE "shopId" = $1 AND role = 'OWNER' AND status = 'ACTIVE' AND id <> $2
        LIMIT 1
    `,
        [shopId, excludeMemberId]
    );
    if (!rows.length) {
        throw createError(400, 'Each shop must retain at least one active owner');
    }
};

const getMemberForUser = async (shopId, userId) => {
    const { rows } = await pool.query(
        `
        SELECT sm.*, u.name AS "userName", u.email AS "userEmail", u.image AS "userImage"
        FROM "ShopMember" sm
        INNER JOIN "User" u ON u.id = sm."userId"
        WHERE sm."shopId" = $1 AND sm."userId" = $2
    `,
        [shopId, userId]
    );
    return formatMemberRow(rows[0]);
};

const rosterResponse = async (shopId) => {
    const [members, invitations] = await Promise.all([
        getMembersForShop(shopId),
        getInvitationsForShop(shopId),
    ]);
    return { members, invitations };
};

const normalizeEmail = (value) => value?.trim().toLowerCase();

const createInvitation = async (user, payload = {}) => {
    const { shopId, email, role = 'STAFF', expiresInDays = 7 } = payload;
    if (!shopId) throw createError(400, 'shopId is required');
    if (!email) throw createError(400, 'invitee email is required');

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw createError(400, 'A valid email is required');
    }

    const { membership } = ensureShopRole(user, shopId, SHOP_ADMIN_ROLES);
    if (role === 'OWNER' && user.role !== 'ADMIN' && membership?.role !== 'OWNER') {
        throw createError(403, 'Only admins or owners can invite new owners');
    }

    await pool.query(
        `
        UPDATE "ShopInvitation"
        SET status = 'REVOKED', "revokedAt" = NOW(), "updatedAt" = NOW()
        WHERE "shopId" = $1 AND LOWER(email) = $2 AND status = 'PENDING'
    `,
        [shopId, normalizedEmail]
    );

    const { rowCount: existingMembers } = await pool.query(
        `
        SELECT 1
        FROM "ShopMember" sm
        INNER JOIN "User" u ON u.id = sm."userId"
        WHERE sm."shopId" = $1 AND LOWER(u.email) = $2
        LIMIT 1
    `,
        [shopId, normalizedEmail]
    );
    if (existingMembers) {
        throw createError(400, 'A member with this email already exists');
    }

    const invitationId = generateId('shop_invite');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const { rows } = await pool.query(
        `
        INSERT INTO "ShopInvitation" (
            id, "shopId", email, role, status, token, "expiresAt", "invitedById",
            "createdAt", "updatedAt"
        ) VALUES (
            $1, $2, $3, $4, 'PENDING', $5, $6, $7,
            NOW(), NOW()
        )
        RETURNING *
    `,
        [invitationId, shopId, normalizedEmail, role, token, expiresAt, user.id]
    );

    const enriched = await pool.query(
        `
        SELECT si.*, inviter.name AS "invitedByName", inviter.email AS "invitedByEmail"
        FROM "ShopInvitation" si
        LEFT JOIN "User" inviter ON inviter.id = si."invitedById"
        WHERE si.id = $1
    `,
        [rows[0].id]
    );

    return formatInvitationRow(enriched.rows[0], { includeToken: true });
};

const acceptInvitation = async (user, token) => {
    if (!token) throw createError(400, 'Invitation token is required');
    const { rows } = await pool.query('SELECT * FROM "ShopInvitation" WHERE token = $1', [token]);
    const invitation = rows[0];
    if (!invitation) throw createError(404, 'Invitation not found');
    if (invitation.status !== 'PENDING') {
        throw createError(400, 'This invitation is no longer active');
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await pool.query(
            `
            UPDATE "ShopInvitation"
            SET status = 'EXPIRED', "updatedAt" = NOW()
            WHERE id = $1
        `,
            [invitation.id]
        );
        throw createError(400, 'This invitation has expired');
    }

    if (normalizeEmail(invitation.email) !== normalizeEmail(user.email)) {
        throw createError(403, 'This invitation is assigned to a different email address');
    }

    await withTransaction(async (client) => {
        await client.query(
            `
            UPDATE "ShopInvitation"
            SET status = 'ACCEPTED', "acceptedAt" = NOW(), "updatedAt" = NOW()
            WHERE id = $1
        `,
            [invitation.id]
        );
        await client.query(
            `
            INSERT INTO "ShopMember" (id, "userId", "shopId", role, status)
            VALUES ($1, $2, $3, $4, 'ACTIVE')
            ON CONFLICT ("userId", "shopId")
            DO UPDATE SET role = EXCLUDED.role, status = 'ACTIVE', "updatedAt" = NOW()
        `,
            [generateId('shop_member'), user.id, invitation.shopId, invitation.role]
        );
    });

    const membership = await getMemberForUser(invitation.shopId, user.id);
    return {
        invitation: { id: invitation.id, status: 'ACCEPTED' },
        membership,
    };
};

// ============ SHOP PAYOUTS HANDLER ============
const handlePayouts = async (req, res, user) => {
    const providedShopId = normalizeQueryValue(req.query.shopId);
    const context = resolveShopContext(user, providedShopId);

    if (req.method === 'GET') {
        ensureShopRole(user, context.shopId, SHOP_FINANCE_ROLES);
        const status = normalizeQueryValue(req.query.status);
        const payouts = await listPayouts({ shopId: context.shopId, status });
        const balance = await getLatestBalance(pool, context.shopId);
        const eligibleOrders = await summarizeAwaitingOrders(pool, context.shopId);
        return res.status(200).json({ payouts, balance, eligibleOrders });
    }

    if (req.method === 'POST') {
        ensureShopRole(user, context.shopId, SHOP_FINANCE_ROLES);
        const { amount, currency = 'EGP', notes, scheduledFor, reference: providedReference } = req.body || {};
        const requestedAmount = Number(amount);
        if (amount && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) {
            throw createError(400, 'Invalid requested amount');
        }

        const reference = (providedReference || '').trim() || `SP-${Date.now()}`;
        const scheduleDate = parseScheduledDate(scheduledFor);

        const result = await withTransaction(async (client) => {
            const currentBalance = await getLatestBalance(client, context.shopId);
            const attachableOrders = await fetchAttachableOrders(client, context.shopId);
            if (!attachableOrders.length) {
                throw createError(422, 'No delivered orders are ready for payout');
            }

            const totalAttachable = attachableOrders.reduce((sum, entry) => sum + entry.netAmount, 0);
            if (requestedAmount > totalAttachable) {
                throw createError(422, 'Requested amount exceeds delivered balance');
            }

            const desiredTarget = Number.isFinite(requestedAmount) && requestedAmount > 0 ? requestedAmount : totalAttachable;
            const cappedTarget = Math.min(desiredTarget, currentBalance);
            if (cappedTarget <= 0) {
                throw createError(422, 'Insufficient balance for payout');
            }
            const { selected, total } = selectOrdersForAmount(attachableOrders, cappedTarget);

            if (!selected.length || total <= 0) {
                throw createError(422, 'No payable orders matched the request');
            }

            const orderIds = selected.map((entry) => entry.id);
            const payoutId = generateId('sp');
            const preferenceId = await fetchPayoutPreference(client, context.shopId);

            const { rows } = await client.query(
                `
                INSERT INTO "ShopPayout" (
                    id, "shopId", amount, currency, status, "scheduledFor", reference, notes, "preferenceId", "createdAt", "updatedAt"
                )
                VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $7, $8, NOW(), NOW())
                RETURNING id, "shopId", amount, currency, status, "scheduledFor", "processedAt",
                          reference, notes, "preferenceId", "createdAt", "updatedAt"
            `,
                [
                    payoutId,
                    context.shopId,
                    total,
                    currency,
                    scheduleDate,
                    reference,
                    notes || null,
                    preferenceId,
                ],
            );

            await client.query(
                `
                UPDATE "Order"
                SET "shopPayoutId" = $1,
                    "shopPayoutStatus" = 'QUEUED',
                    "updatedAt" = NOW()
                WHERE id = ANY($2::text[])
            `,
                [payoutId, orderIds],
            );

            const ledgerEntry = await recordPayoutLedgerEntry(client, {
                shopId: context.shopId,
                payoutId,
                amount: total,
                reference,
                description: notes || `Payout ${reference}`,
                metadata: { initiatedBy: user.id, orderIds },
            });

            return {
                payout: {
                    ...rows[0],
                    orderCount: orderIds.length,
                    orderTotal: total,
                },
                ledgerEntry,
                balance: ledgerEntry?.balanceAfter ?? currentBalance - total,
                ordersAttached: { ids: orderIds, count: orderIds.length, total },
            };
        });

        return res.status(201).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// ============ SHOP MEMBERS HANDLER ============
const handleMembers = async (req, res, user) => {
    if (req.method === 'GET') {
        const { shopId } = req.query;
        if (!shopId) return res.status(400).json({ error: 'shopId is required' });
        ensureShopAccess(user, shopId);
        const roster = await rosterResponse(shopId);
        return res.json(roster);
    }

    if (req.method === 'POST') {
        const { token } = req.body || {};

        if (token) {
            const result = await acceptInvitation(user, token);
            return res.json(result);
        }

        const invitation = await createInvitation(user, req.body || {});
        return res.status(201).json({ invitation });
    }

    if (req.method === 'DELETE') {
        const { memberId, invitationId } = req.query;

        if (memberId) {
            const member = await getMemberMeta(memberId);
            if (!member) return res.status(404).json({ error: 'Member not found' });

            if (user.role !== 'ADMIN') {
                ensureShopRole(user, member.shopId, ['OWNER']);
            }

            if (member.role === 'OWNER' && member.status === 'ACTIVE') {
                await ensureAdditionalOwnerExists(member.shopId, member.id);
            }

            await pool.query('DELETE FROM "ShopMember" WHERE id = $1', [member.id]);
            return res.status(204).end();
        }

        if (invitationId) {
            const invitation = await getInvitationMeta(invitationId);
            if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
            if (user.role !== 'ADMIN') {
                ensureShopRole(user, invitation.shopId, SHOP_ADMIN_ROLES);
            }

            await pool.query('DELETE FROM "ShopInvitation" WHERE id = $1', [invitationId]);
            return res.status(204).end();
        }

        return res.status(400).json({ error: 'Provide memberId or invitationId to delete' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const action = normalizeQueryValue(req.query.action);

        // Route to sub-handlers based on action parameter
        if (action === 'payouts') {
            const user = await requireAuth(req);
            return handlePayouts(req, res, user);
        }

        if (action === 'members') {
            const user = await requireAuth(req);
            return handleMembers(req, res, user);
        }

        // Default: shop CRUD operations
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
