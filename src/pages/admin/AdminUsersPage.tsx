import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Pencil, Trash2, Loader2, User, Shield, MapPin, Search, Users, UserCheck, Crown, Mail, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    address: string | null;
    role: 'ADMIN' | 'CUSTOMER';
    latitude: number | null;
    longitude: number | null;
    createdAt: string;
}

export function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string>('ALL');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        role: 'CUSTOMER' as 'ADMIN' | 'CUSTOMER'
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
                toast.error(data.error || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to fetch users');
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
                toast.success('User updated successfully');
                fetchUsers();
                setIsDialogOpen(false);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update user');
            }
        } catch (error) {
            console.error('Failed to update user', error);
            toast.error('Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/users?id=${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('User deleted');
                setUsers(users.filter(u => u.id !== userId));
            } else {
                toast.error('Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user', error);
            toast.error('Failed to delete user');
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
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FFD814]/30 border-t-[#FFD814] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">Loading users...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        User Management
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage customers and administrators</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#4A5568]">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
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
                            <p className="text-sm text-gray-500">Administrators</p>
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
                            <p className="text-sm text-gray-500">Customers</p>
                            <p className="text-xl font-bold text-emerald-600">{stats.customers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 bg-white border-gray-200 focus:border-[#4A5568] rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ADMIN', 'CUSTOMER'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                roleFilter === role
                                    ? 'bg-[#4A5568] text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {role === 'ALL' ? 'All Users' : role === 'ADMIN' ? 'Admins' : 'Customers'}
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
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Contact</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Location</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
                                                user.role === 'ADMIN' 
                                                    ? 'bg-purple-500' 
                                                    : 'bg-[#4A5568]'
                                            }`}>
                                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{user.name || 'Unnamed User'}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate max-w-[150px]">{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                            user.role === 'ADMIN'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {user.role === 'ADMIN' ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                            {user.role}
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Edit User Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium">User Role</Label>
                            <select
                                id="role"
                                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814]"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'CUSTOMER' })}
                            >
                                <option value="CUSTOMER">Customer</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                        <DialogFooter className="pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold rounded-lg"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
