import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Pencil, Trash2, RefreshCw, Loader2, Upload, Camera, X, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface ShopCategory {
    id: string;
    name: string;
    nameEn?: string;
    nameAr?: string;
    description?: string | null;
    image?: string | null;
    shopId: string;
    _count?: { products: number };
}

export function ShopCategoriesPage() {
    const { activeShop, token } = useAuth();
    const { t } = useLanguage();
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);
    const camRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        nameAr: '',
        description: '',
        image: '' as string | null,
    });

    const fetchCategories = async () => {
        if (!activeShop) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/categories?shopId=${activeShop.id}`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [activeShop?.id]);

    const handleCreate = () => {
        setSelectedCategory(null);
        setFormMode('create');
        setFormData({ name: '', nameEn: '', nameAr: '', description: '', image: null });
        setFormOpen(true);
    };

    const handleEdit = (cat: ShopCategory) => {
        setSelectedCategory(cat);
        setFormMode('edit');
        setFormData({
            name: cat.name,
            nameEn: cat.nameEn || '',
            nameAr: cat.nameAr || '',
            description: cat.description || '',
            image: cat.image || null,
        });
        setFormOpen(true);
    };

    const handleDelete = async (cat: ShopCategory) => {
        if (!token) return;
        if (!confirm(`Delete "${cat.name}"? Products in this category will be unlinked.`)) return;
        try {
            const res = await fetch(`/api/categories?id=${cat.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success('Category deleted');
                setCategories(prev => prev.filter(c => c.id !== cat.id));
            } else {
                toast.error('Failed to delete category');
            }
        } catch {
            toast.error('Failed to delete category');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.files?.[0]?.url) {
                    setFormData(prev => ({ ...prev, image: data.files[0].url }));
                }
            }
        } catch {
            toast.error('Image upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeShop || !token) return;
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }
        setSaving(true);

        const payload = {
            name: formData.name.trim(),
            nameEn: formData.nameEn.trim() || formData.name.trim(),
            nameAr: formData.nameAr.trim() || null,
            description: formData.description.trim() || null,
            image: formData.image || null,
            shopId: activeShop.id,
        };

        try {
            const url = formMode === 'edit' && selectedCategory
                ? `/api/categories?id=${selectedCategory.id}`
                : '/api/categories';
            const method = formMode === 'edit' ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(formMode === 'edit' ? 'Category updated' : 'Category created');
                setFormOpen(false);
                fetchCategories();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save category');
            }
        } catch {
            toast.error('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a shop to view categories</h2>
                <p className="text-slate-500 text-sm">Choose a shop from the selector above.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">{t('home.categories')}</p>
                        <h1 className="text-2xl font-bold text-slate-900">{t('home.categories')} — {activeShop.name}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchCategories}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {t('admin.refresh') || 'Refresh'}
                        </Button>
                        <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Plus className="h-4 w-4" />
                            {t('admin.addCategory') || 'Add Category'}
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">{t('home.noCategories')}</h3>
                        <p className="text-slate-500 text-sm mt-1">{t('home.noCategoriesDesc')}</p>
                        <Button onClick={handleCreate} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Plus className="h-4 w-4 mr-1" /> {t('admin.addCategory') || 'Add Category'}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <FolderOpen className="h-10 w-10 text-slate-300" />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                                    {cat.description && (
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-xs text-slate-400">
                                            {cat._count?.products || 0} {t('home.products')}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(cat)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(cat)}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {formMode === 'edit' ? (t('admin.editCategory') || 'Edit Category') : (t('admin.addCategory') || 'Add Category')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Image */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.categoryImage') || 'Category Image'}</Label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                    {uploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    ) : formData.image ? (
                                        <>
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, image: null }))}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <Upload className="h-6 w-6 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => fileRef.current?.click()} disabled={uploading}>
                                        <Upload className="h-3 w-3 mr-1" /> {t('admin.uploadImage') || 'Upload'}
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => camRef.current?.click()} disabled={uploading}>
                                        <Camera className="h-3 w-3 mr-1" /> {t('admin.takePhoto') || 'Camera'}
                                    </Button>
                                </div>
                                <input type="file" accept="image/*" ref={fileRef} onChange={handleImageUpload} className="hidden" />
                                <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={handleImageUpload} className="hidden" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.categoryName') || 'Category Name'} <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Smartphones"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Name (EN)</Label>
                                <Input
                                    value={formData.nameEn}
                                    onChange={e => setFormData(p => ({ ...p, nameEn: e.target.value }))}
                                    placeholder="English name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Name (AR)</Label>
                                <Input
                                    value={formData.nameAr}
                                    onChange={e => setFormData(p => ({ ...p, nameAr: e.target.value }))}
                                    placeholder="الاسم بالعربية"
                                    dir="rtl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t('admin.description') || 'Description'}</Label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                placeholder="Brief description..."
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                                {t('admin.cancel')}
                            </Button>
                            <Button type="submit" disabled={saving || uploading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                {formMode === 'edit' ? (t('admin.saveChanges')) : (t('admin.addCategory') || 'Add Category')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
