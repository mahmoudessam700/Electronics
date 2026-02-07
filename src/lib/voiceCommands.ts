export interface VoiceCommandResult {
  type: 'navigate' | 'search' | 'action';
  path?: string;
  query?: string;
  action?: string;
  matched: boolean;
}

interface CommandPattern {
  patterns: RegExp[];
  result: Omit<VoiceCommandResult, 'matched'>;
}

const commands: CommandPattern[] = [
  // === CART ===
  {
    patterns: [
      /\b(go\s*to\s*(the\s*)?cart|open\s*cart|show\s*cart|view\s*cart|my\s*cart)\b/i,
      /\b(روح|اذهب|فتح|افتح|ورين[يى]|عرض)\b.*(سلة|كارت|عربة|السلة)/i,
      /\b(السلة|سلة\s*(التسوق|المشتريات))\b/i,
    ],
    result: { type: 'navigate', path: '/cart' },
  },

  // === HOME ===
  {
    patterns: [
      /\b(go\s*(to\s*)?(the\s*)?home|home\s*page|main\s*page|go\s*back\s*home)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(الرئيسية|البيت|هوم|الصفحة\s*الرئيسية)/i,
      /\b(الصفحة\s*الرئيسية|الرئيسية)\b/i,
    ],
    result: { type: 'navigate', path: '/' },
  },

  // === CHECKOUT ===
  {
    patterns: [
      /\b(go\s*to\s*(the\s*)?checkout|checkout|proceed\s*to\s*checkout|pay|payment)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(الدفع|الشراء|تشيك\s*اوت|checkout)/i,
      /\b(ادفع|الدفع|اشتري|checkout)\b/i,
    ],
    result: { type: 'navigate', path: '/checkout' },
  },

  // === ORDERS ===
  {
    patterns: [
      /\b(go\s*to\s*(my\s*)?orders|show\s*(my\s*)?orders|my\s*orders|view\s*orders)\b/i,
      /\b(روح|اذهب|فتح|افتح|ورين[يى]|عرض)\b.*(طلبات|الطلبات|اوردر)/i,
      /\b(طلباتي|الطلبات)\b/i,
    ],
    result: { type: 'navigate', path: '/orders' },
  },

  // === ACCOUNT ===
  {
    patterns: [
      /\b(go\s*to\s*(my\s*)?account|my\s*account|show\s*account|profile|my\s*profile)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(حسابي|الحساب|البروفايل|اكاونت)/i,
      /\b(حسابي|الحساب)\b/i,
    ],
    result: { type: 'navigate', path: '/account' },
  },

  // === LISTS / WISHLIST ===
  {
    patterns: [
      /\b(go\s*to\s*(my\s*)?lists?|my\s*lists?|show\s*(my\s*)?lists?|wishlist|my\s*wishlist)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(قوائم|القوائم|المفضلة|الأمنيات)/i,
      /\b(قوائمي|المفضلة|قائمة\s*الأمنيات)\b/i,
    ],
    result: { type: 'navigate', path: '/lists' },
  },

  // === CUSTOMER SERVICE ===
  {
    patterns: [
      /\b(go\s*to\s*customer\s*service|customer\s*service|help|support|contact)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(خدمة\s*العملاء|المساعدة|الدعم)/i,
      /\b(خدمة\s*العملاء|المساعدة|الدعم)\b/i,
    ],
    result: { type: 'navigate', path: '/customer-service' },
  },

  // === GIFT CARDS ===
  {
    patterns: [
      /\b(go\s*to\s*gift\s*cards?|gift\s*cards?|show\s*gift\s*cards?)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(كروت\s*الهدايا|بطاقات\s*الهدايا|gift)/i,
      /\b(كروت\s*الهدايا|بطاقات\s*الهدايا)\b/i,
    ],
    result: { type: 'navigate', path: '/gift-cards' },
  },

  // === SELL ===
  {
    patterns: [
      /\b(go\s*to\s*sell|i\s*want\s*to\s*sell|sell\s*page|start\s*selling)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(البيع|بيع|أبيع)/i,
      /\b(عايز\s*أبيع|أبيع)\b/i,
    ],
    result: { type: 'navigate', path: '/sell' },
  },

  // === DEALS ===
  {
    patterns: [
      /\b(go\s*to\s*(today'?s?\s*)?deals|today'?s?\s*deals|show\s*deals)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(العروض|عروض|التخفيضات)/i,
      /\b(العروض|عروض\s*اليوم|التخفيضات)\b/i,
    ],
    result: { type: 'navigate', path: '/search' },
  },

  // === ABOUT US ===
  {
    patterns: [
      /\b(go\s*to\s*about(\s*us)?|about\s*us|who\s*are\s*you)\b/i,
      /\b(روح|اذهب|فتح|افتح)\b.*(من\s*نحن|عننا)/i,
      /\b(من\s*نحن|عن\s*الشركة)\b/i,
    ],
    result: { type: 'navigate', path: '/about' },
  },

  // === CATEGORIES (specific) ===
  {
    patterns: [
      /\b(show\s*(me\s*)?laptops?|go\s*to\s*laptops?|laptops?\s*page)\b/i,
      /\b(ورين[يى]|عرض|افتح)\b.*(لابتوب|لاب\s*توب|اللابتوبات)/i,
    ],
    result: { type: 'navigate', path: '/search?q=laptops' },
  },
  {
    patterns: [
      /\b(show\s*(me\s*)?headphones?|go\s*to\s*headphones?)\b/i,
      /\b(ورين[يى]|عرض|افتح)\b.*(هيدفون|سماعات|سماعة)/i,
    ],
    result: { type: 'navigate', path: '/search?q=headphones' },
  },
  {
    patterns: [
      /\b(show\s*(me\s*)?keyboards?|go\s*to\s*keyboards?)\b/i,
      /\b(ورين[يى]|عرض|افتح)\b.*(كيبورد|لوحة\s*مفاتيح)/i,
    ],
    result: { type: 'navigate', path: '/search?q=keyboards' },
  },
  {
    patterns: [
      /\b(show\s*(me\s*)?mice|show\s*(me\s*)?mouse|go\s*to\s*mice)\b/i,
      /\b(ورين[يى]|عرض|افتح)\b.*(ماوس|فأرة)/i,
    ],
    result: { type: 'navigate', path: '/search?q=mice' },
  },

  // === SEARCH (explicit) ===
  {
    patterns: [
      /\b(search\s*(for)?|find|look\s*(for|up))\s+(.+)/i,
      /\b(ابحث|دور)\s*(عن|على)\s+(.+)/i,
    ],
    result: { type: 'search' }, // query extracted dynamically
  },
];

export function processVoiceCommand(transcript: string): VoiceCommandResult {
  const text = transcript.trim();

  for (const command of commands) {
    for (const pattern of command.patterns) {
      const match = text.match(pattern);
      if (match) {
        // Handle search commands — extract the search query
        if (command.result.type === 'search') {
          // Get the last capture group as the search query
          const query = match[match.length - 1]?.trim();
          if (query) {
            return {
              type: 'search',
              query,
              path: `/search?q=${encodeURIComponent(query)}`,
              matched: true,
            };
          }
        }

        return { ...command.result, matched: true };
      }
    }
  }

  // If no command matched, treat it as a search query
  return {
    type: 'search',
    query: text,
    path: `/search?q=${encodeURIComponent(text)}`,
    matched: true,
  };
}
