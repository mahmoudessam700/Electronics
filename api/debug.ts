import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const envSanitized = Object.keys(process.env).reduce((acc, key) => {
            if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
                acc[key] = '***';
            } else {
                acc[key] = process.env[key];
            }
            return acc;
        }, {} as Record<string, any>);

        // Check if DB URL exists (don't show it)
        const hasDbUrl = !!process.env.DATABASE_URL;

        // List directory structure to debug bundling
        const rootDir = process.cwd();
        const files = fs.readdirSync(rootDir);

        let nodeModules = 'not found';
        try {
            nodeModules = fs.readdirSync(path.join(rootDir, 'node_modules')).slice(0, 20).join(', ');
        } catch (e) { }

        let prismaClient = 'not found';
        try {
            prismaClient = fs.readdirSync(path.join(rootDir, 'node_modules', '.prisma', 'client')).join(', ');
        } catch (e) {
            prismaClient = e instanceof Error ? e.message : String(e);
        }

        // Try to load Prisma
        let prismaLoad = 'success';
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();
            await prisma.$connect();
            await prisma.$disconnect();
        } catch (e: any) {
            prismaLoad = e.message;
        }

        res.status(200).json({
            status: 'ok',
            hasDbUrl,
            prismaLoad,
            prismaClientFiles: prismaClient,
            rootDir,
            files,
            nodeModulesShort: nodeModules,
            env: envSanitized
        });
    } catch (error: any) {
        res.status(200).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
