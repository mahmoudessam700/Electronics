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
const { sendShopVerifiedEmail } = require('../_utils/mailer');

const pool = getPool();

const normalizeQueryValue = (value) => (Array.isArray(value) ? value[0] : value);

const getBaseShopSelect = () => `
    SELECT s.*,
        (SELECT COUNT(*) FROM ShopMember sm WHERE sm.shopId = s.id AND sm.status = 'ACTIVE') AS memberCount,
        (SELECT COUNT(*) FROM ShopInvitation si WHERE si.shopId = s.id AND si.status = 'PENDING') AS pendingInvitations,
        (SELECT COALESCE(SUM(l.amount), 0) FROM ShopCommissionLedger l WHERE l.shopId = s.id) AS ledgerBalance
    FROM Shop s
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
        defaultCommissionRate: row.defaultCommissionRate !== null ? Number(row.defaultCommissionRate) : 0,
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
    const [rows] = await pool.execute(`${getBaseShopSelect()} WHERE s.id = ?`, [id]);
    return formatShopRow(rows[0]);
};

const buildShopListQuery = (user, { status, kycStatus, search }) => {
    const whereClauses = [];
    const params = [];

    if (status) {
        whereClauses.push(`s.status = ?`);
        params.push(status);
    }
    if (kycStatus) {
        whereClauses.push(`s.kycStatus = ?`);
        params.push(kycStatus);
    }
    if (search) {
        whereClauses.push(`(LOWER(s.name) LIKE ? OR LOWER(s.slug) LIKE ?)`);
        params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    if (user.role !== 'ADMIN') {
        const shopIds = (user.shopMemberships || []).map((m) => m.shopId);
        if (!shopIds.length) return { query: `${getBaseShopSelect()} WHERE 1 = 0`, params: [] };
        const placeholders = shopIds.map(() => '?').join(',');
        whereClauses.push(`s.id IN (${placeholders})`);
        params.push(...shopIds);
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    return { query: `${getBaseShopSelect()} ${where} ORDER BY s.createdAt DESC`, params };
};

const upsertOwnerMembership = async (client, shopId, ownerId) => {
    if (!ownerId) return;
    const [existing] = await client.execute('SELECT id FROM ShopMember WHERE userId = ? AND shopId = ?', [ownerId, shopId]);
    if (existing.length > 0) {
        await client.execute(`UPDATE ShopMember SET role = 'OWNER', status = 'ACTIVE', updatedAt = NOW() WHERE userId = ? AND shopId = ?`, [ownerId, shopId]);
    } else {
        await client.execute(`INSERT INTO ShopMember (id, userId, shopId, role, status) VALUES (?, ?, ?, 'OWNER', 'ACTIVE')`, [generateId('shop_member'), ownerId, shopId]);
    }
};

// ============ SHOP PAYOUTS HELPERS ============
const listPayouts = async ({ shopId, status }) => {
    let query = `
        SELECT sp.*, COALESCE(stats.orderCount, 0) AS orderCount, COALESCE(stats.orderTotal, 0) AS orderTotal
        FROM ShopPayout sp
        LEFT JOIN (
            SELECT shopPayoutId, COUNT(*) AS orderCount, COALESCE(SUM((totalAmount - commissionTotal)), 0) AS orderTotal
            FROM \`Order\` WHERE shopPayoutId IS NOT NULL GROUP BY shopPayoutId
        ) AS stats ON stats.shopPayoutId = sp.id
        WHERE sp.shopId = ?
    `;
    const params = [shopId];
    if (status) {
        query += ' AND sp.status = ?';
        params.push(status);
    }
    query += ' ORDER BY sp.createdAt DESC LIMIT 100';
    const [rows] = await pool.execute(query, params);
    return rows;
};

const summarizeAwaitingOrders = async (executor, shopId) => {
    const runner = executor || pool;
    const [rows] = await runner.execute(`
        SELECT COUNT(*) AS count, COALESCE(SUM((totalAmount - commissionTotal)), 0) AS amount
        FROM \`Order\` WHERE shopId = ? AND status = 'DELIVERED' AND shopPayoutStatus = 'NOT_REQUESTED'
    `, [shopId]);
    const summary = rows[0] || { count: 0, amount: 0 };
    return { count: Number(summary.count) || 0, amount: Number(summary.amount) || 0 };
};

