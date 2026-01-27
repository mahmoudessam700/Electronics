import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Folder, Loader2, Layers, Image as ImageIcon } from 'lucide-react';
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

const CATEGORY_COLORS = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-red-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-green-500 to-emerald-600',
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

    // Drag state
    const [draggedItem, setDraggedItem] = useState<Category | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

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

    // Drag and Drop handlers
    function handleDragStart(e: React.DragEvent, category: Category) {
        setDraggedItem(category);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e: React.DragEvent, category: Category) {
        e.preventDefault();
        if (draggedItem?.id !== category.id) {
            setDragOverId(category.id);
        }
    }

    function handleDragLeave() {
        setDragOverId(null);
    }

    async function handleDrop(e: React.DragEvent, targetCategory: Category) {
        e.preventDefault();
        setDragOverId(null);

        if (!draggedItem || draggedItem.id === targetCategory.id) {
            setDraggedItem(null);
            return;
        }

        // Find all categories and reorder
        const newOrder = categories.filter(c => c.id !== draggedItem.id);
        const targetIndex = newOrder.findIndex(c => c.id === targetCategory.id);
        newOrder.splice(targetIndex, 0, draggedItem);

        // Update sort orders
        const updates = newOrder.map((cat, idx) => ({
            id: cat.id,
            sortOrder: idx
        }));

        try {
            await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories: updates })
            });
            fetchCategories();
        } catch (error) {
            toast.error('Failed to reorder');
        }

        setDraggedItem(null);
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">Loading categories...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Categories
                    </h1>
                    <p className="text-slate-500 mt-1">Organize your products into categories</p>
                </div>
                <Button 
                    onClick={() => openAddForm()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Allowed Categories Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Layers className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">Available Categories</p>
                        <p className="text-sm text-slate-600 mt-1">
                            {ALLOWED_CATEGORIES.join(' • ')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            {categories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                        <Folder className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No categories yet</h3>
                    <p className="text-slate-500 mb-6">Create your first category to organize products</p>
                    <Button 
                        onClick={() => openAddForm()}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Category
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category, index) => {
                        const isDragOver = dragOverId === category.id;
                        const colorClass = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

                        return (
                            <div
                                key={category.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, category)}
                                onDragOver={(e) => handleDragOver(e, category)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, category)}
                                className={`
                                    group relative bg-white rounded-2xl border overflow-hidden
                                    hover:shadow-lg transition-all duration-300 cursor-move
                                    ${isDragOver ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}
                                `}
                            >
                                {/* Category Image or Gradient */}
                                <div className="relative h-32 overflow-hidden">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${colorClass} opacity-90`} />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                    
                                    {/* Drag Handle */}
                                    <div className="absolute top-3 left-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-4 w-4 text-white" />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditForm(category)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                                        >
                                            <Edit2 className="h-4 w-4 text-slate-700" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirm(category)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>

                                    {/* Product Count Badge */}
                                    {category._count && (
                                        <div className="absolute bottom-3 right-3">
                                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                                                {category._count.products} products
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Category Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colorClass}`}>
                                            <Folder className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                                    </div>
                                    {category.description && (
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{category.description}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
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
                            <div className="flex items-start gap-4">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border shadow-sm" />
                                ) : (
                                    <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-3">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={saving}
                                        className="rounded-xl"
                                    />
                                    <p className="text-xs text-slate-400">Or paste an image URL:</p>
                                    <Input
                                        id="image"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl"
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
