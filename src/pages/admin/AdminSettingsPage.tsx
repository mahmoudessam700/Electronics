import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Save, Loader2, Globe, Mail, Phone, MapPin, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

export function AdminSettingsPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Electronics Store',
        contactEmail: 'support@electronics.com',
        contactPhone: '+20 123 456 789',
        address: 'Cairo, Egypt',
        logoUrl: '',
        maintenanceMode: false,
        enableReviews: true,
        commissionRate: 10
    });

    useEffect(() => {
        // In a real app, fetch from /api/settings
        // For now, we'll simulate or just leave defaults
        setTimeout(() => setLoading(false), 500);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#4A5568]/30 border-t-[#4A5568] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('admin.settings')}</h1>
                <p className="text-gray-500 mt-1">Configure global store preferences and branding</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Globe className="h-5 w-5 text-[#4A5568]" />
                            General Branding
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Site Name</label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none"
                                value={settings.siteName}
                                onChange={e => setSettings({...settings, siteName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Logo URL</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none"
                                        value={settings.logoUrl}
                                        onChange={e => setSettings({...settings, logoUrl: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Mail className="h-5 w-5 text-[#4A5568]" />
                            Contact Information
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Support Email</label>
                            <input
                                type="email"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none"
                                value={settings.contactEmail}
                                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none"
                                value={settings.contactPhone}
                                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Store Address</label>
                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none min-h-[100px]"
                                value={settings.address}
                                onChange={e => setSettings({...settings, address: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-[#4A5568]" />
                            Platform Rules
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Maintenance Mode</p>
                                <p className="text-sm text-gray-500">Temporarily disable storefront for visitors</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                            <div>
                                <p className="font-medium text-gray-900">Customer Reviews</p>
                                <p className="text-sm text-gray-500">Allow customers to post reviews on products</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({...settings, enableReviews: !settings.enableReviews})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableReviews ? 'bg-emerald-500' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableReviews ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-2 border-t border-gray-100 pt-6">
                            <label className="text-sm font-medium text-gray-700">Default Shop Commission (%)</label>
                            <input
                                type="number"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none max-w-[200px]"
                                value={settings.commissionRate}
                                onChange={e => setSettings({...settings, commissionRate: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-8 h-12 rounded-lg font-semibold flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    );
}
