import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Pencil, Loader2, Search, ShieldCheck, ShieldAlert, Shield, Mail, ExternalLink, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

type ShopStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
type KycStatus = 'UNVERIFIED' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';

interface ShopData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: ShopStatus;
    kycStatus: KycStatus;
    defaultCommissionRate: number;
    ownerId: string | null;
    createdAt: string;
    metrics: {
        memberCount: number;
        ledgerBalance: number;
    };
}

export function AdminShopsPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [shops, setShops] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<ShopData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    const [formData, setFormData] = useState({
        name: '',
        status: 'PENDING' as ShopStatus,
        kycStatus: 'UNVERIFIED' as KycStatus,
        defaultCommissionRate: 0,
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (token) {
            fetchShops();
        }
    }, [token]);

    const fetchShops = async () => {
        try {
            const res = await fetch('/api/shops', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setShops(data);
            } else {
                toast.error(data.error || t('admin.failedToFetchShops'));
            }
        } catch (error) {
            console.error('Failed to fetch shops', error);
            toast.error(t('admin.failedToFetchShops'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (shop: ShopData) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            status: shop.status,
            kycStatus: shop.kycStatus,
            defaultCommissionRate: shop.defaultCommissionRate,
            email: shop.email || '',
            phone: shop.phone || ''
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingShop) return;
        setIsSaving(true);

        try {
            const res = await fetch(`/api/shops?id=${editingShop.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(t('admin.shopUpdatedSuccess'));
                fetchShops();
                setIsDialogOpen(false);
            } else {
                const data = await res.json();
                toast.error(data.error || t('admin.failedToUpdateShop'));
            }
        } catch (error) {
            console.error('Failed to update shop', error);
            toast.error(t('admin.failedToUpdateShop'));
        } finally {
            setIsSaving(false);
        }
    };

    const filteredShops = shops.filter(shop => {
        const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (shop.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || shop.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#4A5568]/30 border-t-[#4A5568] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('admin.loading')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('admin.shops')}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.shopsSubtitle')}</p>
                </div>
                <Button className="bg-[#4A5568] hover:bg-[#2D3748] text-white">
                    <Plus className="h-4 w-4 mr-2" /> {t('admin.addShop')}
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${t('common.isRTL') === 'true' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('admin.searchShops')}
                        className={`${t('common.isRTL') === 'true' ? 'pr-10' : 'pl-10'} bg-white border-gray-200`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                ? 'bg-[#4A5568] text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'ALL' ? t('admin.allFilter') :
                                status === 'ACTIVE' ? t('admin.active') :
                                    status === 'PENDING' ? t('admin.pending') :
                                        t('admin.suspended')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left rtl:text-right py-3 px-4 text-xs font-semibold uppercase text-gray-500">{t('admin.shopColumn')}</th>
                                <th className="text-left rtl:text-right py-3 px-4 text-xs font-semibold uppercase text-gray-500">{t('admin.status')}</th>
                                <th className="text-left rtl:text-right py-3 px-4 text-xs font-semibold uppercase text-gray-500">{t('admin.kycColumn')}</th>
                                <th className="text-left rtl:text-right py-3 px-4 text-xs font-semibold uppercase text-gray-500">{t('admin.commissionColumn')}</th>
                                <th className="text-right rtl:text-left py-3 px-4 text-xs font-semibold uppercase text-gray-500">{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredShops.map((shop) => (
                                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {shop.logo ? (
                                                <img src={shop.logo} className="w-10 h-10 rounded-lg object-cover" alt={shop.name} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                                                    {shop.name[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                                    {shop.name}
                                                    <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer">
                                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                                    </a>
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{shop.email || t('admin.noEmail')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${shop.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                            shop.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                            {shop.status === 'ACTIVE' ? t('admin.active') :
                                                shop.status === 'PENDING' ? t('admin.pending') :
                                                    t('admin.suspended')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1.5 text-xs">
                                            {shop.kycStatus === 'VERIFIED' ? (
                                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                            ) : shop.kycStatus === 'REJECTED' ? (
                                                <ShieldAlert className="h-4 w-4 text-rose-600" />
                                            ) : (
                                                <Shield className="h-4 w-4 text-amber-600" />
                                            )}
                                            <span className="font-medium text-gray-700">
                                                {shop.kycStatus === 'VERIFIED' ? t('admin.verified') :
                                                    shop.kycStatus === 'REJECTED' ? t('admin.rejected') :
                                                        shop.kycStatus === 'SUBMITTED' ? t('admin.submitted') :
                                                            t('admin.unverified')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-semibold text-gray-900">{(shop.defaultCommissionRate * 100).toFixed(1)}%</p>
                                        <p className="text-[10px] text-gray-400">{t('admin.defaultRate')}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-gray-100"
                                                onClick={() => handleOpenEdit(shop)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{t('admin.editShop')}: {editingShop?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="shop-status" className="text-sm font-medium">{t('admin.shopStatus')}</Label>
                            <select
                                id="shop-status"
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ShopStatus })}
                            >
                                <option value="PENDING">{t('admin.pendingApproval')}</option>
                                <option value="ACTIVE">{t('admin.activeLive')}</option>
                                <option value="SUSPENDED">{t('admin.suspendedHidden')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="kyc-status" className="text-sm font-medium">{t('admin.verificationKyc')}</Label>
                            <select
                                id="kyc-status"
                                className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
                                value={formData.kycStatus}
                                onChange={(e) => setFormData({ ...formData, kycStatus: e.target.value as KycStatus })}
                            >
                                <option value="UNVERIFIED">{t('admin.unverified')}</option>
                                <option value="SUBMITTED">{t('admin.submitted')}</option>
                                <option value="VERIFIED">{t('admin.verified')}</option>
                                <option value="REJECTED">{t('admin.rejected')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="commission" className="text-sm font-medium">{t('admin.commissionRateLabel')}</Label>
                            <Input
                                id="commission"
                                type="number"
                                step="0.01"
                                value={formData.defaultCommissionRate}
                                onChange={(e) => setFormData({ ...formData, defaultCommissionRate: parseFloat(e.target.value) })}
                                className="rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-slate-500">
                            <div>
                                <p className="font-bold">{t('admin.contactEmail')}</p>
                                <p>{formData.email || t('admin.na')}</p>
                            </div>
                            <div>
                                <p className="font-bold">{t('admin.contactPhone')}</p>
                                <p>{formData.phone || t('admin.na')}</p>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                {t('admin.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#4A5568] hover:bg-[#2D3748] text-white"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('admin.saveChanges')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
