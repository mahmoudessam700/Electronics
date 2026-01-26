import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Folder, Loader2 } from 'lucide-react';
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
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-gray-500">Manage product categories</p>
                </div>
                <Button onClick={() => openAddForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Allowed Categories Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>Allowed categories:</strong> {ALLOWED_CATEGORIES.join(', ')}
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No categories yet</p>
                    <Button onClick={() => openAddForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Category
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {categories.map(category => {
                        const isDragOver = dragOverId === category.id;

                        return (
                            <div
                                key={category.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, category)}
                                onDragOver={(e) => handleDragOver(e, category)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, category)}
                                className={`
                                    flex items-center gap-3 p-4 bg-white border rounded-lg
                                    hover:shadow-sm transition-all cursor-move
                                    ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                                `}
                            >
                                <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />

                                {/* Category Image */}
                                {category.image && (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="h-12 w-12 object-cover rounded"
                                    />
                                )}

                                <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />

                                <div className="flex-1">
                                    <span className="font-medium text-lg">{category.name}</span>
                                    {category._count && (
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({category._count.products} products)
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditForm(category)}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openDeleteConfirm(category)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="name">Name *</Label>
                            {editingCategory ? (
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Category name"
                                />
                            ) : (
                                <select
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a category...</option>
                                    {ALLOWED_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>

                        <div>
                            <Label>Image</Label>
                            <div className="flex items-start gap-4 mt-1">
                                {formData.image && (
                                    <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                                )}
                                <div className="flex-1 space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={saving}
                                    />
                                    <p className="text-xs text-gray-500">Or paste an image URL:</p>
                                    <Input
                                        id="image"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingCategory?.name}"?
                            Products in this category will become uncategorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
