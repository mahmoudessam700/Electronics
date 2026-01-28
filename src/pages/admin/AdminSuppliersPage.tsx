import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Pencil, Trash2, Loader2, Building2, Mail, Phone, MapPin, User, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

interface Supplier {
    id: string;
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
}

const SUPPLIER_COLORS = [
    'bg-[#4A5568]',
    'bg-[#718096]',
    'bg-[#2D3748]',
    'bg-gray-600',
    'bg-gray-500',
    'bg-gray-700',
];

export function AdminSuppliersPage() {
    const { t } = useLanguage();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            const data = await res.json();
            if (res.ok) {
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contact: supplier.contact || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                contact: '',
                email: '',
                phone: '',
                address: ''
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Supplier name is required');
            return;
        }
        setIsSaving(true);

        try {
            const url = editingSupplier ? `/api/suppliers?id=${editingSupplier.id}` : '/api/suppliers';
            const method = editingSupplier ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingSupplier ? 'Supplier updated!' : 'Supplier created!');
                fetchSuppliers();
                setIsDialogOpen(false);
            } else {
                toast.error('Failed to save supplier');
            }
        } catch (error) {
            console.error('Failed to save supplier', error);
            toast.error('Failed to save supplier');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier? Any linked products will have their supplier set to null.')) return;

        try {
            const res = await fetch(`/api/suppliers?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Supplier deleted');
                setSuppliers(suppliers.filter(s => s.id !== id));
            } else {
                toast.error('Failed to delete supplier');
            }
        } catch (error) {
            console.error('Failed to delete supplier', error);
            toast.error('Failed to delete supplier');
        }
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.contact?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (supplier.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FFD814]/30 border-t-[#FFD814] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('admin.loadingSuppliers')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('admin.suppliersTitle')}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.suppliersSubtitle')}</p>
                </div>
                <Button 
                    onClick={() => handleOpenDialog()}
                    className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold"
                >
                    <Plus className="mr-2 h-4 w-4" /> {t('admin.addSupplier')}
                </Button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#4A5568]">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">{t('admin.totalSuppliers')}</p>
                        <p className="text-xl font-bold text-gray-900">{suppliers.length}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder={t('admin.searchSuppliers')}
                    className="pl-10 bg-white border-slate-200 focus:border-[#FFD814] focus:ring-[#FFD814]/20 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Suppliers Grid */}
            {filteredSuppliers.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                        <Building2 className="h-7 w-7 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {searchQuery ? t('admin.noSuppliersFound') : t('admin.noSuppliersYet')}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchQuery ? t('admin.tryAdjustSearch') : t('admin.addFirstSupplier')}
                    </p>
                    {!searchQuery && (
                        <Button 
                            onClick={() => handleOpenDialog()}
                            className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold"
                        >
                            <Plus className="mr-2 h-4 w-4" /> {t('admin.addSupplier')}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSuppliers.map((supplier, index) => {
                        const colorClass = SUPPLIER_COLORS[index % SUPPLIER_COLORS.length];
                        
                        return (
                            <div 
                                key={supplier.id}
                                className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden"
                            >
                                {/* Header with color */}
                                <div className={`h-16 ${colorClass} relative`}>
                                    <div className="absolute -bottom-5 left-4">
                                        <div className="w-12 h-12 rounded-lg bg-white shadow flex items-center justify-center border border-gray-100">
                                            <Building2 className="h-5 w-5 text-gray-600" />
                                        </div>
                                    </div>
                                    
                                    {/* Actions on hover */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenDialog(supplier)}
                                            className="p-1.5 bg-white/90 rounded-md hover:bg-white transition-colors"
                                        >
                                            <Pencil className="h-4 w-4 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            className="p-1.5 bg-white/90 rounded-md hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-8 pb-4 px-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">{supplier.name}</h3>
                                    
                                    <div className="space-y-1.5">
                                        {supplier.contact && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                                {supplier.contact}
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                {supplier.email}
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                {supplier.phone}
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{supplier.address}</span>
                                            </div>
                                        )}
                                        {!supplier.contact && !supplier.email && !supplier.phone && !supplier.address && (
                                            <p className="text-sm text-gray-400 italic">{t('admin.noContactInfo')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingSupplier ? t('admin.editSupplier') : t('admin.addSupplier')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">{t('admin.supplierNameRequired')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Tech Global Inc."
                                className="rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact" className="text-sm font-medium">{t('admin.contactPerson')}</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">{t('admin.userEmail')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">{t('admin.phoneNumber')}</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. +20 123 456 7890"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium">{t('admin.address')}</Label>
                            <textarea
                                id="address"
                                className="w-full min-h-[80px] p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g. 123 Business St, Cairo, Egypt"
                            />
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
                                {editingSupplier ? t('admin.updateSupplier') : t('admin.createSupplier')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
