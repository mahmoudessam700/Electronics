import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Pencil, Loader2, Search, ShieldCheck, ShieldAlert, Shield, Mail, ExternalLink, Plus, Camera, Upload, X, UserPlus } from 'lucide-react';
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

interface UserOption {
    id: string;
    name: string;
    email: string;
}

export function AdminShopsPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [shops, setShops] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<ShopData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isUploading, setIsUploading] = useState(false);
    const [isAddUploading, setIsAddUploading] = useState(false);
    const [users, setUsers] = useState<UserOption[]>([]);
    const [createNewOwner, setCreateNewOwner] = useState(false);
    const [newOwnerData, setNewOwnerData] = useState({ name: '', email: '', password: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const addFileInputRef = useRef<HTMLInputElement>(null);
    const addCameraInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        status: 'PENDING' as ShopStatus,
        kycStatus: 'UNVERIFIED' as KycStatus,
        defaultCommissionRate: 0,
        email: '',
        phone: '',
        logo: '' as string | null,
        ownerId: '' as string,
    });

    const [addFormData, setAddFormData] = useState({
        name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        status: 'ACTIVE' as ShopStatus,
        kycStatus: 'UNVERIFIED' as KycStatus,
        defaultCommissionRate: 0.1,
        logo: '' as string | null,
        ownerId: '' as string,
    });

    useEffect(() => {
        if (token) {
            fetchShops();
            fetchUsers();
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

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
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
            phone: shop.phone || '',
            logo: shop.logo || '',
            ownerId: shop.ownerId || '',
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
                body: JSON.stringify({
                    ...formData,
                    ownerId: formData.ownerId || null,
                }),
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

    // Upload image helper
    const uploadImage = async (file: File): Promise<string | null> => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            if (data.success && data.files?.[0]?.url) return data.files[0].url;
        } catch (err) {
            console.error('Image upload failed', err);
            toast.error('Image upload failed');
        }
        return null;
    };

    const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const url = await uploadImage(file);
        if (url) setFormData(prev => ({ ...prev, logo: url }));
        setIsUploading(false);
        e.target.value = '';
    };

    const handleAddImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsAddUploading(true);
        const url = await uploadImage(file);
        if (url) setAddFormData(prev => ({ ...prev, logo: url }));
        setIsAddUploading(false);
        e.target.value = '';
    };

    const handleOpenAdd = () => {
        setAddFormData({
            name: '', description: '', email: '', phone: '', address: '',
            status: 'ACTIVE', kycStatus: 'UNVERIFIED', defaultCommissionRate: 0.1, logo: null, ownerId: '',
        });
        setCreateNewOwner(false);
        setNewOwnerData({ name: '', email: '', password: '' });
        setIsAddDialogOpen(true);
    };

    // Create a new user and return the user ID
    const createOwnerUser = async (): Promise<string | null> => {
        if (!newOwnerData.name.trim() || !newOwnerData.email.trim() || !newOwnerData.password.trim()) {
            toast.error('Owner name, email and password are required');
            return null;
        }
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newOwnerData.name.trim(),
                    email: newOwnerData.email.trim(),
                    password: newOwnerData.password.trim(),
                    role: 'SHOP_OWNER',
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || 'Failed to create owner account');
                return null;
            }
            const data = await res.json();
            // Refresh users list
            fetchUsers();
            return data.user?.id || data.id || null;
        } catch {
            toast.error('Failed to create owner account');
            return null;
        }
    };

    const handleAddShop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addFormData.name.trim()) {
            toast.error('Shop name is required');
            return;
        }
        setIsSaving(true);

        let ownerId = addFormData.ownerId || null;

        // If creating new owner, create user first
        if (createNewOwner) {
            const newUserId = await createOwnerUser();
            if (!newUserId) {
                setIsSaving(false);
                return;
            }
            ownerId = newUserId;
        }

        try {
            const res = await fetch('/api/shops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: addFormData.name.trim(),
                    description: addFormData.description.trim() || null,
                    email: addFormData.email.trim() || null,
                    phone: addFormData.phone.trim() || null,
                    address: addFormData.address.trim() || null,
                    status: addFormData.status,
                    kycStatus: addFormData.kycStatus,
                    defaultCommissionRate: addFormData.defaultCommissionRate,
                    logo: addFormData.logo || null,
                    ownerId,
                }),
            });

            if (res.ok) {
                toast.success(t('admin.shopCreatedSuccess') || 'Shop created successfully');
                if (createNewOwner && newOwnerData.email) {
                    toast.success(`Owner credentials: ${newOwnerData.email} / ${newOwnerData.password}`, { duration: 10000 });
                }
                fetchShops();
                setIsAddDialogOpen(false);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create shop');
            }
        } catch (error) {
            console.error('Failed to create shop', error);
            toast.error('Failed to create shop');
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

    const getOwnerName = (ownerId: string | null) => {
        if (!ownerId) return null;
        const user = users.find(u => u.id === ownerId);
        return user ? `${user.name} (${user.email})` : ownerId;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#4A5568]/30 border-t-[#4A5568] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('admin.loading')}</span>
            </div>
        );
    }

    // Reusable image upload widget
    const ImageUploadWidget = ({ imageUrl, isUploadingState, onFileUpload, onRemove, fileRef, camRef }: {
        imageUrl: string | null; isUploadingState: boolean;
        onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void;
        fileRef: React.RefObject<HTMLInputElement>; camRef: React.RefObject<HTMLInputElement>;
    }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium">{t('admin.shopLogo') || 'Shop Logo'}</Label>
            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {isUploadingState ? (
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : imageUrl ? (
                        <>
                            <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                            <button type="button" onClick={onRemove} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">
                                <X className="h-3 w-3" />
                            </button>
                        </>
                    ) : (
                        <Upload className="h-6 w-6 text-gray-300" />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => fileRef.current?.click()} disabled={isUploadingState}>
                        <Upload className="h-3 w-3 mr-1" /> {t('admin.uploadImage') || 'Upload Image'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => camRef.current?.click()} disabled={isUploadingState}>
                        <Camera className="h-3 w-3 mr-1" /> {t('admin.takePhoto') || 'Take Photo'}
                    </Button>
                </div>
                <input type="file" accept="image/*" ref={fileRef} onChange={onFileUpload} className="hidden" />
                <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={onFileUpload} className="hidden" />
            </div>
        </div>
    );

    // Owner selector widget
    const OwnerSelector = ({ value, onChange, showCreate, onToggleCreate }: {
        value: string; onChange: (v: string) => void; showCreate: boolean; onToggleCreate: (v: boolean) => void;
    }) => (
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-blue-600" />
                        {t('admin.shopOwner') || 'Shop Owner'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{t('admin.shopOwnerDesc') || 'The user who will manage this shop'}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button type="button" onClick={() => onToggleCreate(false)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!showCreate ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    {t('admin.selectExisting') || 'Select Existing User'}
                </button>
                <button type="button" onClick={() => onToggleCreate(true)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${showCreate ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    {t('admin.createNewOwner') || 'Create New Owner'}
                </button>
            </div>

            {!showCreate ? (
                <select
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm bg-white"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">{t('admin.noOwnerAssigned') || '-- No owner assigned --'}</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                    ))}
                </select>
            ) : (
                <div className="space-y-2">
                    <Input
                        placeholder={t('admin.ownerName') || 'Owner full name'}
                        value={newOwnerData.name}
                        onChange={e => setNewOwnerData(p => ({ ...p, name: e.target.value }))}
                    />
                    <Input
                        type="email"
                        placeholder={t('admin.ownerEmail') || 'Owner email (login username)'}
                        value={newOwnerData.email}
                        onChange={e => setNewOwnerData(p => ({ ...p, email: e.target.value }))}
                    />
                    <Input
                        type="text"
                        placeholder={t('admin.ownerPassword') || 'Password'}
                        value={newOwnerData.password}
                        onChange={e => setNewOwnerData(p => ({ ...p, password: e.target.value }))}
                    />
                    <p className="text-[10px] text-blue-600 font-medium">
                        ⓘ {t('admin.ownerCredentialsNote') || 'These credentials will be used by the shop owner to log in and manage their shop at /shop'}
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('admin.shops')}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.shopsSubtitle')}</p>
                </div>
                <Button className="bg-[#4A5568] hover:bg-[#2D3748] text-white" onClick={handleOpenAdd}>
                    <Plus className="h-4 w-4 mr-2" /> {t('admin.addShop')}
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${t('common.isRTL') === 'true' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input placeholder={t('admin.searchShops')} className={`${t('common.isRTL') === 'true' ? 'pr-10' : 'pl-10'} bg-white border-gray-200`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'].map((status) => (
                        <button key={status} onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status ? 'bg-[#4A5568] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {status === 'ALL' ? t('admin.allFilter') : status === 'ACTIVE' ? t('admin.active') : status === 'PENDING' ? t('admin.pending') : t('admin.suspended')}
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
                                <th className="text-left rtl:text-right py-3 px-4 text-xs font-semibold uppercase text-gray-500">{t('admin.shopOwner') || 'Owner'}</th>
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
                                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{shop.name[0]}</div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                                    {shop.name}
                                                    <a href={`/shop/${shop.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3 text-slate-400" /></a>
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{shop.email || t('admin.noEmail')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${shop.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : shop.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {shop.status === 'ACTIVE' ? t('admin.active') : shop.status === 'PENDING' ? t('admin.pending') : t('admin.suspended')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {shop.ownerId ? (
                                            <span className="text-sm text-gray-700">{getOwnerName(shop.ownerId)}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">{t('admin.noOwner') || 'No owner'}</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-sm font-semibold text-gray-900">{(shop.defaultCommissionRate * 100).toFixed(1)}%</p>
                                        <p className="text-[10px] text-gray-400">{t('admin.defaultRate')}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100" onClick={() => handleOpenEdit(shop)}>
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

            {/* Edit Shop Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{t('admin.editShop')}: {editingShop?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <ImageUploadWidget imageUrl={formData.logo} isUploadingState={isUploading} onFileUpload={handleEditImageUpload}
                            onRemove={() => setFormData(p => ({ ...p, logo: null }))} fileRef={fileInputRef as React.RefObject<HTMLInputElement>} camRef={cameraInputRef as React.RefObject<HTMLInputElement>} />

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.shopName') || 'Shop Name'}</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="rounded-lg" />
                        </div>

                        {/* Owner selector for edit */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.shopOwner') || 'Shop Owner'}</Label>
                            <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
                                value={formData.ownerId} onChange={e => setFormData({ ...formData, ownerId: e.target.value })}>
                                <option value="">{t('admin.noOwnerAssigned') || '-- No owner --'}</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.shopStatus')}</Label>
                            <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as ShopStatus })}>
                                <option value="PENDING">{t('admin.pendingApproval')}</option>
                                <option value="ACTIVE">{t('admin.activeLive')}</option>
                                <option value="SUSPENDED">{t('admin.suspendedHidden')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.verificationKyc')}</Label>
                            <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" value={formData.kycStatus} onChange={e => setFormData({ ...formData, kycStatus: e.target.value as KycStatus })}>
                                <option value="UNVERIFIED">{t('admin.unverified')}</option>
                                <option value="SUBMITTED">{t('admin.submitted')}</option>
                                <option value="VERIFIED">{t('admin.verified')}</option>
                                <option value="REJECTED">{t('admin.rejected')}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.commissionRateLabel')}</Label>
                            <Input type="number" step="0.01" value={formData.defaultCommissionRate} onChange={e => setFormData({ ...formData, defaultCommissionRate: parseFloat(e.target.value) })} className="rounded-lg" />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.cancel')}</Button>
                            <Button type="submit" disabled={isSaving} className="bg-[#4A5568] hover:bg-[#2D3748] text-white">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('admin.saveChanges')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Shop Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{t('admin.addShop')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddShop} className="space-y-4 py-4">
                        <ImageUploadWidget imageUrl={addFormData.logo} isUploadingState={isAddUploading} onFileUpload={handleAddImageUpload}
                            onRemove={() => setAddFormData(p => ({ ...p, logo: null }))} fileRef={addFileInputRef as React.RefObject<HTMLInputElement>} camRef={addCameraInputRef as React.RefObject<HTMLInputElement>} />

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.shopName') || 'Shop Name'} <span className="text-red-500">*</span></Label>
                            <Input value={addFormData.name} onChange={e => setAddFormData({ ...addFormData, name: e.target.value })} placeholder="Enter shop name" className="rounded-lg" required />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.description') || 'Description'}</Label>
                            <textarea value={addFormData.description} onChange={e => setAddFormData({ ...addFormData, description: e.target.value })} placeholder="Describe the shop..." rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-[#4A5568]/20 focus:border-[#4A5568]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('admin.contactEmail')}</Label>
                                <Input type="email" value={addFormData.email} onChange={e => setAddFormData({ ...addFormData, email: e.target.value })} placeholder="shop@example.com" className="rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('admin.contactPhone')}</Label>
                                <Input type="tel" value={addFormData.phone} onChange={e => setAddFormData({ ...addFormData, phone: e.target.value })} placeholder="+20 1xx xxxx xxx" className="rounded-lg" />
                            </div>
                        </div>

                        {/* Owner Assignment Section */}
                        <OwnerSelector value={addFormData.ownerId} onChange={v => setAddFormData({ ...addFormData, ownerId: v })} showCreate={createNewOwner} onToggleCreate={setCreateNewOwner} />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('admin.shopStatus')}</Label>
                                <select className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm" value={addFormData.status} onChange={e => setAddFormData({ ...addFormData, status: e.target.value as ShopStatus })}>
                                    <option value="PENDING">{t('admin.pendingApproval')}</option>
                                    <option value="ACTIVE">{t('admin.activeLive')}</option>
                                    <option value="SUSPENDED">{t('admin.suspendedHidden')}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('admin.commissionRateLabel')}</Label>
                                <Input type="number" step="0.01" min="0" max="1" value={addFormData.defaultCommissionRate} onChange={e => setAddFormData({ ...addFormData, defaultCommissionRate: parseFloat(e.target.value) || 0 })} className="rounded-lg" />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t('admin.cancel')}</Button>
                            <Button type="submit" disabled={isSaving || isAddUploading} className="bg-[#4A5568] hover:bg-[#2D3748] text-white">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('admin.addShop')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
