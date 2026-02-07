export interface VoiceCommandResult {
  type: 'navigate' | 'search';
  path: string;
  label?: string;
  query?: string;
  matched: boolean;
}

interface CommandRule {
  keywords: string[];
  path: string;
  label: string;
}

// =============================================
// ALL APP PAGES — every route in the application
// =============================================
const pageCommands: CommandRule[] = [
  // --- Main Pages ---
  { keywords: ['home', 'homepage', 'main page', 'الرئيسية', 'الرئيسيه', 'البيت', 'هوم', 'الصفحه الرئيسيه', 'الصفحة الرئيسية'], path: '/', label: 'Home' },
  { keywords: ['cart', 'shopping cart', 'my cart', 'سلة', 'السلة', 'السله', 'كارت', 'عربة', 'عربية', 'سلة التسوق', 'سلة المشتريات'], path: '/cart', label: 'Cart' },
  { keywords: ['checkout', 'check out', 'الدفع', 'ادفع', 'الشراء', 'شراء', 'payment', 'pay', 'pay now', 'تشيك اوت'], path: '/checkout', label: 'Checkout' },
  { keywords: ['orders', 'my orders', 'order', 'طلبات', 'الطلبات', 'طلباتي', 'اوردر', 'اوردرات', 'الاوردرات'], path: '/orders', label: 'Orders' },
  { keywords: ['account', 'my account', 'profile', 'my profile', 'حسابي', 'الحساب', 'بروفايل', 'اكاونت', 'حساب'], path: '/account', label: 'Account' },
  { keywords: ['lists', 'my lists', 'wishlist', 'my wishlist', 'favorites', 'قوائم', 'قوائمي', 'المفضلة', 'المفضله', 'الأمنيات', 'قائمة الأمنيات', 'قائمة امنيات'], path: '/lists', label: 'Lists' },
  { keywords: ['customer service', 'support', 'help', 'contact', 'contact us', 'خدمة العملاء', 'خدمه العملاء', 'المساعدة', 'مساعده', 'مساعدة', 'الدعم', 'دعم', 'تواصل', 'اتصل بنا'], path: '/customer-service', label: 'Customer Service' },
  { keywords: ['gift cards', 'gift card', 'كروت الهدايا', 'بطاقات الهدايا', 'بطاقات هدايا', 'كروت هدايا', 'هدايا', 'gift'], path: '/gift-cards', label: 'Gift Cards' },
  { keywords: ['sell', 'start selling', 'i want to sell', 'بيع', 'أبيع', 'ابيع', 'عايز ابيع', 'بائع'], path: '/sell', label: 'Sell' },
  { keywords: ['registry', 'سجل', 'تسجيل', 'ريجيستري'], path: '/registry', label: 'Registry' },
  { keywords: ['about us', 'about', 'من نحن', 'عننا', 'عن الشركة', 'عن الموقع'], path: '/about-us', label: 'About Us' },
  { keywords: ['careers', 'jobs', 'وظائف', 'توظيف', 'كاريرز', 'فرص عمل'], path: '/careers', label: 'Careers' },
  { keywords: ['press', 'press releases', 'news', 'صحافة', 'اخبار', 'أخبار', 'بيانات صحفية', 'نيوز'], path: '/press', label: 'Press' },
  { keywords: ['affiliate', 'التسويق بالعمولة', 'عمولة', 'افلييت', 'تسويق'], path: '/affiliate', label: 'Affiliate' },
  { keywords: ['advertise', 'advertising', 'اعلان', 'إعلان', 'اعلانات', 'إعلانات'], path: '/advertise', label: 'Advertise' },
  { keywords: ['shop card', 'بطاقة المتجر', 'كارت المتجر', 'شوب كارد'], path: '/shop-card', label: 'Shop Card' },
  { keywords: ['currency converter', 'currency', 'تحويل عملات', 'عملات', 'محول العملات', 'كارنسي'], path: '/currency-converter', label: 'Currency Converter' },
  { keywords: ['deals', "today's deals", 'عروض', 'العروض', 'عروض اليوم', 'التخفيضات', 'تخفيضات', 'خصومات', 'اوفر'], path: '/search', label: 'Deals' },
  { keywords: ['products', 'all products', 'browse', 'browse products', 'المنتجات', 'كل المنتجات', 'تصفح', 'تصفح المنتجات'], path: '/search', label: 'All Products' },
  { keywords: ['notifications', 'alerts', 'اشعارات', 'إشعارات', 'تنبيهات'], path: '/notifications', label: 'Notifications' },

  // --- Auth Pages ---
  { keywords: ['sign in', 'signin', 'login', 'log in', 'تسجيل دخول', 'دخول', 'سجل دخول', 'لوجن', 'لوج ان'], path: '/login', label: 'Sign In' },
  { keywords: ['sign up', 'signup', 'register', 'create account', 'new account', 'تسجيل', 'حساب جديد', 'انشاء حساب', 'إنشاء حساب', 'ساين اب'], path: '/signup', label: 'Sign Up' },
  { keywords: ['forgot password', 'reset password', 'نسيت كلمة السر', 'نسيت الباسورد', 'استعادة كلمة السر', 'ريست باسورد'], path: '/forgot-password', label: 'Forgot Password' },

  // --- Admin Pages ---
  { keywords: ['admin', 'admin dashboard', 'dashboard', 'لوحة التحكم', 'ادمن', 'داشبورد', 'الادارة', 'الإدارة'], path: '/admin', label: 'Admin Dashboard' },
  { keywords: ['admin products', 'manage products', 'ادارة المنتجات', 'إدارة المنتجات', 'منتجات الادمن'], path: '/admin/products', label: 'Admin Products' },
  { keywords: ['admin categories', 'manage categories', 'ادارة الاقسام', 'إدارة الأقسام', 'اقسام الادمن', 'الأقسام'], path: '/admin/categories', label: 'Admin Categories' },
  { keywords: ['admin orders', 'manage orders', 'ادارة الطلبات', 'إدارة الطلبات', 'طلبات الادمن'], path: '/admin/orders', label: 'Admin Orders' },
  { keywords: ['admin users', 'manage users', 'ادارة المستخدمين', 'إدارة المستخدمين', 'المستخدمين'], path: '/admin/users', label: 'Admin Users' },
  { keywords: ['admin suppliers', 'manage suppliers', 'الموردين', 'ادارة الموردين', 'إدارة الموردين'], path: '/admin/suppliers', label: 'Admin Suppliers' },
  { keywords: ['admin shops', 'manage shops', 'المتاجر', 'ادارة المتاجر', 'إدارة المتاجر'], path: '/admin/shops', label: 'Admin Shops' },
  { keywords: ['admin reviews', 'manage reviews', 'المراجعات', 'ادارة المراجعات', 'التقييمات'], path: '/admin/reviews', label: 'Admin Reviews' },
  { keywords: ['admin settings', 'site settings', 'اعدادات', 'إعدادات', 'اعدادات الموقع', 'الاعدادات'], path: '/admin/settings', label: 'Admin Settings' },
  { keywords: ['admin financial', 'financials', 'المالية', 'التقارير المالية', 'فاينانشال'], path: '/admin/financial', label: 'Admin Financial' },
  { keywords: ['admin files', 'file manager', 'manage files', 'الملفات', 'ادارة الملفات', 'إدارة الملفات', 'مدير الملفات'], path: '/admin/files', label: 'Admin Files' },
  { keywords: ['admin homepage settings', 'homepage settings', 'اعدادات الصفحة الرئيسية', 'تعديل الرئيسية'], path: '/admin/homepage', label: 'Admin Homepage Settings' },
  { keywords: ['admin pages', 'page content', 'اعدادات الصفحات', 'محتوى الصفحات'], path: '/admin/pages', label: 'Admin Page Content' },
  { keywords: ['admin payouts', 'shop payouts', 'المدفوعات', 'مدفوعات المتاجر'], path: '/admin/shop-payouts', label: 'Admin Shop Payouts' },
  { keywords: ['add product', 'new product', 'create product', 'اضافة منتج', 'إضافة منتج', 'منتج جديد'], path: '/admin/products/new', label: 'Add New Product' },

  // --- Shop Owner Pages ---
  { keywords: ['shop dashboard', 'my shop', 'لوحة تحكم المتجر', 'متجري', 'شوب'], path: '/shop', label: 'Shop Dashboard' },
  { keywords: ['shop products', 'my products', 'منتجات المتجر', 'منتجاتي'], path: '/shop/products', label: 'Shop Products' },
  { keywords: ['shop orders', 'منتجات المتجر', 'طلبات المتجر', 'طلبات متجري'], path: '/shop/orders', label: 'Shop Orders' },
  { keywords: ['shop team', 'my team', 'فريق العمل', 'فريقي', 'الفريق'], path: '/shop/team', label: 'Shop Team' },
  { keywords: ['shop payouts', 'my payouts', 'مدفوعاتي', 'ارباحي', 'أرباحي'], path: '/shop/payouts', label: 'Shop Payouts' },
  { keywords: ['shop settings', 'اعدادات المتجر', 'إعدادات المتجر'], path: '/shop/settings', label: 'Shop Settings' },
];

