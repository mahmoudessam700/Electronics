module.exports = (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');

        let prismaStatus = 'unknown';
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            prismaStatus = 'loaded';
        } catch (e) {
            prismaStatus = e.message;
        }

        res.status(200).json({
            status: 'alive',
            language: 'javascript',
            prismaStatus,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
