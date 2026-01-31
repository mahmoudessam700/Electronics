import { useState, useEffect } from 'react';
import { Save, Globe, FileText, ChevronDown, ChevronUp, Plus, Trash2, Image } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PageContent {
    id: string;
    name: string;
    nameAr: string;
    heroTitle: string;
    heroTitleAr: string;
    heroSubtitle: string;
    heroSubtitleAr: string;
    heroImage?: string;
    sections: PageSection[];
}

interface PageSection {
    id: string;
    type: 'text' | 'benefits' | 'cards' | 'cta' | 'list' | 'faq';
    title: string;
    titleAr: string;
    content: string;
    contentAr: string;
    items?: SectionItem[];
}

interface SectionItem {
    id: string;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    icon?: string;
    image?: string;
}

const defaultPages: PageContent[] = [
    {
        id: 'about-us',
        name: 'About Us',
        nameAr: 'من نحن',
        heroTitle: 'About Our Company',
        heroTitleAr: 'عن شركتنا',
        heroSubtitle: 'Learn more about our mission, values, and the team behind our success.',
        heroSubtitleAr: 'تعرف على مهمتنا وقيمنا والفريق وراء نجاحنا.',
        sections: [
            {
                id: 'mission',
                type: 'text',
                title: 'Our Mission',
                titleAr: 'مهمتنا',
                content: 'To provide the best electronics shopping experience with quality products and excellent customer service.',
                contentAr: 'تقديم أفضل تجربة تسوق إلكترونيات مع منتجات عالية الجودة وخدمة عملاء ممتازة.'
            },
            {
                id: 'values',
                type: 'benefits',
                title: 'Our Values',
                titleAr: 'قيمنا',
                content: '',
                contentAr: '',
                items: [
                    { id: 'v1', title: 'Quality', titleAr: 'الجودة', description: 'We never compromise on quality', descriptionAr: 'لا نتنازل أبداً عن الجودة' },
                    { id: 'v2', title: 'Trust', titleAr: 'الثقة', description: 'Building lasting relationships', descriptionAr: 'بناء علاقات دائمة' },
                    { id: 'v3', title: 'Innovation', titleAr: 'الابتكار', description: 'Always staying ahead', descriptionAr: 'دائماً في المقدمة' },
                    { id: 'v4', title: 'Service', titleAr: 'الخدمة', description: 'Customer satisfaction first', descriptionAr: 'رضا العملاء أولاً' }
                ]
            }
        ]
    },
    {
        id: 'careers',
        name: 'Careers',
        nameAr: 'الوظائف',
        heroTitle: 'Join Our Team',
        heroTitleAr: 'انضم لفريقنا',
        heroSubtitle: 'Discover exciting career opportunities and grow with us.',
        heroSubtitleAr: 'اكتشف فرص وظيفية مثيرة وانمو معنا.',
        sections: [
            {
                id: 'why-join',
                type: 'text',
                title: 'Why Join Us?',
                titleAr: 'لماذا تنضم إلينا؟',
                content: 'We offer competitive salaries, great benefits, and a dynamic work environment.',
                contentAr: 'نقدم رواتب تنافسية ومزايا رائعة وبيئة عمل ديناميكية.'
            },
            {
                id: 'benefits',
                type: 'benefits',
                title: 'Employee Benefits',
                titleAr: 'مزايا الموظفين',
                content: '',
                contentAr: '',
                items: [
                    { id: 'b1', title: 'Health Insurance', titleAr: 'التأمين الصحي', description: 'Comprehensive health coverage', descriptionAr: 'تغطية صحية شاملة' },
                    { id: 'b2', title: 'Learning & Development', titleAr: 'التعلم والتطوير', description: 'Continuous growth opportunities', descriptionAr: 'فرص نمو مستمرة' },
                    { id: 'b3', title: 'Work-Life Balance', titleAr: 'التوازن بين العمل والحياة', description: 'Flexible working hours', descriptionAr: 'ساعات عمل مرنة' },
                    { id: 'b4', title: 'Career Growth', titleAr: 'النمو الوظيفي', description: 'Clear advancement paths', descriptionAr: 'مسارات ترقي واضحة' }
                ]
            }
        ]
    },
    {
        id: 'press',
        name: 'Press Releases',
        nameAr: 'البيانات الصحفية',
        heroTitle: 'Press & Media',
        heroTitleAr: 'الصحافة والإعلام',
        heroSubtitle: 'Latest news and announcements from our company.',
        heroSubtitleAr: 'آخر الأخبار والإعلانات من شركتنا.',
        sections: [
            {
                id: 'contact',
                type: 'text',
                title: 'Media Contact',
                titleAr: 'التواصل الإعلامي',
                content: 'For press inquiries, please contact our media relations team.',
                contentAr: 'للاستفسارات الصحفية، يرجى التواصل مع فريق العلاقات الإعلامية.'
            }
        ]
    },
    {
        id: 'affiliate',
        name: 'Affiliate Program',
        nameAr: 'برنامج الشراكة',
        heroTitle: 'Become an Affiliate',
        heroTitleAr: 'كن شريكاً',
        heroSubtitle: 'Earn commissions by promoting our products.',
        heroSubtitleAr: 'اكسب عمولات من خلال الترويج لمنتجاتنا.',
        sections: [
            {
                id: 'how-it-works',
                type: 'text',
                title: 'How It Works',
                titleAr: 'كيف يعمل البرنامج',
                content: 'Sign up, share your unique link, and earn commissions on every sale.',
                contentAr: 'سجل، شارك رابطك الفريد، واكسب عمولات على كل عملية بيع.'
            },
            {
                id: 'benefits',
                type: 'benefits',
                title: 'Program Benefits',
                titleAr: 'مزايا البرنامج',
                content: '',
                contentAr: '',
                items: [
                    { id: 'a1', title: 'High Commissions', titleAr: 'عمولات عالية', description: 'Up to 10% on every sale', descriptionAr: 'حتى 10% على كل عملية بيع' },
                    { id: 'a2', title: 'Real-time Tracking', titleAr: 'تتبع فوري', description: 'Monitor your earnings live', descriptionAr: 'راقب أرباحك مباشرة' },
                    { id: 'a3', title: 'Monthly Payouts', titleAr: 'دفعات شهرية', description: 'Reliable payment schedule', descriptionAr: 'جدول دفع موثوق' },
                    { id: 'a4', title: 'Marketing Materials', titleAr: 'مواد تسويقية', description: 'Ready-to-use banners and links', descriptionAr: 'بانرات وروابط جاهزة للاستخدام' }
                ]
            }
        ]
    },
    {
        id: 'advertise',
        name: 'Advertise With Us',
        nameAr: 'أعلن معنا',
        heroTitle: 'Advertising Opportunities',
        heroTitleAr: 'فرص الإعلان',
        heroSubtitle: 'Reach millions of customers through our platform.',
        heroSubtitleAr: 'الوصول لملايين العملاء عبر منصتنا.',
        sections: [
            {
                id: 'options',
                type: 'text',
                title: 'Advertising Options',
                titleAr: 'خيارات الإعلان',
                content: 'We offer various advertising solutions including banner ads, sponsored products, and email marketing.',
                contentAr: 'نقدم حلول إعلانية متنوعة تشمل إعلانات البانر والمنتجات المدعومة والتسويق عبر البريد الإلكتروني.'
            }
        ]
    },
    {
        id: 'shop-card',
        name: 'Shop Card',
        nameAr: 'بطاقة المتجر',
        heroTitle: 'Shop Card',
        heroTitleAr: 'بطاقة المتجر',
        heroSubtitle: 'The perfect gift for any occasion.',
        heroSubtitleAr: 'الهدية المثالية لأي مناسبة.',
        sections: [
            {
                id: 'about',
                type: 'text',
                title: 'About Shop Card',
                titleAr: 'عن بطاقة المتجر',
                content: 'Our shop cards never expire and can be used on millions of products.',
                contentAr: 'بطاقات المتجر لدينا لا تنتهي صلاحيتها ويمكن استخدامها على ملايين المنتجات.'
            }
        ]
    },
    {
        id: 'gift-cards',
        name: 'Gift Cards',
        nameAr: 'بطاقات الهدايا',
        heroTitle: 'Gift Cards',
        heroTitleAr: 'بطاقات الهدايا',
        heroSubtitle: 'Give the gift of choice.',
        heroSubtitleAr: 'قدم هدية الاختيار.',
        sections: [
            {
                id: 'types',
                type: 'text',
                title: 'Gift Card Types',
                titleAr: 'أنواع بطاقات الهدايا',
                content: 'Choose from digital or physical gift cards in various denominations.',
                contentAr: 'اختر من بطاقات الهدايا الرقمية أو المادية بفئات متنوعة.'
            }
        ]
    },
    {
        id: 'customer-service',
        name: 'Customer Service',
        nameAr: 'خدمة العملاء',
        heroTitle: 'How Can We Help?',
        heroTitleAr: 'كيف يمكننا مساعدتك؟',
        heroSubtitle: 'We are here to assist you 24/7.',
        heroSubtitleAr: 'نحن هنا لمساعدتك على مدار الساعة.',
        sections: [
            {
                id: 'contact-info',
                type: 'text',
                title: 'Contact Information',
                titleAr: 'معلومات التواصل',
                content: 'Reach us via phone, email, or live chat.',
                contentAr: 'تواصل معنا عبر الهاتف أو البريد الإلكتروني أو الدردشة المباشرة.'
            },
            {
                id: 'faq',
                type: 'faq',
                title: 'Frequently Asked Questions',
                titleAr: 'الأسئلة الشائعة',
                content: '',
                contentAr: '',
                items: [
                    { id: 'f1', title: 'How do I track my order?', titleAr: 'كيف أتتبع طلبي؟', description: 'You can track your order in the Orders section of your account.', descriptionAr: 'يمكنك تتبع طلبك في قسم الطلبات في حسابك.' },
                    { id: 'f2', title: 'What is the return policy?', titleAr: 'ما هي سياسة الإرجاع؟', description: 'We offer 30-day returns on most items.', descriptionAr: 'نقدم إرجاع خلال 30 يوماً على معظم المنتجات.' },
                    { id: 'f3', title: 'How do I contact support?', titleAr: 'كيف أتواصل مع الدعم؟', description: 'Use live chat, email, or call our hotline.', descriptionAr: 'استخدم الدردشة المباشرة أو البريد الإلكتروني أو اتصل بخط الدعم.' }
                ]
            }
        ]
    },
    {
        id: 'sell',
        name: 'Sell on Shop',
        nameAr: 'البيع على المتجر',
        heroTitle: 'Start Selling Today',
        heroTitleAr: 'ابدأ البيع اليوم',
        heroSubtitle: 'Join thousands of successful sellers on our platform.',
        heroSubtitleAr: 'انضم لآلاف البائعين الناجحين على منصتنا.',
        sections: [
            {
                id: 'how-to-start',
                type: 'text',
                title: 'How to Get Started',
                titleAr: 'كيف تبدأ',
                content: 'Register as a seller, list your products, and start earning.',
                contentAr: 'سجل كبائع، أضف منتجاتك، وابدأ في الربح.'
            },
            {
                id: 'seller-benefits',
                type: 'benefits',
                title: 'Seller Benefits',
                titleAr: 'مزايا البائعين',
                content: '',
                contentAr: '',
                items: [
                    { id: 's1', title: 'Wide Reach', titleAr: 'وصول واسع', description: 'Access millions of customers', descriptionAr: 'الوصول لملايين العملاء' },
                    { id: 's2', title: 'Easy Management', titleAr: 'إدارة سهلة', description: 'Simple seller dashboard', descriptionAr: 'لوحة تحكم بسيطة للبائعين' },
                    { id: 's3', title: 'Secure Payments', titleAr: 'دفعات آمنة', description: 'Reliable payment processing', descriptionAr: 'معالجة دفعات موثوقة' },
                    { id: 's4', title: 'Support', titleAr: 'الدعم', description: '24/7 seller support', descriptionAr: 'دعم البائعين على مدار الساعة' }
                ]
            }
        ]
    },
    {
        id: 'currency-converter',
        name: 'Currency Converter',
        nameAr: 'محول العملات',
        heroTitle: 'Currency Converter',
        heroTitleAr: 'محول العملات',
        heroSubtitle: 'Convert prices to your local currency.',
        heroSubtitleAr: 'حول الأسعار لعملتك المحلية.',
        sections: [
            {
                id: 'info',
                type: 'text',
                title: 'About Currency Conversion',
                titleAr: 'عن تحويل العملات',
                content: 'We support multiple currencies with real-time exchange rates.',
                contentAr: 'ندعم عملات متعددة بأسعار صرف فورية.'
            }
        ]
    }
];

