const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
    const { type } = req.query;

    if (req.method === 'GET') {
        if (type === 'homepage') {
            try {
                const setting = await prisma.setting.findUnique({
                    where: { key: 'homepage_sections' }
                });

                if (setting) {
                    let value = setting.value;
                    // Handle cases where it might be stored as a stringified JSON
                    if (typeof value === 'string') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.error('Failed to parse setting value:', e);
                        }
                    }
                    return res.json(value);
                } else {
                    // Default configuration if nothing is in DB
                    const defaults = {
                        sections: [
                            { id: 'deals-of-the-day', isEnabled: true, name: 'Deals of the Day', description: 'Shows products that have an original price higher than their current price.', showBadge: true, badgeText: 'Ends in 12:34:56' },
                            { id: 'inspired-browsing', isEnabled: true, name: 'Inspired by your browsing history', description: 'Shows a carousel of recommended products for the user.' },
                            { id: 'trending', isEnabled: true, name: 'Trending in Electronics', description: 'Shows high-value products (over E£1000).' },
                            { id: 'signup-banner', isEnabled: true, name: 'Sign Up Banner', description: 'The purple gradient banner encouraging users to create an account.' },
                            { id: 'pc-peripherals', isEnabled: true, name: 'PC Accessories & Peripherals', description: 'Shows mice, keyboards, and headphones.' }
                        ]
                    };
                    return res.json(defaults);
                }
            } catch (e) {
                console.error('Settings fetch error:', e);
                return res.status(500).json({ error: e.message });
            } finally {
                await prisma.$disconnect();
            }
        }
    }

    if (req.method === 'POST') {
        if (type === 'homepage') {
            try {
                const { sections } = req.body;
                
                await prisma.setting.upsert({
                    where: { key: 'homepage_sections' },
                    update: { 
                        value: { sections },
                        updatedAt: new Date()
                    },
                    create: {
                        key: 'homepage_sections',
                        value: { sections },
                        updatedAt: new Date()
                    }
                });

                return res.json({ success: true });
            } catch (e) {
                console.error('Settings save error:', e);
                return res.status(500).json({ error: e.message });
            } finally {
                await prisma.$disconnect();
            }
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
};
