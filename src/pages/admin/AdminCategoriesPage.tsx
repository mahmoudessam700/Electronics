import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Folder, Loader2, Layers, Search, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    sortOrder: number;
    _count?: { products: number };
}

// Allowed categories - only these can be created
const ALLOWED_CATEGORIES = [
    'PCs',
    'Laptops',
    'Mice',
    'Keyboards',
    'Headphones',
    'Cables',
    'Mouse Pads',
    'Hard Drives'
];

export function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: ''
    });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            setLoading(true);
            const res = await fetch('/api/categories');
            const data = await res.json();
            // Filter out "Electronics" and any subcategories
            const filtered = data.filter((cat: Category) =>
                cat.name.toLowerCase() !== 'electronics'
            );
            setCategories(filtered);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }

    function openAddForm() {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            image: ''
        });
        setIsFormOpen(true);
    }

    function openEditForm(category: Category) {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || ''
        });
        setIsFormOpen(true);
    }

    function openDeleteConfirm(category: Category) {
        setDeletingCategory(category);
        setIsDeleteOpen(true);
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload,
            });
            const data = await res.json();
            if (res.ok && data.files?.[0]?.url) {
                setFormData(prev => ({ ...prev, image: data.files[0].url }));
                toast.success('Image uploaded!');
            } else {
                toast.error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            toast.error('Upload failed');
        } finally {
            setSaving(false);
        }
    }

    async function handleSave() {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        // Check if the category name is allowed
        if (!editingCategory && !ALLOWED_CATEGORIES.some(c => c.toLowerCase() === formData.name.trim().toLowerCase())) {
            toast.error(`Only these categories are allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
            return;
        }

        setSaving(true);
        try {
            const url = editingCategory
                ? `/api/categories?id=${editingCategory.id}`
                : '/api/categories';

            const res = await fetch(url, {
                method: editingCategory ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save');
            }

            toast.success(editingCategory ? 'Category updated!' : 'Category created!');
            setIsFormOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deletingCategory) return;

        try {
            const res = await fetch(`/api/categories?id=${deletingCategory.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete');
            }

            toast.success('Category deleted!');
            setIsDeleteOpen(false);
            setDeletingCategory(null);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    }

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FFD814]/30 border-t-[#FFD814] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">Loading categories...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Categories
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">Organize your products into categories</p>
                </div>
                <Button 
                    onClick={() => openAddForm()}
                    className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-10 bg-white border-slate-200 focus:border-[#FFD814] focus:ring-[#FFD814]/20 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Allowed Categories Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Layers className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Available Categories</p>
                        <p className="text-sm text-gray-600 mt-1">
                            {ALLOWED_CATEGORIES.join(' • ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Total Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">With Products</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {categories.filter(c => (c._count?.products || 0) > 0).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Empty</p>
                    <p className="text-2xl font-bold text-amber-600">
                        {categories.filter(c => (c._count?.products || 0) === 0).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-[#4A5568]">
                        {categories.reduce((acc, c) => acc + (c._count?.products || 0), 0)}
                    </p>
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell">Description</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Products</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                {category.image ? (
                                                    <img 
                                                        src={category.image} 
                                                        alt={category.name} 
                                                        className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-lg border border-gray-200" 
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-[#4A5568] flex items-center justify-center">
                                                        <Folder className="h-5 w-5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{category.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">/{category.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        <span className="text-sm text-gray-600 line-clamp-2">
                                            {category.description || <span className="text-gray-400 italic">No description</span>}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                            (category._count?.products || 0) > 0 
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {category._count?.products || 0} products
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg hover:bg-gray-100"
                                                onClick={() => openEditForm(category)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50" 
                                                onClick={() => openDeleteConfirm(category)}
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

                {filteredCategories.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                            <Folder className="h-7 w-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No categories found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first category'}
                        </p>
                        {!searchQuery && (
                            <Button 
                                onClick={() => openAddForm()}
                                className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Add First Category
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                            {editingCategory ? (
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Category name"
                                    className="rounded-xl"
                                />
                            ) : (
                                <select
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors"
                                >
                                    <option value="">Select a category...</option>
                                    {ALLOWED_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Image</Label>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="h-24 w-24 object-cover rounded-xl border shadow-sm flex-shrink-0" />
                                ) : (
                                    <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center flex-shrink-0">
                                        <ImageIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                )}
                                <div className="flex-1 w-full space-y-3">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={saving}
                                        className="rounded-xl w-full"
                                    />
                                    <p className="text-xs text-slate-400">Or paste an image URL:</p>
                                    <Input
                                        id="image"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                        className="rounded-xl w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-lg">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold rounded-lg"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingCategory?.name}"?
                            Products in this category will become uncategorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