const fetchAttachableOrders = async (client, shopId) => {
    const [rows] = await client.execute(`
        SELECT id, totalAmount, commissionTotal FROM \`Order\`
        WHERE shopId = ? AND status = 'DELIVERED' AND shopPayoutStatus = 'NOT_REQUESTED'
        ORDER BY createdAt ASC FOR UPDATE
    `, [shopId]);
    return rows.map((row) => ({ id: row.id, netAmount: Math.max((Number(row.totalAmount) || 0) - (Number(row.commissionTotal) || 0), 0) })).filter((e) => e.netAmount > 0);
};

const selectOrdersForAmount = (orders, requestedAmount) => {
    if (!orders.length) return { selected: [], total: 0 };
    const fullAmount = orders.reduce((sum, o) => sum + o.netAmount, 0);
    const target = Number.isFinite(Number(requestedAmount)) && requestedAmount > 0 ? requestedAmount : fullAmount;
    const selected = [];
    let runningTotal = 0;
    for (const order of orders) {
        selected.push(order);
        runningTotal += order.netAmount;
        if (runningTotal + 1e-6 >= target) break;
    }
    return { selected, total: runningTotal };
};

const parseScheduledDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw createError(400, 'Invalid scheduledFor date');
    return date;
};

const fetchPayoutPreference = async (client, shopId) => {
    const [rows] = await client.execute('SELECT id FROM ShopPayoutPreference WHERE shopId = ?', [shopId]);
    return rows[0]?.id || null;
};

// ============ SHOP MEMBERS HELPERS ============
const formatMemberRow = (row) => {
    if (!row) return null;
    return {
        id: row.id, shopId: row.shopId, userId: row.userId, role: row.role, status: row.status,
        createdAt: row.createdAt, updatedAt: row.updatedAt,
        user: { id: row.userId, name: row.userName, email: row.userEmail, image: row.userImage },
    };
};

const formatInvitationRow = (row, { includeToken = false } = {}) => {
    if (!row) return null;
    const base = {
        id: row.id, shopId: row.shopId, email: row.email, role: row.role, status: row.status,
        expiresAt: row.expiresAt, acceptedAt: row.acceptedAt, revokedAt: row.revokedAt,
        createdAt: row.createdAt, updatedAt: row.updatedAt,
        invitedBy: row.invitedById ? { id: row.invitedById, name: row.invitedByName, email: row.invitedByEmail } : null,
    };
    if (includeToken) base.token = row.token;
    return base;
};

const getMembersForShop = async (shopId) => {
    const [rows] = await pool.execute(`
        SELECT sm.*, u.name AS userName, u.email AS userEmail, u.image AS userImage
        FROM ShopMember sm INNER JOIN User u ON u.id = sm.userId
        WHERE sm.shopId = ?
        ORDER BY CASE sm.role WHEN 'OWNER' THEN 0 WHEN 'MANAGER' THEN 1 WHEN 'FINANCE' THEN 2 ELSE 3 END, u.name
    `, [shopId]);
    return rows.map(formatMemberRow);
};

const getInvitationsForShop = async (shopId) => {
    const [rows] = await pool.execute(`
        SELECT si.*, inviter.name AS invitedByName, inviter.email AS invitedByEmail
        FROM ShopInvitation si LEFT JOIN User inviter ON inviter.id = si.invitedById
        WHERE si.shopId = ? ORDER BY si.createdAt DESC
    `, [shopId]);
    return rows.map((row) => formatInvitationRow(row));
};

const getMemberMeta = async (memberId) => {
    const [rows] = await pool.execute(`SELECT sm.*, u.email AS userEmail, u.name AS userName FROM ShopMember sm INNER JOIN User u ON u.id = sm.userId WHERE sm.id = ?`, [memberId]);
    return rows[0] || null;
};

const getInvitationMeta = async (invitationId) => {
    const [rows] = await pool.execute(`SELECT si.* FROM ShopInvitation si WHERE si.id = ?`, [invitationId]);
    return rows[0] || null;
};

const ensureAdditionalOwnerExists = async (shopId, excludeMemberId) => {
    const [rows] = await pool.execute(`SELECT id FROM ShopMember WHERE shopId = ? AND role = 'OWNER' AND status = 'ACTIVE' AND id <> ? LIMIT 1`, [shopId, excludeMemberId]);
    if (!rows.length) throw createError(400, 'Each shop must retain at least one active owner');
};

const getMemberForUser = async (shopId, userId) => {
    const [rows] = await pool.execute(`SELECT sm.*, u.name AS userName, u.email AS userEmail, u.image AS userImage FROM ShopMember sm INNER JOIN User u ON u.id = sm.userId WHERE sm.shopId = ? AND sm.userId = ?`, [shopId, userId]);
    return formatMemberRow(rows[0]);
};