// =============================================
// PRODUCT CATEGORIES
// =============================================
const categoryCommands: CommandRule[] = [
  { keywords: ['laptops', 'laptop', 'لابتوب', 'لاب توب', 'لابتوبات', 'اجهزة لابتوب', 'أجهزة لاب توب', 'اجهزة اللابتوب', 'أجهزة اللابتوب'], path: '/search?q=Laptops', label: 'Laptops' },
  { keywords: ['headphones', 'headphone', 'earphones', 'earbuds', 'هيدفون', 'سماعات', 'سماعة', 'سماعه', 'سماعات الرأس', 'سماعات راس', 'ايربودز'], path: '/search?q=Headphones', label: 'Headphones' },
  { keywords: ['keyboards', 'keyboard', 'كيبورد', 'كيبوردات', 'لوحة مفاتيح', 'لوحات المفاتيح', 'لوحه مفاتيح'], path: '/search?q=Keyboards', label: 'Keyboards' },
  { keywords: ['mouse', 'mice', 'ماوس', 'فأرة', 'فاره', 'الفأرات', 'ماوسات'], path: '/search?q=Mice', label: 'Mice' },
  { keywords: ['mouse pad', 'mouse pads', 'mousepad', 'mousepads', 'ماوس باد', 'وسادة ماوس', 'وسائد الماوس', 'باد'], path: '/search?q=Mouse+Pads', label: 'Mouse Pads' },
  { keywords: ['cables', 'cable', 'كابل', 'كابلات', 'سلك', 'اسلاك', 'الكابلات'], path: '/search?q=Cables', label: 'Cables' },
  { keywords: ['hard drive', 'hard drives', 'hard disk', 'ssd', 'هارد', 'هارد درايف', 'هارد ديسك', 'الأقراص الصلبة', 'اقراص صلبة', 'اس اس دي'], path: '/search?q=Hard+Drives', label: 'Hard Drives' },
  { keywords: ['monitor', 'monitors', 'screen', 'screens', 'display', 'شاشة', 'شاشات', 'مونيتور', 'شاشه'], path: '/search?q=Monitors', label: 'Monitors' },
  { keywords: ['pc', 'pcs', 'computer', 'computers', 'desktop', 'كمبيوتر', 'كومبيوتر', 'كمبيوترات', 'كومبيوترات', 'بي سي', 'حاسوب', 'حاسب', 'اجهزة الكمبيوتر', 'أجهزة الكمبيوتر', 'اجهزة الكومبيوتر', 'ديسكتوب'], path: '/search?q=PCs', label: 'PCs' },
  { keywords: ['books', 'book', 'كتب', 'كتاب', 'الكتب'], path: '/search?q=Books', label: 'Books' },
  { keywords: ['fashion', 'clothes', 'clothing', 'ملابس', 'موضة', 'الموضة', 'ازياء', 'أزياء'], path: '/search?q=Fashion', label: 'Fashion' },
  { keywords: ['home kitchen', 'home and kitchen', 'kitchen', 'المنزل والمطبخ', 'المنزل', 'المطبخ', 'مطبخ', 'ادوات منزلية', 'أدوات منزلية'], path: '/search?q=Home+%26+Kitchen', label: 'Home & Kitchen' },
];

