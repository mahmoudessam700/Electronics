import { VercelRequest, VercelResponse } from '@vercel/node';
import productsHandler from '../../src/handlers/products/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { route } = req.query;

        // Support /api/products/123 -> id=123
        if (route && Array.isArray(route) && route.length === 1) {
            req.query.id = route[0];
        }

        return await productsHandler(req, res);
    } catch (error: any) {
        console.error('Error in products handler:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
}
