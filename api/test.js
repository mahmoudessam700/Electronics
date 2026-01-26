module.exports = (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');

        let prismaStatus = 'unknown';
        let prismaError = null;
        let clientType = typeof PrismaClient;

        try {
            // Try explicit configuration which sometimes fixes initialization issues
            const prisma = new PrismaClient({
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL
                    }
                }
            });
            prismaStatus = 'loaded_explicit';
        } catch (e) {
            prismaStatus = 'failed_explicit';
            prismaError = e.message;
        }

        if (prismaStatus.startsWith('failed')) {
            try {
                // Try empty constructor
                const prisma2 = new PrismaClient();
                prismaStatus = 'loaded_empty';
            } catch (e) {
                prismaStatus = 'failed_both';
                prismaError = e.message;
            }
        }

        res.status(200).json({
            status: 'alive',
            language: 'javascript',
            prismaStatus,
            prismaError,
            clientType,
            env: {
                hasDbUrl: !!process.env.DATABASE_URL
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
