import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ChevronRight, ChevronDown, Folder, FolderOpen, Loader2, X } from 'lucide-react';
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
    parentId?: string | null;
    children?: Category[];
    _count?: { products: number };
}

export function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        parentId: '' as string | null
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
            const res = await fetch('/api/categories?parentId=null');
            const data = await res.json();
            setCategories(data);
            // Expand all by default
            const ids = new Set<string>();
            data.forEach((cat: Category) => ids.add(cat.id));
            setExpandedIds(ids);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }

    function toggleExpand(id: string) {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function openAddForm(parentId?: string) {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            image: '',
            parentId: parentId || null
        });
        setIsFormOpen(true);
    }

    function openEditForm(category: Category) {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image || '',
            parentId: category.parentId || null
        });
        setIsFormOpen(true);
    }

    function openDeleteConfirm(category: Category) {
        setDeletingCategory(category);
        setIsDeleteOpen(true);
    }

    async function handleSave() {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSaving(true);
        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory.id}`
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
            const res = await fetch(`/api/categories/${deletingCategory.id}`, {
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

        // Find all siblings and reorder
        const siblings = categories.flatMap(cat =>
            cat.id === draggedItem.parentId || (!draggedItem.parentId && !cat.parentId)
                ? [cat, ...(cat.children || [])]
                : cat.children || []
        ).filter(c => c.parentId === targetCategory.parentId);

        const newOrder = siblings.filter(s => s.id !== draggedItem.id);
        const targetIndex = newOrder.findIndex(s => s.id === targetCategory.id);
        newOrder.splice(targetIndex, 0, { ...draggedItem, parentId: targetCategory.parentId });

        // Update sort orders
        const updates = newOrder.map((cat, idx) => ({
            id: cat.id,
            sortOrder: idx,
            parentId: cat.parentId
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

    function renderCategory(category: Category, level: number = 0) {
        const isExpanded = expandedIds.has(category.id);
        const hasChildren = category.children && category.children.length > 0;
        const isDragOver = dragOverId === category.id;

        return (
            <div key={category.id}>
                <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, category)}
                    onDragOver={(e) => handleDragOver(e, category)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, category)}
                    className={`
                        flex items-center gap-2 p-3 bg-white border rounded-lg mb-2
                        hover:shadow-sm transition-all cursor-move
                        ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    `}
                    style={{ marginLeft: level * 24 }}
                >
                    <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />

                    {hasChildren ? (
                        <button onClick={() => toggleExpand(category.id)} className="p-1">
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    {isExpanded ? (
                        <FolderOpen className="h-5 w-5 text-yellow-500" />
                    ) : (
                        <Folder className="h-5 w-5 text-yellow-500" />
                    )}

                    <div className="flex-1">
                        <span className="font-medium">{category.name}</span>
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
                            onClick={() => openAddForm(category.id)}
                            title="Add subcategory"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
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

                {isExpanded && hasChildren && (
                    <div>
                        {category.children!.map(child => renderCategory(child, level + 1))}
                    </div>
                )}
            </div>
        );
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
                    <p className="text-gray-500">Manage product categories and subcategories</p>
                </div>
                <Button onClick={() => openAddForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                </Button>
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
                    {categories.map(cat => renderCategory(cat))}
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
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Gaming Laptops"
                            />
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
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                                id="image"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        {formData.parentId && (
                            <div className="p-2 bg-gray-100 rounded text-sm">
                                This will be a subcategory
                            </div>
                        )}
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
                            Subcategories will be moved to the parent level.
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
