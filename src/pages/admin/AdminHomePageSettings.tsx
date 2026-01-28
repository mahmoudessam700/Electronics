import { useState, useEffect } from 'react';
import { 
    Layout, 
    Eye, 
    EyeOff, 
    Save, 
    Loader2, 
    LayoutDashboard, 
    RefreshCw,
    Info,
    CheckCircle2,
    AlertCircle,
    Clock,
    Search,
    Plus,
    X,
    Package,
    GripVertical,
    FileText,
    Languages,
    Image,
    Trash2,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
}

interface HeroSlide {
    id: string;
    title: string;
    titleAr?: string;
    subtitle: string;
    subtitleAr?: string;
    ctaText: string;
    ctaTextAr?: string;
    image: string;
    gradient: string;
    navigationTarget: { type: 'category' | 'page'; value: string };
}

interface Section {
    id: string;
    name: string;
    nameAr?: string;
    description: string;
    descriptionAr?: string;
    isEnabled: boolean;
    badgeText?: string;
    badgeTextAr?: string;
    showBadge?: boolean;
    selectedProducts?: string[];
    useManualSelection?: boolean;
    subtitleText?: string;
    subtitleTextAr?: string;
    buttonText?: string;
    buttonTextAr?: string;
}

export function AdminHomePageSettings() {
    const { t, isRTL, formatCurrency } = useLanguage();

    const [sections, setSections] = useState<Section[]>([
        { 
            id: 'deals-of-the-day', 
            name: 'Deals of the Day', 
            nameAr: 'عروض اليوم',
            description: 'Shows products that have an original price higher than their current price.', 
            descriptionAr: 'يعرض المنتجات التي لها سعر أصلي أعلى من سعرها الحالي.',
            isEnabled: true,
            badgeText: 'Ends in 12:34:56',
            badgeTextAr: 'ينتهي في 12:34:56',
            showBadge: true,
            selectedProducts: [],
            useManualSelection: false
        },
        { 
            id: 'inspired-browsing', 
            name: 'Inspired by your browsing history', 
            nameAr: 'مستوحى من سجل التصفح الخاص بك',
            description: 'Shows a carousel of recommended products for the user.', 
            descriptionAr: 'يعرض شريط من المنتجات الموصى بها للمستخدم.',
            isEnabled: true,
            selectedProducts: [],
            useManualSelection: false
        },
        { 
            id: 'trending', 
            name: 'Trending in Electronics', 
            nameAr: 'الأكثر رواجاً في الإلكترونيات',
            description: 'Shows high-value products (over E£50).', 
            descriptionAr: 'يعرض المنتجات عالية القيمة (أكثر من 50 جنيه).',
            isEnabled: true,
            selectedProducts: [],
            useManualSelection: false
        },
        { 
            id: 'signup-banner', 
            name: 'Sign Up Banner', 
            nameAr: 'لافتة التسجيل',
            description: 'The purple gradient banner encouraging users to create an account.', 
            descriptionAr: 'اللافتة المتدرجة التي تشجع المستخدمين على إنشاء حساب.',
            isEnabled: true,
            subtitleText: 'Get exclusive deals, personalized recommendations, and early access to sales',
            subtitleTextAr: 'احصل على عروض حصرية وتوصيات مخصصة ووصول مبكر للتخفيضات',
            buttonText: 'Create your account',
            buttonTextAr: 'أنشئ حسابك'
        },
        { 
            id: 'pc-peripherals', 
            name: 'PC Accessories & Peripherals', 
            nameAr: 'ملحقات وإكسسوارات الكمبيوتر',
            description: 'Shows mice, keyboards, and headphones.', 
            descriptionAr: 'يعرض الماوسات ولوحات المفاتيح وسماعات الرأس.',
            isEnabled: true,
            selectedProducts: [],
            useManualSelection: false
        }
    ]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [expandedSlide, setExpandedSlide] = useState<string | null>(null);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([
        {
            id: '1',
            title: 'New Year Sale',
            titleAr: 'تخفيضات السنة الجديدة',
            subtitle: 'Up to 50% off on premium tech',
            subtitleAr: 'خصم يصل إلى 50% على التقنية المتميزة',
            ctaText: 'Shop Now',
            ctaTextAr: 'تسوق الآن',
            image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?w=1200',
            gradient: 'from-blue-600/20 to-purple-600/20',
            navigationTarget: { type: 'page', value: 'search' }
        },
        {
            id: '2',
            title: 'Latest Laptops',
            titleAr: 'أحدث اللابتوبات',
            subtitle: 'Powerful performance for work and play',
            subtitleAr: 'أداء قوي للعمل واللعب',
            ctaText: 'Explore Laptops',
            ctaTextAr: 'استكشف اللابتوبات',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
            gradient: 'from-gray-600/20 to-blue-600/20',
            navigationTarget: { type: 'category', value: 'Laptops' }
        },
        {
            id: '3',
            title: 'Gaming Accessories',
            titleAr: 'إكسسوارات الألعاب',
            subtitle: 'Upgrade your gaming setup',
            subtitleAr: 'طور معدات الألعاب الخاصة بك',
            ctaText: 'Discover More',
            ctaTextAr: 'اكتشف المزيد',
            image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200',
            gradient: 'from-purple-600/20 to-pink-600/20',
            navigationTarget: { type: 'page', value: 'search' }
        }
    ]);

    useEffect(() => {
        fetchSettings();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setAllProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/settings?type=homepage&t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.sections) {
                    // Merge saved settings with defaults to ensure new fields like badgeText exist
                    setSections(prev => prev.map(defSection => {
                        const saved = data.sections.find((s: any) => s.id === defSection.id);
                        return saved ? { ...defSection, ...saved } : defSection;
                    }));
                }
                if (data && data.heroSlides) {
                    setHeroSlides(data.heroSlides);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (id: string) => {
        const newSections = sections.map(section => 
            section.id === id ? { ...section, isEnabled: !section.isEnabled } : section
        );
        setSections(newSections);
        autoSave(newSections);
    };

    const updateSection = (id: string, field: keyof Section, value: any) => {
        const newSections = sections.map(section => 
            section.id === id ? { ...section, [field]: value } : section
        );
        setSections(newSections);
        // We don't auto-save for every keystroke in text fields
    };

    // Product picker helpers
    const getSelectedProducts = (sectionId: string) => {
        const section = sections.find(s => s.id === sectionId);
        return section?.selectedProducts || [];
    };

    const addProductToSection = (sectionId: string, productId: string) => {
        const newSections = sections.map(section => {
            if (section.id === sectionId) {
                const existing = section.selectedProducts || [];
                if (!existing.includes(productId)) {
                    return { ...section, selectedProducts: [...existing, productId] };
                }
            }
            return section;
        });
        setSections(newSections);
    };

    const removeProductFromSection = (sectionId: string, productId: string) => {
        const newSections = sections.map(section => {
            if (section.id === sectionId) {
                return { 
                    ...section, 
                    selectedProducts: (section.selectedProducts || []).filter(id => id !== productId) 
                };
            }
            return section;
        });
        setSections(newSections);
    };

    const filteredProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    // Hero slide management functions
    const updateHeroSlide = (id: string, field: keyof HeroSlide, value: any) => {
        setHeroSlides(prev => prev.map(slide => 
            slide.id === id ? { ...slide, [field]: value } : slide
        ));
    };

    const updateHeroSlideNavigation = (id: string, type: 'category' | 'page', value: string) => {
        setHeroSlides(prev => prev.map(slide => 
            slide.id === id ? { ...slide, navigationTarget: { type, value } } : slide
        ));
    };

    const addHeroSlide = () => {
        const newSlide: HeroSlide = {
            id: Date.now().toString(),
            title: 'New Slide',
            titleAr: 'شريحة جديدة',
            subtitle: 'Add your subtitle here',
            subtitleAr: 'أضف العنوان الفرعي هنا',
            ctaText: 'Shop Now',
            ctaTextAr: 'تسوق الآن',
            image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?w=1200',
            gradient: 'from-blue-600/20 to-purple-600/20',
            navigationTarget: { type: 'page', value: 'search' }
        };
        setHeroSlides(prev => [...prev, newSlide]);
        setExpandedSlide(newSlide.id);
    };

    const removeHeroSlide = (id: string) => {
        if (heroSlides.length <= 1) {
            toast.error('You must have at least one slide');
            return;
        }
        setHeroSlides(prev => prev.filter(slide => slide.id !== id));
    };

    const moveHeroSlide = (id: string, direction: 'up' | 'down') => {
        const index = heroSlides.findIndex(s => s.id === id);
        if (direction === 'up' && index > 0) {
            const newSlides = [...heroSlides];
            [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
            setHeroSlides(newSlides);
        } else if (direction === 'down' && index < heroSlides.length - 1) {
            const newSlides = [...heroSlides];
            [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
            setHeroSlides(newSlides);
        }
    };

    const autoSave = async (newSections: Section[], newHeroSlides?: HeroSlide[]) => {
        try {
            const res = await fetch('/api/settings?type=homepage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    sections: newSections,
                    heroSlides: newHeroSlides || heroSlides
                })
            });
            if (res.ok) {
                console.log('Auto-saved settings');
            } else {
                toast.error('Failed to auto-save changes');
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
            toast.error('Network error during auto-save');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings?type=homepage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections, heroSlides })
            });

            if (res.ok) {
                toast.success('All settings saved and applied!');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-medium">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-2xl">
                        <Layout className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{t('admin.homeLayoutTitle')}</h1>
                        <p className="text-sm text-slate-500">{t('admin.homeLayout')}</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-11 px-8 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold transition-all shadow-lg active:scale-95"
                >
                    {saving ? <Loader2 className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4 animate-spin`} /> : <Save className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />}
                    {t('admin.saveChanges')}
                </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                <div className="bg-blue-100 p-2 rounded-lg h-fit">
                    <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-blue-900">{t('admin.visibilityControl')}</h3>
                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                        {t('admin.visibilityControlDesc')}
                    </p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">Hero Slider</h2>
                            <p className="text-xs text-slate-500">The main banner carousel at the top of the homepage</p>
                        </div>
                    </div>
                    <Button
                        onClick={addHeroSlide}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                    >
                        <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Add Slide
                    </Button>
                </div>

                <div className="divide-y divide-slate-100">
                    {heroSlides.map((slide, index) => (
                        <div key={slide.id} className="bg-white">
                            {/* Slide Header - Collapsed View */}
                            <button
                                onClick={() => setExpandedSlide(expandedSlide === slide.id ? null : slide.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveHeroSlide(slide.id, 'up'); }}
                                            disabled={index === 0}
                                            className={`p-0.5 rounded ${index === 0 ? 'text-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <ChevronUp className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveHeroSlide(slide.id, 'down'); }}
                                            disabled={index === heroSlides.length - 1}
                                            className={`p-0.5 rounded ${index === heroSlides.length - 1 ? 'text-slate-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <img 
                                        src={slide.image} 
                                        alt={slide.title}
                                        className="w-16 h-10 object-cover rounded-lg border border-slate-200"
                                    />
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-slate-800">{slide.title}</p>
                                        <p className="text-xs text-slate-500">Slide {index + 1}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeHeroSlide(slide.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expandedSlide === slide.id ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {/* Slide Expanded Content */}
                            {expandedSlide === slide.id && (
                                <div className="px-4 pb-4 space-y-4 bg-slate-50/50">
                                    {/* Image URL */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">
                                            <Image className="inline h-3.5 w-3.5 mr-1" />
                                            Image URL
                                        </label>
                                        <input
                                            type="text"
                                            value={slide.image}
                                            onChange={(e) => updateHeroSlide(slide.id, 'image', e.target.value)}
                                            className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Title EN/AR */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Title (EN)</label>
                                            <input
                                                type="text"
                                                value={slide.title}
                                                onChange={(e) => updateHeroSlide(slide.id, 'title', e.target.value)}
                                                dir="ltr"
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="Slide title"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Title (AR)</label>
                                            <input
                                                type="text"
                                                value={slide.titleAr || ''}
                                                onChange={(e) => updateHeroSlide(slide.id, 'titleAr', e.target.value)}
                                                dir="rtl"
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="عنوان الشريحة"
                                            />
                                        </div>
                                    </div>

                                    {/* Subtitle EN/AR */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Subtitle (EN)</label>
                                            <input
                                                type="text"
                                                value={slide.subtitle}
                                                onChange={(e) => updateHeroSlide(slide.id, 'subtitle', e.target.value)}
                                                dir="ltr"
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="Subtitle text"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Subtitle (AR)</label>
                                            <input
                                                type="text"
                                                value={slide.subtitleAr || ''}
                                                onChange={(e) => updateHeroSlide(slide.id, 'subtitleAr', e.target.value)}
                                                dir="rtl"
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="النص الفرعي"
                                            />
                                        </div>
                                    </div>

                                    {/* Button Text EN/AR */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Button Text (EN)</label>
                                            <input
                                                type="text"
                                                value={slide.ctaText}
                                                onChange={(e) => updateHeroSlide(slide.id, 'ctaText', e.target.value)}
                                                dir="ltr"
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="Shop Now"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Button Text (AR)</label>
                                            <input
                                                type="text"
                                                value={slide.ctaTextAr || ''}
                                                onChange={(e) => updateHeroSlide(slide.id, 'ctaTextAr', e.target.value)}
                                                dir="rtl"
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="تسوق الآن"
                                            />
                                        </div>
                                    </div>

                                    {/* Navigation Target */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Navigation Type</label>
                                            <select
                                                value={slide.navigationTarget.type}
                                                onChange={(e) => updateHeroSlideNavigation(slide.id, e.target.value as 'category' | 'page', slide.navigationTarget.value)}
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="page">Page</option>
                                                <option value="category">Category</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">
                                                {slide.navigationTarget.type === 'category' ? 'Category Name' : 'Page Name'}
                                            </label>
                                            <input
                                                type="text"
                                                value={slide.navigationTarget.value}
                                                onChange={(e) => updateHeroSlideNavigation(slide.id, slide.navigationTarget.type, e.target.value)}
                                                className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder={slide.navigationTarget.type === 'category' ? 'Laptops' : 'search'}
                                            />
                                        </div>
                                    </div>

                                    {/* Gradient */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1.5">Gradient Overlay</label>
                                        <select
                                            value={slide.gradient}
                                            onChange={(e) => updateHeroSlide(slide.id, 'gradient', e.target.value)}
                                            className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="from-blue-600/20 to-purple-600/20">Blue to Purple</option>
                                            <option value="from-gray-600/20 to-blue-600/20">Gray to Blue</option>
                                            <option value="from-purple-600/20 to-pink-600/20">Purple to Pink</option>
                                            <option value="from-green-600/20 to-blue-600/20">Green to Blue</option>
                                            <option value="from-orange-600/20 to-red-600/20">Orange to Red</option>
                                            <option value="from-slate-600/20 to-slate-800/20">Dark Slate</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid gap-4">
                {sections.map((section) => (
                    <div 
                        key={section.id}
                        className={`group bg-white rounded-2xl border transition-all duration-300 ${
                            section.isEnabled 
                                ? 'border-slate-200 shadow-sm' 
                                : 'border-slate-100 bg-slate-50/30 opacity-75'
                        }`}
                    >
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2.5 rounded-xl transition-colors ${
                                    section.isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                                }`}>
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    {/* Section Name - English */}
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={section.name}
                                            onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                                            dir="ltr"
                                            className={`block flex-1 font-bold bg-transparent border-none p-0 focus:ring-0 transition-colors ${
                                                section.isEnabled ? 'text-slate-900' : 'text-slate-400'
                                            }`}
                                            placeholder={t('admin.sectionName') + ' (EN)'}
                                        />
                                        <span className="text-[9px] text-slate-400 font-medium">EN</span>
                                    </div>
                                    {/* Section Name - Arabic */}
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={section.nameAr || ''}
                                            onChange={(e) => updateSection(section.id, 'nameAr', e.target.value)}
                                            dir="rtl"
                                            className={`block flex-1 font-bold bg-transparent border-none p-0 focus:ring-0 transition-colors ${
                                                section.isEnabled ? 'text-slate-700' : 'text-slate-400'
                                            }`}
                                            placeholder={t('admin.sectionName') + ' (AR)'}
                                        />
                                        <span className="text-[9px] text-slate-400 font-medium">AR</span>
                                    </div>
                                    {/* Description - English */}
                                    <textarea 
                                        value={section.description}
                                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                                        rows={1}
                                        dir="ltr"
                                        className="block w-full text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 resize-none overflow-hidden"
                                        placeholder={t('admin.sectionDescription') + ' (EN)'}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                    />
                                    {/* Description - Arabic */}
                                    <textarea 
                                        value={section.descriptionAr || ''}
                                        onChange={(e) => updateSection(section.id, 'descriptionAr', e.target.value)}
                                        rows={1}
                                        dir="rtl"
                                        className="block w-full text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 resize-none overflow-hidden"
                                        placeholder={t('admin.sectionDescription') + ' (AR)'}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                    />

                                    {/* Additional Settings for Specific Sections */}
                                    {section.id === 'deals-of-the-day' && (
                                        <div className="flex flex-col gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {/* Countdown Badge Toggle */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{t('admin.countdownBadge')}</span>
                                                </div>
                                                <button
                                                    onClick={() => updateSection(section.id, 'showBadge', !section.showBadge)}
                                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                                                        section.showBadge ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                >
                                                    {section.showBadge ? t('admin.enabled') : t('admin.disabled')}
                                                </button>
                                            </div>
                                            {section.showBadge && (
                                                <div className="space-y-2">
                                                    <input 
                                                        type="text"
                                                        value={section.badgeText || ''}
                                                        onChange={(e) => updateSection(section.id, 'badgeText', e.target.value)}
                                                        dir="ltr"
                                                        className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                        placeholder={t('admin.enterBadgeText') + ' (EN)'}
                                                    />
                                                    <input 
                                                        type="text"
                                                        value={section.badgeTextAr || ''}
                                                        onChange={(e) => updateSection(section.id, 'badgeTextAr', e.target.value)}
                                                        dir="rtl"
                                                        className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                        placeholder={t('admin.enterBadgeText') + ' (AR)'}
                                                    />
                                                </div>
                                            )}

                                            {/* Manual Product Selection Toggle */}
                                            <div className="border-t border-slate-200 pt-3 mt-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-3.5 w-3.5 text-indigo-600" />
                                                        <span className="text-[10px] font-bold text-slate-600 uppercase">{t('admin.manualProductSelection')}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => updateSection(section.id, 'useManualSelection', !section.useManualSelection)}
                                                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                                                            section.useManualSelection ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                                                        }`}
                                                    >
                                                        {section.useManualSelection ? t('admin.manual') : t('admin.automatic')}
                                                    </button>
                                                </div>

            {section.useManualSelection ? (
                                                    <div className="space-y-3">
                                                        <p className="text-[10px] text-slate-500">
                                                            {t('admin.selectProductsToFeature')}
                                                        </p>

                                                        {/* Selected Products List */}
                                                        {getSelectedProducts(section.id).length > 0 && (
                                                            <div className="space-y-2">
                                                                {getSelectedProducts(section.id).map((productId) => {
                                                                    const product = allProducts.find(p => p.id === productId);
                                                                    if (!product) return null;
                                                                    return (
                                                                        <div key={productId} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2">
                                                                            <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                                                                            <img 
                                                                                src={product.image} 
                                                                                alt={product.name}
                                                                                className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                                <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => removeProductFromSection(section.id, productId)}
                                                                                className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-all"
                                                                            >
                                                                                <X className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* Add Product Button / Search */}
                                                        {!showProductPicker ? (
                                                            <button
                                                                onClick={() => setShowProductPicker(true)}
                                                                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                                Add Product
                                                            </button>
                                                        ) : (
                                                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                                <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                                                                    <Search className="h-3.5 w-3.5 text-slate-400" />
                                                                    <input
                                                                        type="text"
                                                                        value={productSearch}
                                                                        onChange={(e) => setProductSearch(e.target.value)}
                                                                        placeholder="Search products..."
                                                                        className="flex-1 text-xs outline-none bg-transparent"
                                                                        autoFocus
                                                                    />
                                                                    <button 
                                                                        onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                                                                        className="text-slate-400 hover:text-slate-600"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto">
                                                                    {filteredProducts.slice(0, 10).map(product => {
                                                                        const isSelected = getSelectedProducts(section.id).includes(product.id);
                                                                        return (
                                                                            <button
                                                                                key={product.id}
                                                                                onClick={() => {
                                                                                    if (!isSelected) {
                                                                                        addProductToSection(section.id, product.id);
                                                                                    }
                                                                                }}
                                                                                disabled={isSelected}
                                                                                className={`w-full flex items-center gap-2 p-2 text-left transition-all ${
                                                                                    isSelected 
                                                                                        ? 'bg-indigo-50 opacity-50 cursor-not-allowed' 
                                                                                        : 'hover:bg-slate-50'
                                                                                }`}
                                                                            >
                                                                                <img 
                                                                                    src={product.image} 
                                                                                    alt={product.name}
                                                                                    className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                                />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                                    <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                                </div>
                                                                                {isSelected && (
                                                                                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    {filteredProducts.length === 0 && (
                                                                        <p className="p-3 text-xs text-slate-400 text-center">No products found</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-slate-500">
                                                        {t('admin.autoShowsDiscounted')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Settings for Inspired by browsing history */}
                                    {section.id === 'inspired-browsing' && (
                                        <div className="flex flex-col gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {/* Manual Product Selection Toggle */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Manual Product Selection</span>
                                                </div>
                                                <button
                                                    onClick={() => updateSection(section.id, 'useManualSelection', !section.useManualSelection)}
                                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                                                        section.useManualSelection ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                >
                                                    {section.useManualSelection ? 'MANUAL' : 'AUTOMATIC'}
                                                </button>
                                            </div>

                                            {section.useManualSelection ? (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-slate-500">
                                                        Select specific products to show as browsing recommendations.
                                                    </p>

                                                    {/* Selected Products List */}
                                                    {getSelectedProducts(section.id).length > 0 && (
                                                        <div className="space-y-2">
                                                            {getSelectedProducts(section.id).map((productId) => {
                                                                const product = allProducts.find(p => p.id === productId);
                                                                if (!product) return null;
                                                                return (
                                                                    <div key={productId} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2">
                                                                        <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                                                                        <img 
                                                                            src={product.image} 
                                                                            alt={product.name}
                                                                            className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                            <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => removeProductFromSection(section.id, productId)}
                                                                            className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-all"
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Add Product Button / Search */}
                                                    {!showProductPicker ? (
                                                        <button
                                                            onClick={() => setShowProductPicker(true)}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Product
                                                        </button>
                                                    ) : (
                                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                            <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                                                                <Search className="h-3.5 w-3.5 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    value={productSearch}
                                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                                    placeholder="Search products..."
                                                                    className="flex-1 text-xs outline-none bg-transparent"
                                                                    autoFocus
                                                                />
                                                                <button 
                                                                    onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                                                                    className="text-slate-400 hover:text-slate-600"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filteredProducts.slice(0, 10).map(product => {
                                                                    const isSelected = getSelectedProducts(section.id).includes(product.id);
                                                                    return (
                                                                        <button
                                                                            key={product.id}
                                                                            onClick={() => {
                                                                                if (!isSelected) {
                                                                                    addProductToSection(section.id, product.id);
                                                                                }
                                                                            }}
                                                                            disabled={isSelected}
                                                                            className={`w-full flex items-center gap-2 p-2 text-left transition-all ${
                                                                                isSelected 
                                                                                    ? 'bg-indigo-50 opacity-50 cursor-not-allowed' 
                                                                                    : 'hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            <img 
                                                                                src={product.image} 
                                                                                alt={product.name}
                                                                                className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                                <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                                {filteredProducts.length === 0 && (
                                                                    <p className="p-3 text-xs text-slate-400 text-center">No products found</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-500">
                                                    Automatically shows the first 10 products as recommendations.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Additional Settings for Trending in Electronics */}
                                    {section.id === 'trending' && (
                                        <div className="flex flex-col gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {/* Manual Product Selection Toggle */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Manual Product Selection</span>
                                                </div>
                                                <button
                                                    onClick={() => updateSection(section.id, 'useManualSelection', !section.useManualSelection)}
                                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                                                        section.useManualSelection ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                >
                                                    {section.useManualSelection ? 'MANUAL' : 'AUTOMATIC'}
                                                </button>
                                            </div>

                                            {section.useManualSelection ? (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-slate-500">
                                                        Select specific products to show as trending.
                                                    </p>

                                                    {/* Selected Products List */}
                                                    {getSelectedProducts(section.id).length > 0 && (
                                                        <div className="space-y-2">
                                                            {getSelectedProducts(section.id).map((productId) => {
                                                                const product = allProducts.find(p => p.id === productId);
                                                                if (!product) return null;
                                                                return (
                                                                    <div key={productId} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2">
                                                                        <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                                                                        <img 
                                                                            src={product.image} 
                                                                            alt={product.name}
                                                                            className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                            <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => removeProductFromSection(section.id, productId)}
                                                                            className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-all"
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Add Product Button / Search */}
                                                    {!showProductPicker ? (
                                                        <button
                                                            onClick={() => setShowProductPicker(true)}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Product
                                                        </button>
                                                    ) : (
                                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                            <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                                                                <Search className="h-3.5 w-3.5 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    value={productSearch}
                                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                                    placeholder="Search products..."
                                                                    className="flex-1 text-xs outline-none bg-transparent"
                                                                    autoFocus
                                                                />
                                                                <button 
                                                                    onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                                                                    className="text-slate-400 hover:text-slate-600"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filteredProducts.slice(0, 10).map(product => {
                                                                    const isSelected = getSelectedProducts(section.id).includes(product.id);
                                                                    return (
                                                                        <button
                                                                            key={product.id}
                                                                            onClick={() => {
                                                                                if (!isSelected) {
                                                                                    addProductToSection(section.id, product.id);
                                                                                }
                                                                            }}
                                                                            disabled={isSelected}
                                                                            className={`w-full flex items-center gap-2 p-2 text-left transition-all ${
                                                                                isSelected 
                                                                                    ? 'bg-indigo-50 opacity-50 cursor-not-allowed' 
                                                                                    : 'hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            <img 
                                                                                src={product.image} 
                                                                                alt={product.name}
                                                                                className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                                <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                                {filteredProducts.length === 0 && (
                                                                    <p className="p-3 text-xs text-slate-400 text-center">No products found</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-500">
                                                    Automatically shows products priced over E£50.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Additional Settings for PC Accessories & Peripherals */}
                                    {section.id === 'pc-peripherals' && (
                                        <div className="flex flex-col gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {/* Manual Product Selection Toggle */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Manual Product Selection</span>
                                                </div>
                                                <button
                                                    onClick={() => updateSection(section.id, 'useManualSelection', !section.useManualSelection)}
                                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                                                        section.useManualSelection ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                >
                                                    {section.useManualSelection ? 'MANUAL' : 'AUTOMATIC'}
                                                </button>
                                            </div>

                                            {section.useManualSelection ? (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] text-slate-500">
                                                        Select specific products to show as PC accessories.
                                                    </p>

                                                    {/* Selected Products List */}
                                                    {getSelectedProducts(section.id).length > 0 && (
                                                        <div className="space-y-2">
                                                            {getSelectedProducts(section.id).map((productId) => {
                                                                const product = allProducts.find(p => p.id === productId);
                                                                if (!product) return null;
                                                                return (
                                                                    <div key={productId} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2">
                                                                        <GripVertical className="h-3.5 w-3.5 text-slate-300" />
                                                                        <img 
                                                                            src={product.image} 
                                                                            alt={product.name}
                                                                            className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                        />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                            <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => removeProductFromSection(section.id, productId)}
                                                                            className="p-1 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-500 transition-all"
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Add Product Button / Search */}
                                                    {!showProductPicker ? (
                                                        <button
                                                            onClick={() => setShowProductPicker(true)}
                                                            className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add Product
                                                        </button>
                                                    ) : (
                                                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                            <div className="p-2 border-b border-slate-100 flex items-center gap-2">
                                                                <Search className="h-3.5 w-3.5 text-slate-400" />
                                                                <input
                                                                    type="text"
                                                                    value={productSearch}
                                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                                    placeholder="Search products..."
                                                                    className="flex-1 text-xs outline-none bg-transparent"
                                                                    autoFocus
                                                                />
                                                                <button 
                                                                    onClick={() => { setShowProductPicker(false); setProductSearch(''); }}
                                                                    className="text-slate-400 hover:text-slate-600"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto">
                                                                {filteredProducts.slice(0, 10).map(product => {
                                                                    const isSelected = getSelectedProducts(section.id).includes(product.id);
                                                                    return (
                                                                        <button
                                                                            key={product.id}
                                                                            onClick={() => {
                                                                                if (!isSelected) {
                                                                                    addProductToSection(section.id, product.id);
                                                                                }
                                                                            }}
                                                                            disabled={isSelected}
                                                                            className={`w-full flex items-center gap-2 p-2 text-left transition-all ${
                                                                                isSelected 
                                                                                    ? 'bg-indigo-50 opacity-50 cursor-not-allowed' 
                                                                                    : 'hover:bg-slate-50'
                                                                            }`}
                                                                        >
                                                                            <img 
                                                                                src={product.image} 
                                                                                alt={product.name}
                                                                                className="w-8 h-8 object-contain rounded bg-slate-100"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-[11px] font-medium text-slate-800 truncate">{product.name}</p>
                                                                                <p className="text-[10px] text-slate-500">E£{product.price.toLocaleString()}</p>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                                {filteredProducts.length === 0 && (
                                                                    <p className="p-3 text-xs text-slate-400 text-center">No products found</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-slate-500">
                                                    Automatically shows products with category containing mouse, keyboard, or headphone.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Additional Settings for Sign Up Banner */}
                                    {section.id === 'signup-banner' && (
                                        <div className="flex flex-col gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {/* Subtitle Text - English */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Subtitle Text (EN)</span>
                                                </div>
                                                <textarea 
                                                    value={section.subtitleText || ''}
                                                    onChange={(e) => updateSection(section.id, 'subtitleText', e.target.value)}
                                                    rows={2}
                                                    dir="ltr"
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                                    placeholder="Enter subtitle text (English)"
                                                />
                                            </div>

                                            {/* Subtitle Text - Arabic */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Languages className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Subtitle Text (AR)</span>
                                                </div>
                                                <textarea 
                                                    value={section.subtitleTextAr || ''}
                                                    onChange={(e) => updateSection(section.id, 'subtitleTextAr', e.target.value)}
                                                    rows={2}
                                                    dir="rtl"
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                                    placeholder="أدخل النص الفرعي (عربي)"
                                                />
                                            </div>

                                            {/* Button Text - English */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Package className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Button Text (EN)</span>
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={section.buttonText || ''}
                                                    onChange={(e) => updateSection(section.id, 'buttonText', e.target.value)}
                                                    dir="ltr"
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                    placeholder="Enter button text (English)"
                                                />
                                            </div>

                                            {/* Button Text - Arabic */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Languages className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Button Text (AR)</span>
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={section.buttonTextAr || ''}
                                                    onChange={(e) => updateSection(section.id, 'buttonTextAr', e.target.value)}
                                                    dir="rtl"
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                    placeholder="أدخل نص الزر (عربي)"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => toggleSection(section.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    section.isEnabled
                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                            >
                                {section.isEnabled ? (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        {t('admin.visible')}
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="h-4 w-4" />
                                        {t('admin.hidden')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Status */}
            <div className="flex items-center justify-center gap-6 pt-4 text-slate-400">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">{t('admin.autoSyncingReady')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">{t('admin.realTimeUpdates')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-300" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">{t('admin.versioning')}: v2.0</span>
                </div>
            </div>
        </div>
    );
}
