import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Pencil, Trash2, Loader2, Package, Search, Filter, MoreVertical, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        if (!confirm('Are you sure you want to delete this product?')) return;

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
                <span className="mt-4 text-slate-500">Loading products...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Products
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your product inventory</p>
                </div>
                <Link to="/admin/products/new">
                    <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold shadow-md hover:shadow-lg transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10 bg-white border-slate-200 focus:border-[#FFD814] focus:ring-[#FFD814]/20 rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Products Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Total Products</p>
                    <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">In Stock</p>
                    <p className="text-2xl font-bold text-emerald-600">{products.filter(p => p.inStock).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-500">{products.filter(p => !p.inStock).length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Categories</p>
                    <p className="text-2xl font-bold text-indigo-600">
                        {new Set(products.map(p => p.subcategoryName)).size}
                    </p>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Product</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    className="h-14 w-14 object-cover rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow" 
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors flex items-center justify-center">
                                                    <Eye className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{product.name}</p>
                                                <p className="text-xs text-slate-400 font-mono">ID: {product.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {product.parentCategoryName ? (
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-600">
                                                    {product.parentCategoryName}
                                                </span>
                                                <span className="text-slate-300">/</span>
                                                <span className="px-2 py-1 bg-indigo-50 rounded-md text-xs font-medium text-indigo-600">
                                                    {product.subcategoryName}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-600">
                                                {product.subcategoryName || product.category || 'Uncategorized'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm text-slate-600">
                                            {product.supplierName || <span className="text-slate-400">—</span>}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-base font-bold text-slate-900">
                                            E£{product.price.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {product.inStock ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end gap-1">
                                            <Link to={`/admin/products/${product.id}`}>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600" 
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
                    <div className="py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                            <Package className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                        <p className="text-slate-500 mb-6">
                            {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
                        </p>
                        {!searchQuery && (
                            <Link to="/admin/products/new">
                                <Button className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-semibold shadow-md">
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