// =============================================
// ACTIONS (browser actions, not navigation)
// =============================================
const actionKeywords: { keywords: string[]; action: string }[] = [
  { keywords: ['scroll down', 'انزل', 'نزل', 'تحت', 'نزول'], action: 'scrollDown' },
  { keywords: ['scroll up', 'اطلع', 'طلع', 'فوق', 'طلوع'], action: 'scrollUp' },
  { keywords: ['go to end', 'go to bottom', 'bottom', 'end of page', 'اخر الصفحة', 'اخر الصفحه', 'آخر الصفحة', 'النهاية', 'النهايه', 'الاخر', 'الآخر', 'تحت خالص', 'اخر'], action: 'scrollToBottom' },
  { keywords: ['go to top', 'top', 'top of page', 'اول الصفحة', 'اول الصفحه', 'أول الصفحة', 'البداية', 'البدايه', 'فوق خالص', 'الاول'], action: 'scrollToTop' },
  { keywords: ['go back', 'back', 'رجوع', 'ارجع', 'رجعني', 'رجع'], action: 'goBack' },
  { keywords: ['go forward', 'forward', 'قدام', 'للأمام', 'للامام'], action: 'goForward' },
  { keywords: ['refresh', 'reload', 'تحديث', 'حدث', 'ريفريش', 'ريلود'], action: 'refresh' },
  { keywords: ['stop', 'cancel', 'الغاء', 'إلغاء', 'توقف', 'ستوب', 'كانسل'], action: 'stop' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?؟،:;'"٪%]/g, '')  // remove punctuation
    .replace(/\s+/g, ' ')             // collapse whitespace
    .replace(/ة/g, 'ه')              // taa marbuta → haa
    .replace(/ى/g, 'ي')              // alef maqsura → yaa
    .replace(/أ|إ|آ/g, 'ا');          // normalize alef variants
}

export function processVoiceCommand(transcript: string): VoiceCommandResult & { action?: string } {
  const text = normalize(transcript);

  // 1. Check browser actions first
  for (const act of actionKeywords) {
    for (const keyword of act.keywords) {
      if (text.includes(keyword)) {
        return { type: 'navigate', path: '', label: act.action, action: act.action, matched: true };
      }
    }
  }

  // 2. Check explicit search commands — "search for X" / "ابحث عن X"
  const searchMatch = text.match(/(?:search\s*(?:for)?|find|look\s*(?:for|up))\s+(.+)/i)
    || text.match(/(?:ابحث|دور|بحث)\s*(?:عن|على|لي)?\s+(.+)/i);

  if (searchMatch) {
    const query = searchMatch[1].trim();
    return {
      type: 'search',
      query,
      path: `/search?q=${encodeURIComponent(query)}`,
      label: `Search: ${query}`,
      matched: true,
    };
  }

  // 3. Check "go to" prefix patterns — extract the target
  const goToMatch = text.match(/(?:go\s*(?:to)?|open|show|show me|navigate\s*to|take me to)\s+(.+)/i)
    || text.match(/(?:روح|اذهب|فتح|افتح|وريني|ورينى|خدني|ودينى|وديني|عرض)\s*(?:ل|لل|الى|إلى|على)?\s*(.+)/i);

  if (goToMatch) {
    const target = normalize(goToMatch[1]);

    // Try categories FIRST (more specific), then pages
    for (const cmd of categoryCommands) {
      for (const keyword of cmd.keywords) {
        if (target.includes(keyword)) {
          return { type: 'navigate', path: cmd.path, label: cmd.label, matched: true };
        }
      }
    }
    for (const cmd of pageCommands) {
      for (const keyword of cmd.keywords) {
        if (target.includes(keyword)) {
          return { type: 'navigate', path: cmd.path, label: cmd.label, matched: true };
        }
      }
    }
  }

  // 4. Direct keyword matching (without prefix)
  // Check CATEGORIES first — they are more specific than page names
  // Sort each group by longest keyword first to prefer exact matches
  const sortedCategories = [...categoryCommands].sort((a, b) => {
    const maxA = Math.max(...a.keywords.map(k => k.length));
    const maxB = Math.max(...b.keywords.map(k => k.length));
    return maxB - maxA;
  });

  for (const cmd of sortedCategories) {
    for (const keyword of cmd.keywords) {
      if (text.includes(keyword)) {
        return { type: 'navigate', path: cmd.path, label: cmd.label, matched: true };
      }
    }
  }

  // Then check pages
  const sortedPages = [...pageCommands].sort((a, b) => {
    const maxA = Math.max(...a.keywords.map(k => k.length));
    const maxB = Math.max(...b.keywords.map(k => k.length));
    return maxB - maxA;
  });

  for (const cmd of sortedPages) {
    for (const keyword of cmd.keywords) {
      if (text.includes(keyword)) {
        return { type: 'navigate', path: cmd.path, label: cmd.label, matched: true };
      }
    }
  }

  // 5. Fallback — treat everything as a product search
  return {
    type: 'search',
    query: text,
    path: `/search?q=${encodeURIComponent(text)}`,
    label: `Search: ${text}`,
    matched: true,
  };
}
