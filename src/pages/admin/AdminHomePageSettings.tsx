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
    FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
}

interface Section {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    badgeText?: string;
    showBadge?: boolean;
    selectedProducts?: string[];
    useManualSelection?: boolean;
    subtitleText?: string;
    buttonText?: string;
}

export function AdminHomePageSettings() {
    const [sections, setSections] = useState<Section[]>([
        { 
            id: 'deals-of-the-day', 
            name: 'Deals of the Day', 
            description: 'Shows products that have an original price higher than their current price.', 
            isEnabled: true,
            badgeText: 'Ends in 12:34:56',
            showBadge: true,
            selectedProducts: [],
            useManualSelection: false
        },
        { 
            id: 'inspired-browsing', 
            name: 'Inspired by your browsing history', 
            description: 'Shows a carousel of recommended products for the user.', 
            isEnabled: true,
            selectedProducts: [],
            useManualSelection: false
        },
        { 
            id: 'trending', 
            name: 'Trending in Electronics', 
            description: 'Shows high-value products (over E£50).', 
            isEnabled: true,
            selectedProducts: [],
            useManualSelection: false
        },
        { 
            id: 'signup-banner', 
            name: 'Sign Up Banner', 
            description: 'The purple gradient banner encouraging users to create an account.', 
            isEnabled: true,
            subtitleText: 'Get exclusive deals, personalized recommendations, and early access to sales',
            buttonText: 'Create your account'
        },
        { 
            id: 'pc-peripherals', 
            name: 'PC Accessories & Peripherals', 
            description: 'Shows mice, keyboards, and headphones.', 
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

    const autoSave = async (newSections: Section[]) => {
        try {
            const res = await fetch('/api/settings?type=homepage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections: newSections })
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
                body: JSON.stringify({ sections })
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
                <p className="text-slate-500 font-medium">Loading settings...</p>
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
                        <h1 className="text-2xl font-bold text-slate-900">Home Page Content</h1>
                        <p className="text-sm text-slate-500">Control which sections are visible on the storefront</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-11 px-8 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold transition-all shadow-lg active:scale-95"
                >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                <div className="bg-blue-100 p-2 rounded-lg h-fit">
                    <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-blue-900">Visibility Control</h3>
                    <p className="text-xs text-blue-700 leading-relaxed mt-1">
                        Use the toggles below to hide or show specific sections on your main page. This is useful for clearing space during specific sales or removing sections if they have no products yet.
                    </p>
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
                                    <input 
                                        type="text"
                                        value={section.name}
                                        onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                                        className={`block w-full font-bold bg-transparent border-none p-0 focus:ring-0 transition-colors ${
                                            section.isEnabled ? 'text-slate-900' : 'text-slate-400'
                                        }`}
                                        placeholder="Section Name"
                                    />
                                    <textarea 
                                        value={section.description}
                                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                                        rows={1}
                                        className="block w-full text-xs text-slate-500 bg-transparent border-none p-0 focus:ring-0 resize-none overflow-hidden"
                                        placeholder="Section Description"
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
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Countdown Badge</span>
                                                </div>
                                                <button
                                                    onClick={() => updateSection(section.id, 'showBadge', !section.showBadge)}
                                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                                                        section.showBadge ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-500'
                                                    }`}
                                                >
                                                    {section.showBadge ? 'ENABLED' : 'DISABLED'}
                                                </button>
                                            </div>
                                            {section.showBadge && (
                                                <input 
                                                    type="text"
                                                    value={section.badgeText || ''}
                                                    onChange={(e) => updateSection(section.id, 'badgeText', e.target.value)}
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                    placeholder="Enter badge text (e.g. Ends in 12:34:56)"
                                                />
                                            )}

                                            {/* Manual Product Selection Toggle */}
                                            <div className="border-t border-slate-200 pt-3 mt-1">
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
                                                            Select specific products to feature in this section.
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
                                                        Automatically shows all products with a discount (original price {'>'} current price).
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
                                            {/* Subtitle Text */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Subtitle Text</span>
                                                </div>
                                                <textarea 
                                                    value={section.subtitleText || ''}
                                                    onChange={(e) => updateSection(section.id, 'subtitleText', e.target.value)}
                                                    rows={2}
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                                                    placeholder="Enter subtitle text"
                                                />
                                            </div>

                                            {/* Button Text */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Package className="h-3.5 w-3.5 text-indigo-600" />
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">Button Text</span>
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={section.buttonText || ''}
                                                    onChange={(e) => updateSection(section.id, 'buttonText', e.target.value)}
                                                    className="w-full text-xs bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                                    placeholder="Enter button text"
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
                                        VISIBLE
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="h-4 w-4" />
                                        HIDDEN
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
                    <span className="text-[10px] uppercase font-bold tracking-wider">Auto-Syncing Ready</span>
                </div>
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-300" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Versioning: v2.0</span>
                </div>
            </div>
        </div>
    );
}
