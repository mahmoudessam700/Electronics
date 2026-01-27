import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Pencil, Trash2, Loader2, Building2, Mail, Phone, MapPin, User, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

interface Supplier {
    id: string;
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
}

const SUPPLIER_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
];

export function AdminSuppliersPage() {
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
                <span className="mt-4 text-slate-500">Loading suppliers...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Suppliers
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your product suppliers and vendors</p>
                </div>
                <Button 
                    onClick={() => handleOpenDialog()}
                    className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FFD814] to-[#F7CA00]">
                        <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Suppliers</p>
                        <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search suppliers..."
                    className="pl-10 bg-white border-slate-200 focus:border-[#FFD814] focus:ring-[#FFD814]/20 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Suppliers Grid */}
            {filteredSuppliers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                        <Building2 className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {searchQuery ? 'No suppliers found' : 'No suppliers yet'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {searchQuery ? 'Try adjusting your search' : 'Add your first supplier to get started'}
                    </p>
                    {!searchQuery && (
                        <Button 
                            onClick={() => handleOpenDialog()}
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add First Supplier
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
                                className="group bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {/* Header with gradient */}
                                <div className={`h-20 bg-gradient-to-br ${colorClass} relative`}>
                                    <div className="absolute -bottom-6 left-5">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
                                            <Building2 className="h-6 w-6 text-slate-600" />
                                        </div>
                                    </div>
                                    
                                    {/* Actions on hover */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenDialog(supplier)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                                        >
                                            <Pencil className="h-4 w-4 text-slate-700" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-10 pb-5 px-5">
                                    <h3 className="font-semibold text-lg text-slate-900 mb-3">{supplier.name}</h3>
                                    
                                    <div className="space-y-2">
                                        {supplier.contact && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <User className="h-4 w-4 text-slate-400" />
                                                {supplier.contact}
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                {supplier.email}
                                            </div>
                                        )}
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                {supplier.phone}
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{supplier.address}</span>
                                            </div>
                                        )}
                                        {!supplier.contact && !supplier.email && !supplier.phone && !supplier.address && (
                                            <p className="text-sm text-slate-400 italic">No contact information</p>
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
                            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Supplier Name *</Label>
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
                                <Label htmlFor="contact" className="text-sm font-medium">Contact Person</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. +20 123 456 7890"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                            <textarea
                                id="address"
                                className="w-full min-h-[80px] p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g. 123 Business St, Cairo, Egypt"
                            />
                        </div>
                        <DialogFooter className="pt-4 gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold rounded-xl"
                            >
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
