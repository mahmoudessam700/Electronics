import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'basic-ftp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const client = new Client();
    // client.ftp.verbose = true; 

    try {
        await client.access({
            host: process.env.FTP_HOST!,
            user: process.env.FTP_USER!,
            password: process.env.FTP_PASSWORD!,
            secure: true,
            secureOptions: { rejectUnauthorized: false },
        });

        const uploadDir = process.env.FTP_UPLOAD_DIR || '/uploads';
        const baseUrl = process.env.FTP_BASE_URL || 'https://electronics.adsolutions-eg.com/uploads';

        if (req.method === 'GET') {
            const list = await client.list(uploadDir);

            // Filter out . and .. and map to useful structure
            const files = list
                .filter(item => item.name !== '.' && item.name !== '..')
                .map(item => ({
                    name: item.name,
                    size: item.size,
                    date: item.modifiedAt ? item.modifiedAt.toISOString() : null,
                    url: `${baseUrl}/${item.name}`,
                    type: item.isDirectory ? 'folder' : 'file'
                }))
                .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

            return res.json(files);
        }

        if (req.method === 'DELETE') {
            const { name } = req.query;

            if (!name || typeof name !== 'string') {
                return res.status(400).json({ error: 'Filename is required' });
            }

            // Sanitization to prevent traversing up
            const safeName = name.replace(/^(\.\.(\/|\\|$))+/, '');

            await client.remove(`${uploadDir}/${safeName}`);

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('FTP Error:', error);
        return res.status(500).json({
            error: 'File operation failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        client.close();
    }
}