export function AdminPageContentSettings() {
    const { language } = useLanguage();
    const [pages, setPages] = useState<PageContent[]>(defaultPages);
    const [expandedPage, setExpandedPage] = useState<string | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/settings?type=page-content&t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.pages && data.pages.length > 0) {
                        // Merge with defaults to ensure all pages exist
                        const mergedPages = defaultPages.map(defaultPage => {
                            const savedPage = data.pages.find((p: PageContent) => p.id === defaultPage.id);
                            return savedPage || defaultPage;
                        });
                        setPages(mergedPages);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch page content settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'page-content', pages })
            });
            if (res.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const updatePage = (pageId: string, field: keyof PageContent, value: any) => {
        setPages(prev => prev.map(page => 
            page.id === pageId ? { ...page, [field]: value } : page
        ));
    };

    const updateSection = (pageId: string, sectionId: string, field: keyof PageSection, value: any) => {
        setPages(prev => prev.map(page => {
            if (page.id !== pageId) return page;
            return {
                ...page,
                sections: page.sections.map(section =>
                    section.id === sectionId ? { ...section, [field]: value } : section
                )
            };
        }));
    };

    const updateSectionItem = (pageId: string, sectionId: string, itemId: string, field: keyof SectionItem, value: string) => {
        setPages(prev => prev.map(page => {
            if (page.id !== pageId) return page;
            return {
                ...page,
                sections: page.sections.map(section => {
                    if (section.id !== sectionId) return section;
                    return {
                        ...section,
                        items: section.items?.map(item =>
                            item.id === itemId ? { ...item, [field]: value } : item
                        )
                    };
                })
            };
        }));
    };

    const addSectionItem = (pageId: string, sectionId: string) => {
        const newItem: SectionItem = {
            id: `item-${Date.now()}`,
            title: 'New Item',
            titleAr: 'عنصر جديد',
            description: 'Description',
            descriptionAr: 'الوصف'
        };
        setPages(prev => prev.map(page => {
            if (page.id !== pageId) return page;
            return {
                ...page,
                sections: page.sections.map(section => {
                    if (section.id !== sectionId) return section;
                    return {
                        ...section,
                        items: [...(section.items || []), newItem]
                    };
                })
            };
        }));
    };

    const removeSectionItem = (pageId: string, sectionId: string, itemId: string) => {
        setPages(prev => prev.map(page => {
            if (page.id !== pageId) return page;
            return {
                ...page,
                sections: page.sections.map(section => {
                    if (section.id !== sectionId) return section;
                    return {
                        ...section,
                        items: section.items?.filter(item => item.id !== itemId)
                    };
                })
            };
        }));
    };

    const addSection = (pageId: string) => {
        const newSection: PageSection = {
            id: `section-${Date.now()}`,
            type: 'text',
            title: 'New Section',
            titleAr: 'قسم جديد',
            content: 'Content goes here',
            contentAr: 'المحتوى هنا'
        };
        setPages(prev => prev.map(page => {
            if (page.id !== pageId) return page;
            return {
                ...page,
                sections: [...page.sections, newSection]
            };
        }));
    };

    const removeSection = (pageId: string, sectionId: string) => {
        setPages(prev => prev.map(page => {
            if (page.id !== pageId) return page;
            return {
                ...page,
                sections: page.sections.filter(s => s.id !== sectionId)
            };
        }));
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <FileText className="h-7 w-7 text-indigo-600" />
                        {language === 'ar' ? 'إدارة محتوى الصفحات' : 'Page Content Manager'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {language === 'ar' 
                            ? 'تحكم في محتوى جميع صفحات الموقع' 
                            : 'Control the content of all website pages'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                        saveSuccess 
                            ? 'bg-green-500 text-white' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                    <Save className="h-5 w-5" />
                    {saving ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                        : saveSuccess ? (language === 'ar' ? 'تم الحفظ!' : 'Saved!') 
                        : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
            </div>

            {/* Pages List */}
            <div className="space-y-4">
                {pages.map(page => (
                    <div key={page.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Page Header */}
                        <button
                            onClick={() => setExpandedPage(expandedPage === page.id ? null : page.id)}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-indigo-500" />
                                <span className="font-semibold text-slate-800">
                                    {language === 'ar' ? page.nameAr : page.name}
                                </span>
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                    /{page.id}
                                </span>
                            </div>
                            {expandedPage === page.id ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                        </button>

                        {/* Page Content */}
                        {expandedPage === page.id && (
                            <div className="border-t border-slate-100 p-5 space-y-6">
                                {/* Hero Section */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5">
                                    <h3 className="font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                                        <Image className="h-4 w-4" />
                                        {language === 'ar' ? 'القسم الرئيسي (Hero)' : 'Hero Section'}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Hero Title (EN)
                                            </label>
                                            <input
                                                type="text"
                                                value={page.heroTitle}
                                                onChange={(e) => updatePage(page.id, 'heroTitle', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                العنوان الرئيسي (AR)
                                            </label>
                                            <input
                                                type="text"
                                                value={page.heroTitleAr}
                                                onChange={(e) => updatePage(page.id, 'heroTitleAr', e.target.value)}
                                                dir="rtl"
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Hero Subtitle (EN)
                                            </label>
                                            <textarea
                                                value={page.heroSubtitle}
                                                onChange={(e) => updatePage(page.id, 'heroSubtitle', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                العنوان الفرعي (AR)
                                            </label>
                                            <textarea
                                                value={page.heroSubtitleAr}
                                                onChange={(e) => updatePage(page.id, 'heroSubtitleAr', e.target.value)}
                                                dir="rtl"
                                                rows={2}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sections */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-semibold text-slate-700">
                                            {language === 'ar' ? 'أقسام الصفحة' : 'Page Sections'}
                                        </h3>
                                        <button
                                            onClick={() => addSection(page.id)}
                                            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Plus className="h-4 w-4" />
                                            {language === 'ar' ? 'إضافة قسم' : 'Add Section'}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {page.sections.map(section => (
                                            <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded capitalize">
                                                            {section.type}
                                                        </span>
                                                        <span className="font-medium text-slate-700">
                                                            {language === 'ar' ? section.titleAr : section.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeSection(page.id, section.id);
                                                            }}
                                                            className="p-1 text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                        {expandedSection === section.id ? (
                                                            <ChevronUp className="h-4 w-4 text-slate-400" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                </button>

                                                {expandedSection === section.id && (
                                                    <div className="p-4 space-y-4">
                                                        {/* Section Type */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                Section Type
                                                            </label>
                                                            <select
                                                                value={section.type}
                                                                onChange={(e) => updateSection(page.id, section.id, 'type', e.target.value)}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                            >
                                                                <option value="text">Text Block</option>
                                                                <option value="benefits">Benefits/Features Grid</option>
                                                                <option value="cards">Cards</option>
                                                                <option value="faq">FAQ</option>
                                                                <option value="list">List</option>
                                                                <option value="cta">Call to Action</option>
                                                            </select>
                                                        </div>

                                                        {/* Section Title */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                    Section Title (EN)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={section.title}
                                                                    onChange={(e) => updateSection(page.id, section.id, 'title', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                    عنوان القسم (AR)
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={section.titleAr}
                                                                    onChange={(e) => updateSection(page.id, section.id, 'titleAr', e.target.value)}
                                                                    dir="rtl"
                                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Section Content (for text type) */}
                                                        {(section.type === 'text' || section.type === 'cta') && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                        Content (EN)
                                                                    </label>
                                                                    <textarea
                                                                        value={section.content}
                                                                        onChange={(e) => updateSection(page.id, section.id, 'content', e.target.value)}
                                                                        rows={4}
                                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                        المحتوى (AR)
                                                                    </label>
                                                                    <textarea
                                                                        value={section.contentAr}
                                                                        onChange={(e) => updateSection(page.id, section.id, 'contentAr', e.target.value)}
                                                                        dir="rtl"
                                                                        rows={4}
                                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Section Items (for benefits, faq, list types) */}
                                                        {(section.type === 'benefits' || section.type === 'faq' || section.type === 'list' || section.type === 'cards') && (
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <label className="text-xs font-medium text-slate-600">
                                                                        {language === 'ar' ? 'العناصر' : 'Items'}
                                                                    </label>
                                                                    <button
                                                                        onClick={() => addSectionItem(page.id, section.id)}
                                                                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                        {language === 'ar' ? 'إضافة' : 'Add'}
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {section.items?.map((item, index) => (
                                                                        <div key={item.id} className="bg-slate-50 rounded-lg p-3">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-xs text-slate-500">
                                                                                    {language === 'ar' ? `عنصر ${index + 1}` : `Item ${index + 1}`}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => removeSectionItem(page.id, section.id, item.id)}
                                                                                    className="text-red-500 hover:text-red-700"
                                                                                >
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.title}
                                                                                    onChange={(e) => updateSectionItem(page.id, section.id, item.id, 'title', e.target.value)}
                                                                                    placeholder="Title (EN)"
                                                                                    className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.titleAr}
                                                                                    onChange={(e) => updateSectionItem(page.id, section.id, item.id, 'titleAr', e.target.value)}
                                                                                    placeholder="العنوان (AR)"
                                                                                    dir="rtl"
                                                                                    className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.description}
                                                                                    onChange={(e) => updateSectionItem(page.id, section.id, item.id, 'description', e.target.value)}
                                                                                    placeholder="Description (EN)"
                                                                                    className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={item.descriptionAr}
                                                                                    onChange={(e) => updateSectionItem(page.id, section.id, item.id, 'descriptionAr', e.target.value)}
                                                                                    placeholder="الوصف (AR)"
                                                                                    dir="rtl"
                                                                                    className="px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
