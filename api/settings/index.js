const { Pool } = require('pg');

let pool;

const getPool = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
    }
    return pool;
};

module.exports = async (req, res) => {
    const { type } = req.query;
    const client = getPool();

    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');

    try {
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ error: 'DATABASE_URL is missing' });
        }

        if (req.method === 'GET') {
            if (type === 'homepage') {
                try {
                    const { rows } = await client.query('SELECT value FROM "Setting" WHERE key = $1', ['homepage_sections']);
                    
                    if (rows.length > 0) {
                        let data = rows[0].value;
                        if (typeof data === 'string') {
                            try { data = JSON.parse(data); } catch (e) {}
                        }
                        return res.status(200).json(data);
                    } else {
                        return res.status(200).json({
                            sections: [
                                { id: 'deals-of-the-day', isEnabled: true, name: 'Deals of the Day', description: 'Shows products that have an original price higher than their current price.', showBadge: true, badgeText: 'Ends in 12:34:56' },
                                { id: 'inspired-browsing', isEnabled: true, name: 'Inspired by your browsing history', description: 'Shows a carousel of recommended products for the user.' },
                                { id: 'trending', isEnabled: true, name: 'Trending in Electronics', description: 'Shows high-value products (over E£1000).' },
                                { id: 'signup-banner', isEnabled: true, name: 'Sign Up Banner', description: 'The purple gradient banner encouraging users to create an account.' },
                                { id: 'pc-peripherals', isEnabled: true, name: 'PC Accessories & Peripherals', description: 'Shows mice, keyboards, and headphones.' }
                            ]
                        });
                    }
                } catch (dbError) {
                    console.error('DB GET Error:', dbError);
                    return res.status(500).json({ error: `Database Error (GET): ${dbError.message}` });
                }
            }
        }

        if (req.method === 'POST') {
            if (type === 'homepage') {
                const { sections } = req.body;
                
                if (!sections || !Array.isArray(sections)) {
                    return res.status(400).json({ error: 'Invalid data format' });
                }

                try {
                    const value = JSON.stringify({ sections });
                    
                    await client.query(`
                        INSERT INTO "Setting" (key, value, "updatedAt") 
                        VALUES ($1, $2, NOW())
                        ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()
                    `, ['homepage_sections', value]);

                    return res.status(200).json({ success: true });
                } catch (dbError) {
                    console.error('DB POST Error:', dbError);
                    return res.status(500).json({ error: `Database Error (POST): ${dbError.message}` });
                }
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (e) {
        console.error('Settings API Error:', e);
        return res.status(500).json({ error: `General API Error: ${e.message}` });
    }
};
