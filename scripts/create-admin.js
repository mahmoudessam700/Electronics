// Run with: node scripts/create-admin.js
require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to database...');

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const email = 'admin@electronics.adsolutions-eg.com';
    const password = 'Admin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to find existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        // Update existing user to ADMIN
        const updated = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                password: hashedPassword,
                emailVerified: true
            }
        });
        console.log('✅ Updated existing user to ADMIN:', updated.email);
    } else {
        // Create new admin user
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Admin',
                role: 'ADMIN',
                emailVerified: true
            }
        });
        console.log('✅ Created new admin user:', newUser.email);
    }

    await prisma.$disconnect();
    await pool.end();
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
