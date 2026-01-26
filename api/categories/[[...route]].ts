import { VercelRequest, VercelResponse } from '@vercel/node';
import listHandler from '../../src/handlers/categories/index';
import itemHandler from '../../src/handlers/categories/[id]';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Vercel optional catch-all route: [[...route]].ts
    // /api/categories -> route is undefined or empty string/array? 
    // Usually req.query.route

    const { route } = req.query;

    if (!route) {
        // /api/categories
        return listHandler(req, res);
    }

    // route is string or string[]
    const parts = Array.isArray(route) ? route : [route];

    if (parts.length === 1) {
        // /api/categories/123
        req.query.id = parts[0];
        return itemHandler(req, res);
    }

    return res.status(404).json({ error: 'Endpoint not found' });
}
