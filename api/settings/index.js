const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    const { type, id, action } = req.query;

    if (req.method === 'GET') {
        if (type === 'homepage') {
            try {
                const { rows } = await pool.query('SELECT value FROM "Setting" WHERE key = \'homepage_sections\'');
                if (rows.length > 0) {
                    let result = rows[0].value;
                    // Ensure it's an object if pg returns it as a string
                    if (typeof result === 'string') {
                        try {
                            result = JSON.parse(result);
                        } catch (e) {}
                    }
                    return res.json(result);
                } else {
                    // Default layout if none saved
                    return res.json({
                        sections: [
                            { id: 'deals-of-the-day', isEnabled: true, name: 'Deals of the Day', description: 'Shows products that have an original price higher than their current price.' },
                            { id: 'inspired-browsing', isEnabled: true, name: 'Inspired by your browsing history', description: 'Shows a carousel of recommended products for the user.' },
                            { id: 'trending', isEnabled: true, name: 'Trending in Electronics', description: 'Shows high-value products (over E£1000).' },
                            { id: 'signup-banner', isEnabled: true, name: 'Sign Up Banner', description: 'The purple gradient banner encouraging users to create an account.' },
                            { id: 'pc-peripherals', isEnabled: true, name: 'PC Accessories & Peripherals', description: 'Shows mice, keyboards, and headphones.' }
                        ]
                    });
                }
            } catch (e) {
                console.error('Settings fetch error:', e);
                return res.status(500).json({ error: e.message });
            }
        }
    }

    if (req.method === 'POST') {
        if (type === 'homepage') {
            try {
                const { sections } = req.body;
                
                // Ensure table exists - simple check/upsert
                // We pass the object directly, pg will handle it for JSONB/JSON columns
                await pool.query(`
                    INSERT INTO "Setting" (key, value, "updatedAt") 
                    VALUES ('homepage_sections', $1, NOW())
                    ON CONFLICT (key) DO UPDATE SET value = $1, "updatedAt" = NOW()
                `, [JSON.stringify({ sections })]);

                return res.json({ success: true });
            } catch (e) {
                console.error('Settings save error:', e);
                return res.status(500).json({ error: e.message });
            }
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
};
