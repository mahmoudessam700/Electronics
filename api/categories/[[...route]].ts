import { VercelRequest, VercelResponse } from '@vercel/node';
import listHandler from '../../src/handlers/categories/index';
// import itemHandler from '../../src/handlers/categories/[id]'; 
// Note: importing [id].ts might be tricky if the file name is actually `[id].ts`
// Let's check how I named it. I renamed api/categories/[id].ts to src/handlers/categories/[id].ts

// Typescript import of file with [] might need special handling or just work.
// But wait, I see in previous steps I renamed it to src/handlers/categories/[id].ts
import itemHandler from '../../src/handlers/categories/[id]';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { route } = req.query;

        if (!route) {
            // /api/categories
            return await listHandler(req, res);
        }

        // route is string or string[]
        const parts = Array.isArray(route) ? route : [route];

        if (parts.length === 1) {
            // /api/categories/123
            req.query.id = parts[0];
            return await itemHandler(req, res);
        }

        return res.status(404).json({ error: 'Endpoint not found' });
    } catch (error: any) {
        console.error('Error in categories handler:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
}
