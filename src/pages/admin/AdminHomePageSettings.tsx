import { useState, useEffect } from 'react';
import { 
    Layout, 
    Eye, 
    EyeOff, 
    Save, 
    Loader2, 
    LayoutDashboard, 
    Settings, 
    RefreshCw,
    Info,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

interface Section {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
    badgeText?: string;
    showBadge?: boolean;
}

export function AdminHomePageSettings() {
    const [sections, setSections] = useState<Section[]>([
        { 
            id: 'deals-of-the-day', 
            name: 'Deals of the Day', 
            description: 'Shows products that have an original price higher than their current price.', 
            isEnabled: true,
            badgeText: 'Ends in 12:34:56',
            showBadge: true
        },
        { 
            id: 'inspired-browsing', 
            name: 'Inspired by your browsing history', 
            description: 'Shows a carousel of recommended products for the user.', 
            isEnabled: true 
        },
        { 
            id: 'trending', 
            name: 'Trending in Electronics', 
            description: 'Shows high-value products (over E£1000).', 
            isEnabled: true 
        },
        { 
            id: 'signup-banner', 
            name: 'Sign Up Banner', 
            description: 'The purple gradient banner encouraging users to create an account.', 
            isEnabled: true 
        },
        { 
            id: 'pc-peripherals', 
            name: 'PC Accessories & Peripherals', 
            description: 'Shows mice, keyboards, and headphones.', 
            isEnabled: true 
        }
    ]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

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
        setSections(prev => prev.map(section => 
            section.id === id ? { ...section, isEnabled: !section.isEnabled } : section
        ));
    };

    const updateSection = (id: string, field: keyof Section, value: any) => {
        setSections(prev => prev.map(section => 
            section.id === id ? { ...section, [field]: value } : section
        ));
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
                toast.success('Home page settings updated successfully!');
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
