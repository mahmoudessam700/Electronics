import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        if (req.method === 'GET') {
            const orders = await prisma.order.findMany({
                orderBy: { createdAt: 'desc' },
                include: { items: { include: { product: true } } }
            });
            return res.json(orders);
        }

        if (req.method === 'PATCH') {
            const { id } = req.query;
            const { status } = req.body;

            // Simple validation could go here to check enum

            const order = await prisma.order.update({
                where: { id: String(id) },
                data: { status },
            });
            return res.json(order);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
