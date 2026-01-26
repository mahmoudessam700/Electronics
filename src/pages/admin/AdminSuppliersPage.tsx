import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Pencil, Trash2, Loader2, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface Supplier {
    id: string;
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export function AdminSuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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
                fetchSuppliers();
                setIsDialogOpen(false);
            }
        } catch (error) {
            console.error('Failed to save supplier', error);
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
                setSuppliers(suppliers.filter(s => s.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete supplier', error);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
                    <p className="text-muted-foreground">Manage your product suppliers and contact information.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Supplier
                </Button>
            </div>

            <div className="border rounded-md shadow-sm bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left">
                            <th className="p-4 font-medium text-gray-500">Name</th>
                            <th className="p-4 font-medium text-gray-500">Contact Person</th>
                            <th className="p-4 font-medium text-gray-500">Email</th>
                            <th className="p-4 font-medium text-gray-500">Phone</th>
                            <th className="p-4 font-medium text-right text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {suppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-400" />
                                    {supplier.name}
                                </td>
                                <td className="p-4 text-gray-600">{supplier.contact || '-'}</td>
                                <td className="p-4 text-gray-600">{supplier.email || '-'}</td>
                                <td className="p-4 text-gray-600">{supplier.phone || '-'}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(supplier)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(supplier.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {suppliers.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                            <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No suppliers found</h3>
                        <p className="text-gray-500 mt-1">Add your first supplier to start tracking them.</p>
                        <Button className="mt-4" variant="outline" onClick={() => handleOpenDialog()}>
                            Add Supplier
                        </Button>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Supplier Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Tech Global Inc."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact Person</Label>
                                <Input
                                    id="contact"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="e.g. contact@techglobal.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g. +20 123 456 7890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <textarea
                                id="address"
                                className="w-full min-h-[80px] p-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g. 123 Business St, Cairo, Egypt"
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