const rosterResponse = async (shopId) => {
    const [members, invitations] = await Promise.all([getMembersForShop(shopId), getInvitationsForShop(shopId)]);
    return { members, invitations };
};

const normalizeEmail = (value) => value?.trim().toLowerCase();

const createInvitation = async (user, payload = {}) => {
    const { shopId, email, role = 'STAFF', expiresInDays = 7 } = payload;
    if (!shopId) throw createError(400, 'shopId is required');
    if (!email) throw createError(400, 'invitee email is required');
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !normalizedEmail.includes('@')) throw createError(400, 'A valid email is required');

    const { membership } = ensureShopRole(user, shopId, SHOP_ADMIN_ROLES);
    if (role === 'OWNER' && user.role !== 'ADMIN' && membership?.role !== 'OWNER') throw createError(403, 'Only admins or owners can invite new owners');

    await pool.execute(`UPDATE ShopInvitation SET status = 'REVOKED', revokedAt = NOW(), updatedAt = NOW() WHERE shopId = ? AND LOWER(email) = ? AND status = 'PENDING'`, [shopId, normalizedEmail]);

    const [existingMembers] = await pool.execute(`SELECT 1 FROM ShopMember sm INNER JOIN User u ON u.id = sm.userId WHERE sm.shopId = ? AND LOWER(u.email) = ? LIMIT 1`, [shopId, normalizedEmail]);
    if (existingMembers.length > 0) throw createError(400, 'A member with this email already exists');

    const invitationId = generateId('shop_invite');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    await pool.execute(`INSERT INTO ShopInvitation (id, shopId, email, role, status, token, expiresAt, invitedById, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, NOW(), NOW())`, [invitationId, shopId, normalizedEmail, role, token, expiresAt, user.id]);

    const [enriched] = await pool.execute(`SELECT si.*, inviter.name AS invitedByName, inviter.email AS invitedByEmail FROM ShopInvitation si LEFT JOIN User inviter ON inviter.id = si.invitedById WHERE si.id = ?`, [invitationId]);
    return formatInvitationRow(enriched[0], { includeToken: true });
};

