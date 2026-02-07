export interface VoiceCommandResult {
  type: 'navigate' | 'search';
  path?: string;
  query?: string;
  matched: boolean;
}

interface CommandRule {
  keywords: string[];
  path: string;
}

// Simple keyword-based matching — if ANY keyword is found in the transcript, navigate
const navigationCommands: CommandRule[] = [
  // CART
  { keywords: ['cart', 'سلة', 'كارت', 'عربة', 'السله', 'السلة', 'عربية'], path: '/cart' },

  // HOME
  { keywords: ['home', 'الرئيسية', 'البيت', 'هوم', 'الرئيسيه', 'main page'], path: '/' },

  // CHECKOUT
  { keywords: ['checkout', 'check out', 'الدفع', 'ادفع', 'الشراء', 'payment', 'pay now'], path: '/checkout' },

  // ORDERS
  { keywords: ['orders', 'order', 'طلبات', 'الطلبات', 'طلباتي', 'اوردر'], path: '/orders' },

  // ACCOUNT
  { keywords: ['account', 'حسابي', 'الحساب', 'بروفايل', 'profile', 'اكاونت'], path: '/account' },

  // LISTS / WISHLIST
  { keywords: ['lists', 'list', 'wishlist', 'قوائم', 'المفضلة', 'الأمنيات', 'المفضله'], path: '/lists' },

  // CUSTOMER SERVICE
  { keywords: ['customer service', 'خدمة العملاء', 'help', 'support', 'المساعدة', 'الدعم', 'مساعده', 'مساعدة'], path: '/customer-service' },

  // GIFT CARDS
  { keywords: ['gift card', 'gift cards', 'كروت الهدايا', 'بطاقات', 'هدايا'], path: '/gift-cards' },

  // SELL
  { keywords: ['sell', 'بيع', 'أبيع', 'ابيع'], path: '/sell' },

  // ABOUT
  { keywords: ['about us', 'about', 'من نحن', 'عننا'], path: '/about-us' },

  // REGISTRY
  { keywords: ['registry', 'سجل'], path: '/registry' },
];

// Category shortcuts — these navigate to search with a query
const categoryCommands: CommandRule[] = [
  { keywords: ['laptops', 'laptop', 'لابتوب', 'لاب توب', 'لابتوبات'], path: '/search?q=laptops' },
  { keywords: ['headphones', 'headphone', 'هيدفون', 'سماعات', 'سماعة', 'سماعه'], path: '/search?q=headphones' },
  { keywords: ['keyboards', 'keyboard', 'كيبورد', 'لوحة مفاتيح', 'كيبوردات'], path: '/search?q=keyboards' },
  { keywords: ['mouse', 'mice', 'ماوس', 'فأرة', 'فاره'], path: '/search?q=mice' },
  { keywords: ['cables', 'cable', 'كابل', 'كابلات', 'سلك'], path: '/search?q=cables' },
  { keywords: ['hard drive', 'hard disk', 'هارد', 'هارد درايف', 'هارد ديسك'], path: '/search?q=hard+drives' },
  { keywords: ['monitor', 'monitors', 'شاشة', 'شاشات', 'مونيتور'], path: '/search?q=monitors' },
  { keywords: ['pc', 'pcs', 'computer', 'كمبيوتر', 'بي سي'], path: '/search?q=PCs' },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?؟،]/g, '')
    .replace(/\s+/g, ' ');
}

export function processVoiceCommand(transcript: string): VoiceCommandResult {
  const text = normalize(transcript);

  // Check explicit search commands first — "search for X" / "ابحث عن X"
  const searchMatch = text.match(/(?:search\s*(?:for)?|find|look\s*(?:for|up))\s+(.+)/i)
    || text.match(/(?:ابحث|دور)\s*(?:عن|على)\s+(.+)/i);

  if (searchMatch) {
    const query = searchMatch[1].trim();
    return {
      type: 'search',
      query,
      path: `/search?q=${encodeURIComponent(query)}`,
      matched: true,
    };
  }

  // Check navigation commands — look for "go to" prefix patterns first
  const goToMatch = text.match(/(?:go\s*(?:to)?|open|show|navigate\s*to)\s+(.+)/i)
    || text.match(/(?:روح|اذهب|فتح|افتح|ورينى|وريني)\s*(?:ل|لل|الى|إلى)?\s*(.+)/i);

  if (goToMatch) {
    const target = normalize(goToMatch[1]);

    // Try navigation commands
    for (const cmd of navigationCommands) {
      for (const keyword of cmd.keywords) {
        if (target.includes(keyword.toLowerCase())) {
          return { type: 'navigate', path: cmd.path, matched: true };
        }
      }
    }

    // Try category commands
    for (const cmd of categoryCommands) {
      for (const keyword of cmd.keywords) {
        if (target.includes(keyword.toLowerCase())) {
          return { type: 'navigate', path: cmd.path, matched: true };
        }
      }
    }
  }

  // Direct keyword matching (without "go to" prefix)
  for (const cmd of navigationCommands) {
    for (const keyword of cmd.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return { type: 'navigate', path: cmd.path, matched: true };
      }
    }
  }

  // Category keyword matching
  for (const cmd of categoryCommands) {
    for (const keyword of cmd.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return { type: 'navigate', path: cmd.path, matched: true };
      }
    }
  }

  // Fallback — treat as product search
  return {
    type: 'search',
    query: text,
    path: `/search?q=${encodeURIComponent(text)}`,
    matched: true,
  };
}
