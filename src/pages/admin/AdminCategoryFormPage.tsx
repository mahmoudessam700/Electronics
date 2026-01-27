import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, ArrowLeft, Folder, ImageIcon, Upload, FileText } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

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

export function AdminCategoryFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetchingCategory, setFetchingCategory] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        if (isEditing) {
            fetchCategory(id);
        }
    }, [id, isEditing]);

    const fetchCategory = async (categoryId: string) => {
        setFetchingCategory(true);
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            const category = data.find((c: any) => c.id === categoryId);
            if (category) {
                setName(category.name);
                setDescription(category.description || '');
                setImage(category.image || '');
            } else {
                toast.error('Category not found');
                navigate('/admin/categories');
            }
        } catch (error) {
            console.error('Failed to fetch category', error);
            toast.error('Failed to load category');
        } finally {
            setFetchingCategory(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.files?.[0]?.url) {
                setImage(data.files[0].url);
                toast.success('Image uploaded!');
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Category name is required');
            return;
        }

        // Check if the category name is allowed (only for new categories)
        if (!isEditing && !ALLOWED_CATEGORIES.some(c => c.toLowerCase() === name.trim().toLowerCase())) {
            toast.error(`Only these categories are allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
            return;
        }

        setLoading(true);

        const categoryData = {
            name,
            description,
            image,
        };

        try {
            const url = isEditing ? `/api/categories?id=${id}` : '/api/categories';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData),
            });

            if (res.ok) {
                toast.success(isEditing ? 'Category updated!' : 'Category created!');
                navigate('/admin/categories');
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Save error', error);
            toast.error('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCategory) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#4A5568]/30 border-t-[#4A5568] rounded-full animate-spin" />
                <span className="mt-4 text-gray-500">Loading category...</span>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/categories">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-gray-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Category' : 'New Category'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isEditing ? 'Update category details' : 'Add a new category to your store'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Folder className="h-5 w-5 text-[#4A5568]" />
                            <h2 className="font-semibold text-gray-900">Basic Information</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">Category Name *</Label>
                            {isEditing ? (
                                <Input
                                    id="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Category name"
                                    className="rounded-lg h-11"
                                />
                            ) : (
                                <select
                                    id="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full h-11 px-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5568]/20 focus:border-[#4A5568] transition-colors bg-white"
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
                            <textarea
                                id="description"
                                className="w-full min-h-[100px] p-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5568]/20 focus:border-[#4A5568] transition-colors resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe this category..."
                            />
                        </div>
                    </div>
                </div>

                {/* Image Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-[#718096]" />
                            <h2 className="font-semibold text-gray-900">Category Image</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            {/* Image Preview */}
                            <div className="flex-shrink-0">
                                {image ? (
                                    <div className="relative group">
                                        <img 
                                            src={image} 
                                            alt="Preview" 
                                            className="h-32 w-32 object-cover rounded-xl border-2 border-gray-100 shadow-sm" 
                                        />
                                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 w-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                                        <ImageIcon className="h-10 w-10 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Upload Section */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:border-[#4A5568]/50 hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#4A5568]/10 rounded-lg">
                                            <Upload className="h-5 w-5 text-[#4A5568]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {uploading ? 'Uploading...' : 'Click to upload'}
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                        {uploading && <Loader2 className="h-5 w-5 animate-spin text-[#4A5568] ml-auto" />}
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-gray-400">Or paste URL</span>
                                    </div>
                                </div>
                                
                                <Input
                                    type="url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="rounded-lg h-11"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/categories')}
                        className="flex-1 h-12 rounded-lg border-gray-200 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || uploading} 
                        className="flex-1 h-12 rounded-lg bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Category' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
