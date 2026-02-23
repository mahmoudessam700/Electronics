import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Pencil, Trash2, Loader2, User, MapPin, Search, Users, UserCheck, Crown, Mail, Phone, Plus, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';

type RoleOption = 'ADMIN' | 'CUSTOMER' | 'SHOP_OWNER' | 'SHOP_STAFF';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    address: string | null;
    role: RoleOption;
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
}

export function AdminUsersPage() {
    const { token } = useAuth();
    const { t } = useLanguage();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    // Form state for editing
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        role: 'CUSTOMER' as RoleOption
    });

    // Form state for creating
    const [createFormData, setCreateFormData] = useState({
        email: '',
        name: '',
        phone: '',
        address: '',
        role: 'CUSTOMER' as RoleOption,
        password: '',
        sendInvite: true,
        shopName: '',
        shopDescription: ''
    });

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                toast.error(data.error || t('admin.failedToFetchUsers'));
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error(t('admin.failedToFetchUsers'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user: UserData) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            role: user.role
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSaving(true);

        try {
            const res = await fetch(`/api/users?id=${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(t('admin.userUpdatedSuccess'));
                fetchUsers();
                setIsDialogOpen(false);
            } else {
                const data = await res.json();
                toast.error(data.error || t('admin.failedToUpdateUser'));
            }
        } catch (error) {
            console.error('Failed to update user', error);
            toast.error(t('admin.failedToUpdateUser'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm(t('admin.confirmDeleteUser'))) return;

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success(t('admin.userDeleted'));
                setUsers(users.filter(u => u.id !== userId));
            } else {
                toast.error(t('admin.failedToDeleteUser'));
            }
        } catch (error) {
            console.error('Failed to delete user', error);
            toast.error(t('admin.failedToDeleteUser'));
        }
    };

    const handleOpenCreateDialog = () => {
        setCreateFormData({
            email: '',
            name: '',
            phone: '',
            address: '',
            role: 'CUSTOMER',
            password: '',
            sendInvite: true,
            shopName: '',
            shopDescription: ''
        });
        setIsCreateDialogOpen(true);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createFormData.email || !createFormData.name) {
            toast.error(t('admin.emailNameRequired'));
            return;
        }
        if (!createFormData.sendInvite && !createFormData.password) {
            toast.error(t('admin.passwordRequired'));
            return;
        }
        if (createFormData.role === 'SHOP_OWNER' && !createFormData.shopName) {
            toast.error(t('admin.shopNameRequired'));
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(createFormData),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(createFormData.sendInvite ? t('admin.userCreatedInviteSent') : t('admin.userCreatedSuccess'));
                fetchUsers();
                setIsCreateDialogOpen(false);
            } else {
                toast.error(data.error || t('admin.failedToCreateUser'));
            }
        } catch (error) {
            console.error('Failed to create user', error);
            toast.error(t('admin.failedToCreateUser'));
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        customers: users.filter(u => u.role === 'CUSTOMER').length,
        shopOwners: users.filter(u => u.role === 'SHOP_OWNER').length,
        shopStaff: users.filter(u => u.role === 'SHOP_STAFF').length,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FFD814]/30 border-t-[#FFD814] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('admin.loadingUsers')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('admin.userManagement')}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.userManagementSubtitle')}</p>
                </div>
                <Button
                    onClick={handleOpenCreateDialog}
                    className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold rounded-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.addUser')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#4A5568]">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.totalUsers')}</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Crown className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.administrators')}</p>
                            <p className="text-xl font-bold text-purple-600">{stats.admins}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                            <UserCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.customers')}</p>
                            <p className="text-xl font-bold text-emerald-600">{stats.customers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Store className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.shopOwners')}</p>
                            <p className="text-xl font-bold text-blue-600">{stats.shopOwners}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                            <User className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('admin.shopStaffs')}</p>
                            <p className="text-xl font-bold text-orange-600">{stats.shopStaff}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${t('common.isRTL') === 'true' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400`} />
                    <Input
                        placeholder={t('admin.searchUsers')}
                        className={`${t('common.isRTL') === 'true' ? 'pr-10' : 'pl-10'} bg-white border-gray-200 focus:border-[#4A5568] rounded-lg`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'ADMIN', 'CUSTOMER', 'SHOP_OWNER', 'SHOP_STAFF'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === role
                                ? 'bg-[#4A5568] text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {role === 'ALL' ? t('admin.allUsers') : role === 'ADMIN' ? t('admin.admins') : role === 'CUSTOMER' ? t('admin.customers') : role === 'SHOP_OWNER' ? t('admin.shopOwners') : t('admin.shopStaffs')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className={`${t('common.isRTL') === 'true' ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.user')}</th>
                                <th className={`${t('common.isRTL') === 'true' ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.role')}</th>
                                <th className={`${t('common.isRTL') === 'true' ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell`}>{t('admin.contact')}</th>
                                <th className={`${t('common.isRTL') === 'true' ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell`}>{t('admin.location')}</th>
                                <th className={`${t('common.isRTL') === 'true' ? 'text-left' : 'text-right'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${user.role === 'ADMIN'
                                                ? 'bg-purple-500'
                                                : 'bg-[#4A5568]'
                                                }`}>
                                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{user.name || t('admin.unnamedUser')}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate max-w-[150px]">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {user.role === 'ADMIN' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {user.role === 'ADMIN' ? t('admin.administrator') :
                                                user.role === 'SHOP_OWNER' ? t('admin.shopOwner') :
                                                    user.role === 'SHOP_STAFF' ? t('admin.shopStaff') :
                                                        t('admin.customer')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        {user.phone ? (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                {user.phone}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 hidden lg:table-cell">
                                        <div className="max-w-[180px]">
                                            {user.address ? (
                                                <div className="flex items-start gap-1.5 text-sm text-gray-600">
                                                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{user.address}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-gray-100"
                                                onClick={() => handleOpenDialog(user)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                            <Users className="h-7 w-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('admin.noUsersFound')}</h3>
                        <p className="text-gray-500">{t('admin.tryAdjustFilters')}</p>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{t('admin.editUserProfile')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">{t('admin.fullName')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">{t('admin.phoneNumber')}</Label>
                            <Input
                                id="phone"
                                dir="ltr"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="rounded-xl text-left"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium">{t('admin.address')}</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">{t('admin.userRole')}</Label>
                            <select
                                id="role"
                                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814]"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleOption })}
                            >
                                <option value="CUSTOMER">{t('admin.customer')}</option>
                                <option value="ADMIN">{t('admin.administrator')}</option>
                                <option value="SHOP_OWNER">{t('admin.shopOwner')}</option>
                                <option value="SHOP_STAFF">{t('admin.shopStaff')}</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">
                                {t('admin.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold rounded-lg"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('admin.saveChanges')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">{t('admin.addNewUser')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4 py-4 overflow-y-auto flex-1 px-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-name" className="text-sm font-medium">{t('admin.fullName')} *</Label>
                                <Input
                                    id="create-name"
                                    value={createFormData.name}
                                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                    className="rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-email" className="text-sm font-medium">{t('admin.email')} *</Label>
                                <Input
                                    id="create-email"
                                    type="email"
                                    dir="ltr"
                                    value={createFormData.email}
                                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                    className="rounded-xl text-left"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="create-phone" className="text-sm font-medium">{t('admin.phoneNumber')}</Label>
                                <Input
                                    id="create-phone"
                                    dir="ltr"
                                    value={createFormData.phone}
                                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                                    className="rounded-xl text-left"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-role" className="text-sm font-medium">{t('admin.userRole')} *</Label>
                                <select
                                    id="create-role"
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814]"
                                    value={createFormData.role}
                                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value as RoleOption })}
                                >
                                    <option value="CUSTOMER">{t('admin.customer')}</option>
                                    <option value="ADMIN">{t('admin.administrator')}</option>
                                    <option value="SHOP_OWNER">{t('admin.shopOwner')}</option>
                                    <option value="SHOP_STAFF">{t('admin.shopStaff')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-address" className="text-sm font-medium">{t('admin.address')}</Label>
                            <Input
                                id="create-address"
                                value={createFormData.address}
                                onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Shop fields - show only for SHOP_OWNER */}
                        {createFormData.role === 'SHOP_OWNER' && (
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-4 bg-gray-50">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Store className="h-4 w-4" />
                                    {t('admin.shopDetails')}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-shopName" className="text-sm font-medium">{t('admin.shopName')} *</Label>
                                    <Input
                                        id="create-shopName"
                                        value={createFormData.shopName}
                                        onChange={(e) => setCreateFormData({ ...createFormData, shopName: e.target.value })}
                                        className="rounded-xl"
                                        required={createFormData.role === 'SHOP_OWNER'}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="create-shopDescription" className="text-sm font-medium">{t('admin.shopDescription')}</Label>
                                    <Input
                                        id="create-shopDescription"
                                        value={createFormData.shopDescription}
                                        onChange={(e) => setCreateFormData({ ...createFormData, shopDescription: e.target.value })}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password options */}
                        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="send-invite"
                                    checked={createFormData.sendInvite}
                                    onChange={(e) => setCreateFormData({ ...createFormData, sendInvite: e.target.checked, password: '' })}
                                    className="w-4 h-4 rounded border-gray-300 text-[#4A5568] focus:ring-[#4A5568]"
                                />
                                <Label htmlFor="send-invite" className="text-sm font-medium cursor-pointer">
                                    {t('admin.sendEmailInvite')}
                                </Label>
                            </div>
                            <p className="text-xs text-gray-500 ml-7">{t('admin.sendEmailInviteDesc')}</p>

                            {!createFormData.sendInvite && (
                                <div className="space-y-2 mt-3">
                                    <Label htmlFor="create-password" className="text-sm font-medium">{t('admin.temporaryPassword')} *</Label>
                                    <Input
                                        id="create-password"
                                        type="password"
                                        dir="ltr"
                                        value={createFormData.password}
                                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                        className="rounded-xl text-left"
                                        placeholder={t('admin.enterTempPassword')}
                                        required={!createFormData.sendInvite}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter className="pt-4 gap-2 flex-shrink-0 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-lg">
                                {t('admin.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold rounded-lg"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t('admin.createUser')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
