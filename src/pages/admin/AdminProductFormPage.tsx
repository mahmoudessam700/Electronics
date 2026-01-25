import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export function AdminProductFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState('');
    const [inStock, setInStock] = useState(true);

    useEffect(() => {
        if (isEditing) {
            fetchProduct(id);
        }
    }, [id, isEditing]);

    const fetchProduct = async (productId: string) => {
        try {
            const res = await fetch(`/api/products?id=${productId}`);
            const data = await res.json();
            if (res.ok) {
                setName(data.name);
                setPrice(data.price.toString());
                setDescription(data.description || '');
                setCategory(data.category || '');
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
            if (res.ok) {
                setImage(data.files[0].url);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error('Upload error', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const productData = {
            name,
            price: parseFloat(price),
            description,
            category,
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
                navigate('/admin/products');
            } else {
                alert('Failed to save product');
            }
        } catch (error) {
            console.error('Save error', error);
        } finally {
            setLoading(false);
        }
    };

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
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                        id="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            required
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g. Laptops"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="flex items-center gap-4">
                        {image && (
                            <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded border" />
                        )}
                        <div className="flex-1">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
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

                <div className="pt-4">
                    <Button type="submit" disabled={loading || uploading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
