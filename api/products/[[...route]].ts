import { VercelRequest, VercelResponse } from '@vercel/node';
import productsHandler from '../../src/handlers/products/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { route } = req.query;

    // Support /api/products/123 -> id=123
    if (route && Array.isArray(route) && route.length === 1) {
        req.query.id = route[0];
    }

    return productsHandler(req, res);
}