const acceptInvitation = async (user, token) => {
    if (!token) throw createError(400, 'Invitation token is required');
    const [rows] = await pool.execute('SELECT * FROM ShopInvitation WHERE token = ?', [token]);
    const invitation = rows[0];
    if (!invitation) throw createError(404, 'Invitation not found');
    if (invitation.status !== 'PENDING') throw createError(400, 'This invitation is no longer active');
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await pool.execute(`UPDATE ShopInvitation SET status = 'EXPIRED', updatedAt = NOW() WHERE id = ?`, [invitation.id]);
        throw createError(400, 'This invitation has expired');
    }
    if (normalizeEmail(invitation.email) !== normalizeEmail(user.email)) throw createError(403, 'This invitation is assigned to a different email address');

    await withTransaction(async (client) => {
        await client.execute(`UPDATE ShopInvitation SET status = 'ACCEPTED', acceptedAt = NOW(), updatedAt = NOW() WHERE id = ?`, [invitation.id]);
        const [existing] = await client.execute('SELECT id FROM ShopMember WHERE userId = ? AND shopId = ?', [user.id, invitation.shopId]);
        if (existing.length > 0) {
            await client.execute(`UPDATE ShopMember SET role = ?, status = 'ACTIVE', updatedAt = NOW() WHERE userId = ? AND shopId = ?`, [invitation.role, user.id, invitation.shopId]);
        } else {
            await client.execute(`INSERT INTO ShopMember (id, userId, shopId, role, status) VALUES (?, ?, ?, ?, 'ACTIVE')`, [generateId('shop_member'), user.id, invitation.shopId, invitation.role]);
        }
    });

    const membership = await getMemberForUser(invitation.shopId, user.id);
    return { invitation: { id: invitation.id, status: 'ACCEPTED' }, membership };
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
        if (amount && (!Number.isFinite(requestedAmount) || requestedAmount <= 0)) throw createError(400, 'Invalid requested amount');

        const reference = (providedReference || '').trim() || `SP-${Date.now()}`;
        const scheduleDate = parseScheduledDate(scheduledFor);

        const result = await withTransaction(async (client) => {
            const currentBalance = await getLatestBalance(client, context.shopId);
            const attachableOrders = await fetchAttachableOrders(client, context.shopId);
            if (!attachableOrders.length) throw createError(422, 'No delivered orders are ready for payout');
            const totalAttachable = attachableOrders.reduce((sum, e) => sum + e.netAmount, 0);
            if (requestedAmount > totalAttachable) throw createError(422, 'Requested amount exceeds delivered balance');
            const cappedTarget = Math.min(Number.isFinite(requestedAmount) && requestedAmount > 0 ? requestedAmount : totalAttachable, currentBalance);
            if (cappedTarget <= 0) throw createError(422, 'Insufficient balance for payout');
            const { selected, total } = selectOrdersForAmount(attachableOrders, cappedTarget);
            if (!selected.length || total <= 0) throw createError(422, 'No payable orders matched the request');

            const orderIds = selected.map((e) => e.id);
            const payoutId = generateId('sp');
            const preferenceId = await fetchPayoutPreference(client, context.shopId);

            await client.execute(`INSERT INTO ShopPayout (id, shopId, amount, currency, status, scheduledFor, reference, notes, preferenceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, NOW(), NOW())`, [payoutId, context.shopId, total, currency, scheduleDate, reference, notes || null, preferenceId]);
            const [payoutRows] = await client.execute(`SELECT * FROM ShopPayout WHERE id = ?`, [payoutId]);

            const orderPlaceholders = orderIds.map(() => '?').join(',');
            await client.execute(`UPDATE \`Order\` SET shopPayoutId = ?, shopPayoutStatus = 'QUEUED', updatedAt = NOW() WHERE id IN (${orderPlaceholders})`, [payoutId, ...orderIds]);

            const ledgerEntry = await recordPayoutLedgerEntry(client, { shopId: context.shopId, payoutId, amount: total, reference, description: notes || `Payout ${reference}`, metadata: { initiatedBy: user.id, orderIds } });

            return {
                payout: { ...payoutRows[0], orderCount: orderIds.length, orderTotal: total },
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
            if (user.role !== 'ADMIN') ensureShopRole(user, member.shopId, ['OWNER']);
            if (member.role === 'OWNER' && member.status === 'ACTIVE') await ensureAdditionalOwnerExists(member.shopId, member.id);
            await pool.execute('DELETE FROM ShopMember WHERE id = ?', [member.id]);
            return res.status(204).end();
        }
        if (invitationId) {
            const invitation = await getInvitationMeta(invitationId);
            if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
            if (user.role !== 'ADMIN') ensureShopRole(user, invitation.shopId, SHOP_ADMIN_ROLES);
            await pool.execute('DELETE FROM ShopInvitation WHERE id = ?', [invitationId]);
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

        if (action === 'payouts') {
            const user = await requireAuth(req);
            return handlePayouts(req, res, user);
        }
        if (action === 'members') {
            const user = await requireAuth(req);
            return handleMembers(req, res, user);
        }
        if (action === 'stats') {
            const user = await requireAuth(req);
            const providedShopId = normalizeQueryValue(req.query.shopId);
            const context = resolveShopContext(user, providedShopId);
            ensureShopAccess(user, context.shopId);

            const [statsRows] = await pool.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM Product WHERE shopId = ?) as totalProducts,
                    (SELECT COUNT(*) FROM \`Order\` WHERE shopId = ?) as totalOrders,
                    (SELECT COALESCE(SUM(totalAmount), 0) FROM \`Order\` WHERE shopId = ?) as totalRevenue,
                    (SELECT COALESCE(SUM(commissionTotal), 0) FROM \`Order\` WHERE shopId = ?) as totalCommission,
                    (SELECT COALESCE(SUM(amount), 0) FROM ShopCommissionLedger WHERE shopId = ?) as ledgerBalance,
                    (SELECT COUNT(*) FROM \`Order\` WHERE shopId = ? AND status = 'PENDING') as pendingOrders
            `, [context.shopId, context.shopId, context.shopId, context.shopId, context.shopId, context.shopId]);

            const [trendRows] = await pool.execute(`
                SELECT DATE_FORMAT(createdAt, '%b') as month, COALESCE(SUM(totalAmount), 0) as revenue
                FROM \`Order\` WHERE shopId = ?
                GROUP BY YEAR(createdAt), MONTH(createdAt), month
                ORDER BY YEAR(createdAt) ASC, MONTH(createdAt) ASC LIMIT 6
            `, [context.shopId]);

            return res.json({ ...statsRows[0], revenueTrend: trendRows });
        }

        // Default: shop CRUD
        if (req.method === 'GET') {
            const user = await requireAuth(req);
            const { id } = req.query;
            if (id) {
                if (user.role !== 'ADMIN') ensureShopAccess(user, id);
                const shop = await getShopById(id);
                if (!shop) return res.status(404).json({ error: 'Shop not found' });
                return res.json(shop);
            }
            const { query, params } = buildShopListQuery(user, req.query || {});
            const [rows] = await pool.execute(query, params);
            return res.json(rows.map(formatShopRow));
        }

        if (req.method === 'POST') {
            const user = await requireAuth(req);
            ensureRole(user, ['ADMIN']);
            const { name, description, logo, email, phone, address, slug, ownerId, defaultCommissionRate, payoutSchedule, status = 'PENDING', kycStatus = 'UNVERIFIED' } = req.body || {};
            if (!name) return res.status(400).json({ error: 'Shop name is required' });

            const resolvedSlug = await ensureSlug(slug || name);
            const commissionRate = normalizeCommissionRate(defaultCommissionRate);
            const shopId = generateId('shop');

            await withTransaction(async (client) => {
                await client.execute(`INSERT INTO Shop (id, name, slug, description, logo, email, phone, address, status, kycStatus, defaultCommissionRate, payoutSchedule, ownerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [shopId, name, resolvedSlug, description || null, logo || null, email || null, phone || null, address || null, status, kycStatus, commissionRate, payoutSchedule || 'MANUAL', ownerId || null]);
                if (ownerId) await upsertOwnerMembership(client, shopId, ownerId);
            });

            const created = await getShopById(shopId);
            return res.status(201).json(created);
        }

        if (req.method === 'PUT') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Shop ID is required' });
            const user = await requireAuth(req);
            const isAdmin = user.role === 'ADMIN';
            if (!isAdmin) ensureShopRole(user, id, SHOP_ADMIN_ROLES);

            // Get current shop data to detect status change
            const [currentShops] = await pool.execute('SELECT status, ownerId, name, email FROM Shop WHERE id = ?', [id]);
            const currentShop = currentShops[0];
            const previousStatus = currentShop?.status;

            const { name, description, logo, email, phone, address, defaultCommissionRate, status, kycStatus, payoutSchedule, ownerId } = req.body || {};
            const updates = {};
            const generalFields = { name, description, logo, email, phone, address };
            Object.entries(generalFields).forEach(([key, value]) => { if (value !== undefined) updates[key] = value || null; });
            if (defaultCommissionRate !== undefined) updates.defaultCommissionRate = normalizeCommissionRate(defaultCommissionRate);
            if (isAdmin) {
                if (status !== undefined) updates.status = status;
                if (kycStatus !== undefined) updates.kycStatus = kycStatus;
                if (payoutSchedule !== undefined) updates.payoutSchedule = payoutSchedule;
                if (ownerId !== undefined) updates.ownerId = ownerId || null;
            }

            const keys = Object.keys(updates);
            if (!keys.length) return res.status(400).json({ error: 'No changes provided' });

            await withTransaction(async (client) => {
                const setClauses = keys.map((key) => `${key} = ?`);
                const values = keys.map((key) => updates[key]);
                values.push(id);
                await client.execute(`UPDATE Shop SET ${setClauses.join(', ')}, updatedAt = NOW() WHERE id = ?`, values);
                if (isAdmin && ownerId) await upsertOwnerMembership(client, id, ownerId);
            });

            const updated = await getShopById(id);

            // Send shop verified email if status changed from PENDING to ACTIVE
            if (status === 'ACTIVE' && previousStatus === 'PENDING' && currentShop) {
                try {
                    // Get owner email
                    const ownerIdToUse = ownerId || currentShop.ownerId;
                    if (ownerIdToUse) {
                        const [ownerRows] = await pool.execute('SELECT email, name FROM User WHERE id = ?', [ownerIdToUse]);
                        if (ownerRows[0]) {
                            await sendShopVerifiedEmail({
                                to: ownerRows[0].email,
                                name: ownerRows[0].name,
                                shopName: name || currentShop.name
                            });
                        }
                    } else if (currentShop.email) {
                        // Use shop email if no owner
                        await sendShopVerifiedEmail({
                            to: currentShop.email,
                            name: null,
                            shopName: name || currentShop.name
                        });
                    }
                } catch (mailError) {
                    console.error('Failed to send shop verified email:', mailError);
                }
            }

            return res.json(updated);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Shops API Error:', error);
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message, code: error.code });
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
