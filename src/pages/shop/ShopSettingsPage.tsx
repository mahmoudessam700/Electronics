import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Save, Loader2, Store, Image as ImageIcon, MessageSquare, Info, MapPin, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

export function ShopSettingsPage() {
    const { user, token, activeShopId } = useAuth();
    const { t, isRTL } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shopData, setShopData] = useState({
        id: '',
        name: '',
        slug: '',
        description: '',
        logo: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (token && activeShopId) {
            fetchShopData();
        }
    }, [token, activeShopId]);

    const fetchShopData = async () => {
        try {
            const res = await fetch(`/api/shops?id=${activeShopId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setShopData({
                    id: data.id,
                    name: data.name,
                    slug: data.slug || '',
                    description: data.description || '',
                    logo: data.logo || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch shop settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/shops?id=${activeShopId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(shopData)
            });

            if (res.ok) {
                toast.success(isRTL ? 'تم تحديث ملف المتجر' : 'Shop profile updated');
            } else {
                const err = await res.json();
                toast.error(err.error || (isRTL ? 'فشل التحديث' : 'Failed to update shop profile'));
            }
        } catch (error) {
            toast.error(isRTL ? 'حدث خطأ' : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isRTL ? 'إعدادات المتجر' : 'Shop Settings'}</h1>
                    <p className="text-gray-500">{isRTL ? 'إدارة ملف البائع ومعلومات المتجر العامة' : 'Manage your vendor profile and public shop information'}</p>
                </div>
                <div className="flex gap-2">
                    <a 
                        href={`/shop/${shopData.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {isRTL ? 'زيارة المتجر' : 'Visit Shop'}
                    </a>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                    {isRTL 
                        ? 'قد تتطلب التغييرات في اسم المتجر موافقة إدارية قبل ظهورها مباشرة على المنصة.' 
                        : 'Changes to your shop name may require administrative approval before appearing live on the platform.'
                    }
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-8">
                    {/* Visual Profile Section */}
                    <div className="flex flex-col md:flex-row gap-8 pb-6 border-b border-gray-100">
                        <div className="shrink-0 flex flex-col items-center">
                            <label className="block text-sm font-medium text-gray-700 mb-3">{isRTL ? 'شعار المتجر' : 'Shop Logo'}</label>
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {shopData.logo ? (
                                        <img src={shopData.logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="mt-4 w-full">
                                    <input 
                                        type="text" 
                                        className="text-[11px] w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-slate-400 outline-none text-slate-600 placeholder:text-gray-300"
                                        placeholder={isRTL ? 'أدخل رابط الصورة...' : 'Paste image URL...'}
                                        value={shopData.logo}
                                        onChange={e => setShopData({...shopData, logo: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <Store className="h-4 w-4 text-gray-400" />
                                        {isRTL ? 'اسم المتجر' : 'Shop Name'}
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                                        value={shopData.name}
                                        onChange={e => setShopData({...shopData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                        <ExternalLink className="h-4 w-4 text-gray-400" />
                                        {isRTL ? 'الرابط التعريفي (Slug)' : 'Shop Slug'}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/shop/</span>
                                        <input
                                            type="text"
                                            className="w-full h-11 pl-16 pr-4 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            value={shopData.slug}
                                            disabled
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">{isRTL ? 'البريد الإلكتروني للعمل' : 'Business Email'}</label>
                                    <input
                                        type="email"
                                        className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                                        placeholder="contact@yourshop.com"
                                        value={shopData.email}
                                        onChange={e => setShopData({...shopData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">{isRTL ? 'هاتف الدعم' : 'Support Phone'}</label>
                                    <input
                                        type="text"
                                        className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                                        placeholder="+20 123 456 7890"
                                        value={shopData.phone}
                                        onChange={e => setShopData({...shopData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content & Location Section */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 block">{isRTL ? 'وصف المتجر' : 'Shop Description'}</label>
                            <textarea
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none min-h-[140px] resize-none transition-all"
                                placeholder={isRTL ? 'أخبر العملاء عن علامتك التجارية...' : 'Tell customers about your brand...'}
                                value={shopData.description}
                                onChange={e => setShopData({...shopData, description: e.target.value})}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {isRTL ? 'عنوان العمل' : 'Business Address'}
                            </label>
                            <input
                                type="text"
                                className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                                placeholder={isRTL ? 'الشارع، المدينة، الدولة' : 'Street, City, Country'}
                                value={shopData.address}
                                onChange={e => setShopData({...shopData, address: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fetchShopData()}
                        className="px-6 h-12 rounded-lg font-medium"
                    >
                        {isRTL ? 'إلغاء' : 'Discard'}
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-lg font-semibold flex items-center gap-2 shadow-sm"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
