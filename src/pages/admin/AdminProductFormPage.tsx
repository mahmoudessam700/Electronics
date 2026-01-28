import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, ArrowLeft, Package, DollarSign, Tag, Building2, ImageIcon, CheckSquare, FileText, Upload, Camera, Languages } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CameraCapture } from '../../components/CameraCapture';
import { useLanguage } from '../../contexts/LanguageContext';

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
    children?: Category[];
}

interface Supplier {
    id: string;
    name: string;
}

export function AdminProductFormPage() {
    const { id } = useParams();
    const isEditing = !!id;
    const navigate = useNavigate();
    const { t, isRTL } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    // Form fields
    const [name, setName] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [nameAr, setNameAr] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionAr, setDescriptionAr] = useState('');
    const [category, setCategory] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [image, setImage] = useState('');
    const [inStock, setInStock] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchSuppliers();
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

    const fetchSuppliers = async () => {
        try {
            const res = await fetch('/api/suppliers');
            const data = await res.json();
            if (res.ok) {
                setSuppliers(data);
            }
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        }
    };

    const fetchProduct = async (productId: string) => {
        try {
            const res = await fetch(`/api/products?id=${productId}`);
            const data = await res.json();
            if (res.ok && data) {
                setName(data.name);
                setNameEn(data.nameEn || data.name);
                setNameAr(data.nameAr || '');
                setPrice(data.price.toString());
                setCostPrice(data.costPrice?.toString() || '');
                setOriginalPrice(data.originalPrice?.toString() || '');
                setDescription(data.description || '');
                setDescriptionAr(data.descriptionAr || '');
                setCategory(data.category || '');
                setCategoryId(data.categoryId || '');
                setSupplierId(data.supplierId || '');
                setImage(data.image);
                setInStock(data.inStock);
            }
        } catch (error) {
            console.error('Failed to fetch product', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | File) => {
        const file = e instanceof File ? e : e.target.files?.[0];
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
            nameEn: nameEn || name,
            nameAr: nameAr || null,
            price: parseFloat(price),
            costPrice: costPrice ? parseFloat(costPrice) : 0,
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            description,
            descriptionAr: descriptionAr || null,
            category,
            categoryId: categoryId || null,
            supplierId: supplierId || null,
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
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/admin/products">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-slate-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        {isEditing ? 'Edit Product' : 'New Product'}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {isEditing ? 'Update product details' : 'Add a new product to your store'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900">{t('admin.basicInformation')}</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">{t('admin.productName')} *</Label>
                            <Input
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Gaming Laptop Pro"
                                className="rounded-xl h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">{t('admin.description')}</Label>
                            <textarea
                                id="description"
                                className="w-full min-h-[120px] p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your product..."
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>

                {/* Translations Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Languages className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900">{t('admin.translations')}</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nameEn" className="text-sm font-medium">{t('admin.nameInEnglish')}</Label>
                                <Input
                                    id="nameEn"
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    placeholder="English name"
                                    className="rounded-xl h-11"
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nameAr" className="text-sm font-medium">{t('admin.nameInArabic')}</Label>
                                <Input
                                    id="nameAr"
                                    value={nameAr}
                                    onChange={(e) => setNameAr(e.target.value)}
                                    placeholder="الاسم بالعربية"
                                    className="rounded-xl h-11"
                                    dir="rtl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descriptionAr" className="text-sm font-medium">{t('admin.descriptionInArabic')}</Label>
                            <textarea
                                id="descriptionAr"
                                className="w-full min-h-[120px] p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors resize-none"
                                value={descriptionAr}
                                onChange={(e) => setDescriptionAr(e.target.value)}
                                placeholder="وصف المنتج بالعربية..."
                                dir="rtl"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            <h2 className="font-semibold text-slate-900">Pricing</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-medium">Sale Price *</Label>
                                <div className="flex items-center">
                                    <div className="bg-slate-50 border border-slate-200 px-3 h-11 flex items-center justify-center rounded-l-xl text-slate-500 font-bold text-xs border-r-0">
                                        E£
                                    </div>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="rounded-l-none rounded-r-xl h-11 border-l-0 flex-1 focus-visible:ring-0 focus-visible:border-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="costPrice" className="text-sm font-medium">Cost Price</Label>
                                <div className="flex items-center">
                                    <div className="bg-slate-50 border border-slate-200 px-3 h-11 flex items-center justify-center rounded-l-xl text-slate-500 font-bold text-xs border-r-0">
                                        E£
                                    </div>
                                    <Input
                                        id="costPrice"
                                        type="number"
                                        step="0.01"
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="rounded-l-none rounded-r-xl h-11 border-l-0 flex-1 focus-visible:ring-0 focus-visible:border-slate-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="originalPrice" className="text-sm font-medium">Original Price</Label>
                                <div className="flex items-center">
                                    <div className="bg-slate-50 border border-slate-200 px-3 h-11 flex items-center justify-center rounded-l-xl text-slate-500 font-bold text-xs border-r-0">
                                        E£
                                    </div>
                                    <Input
                                        id="originalPrice"
                                        type="number"
                                        step="0.01"
                                        value={originalPrice}
                                        onChange={(e) => setOriginalPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="rounded-l-none rounded-r-xl h-11 border-l-0 flex-1 focus-visible:ring-0 focus-visible:border-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Organization Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-violet-600" />
                            <h2 className="font-semibold text-slate-900">Organization</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryId" className="text-sm font-medium">Category</Label>
                                <select
                                    id="categoryId"
                                    value={categoryId}
                                    onChange={(e) => {
                                        setCategoryId(e.target.value);
                                        const selected = flatCategories.find(c => c.id === e.target.value);
                                        setCategory(selected?.name.trim() || '');
                                    }}
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors bg-white"
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
                                <Label htmlFor="supplierId" className="text-sm font-medium">Supplier</Label>
                                <select
                                    id="supplierId"
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD814]/20 focus:border-[#FFD814] transition-colors bg-white"
                                >
                                    <option value="">Select a supplier</option>
                                    {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>
                                            {sup.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-pink-600" />
                            <h2 className="font-semibold text-slate-900">Product Image *</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-6">
                            {/* Image Preview */}
                            <div className="flex-shrink-0">
                                {image ? (
                                    <div className="relative group">
                                        <img 
                                            src={image} 
                                            alt="Preview" 
                                            className="h-32 w-32 object-cover rounded-2xl border-2 border-slate-100 shadow-sm" 
                                        />
                                        <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">Change</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50">
                                        <ImageIcon className="h-10 w-10 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Upload Section */}
                            <div className="flex-1 space-y-4">
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Upload className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {uploading ? 'Uploading...' : 'Click to upload'}
                                            </p>
                                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                        {uploading && <Loader2 className="h-5 w-5 animate-spin text-indigo-600 ml-auto" />}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <CameraCapture 
                                        onCapture={(file) => handleImageUpload(file)}
                                        trigger={
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                className="flex-1 gap-2 border-slate-200 hover:bg-slate-50 h-11 rounded-xl"
                                                disabled={uploading}
                                            >
                                                <Camera className="h-4 w-4" />
                                                Take Photo
                                            </Button>
                                        }
                                    />
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-slate-400">Or paste URL</span>
                                    </div>
                                </div>
                                
                                <Input
                                    type="url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="rounded-xl h-11"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Status Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-amber-600" />
                            <h2 className="font-semibold text-slate-900">Availability</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={inStock}
                                    onChange={(e) => setInStock(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFD814]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-900">
                                    {inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <p className="text-xs text-slate-500">
                                    {inStock ? 'Product is available for purchase' : 'Product is not available'}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/products')}
                        className="flex-1 h-12 rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || uploading} 
                        className="flex-1 h-12 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEditing ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
