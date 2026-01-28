const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    // Standard Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { type } = req.query;

    try {
        if (!process.env.DATABASE_URL) {
            return res.status(500).json({ error: 'Config Error: DATABASE_URL is not set' });
        }

        if (req.method === 'GET') {
            if (type === 'homepage') {
                try {
                    const { rows } = await pool.query('SELECT value FROM "Setting" WHERE key = $1', ['homepage_sections']);
                    
                    if (rows.length > 0) {
                        let data = rows[0].value;
                        if (typeof data === 'string') {
                            try { data = JSON.parse(data); } catch (e) {}
                        }
                        return res.json(data);
                    } else {
                        // Return Defaults if row doesn't exist
                        return res.json({
                            sections: [
                                { id: 'deals-of-the-day', isEnabled: true, name: 'Deals of the Day', nameAr: 'عروض اليوم', description: 'Shows products that have an original price higher than their current price.', showBadge: true, badgeText: 'Ends in 12:34:56', badgeTextAr: 'ينتهي في 12:34:56', selectedProducts: [], useManualSelection: false },
                                { id: 'inspired-browsing', isEnabled: true, name: 'Inspired by your browsing history', nameAr: 'مستوحى من سجل التصفح الخاص بك', description: 'Shows a carousel of recommended products for the user.', selectedProducts: [], useManualSelection: false },
                                { id: 'trending', isEnabled: true, name: 'Trending in Electronics', nameAr: 'الأكثر رواجاً في الإلكترونيات', description: 'Shows high-value products (over E£50).', selectedProducts: [], useManualSelection: false },
                                { id: 'signup-banner', isEnabled: true, name: 'Sign Up Banner', nameAr: 'لافتة التسجيل', description: 'The purple gradient banner encouraging users to create an account.', subtitleText: 'Get exclusive deals, personalized recommendations, and early access to sales', subtitleTextAr: 'احصل على عروض حصرية وتوصيات مخصصة ووصول مبكر للتخفيضات', buttonText: 'Create your account', buttonTextAr: 'أنشئ حسابك' },
                                { id: 'pc-peripherals', isEnabled: true, name: 'PC Accessories & Peripherals', nameAr: 'ملحقات وإكسسوارات الكمبيوتر', description: 'Shows mice, keyboards, and headphones.', selectedProducts: [], useManualSelection: false }
                            ],
                            heroSlides: [
                                { id: '1', title: 'New Year Sale', titleAr: 'تخفيضات السنة الجديدة', subtitle: 'Up to 50% off on premium tech', subtitleAr: 'خصم يصل إلى 50% على التقنية المتميزة', ctaText: 'Shop Now', ctaTextAr: 'تسوق الآن', image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?w=1200', gradient: 'from-blue-600/20 to-purple-600/20', navigationTarget: { type: 'page', value: 'search' } },
                                { id: '2', title: 'Latest Laptops', titleAr: 'أحدث اللابتوبات', subtitle: 'Powerful performance for work and play', subtitleAr: 'أداء قوي للعمل واللعب', ctaText: 'Explore Laptops', ctaTextAr: 'استكشف اللابتوبات', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200', gradient: 'from-gray-600/20 to-blue-600/20', navigationTarget: { type: 'category', value: 'Laptops' } },
                                { id: '3', title: 'Gaming Accessories', titleAr: 'إكسسوارات الألعاب', subtitle: 'Upgrade your gaming setup', subtitleAr: 'طور معدات الألعاب الخاصة بك', ctaText: 'Discover More', ctaTextAr: 'اكتشف المزيد', image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200', gradient: 'from-purple-600/20 to-pink-600/20', navigationTarget: { type: 'page', value: 'search' } }
                            ]
                        });
                    }
                } catch (dbError) {
                    // Check if table missing
                    if (dbError.message.includes('Setting" does not exist')) {
                        return res.status(400).json({ 
                            error: 'Table Missing', 
                            message: 'The "Setting" table does not exist in your database yet. Please run: npx prisma db push' 
                        });
                    }
                    throw dbError;
                }
            }
        }

        if (req.method === 'POST') {
            if (type === 'homepage') {
                const { sections, heroSlides } = req.body;
                
                if (!sections || !Array.isArray(sections)) {
                    return res.status(400).json({ error: 'Invalid data: sections must be an array' });
                }

                const payload = JSON.stringify({ sections, heroSlides: heroSlides || [] });

                await pool.query(`
                    INSERT INTO "Setting" (key, value, "updatedAt") 
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (key) DO UPDATE SET value = $2, "updatedAt" = NOW()
                `, ['homepage_sections', payload]);

                return res.json({ success: true });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Settings API Critical Error:', error);
        return res.status(500).json({ 
            error: 'Database Error', 
            details: error.message 
        });
    }
};
