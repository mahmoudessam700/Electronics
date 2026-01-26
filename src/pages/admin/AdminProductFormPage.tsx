import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
    children?: Category[];
}

export function AdminProductFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form fields
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState('');
    const [inStock, setInStock] = useState(true);

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProduct(id);
        }
    }, [id, isEditing]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchProduct = async (productId: string) => {
        try {
            const res = await fetch(`/api/products?id=${productId}`);
            const data = await res.json();
            if (res.ok && data) {
                setName(data.name);
                setPrice(data.price.toString());
                setOriginalPrice(data.originalPrice?.toString() || '');
                setDescription(data.description || '');
                setCategory(data.category || '');
                setCategoryId(data.categoryId || '');
                setImage(data.image);
                setInStock(data.inStock);
            }
        } catch (error) {
            console.error('Failed to fetch product', error);
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
            toast.error('Product name is required');
            return;
        }
        if (!price || parseFloat(price) <= 0) {
            toast.error('Valid price is required');
            return;
        }
        if (!image) {
            toast.error('Product image is required');
            return;
        }

        setLoading(true);

        const productData = {
            name,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            description,
            category,
            categoryId: categoryId || null,
            image,
            inStock,
        };

        try {
            const url = isEditing ? `/api/products?id=${id}` : '/api/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (res.ok) {
                toast.success(isEditing ? 'Product updated!' : 'Product created!');
                navigate('/admin/products');
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Save error', error);
            toast.error('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    // Flatten categories for dropdown
    const flattenCategories = (cats: Category[], prefix = ''): { id: string; name: string }[] => {
        let result: { id: string; name: string }[] = [];
        for (const cat of cats) {
            result.push({ id: cat.id, name: prefix + cat.name });
            if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, prefix + '  '));
            }
        }
        return result;
    };

    const flatCategories = flattenCategories(categories);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold tracking-tight">
                    {isEditing ? 'Edit Product' : 'New Product'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-white">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Gaming Laptop Pro"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="99.99"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (optional)</Label>
                        <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            value={originalPrice}
                            onChange={(e) => setOriginalPrice(e.target.value)}
                            placeholder="149.99"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <select
                        id="categoryId"
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            // Also set the category name for backwards compatibility
                            const selected = flatCategories.find(c => c.id === e.target.value);
                            setCategory(selected?.name.trim() || '');
                        }}
                        className="w-full h-10 px-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        {flatCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Product Image *</Label>
                    <div className="flex items-start gap-4">
                        {image && (
                            <img src={image} alt="Preview" className="h-24 w-24 object-cover rounded border" />
                        )}
                        <div className="flex-1 space-y-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                            {uploading && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </div>
                            )}
                            <p className="text-xs text-gray-500">Or paste an image URL:</p>
                            <Input
                                type="url"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        className="w-full min-h-[100px] p-3 border rounded-md text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Product description..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="inStock"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="inStock" className="mb-0">In Stock</Label>
                </div>

                <div className="pt-4 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/products')}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || uploading} className="flex-1">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
