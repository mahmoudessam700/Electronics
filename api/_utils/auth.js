// @ts-nocheck
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool } = require('./db');

const SHOP_ADMIN_ROLES = ['OWNER', 'MANAGER'];
const SHOP_FINANCE_ROLES = ['OWNER', 'MANAGER', 'FINANCE'];

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

const createError = (status, message, code) => {
    const error = new Error(message);
    error.statusCode = status;
    if (code) error.code = code;
    return error;
};

const sanitizeSlug = (value = '') => {
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);
};

const ensureSlug = async (candidate) => {
    const pool = getPool();
    let base = sanitizeSlug(candidate);
    if (!base) {
        base = `shop-${Date.now()}`;
    }

    let slug = base;
    let suffix = 1;

    while (true) {
        const [rows] = await pool.execute('SELECT 1 FROM Shop WHERE slug = ?', [slug]);
        if (rows.length === 0) return slug;
        slug = `${base}-${suffix++}`;
    }
};

const normalizeCommissionRate = (value) => {
    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return 0;
    }
    return numeric;
};

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    const cookie = req.headers.cookie;
    if (!cookie) return null;
    const tokenCookie = cookie.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith('auth_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

const getShopMemberships = async (userId) => {
    if (!userId) return [];
    const pool = getPool();
    const [rows] = await pool.execute(`
        SELECT
            sm.id AS membershipId,
            sm.shopId AS shopId,
            sm.role AS membershipRole,
            sm.status AS membershipStatus,
            sm.createdAt AS membershipCreatedAt,
            sm.updatedAt AS membershipUpdatedAt,
            s.name AS shopName,
            s.slug AS shopSlug,
            s.status AS shopStatus,
            s.defaultCommissionRate AS shopCommissionRate,
            s.payoutSchedule AS shopPayoutSchedule,
            s.kycStatus AS shopKycStatus,
            s.logo AS shopLogo,
            s.email AS shopEmail,
            s.phone AS shopPhone
        FROM ShopMember sm
        INNER JOIN Shop s ON s.id = sm.shopId
        WHERE sm.userId = ?
        ORDER BY s.name ASC
    `, [userId]);
    return rows.map((row) => ({
        id: row.membershipId,
        shopId: row.shopId,
        role: row.membershipRole,
        status: row.membershipStatus,
        createdAt: row.membershipCreatedAt,
        updatedAt: row.membershipUpdatedAt,
        shop: {
            id: row.shopId,
            name: row.shopName,
            slug: row.shopSlug,
            status: row.shopStatus,
            kycStatus: row.shopKycStatus,
            payoutSchedule: row.shopPayoutSchedule,
            logo: row.shopLogo,
            email: row.shopEmail,
            phone: row.shopPhone,
            defaultCommissionRate: parseFloat(row.shopCommissionRate || 0)
        }
    }));
};

const buildAuthUserResponse = async (userRow) => {
    if (!userRow) return null;
    const memberships = await getShopMemberships(userRow.id);
    return {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: userRow.role,
        shopMemberships: memberships
    };
};

const getRequestContext = async (req, { requireUser = false } = {}) => {
    const token = getTokenFromRequest(req);
    if (!token) {
        if (requireUser) {
            throw createError(401, 'Authentication required');
        }
        return { token: null, user: null };
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const pool = getPool();
        const [rows] = await pool.execute('SELECT id, email, name, role FROM User WHERE id = ?', [decoded.userId]);
        if (!rows[0]) {
            if (requireUser) {
                throw createError(401, 'Authentication required');
            }
            return { token: null, user: null };
        }
        const user = await buildAuthUserResponse(rows[0]);
        return { token, user };
    } catch (error) {
        if (requireUser) {
            throw createError(401, 'Authentication required');
        }
        return { token: null, user: null, error };
    }
};

const requireAuth = async (req) => {
    const context = await getRequestContext(req, { requireUser: true });
    return context.user;
};

const ensureRole = (user, roles = []) => {
    if (!user) {
        throw createError(401, 'Authentication required');
    }
    if (roles.length === 0) return;
    if (!roles.includes(user.role)) {
        throw createError(403, 'You do not have permission to perform this action');
    }
};

const resolveShopContext = (user, providedShopId) => {
    if (!user) {
        throw createError(401, 'Authentication required');
    }

    if (user.role === 'ADMIN') {
        if (!providedShopId) {
            throw createError(400, 'shopId is required');
        }
        return { shopId: providedShopId, membership: null };
    }

    const memberships = user.shopMemberships || [];
    if (providedShopId) {
        const membership = memberships.find((entry) => entry.shopId === providedShopId);
        if (!membership) {
            throw createError(403, 'You do not have access to this shop');
        }
        return { shopId: providedShopId, membership };
    }

    if (memberships.length === 1) {
        return { shopId: memberships[0].shopId, membership: memberships[0] };
    }

    throw createError(400, 'shopId is required');
};

const ensureShopAccess = (user, shopId) => {
    if (!shopId) {
        throw createError(400, 'shopId is required');
    }
    if (!user) {
        throw createError(401, 'Authentication required');
    }
    if (user.role === 'ADMIN') {
        return { shopId, membership: null };
    }
    const membership = (user.shopMemberships || []).find((entry) => entry.shopId === shopId);
    if (!membership) {
        throw createError(403, 'You do not have access to this shop');
    }
    return { shopId, membership };
};

const ensureShopRole = (user, shopId, roles = []) => {
    const context = ensureShopAccess(user, shopId);
    if (user.role === 'ADMIN' || roles.length === 0) {
        return context;
    }
    if (!context.membership || !roles.includes(context.membership.role)) {
        throw createError(403, 'You do not have permission for this shop action');
    }
    return context;
};

const generateId = (prefix) => {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}`;
};

module.exports = {
    JWT_SECRET,
    createError,
    sanitizeSlug,
    ensureSlug,
    normalizeCommissionRate,
    getTokenFromRequest,
    getRequestContext,
    requireAuth,
    ensureRole,
    ensureShopAccess,
    ensureShopRole,
    resolveShopContext,
    getShopMemberships,
    buildAuthUserResponse,
    generateId,
    SHOP_ADMIN_ROLES,
    SHOP_FINANCE_ROLES,
};
