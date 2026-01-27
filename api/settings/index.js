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
                // We use a simple table for metadata/settings or a specific row in a settings table
                // For now, let's check if the table exists or just return a default if it's new
                const { rows } = await pool.query('SELECT value FROM "Setting" WHERE key = \'homepage_sections\'');
                if (rows.length > 0) {
                    return res.json(rows[0].value);
                } else {
                    // Default layout if none saved
                    return res.json({
                        sections: [
                            { id: 'deals-of-the-day', isEnabled: true },
                            { id: 'inspired-browsing', isEnabled: true },
                            { id: 'trending', isEnabled: true },
                            { id: 'signup-banner', isEnabled: true },
                            { id: 'pc-peripherals', isEnabled: true }
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
