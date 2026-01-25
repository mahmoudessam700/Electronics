import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

// Prevent multiple instances in development
export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}

export default prisma;
