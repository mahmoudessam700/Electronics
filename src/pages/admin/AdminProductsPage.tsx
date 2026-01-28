import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Pencil, Trash2, Loader2, Package, Search, Filter, MoreVertical, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface Product {
    id: string;
    name: string;
    price: number;
    category?: string;
    subcategoryName?: string;
    parentCategoryName?: string;
    image: string;
    inStock: boolean;
    supplierName?: string;
    supplierId?: string;
}

export function AdminProductsPage() {
    const { t, formatCurrency, isRTL } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.confirmDelete'))) return;

        try {
            const res = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete product', error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.subcategoryName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#FFD814]/30 border-t-[#FFD814] rounded-full animate-spin" />
                <span className="mt-4 text-slate-500">{t('common.loading')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {t('admin.products')}
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('admin.totalProducts')}: {products.length}</p>
                </div>
                <Link to="/admin/products/new">
                    <Button className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold">
                        <Plus className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {t('admin.addProduct')}
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400`} />
                    <Input
                        placeholder={t('admin.searchPlaceholder')}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white border-slate-200 focus:border-[#FFD814] focus:ring-[#FFD814]/20 rounded-xl`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl">
                    <Filter className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                    {t('common.filter')}
                </Button>
            </div>

            {/* Products Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">{t('admin.totalProducts')}</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">{t('product.inStock')}</p>
                    <p className="text-2xl font-bold text-emerald-600">{products.filter(p => p.inStock).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">{t('product.outOfStock')}</p>
                    <p className="text-2xl font-bold text-red-500">{products.filter(p => !p.inStock).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-500">{t('admin.categories')}</p>
                    <p className="text-2xl font-bold text-[#4A5568]">
                        {new Set(products.map(p => p.subcategoryName)).size}
                    </p>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.products')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden md:table-cell`}>{t('admin.productCategory')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell`}>{t('admin.productSupplier')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.productPrice')}</th>
                                <th className={`${isRTL ? 'text-right' : 'text-left'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell`}>{t('admin.status')}</th>
                                <th className={`${isRTL ? 'text-left' : 'text-right'} py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500`}>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-lg border border-gray-200" 
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">ID: {product.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 hidden md:table-cell">
                                        {product.parentCategoryName ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                    {product.parentCategoryName}
                                                </span>
                                                <span className="text-gray-300">/</span>
                                                <span className="px-2 py-1 bg-[#4A5568]/10 rounded text-xs font-medium text-[#4A5568]">
                                                    {product.subcategoryName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                {product.subcategoryName || product.category || 'Uncategorized'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 hidden lg:table-cell">
                                        <span className="text-sm text-gray-600">
                                            {product.supplierName || <span className="text-gray-400">—</span>}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm font-bold text-gray-900">
                                            E£{product.price.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 hidden sm:table-cell">
                                        {product.inStock ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-1">
                                            <Link to={`/admin/products/${product.id}`}>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-lg hover:bg-gray-100"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50" 
                                                onClick={() => handleDelete(product.id)}
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

                {filteredProducts.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 mb-4">
                            <Package className="h-7 w-7 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
                        </p>
                        {!searchQuery && (
                            <Link to="/admin/products/new">
                                <Button className="bg-[#4A5568] hover:bg-[#2D3748] text-white font-semibold">
                                    <Plus className="mr-2 h-4 w-4" /> Add First Product
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
