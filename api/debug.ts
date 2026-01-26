import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Dynamic debugging to prevent startup crash
    const debugInfo: any = {
        status: 'running',
        step: 'init'
    };

    try {
        debugInfo.env = {
            NODE_ENV: process.env.NODE_ENV,
            HAS_DB_URL: !!process.env.DATABASE_URL
        };

        // 1. Check Root Dir
        const rootDir = process.cwd();
        debugInfo.rootDir = rootDir;

        try {
            debugInfo.rootFiles = fs.readdirSync(rootDir);
        } catch (e: any) { debugInfo.rootFilesError = e.message; }

        // 2. Check node_modules
        try {
            const modulesPath = path.join(rootDir, 'node_modules');
            debugInfo.nodeModules = fs.existsSync(modulesPath) ? 'exists' : 'missing';
            if (fs.existsSync(modulesPath)) {
                debugInfo.modulesList = fs.readdirSync(modulesPath).filter(f => f.startsWith('@') || f === 'prisma' || f === '.prisma');
            }
        } catch (e: any) { debugInfo.nodeModulesError = e.message; }

        // 3. Check Prisma Generation
        try {
            const prismaPath = path.join(rootDir, 'node_modules', '.prisma', 'client');
            debugInfo.prismaGenerated = fs.existsSync(prismaPath) ? 'exists' : 'missing';
            if (fs.existsSync(prismaPath)) {
                debugInfo.prismaFiles = fs.readdirSync(prismaPath);
            }
        } catch (e: any) { debugInfo.prismaCheckError = e.message; }

        // 4. Try Safe Load
        debugInfo.step = 'loading_prisma';
        let PrismaClient;
        try {
            // Use dynamic require so we catch the error instead of crashing
            const prismaPkg = require('@prisma/client');
            PrismaClient = prismaPkg.PrismaClient;
            debugInfo.prismaLoaded = 'success';
        } catch (e: any) {
            debugInfo.prismaLoadError = e.message;
            debugInfo.prismaLoadStack = e.stack;
            throw new Error('Prisma Client load failed');
        }

        // 5. Try Connection
        if (PrismaClient) {
            debugInfo.step = 'connecting_db';
            const prisma = new PrismaClient();
            await prisma.$connect();
            debugInfo.dbConnection = 'success';
            await prisma.$disconnect();
        }

    } catch (error: any) {
        debugInfo.globalError = error.message;
        debugInfo.globalStack = error.stack;
    }

    res.status(200).json(debugInfo);
}
