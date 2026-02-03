// @ts-nocheck
const crypto = require('crypto');
const { getPool, withTransaction } = require('../_utils/db');
const {
    requireAuth,
    ensureShopAccess,
    ensureShopRole,
    createError,
    generateId,
    SHOP_ADMIN_ROLES,
} = require('../_utils/auth');

const pool = getPool();

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

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const user = await requireAuth(req);
            const { shopId } = req.query;
            if (!shopId) return res.status(400).json({ error: 'shopId is required' });
            ensureShopAccess(user, shopId);
            const roster = await rosterResponse(shopId);
            return res.json(roster);
        }

        if (req.method === 'POST') {
            const user = await requireAuth(req);
            const { token } = req.body || {};

            if (token) {
                const result = await acceptInvitation(user, token);
                return res.json(result);
            }

            const invitation = await createInvitation(user, req.body || {});
            return res.status(201).json({ invitation });
        }

        if (req.method === 'DELETE') {
            const user = await requireAuth(req);
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
    } catch (error) {
        console.error('Shop Members API Error:', error);
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message, code: error.code });
        }
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
