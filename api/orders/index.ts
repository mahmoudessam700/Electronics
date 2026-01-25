import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'GET') {
        try {
            const orders = await prisma.order.findMany({
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            return res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { items, customerName, customerEmail, customerPhone, shippingAddress } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Order must have at least one item' });
            }

            // Calculate total amount
            let totalAmount = 0;
            for (const item of items) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });
                if (product) {
                    totalAmount += product.price * item.quantity;
                }
            }

            const order = await prisma.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    totalAmount,
                    customerName,
                    customerEmail,
                    customerPhone,
                    shippingAddress,
                    items: {
                        create: items.map((item: { productId: string; quantity: number; price: number }) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            return res.status(201).json(order);
        } catch (error) {
            console.error('Error creating order:', error);
            return res.status(500).json({ error: 'Failed to create order' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
