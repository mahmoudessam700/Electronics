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
    AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

interface Section {
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
}

export function AdminHomePageSettings() {
    const [sections, setSections] = useState<Section[]>([
        { 
            id: 'deals-of-the-day', 
            name: 'Deals of the Day', 
            description: 'Shows products that have an original price higher than their current price.', 
            isEnabled: true 
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
            const res = await fetch('/api/settings?type=homepage');
            if (res.ok) {
                const data = await res.json();
                if (data && data.sections) {
                    setSections(data.sections);
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // We use default state if fetch fails
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (id: string) => {
        setSections(prev => prev.map(section => 
            section.id === id ? { ...section, isEnabled: !section.isEnabled } : section
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
                                <div>
                                    <h3 className={`font-bold transition-colors ${
                                        section.isEnabled ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                        {section.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                                        {section.description}
                                    </p>
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
