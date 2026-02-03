import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { ShopProductFormModal, ShopProductFormValues } from '../../components/shop/ShopProductFormModal';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

interface ShopProduct {
    id: string;
    name: string;
    price: number;
    description?: string;
    commissionRateApplied?: number;
    commissionAmount?: number;
    displayPrice?: number;
    inStock?: boolean;
    image?: string;
    commissionRate?: number | null;
}

export function ShopProductsPage() {
    const { activeShop, token } = useAuth();
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchProducts = async () => {
        if (!activeShop) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/products?shopId=${activeShop.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok) {
                throw new Error('Failed to load products');
            }
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeShop?.id]);

    const handleCreate = () => {
        setSelectedProduct(null);
        setFormMode('create');
        setFormOpen(true);
    };

    const handleEdit = (product: ShopProduct) => {
        setSelectedProduct(product);
        setFormMode('edit');
        setFormOpen(true);
    };

    const handleDelete = async (product: ShopProduct) => {
        if (!token) {
            toast.error('Authentication required');
            return;
        }
        if (!confirm(`Delete ${product.name}? This action cannot be undone.`)) {
            return;
        }
        try {
            const res = await fetch(`/api/products?id=${product.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || 'Failed to delete product');
            }
            toast.success('Product deleted');
            setProducts((prev) => prev.filter((item) => item.id !== product.id));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Unable to delete product');
        }
    };

    const initialFormValues = useMemo<ShopProductFormValues>(() => ({
        name: selectedProduct?.name || '',
        price: selectedProduct?.price !== undefined ? selectedProduct.price.toString() : '',
        image: selectedProduct?.image || '',
        description: selectedProduct?.description || '',
        inStock: selectedProduct?.inStock ?? true,
        commissionRate: selectedProduct?.commissionRate !== undefined && selectedProduct?.commissionRate !== null
            ? selectedProduct.commissionRate.toString()
            : '',
    }), [selectedProduct]);

    const handleSubmit = async (values: ShopProductFormValues) => {
        if (!activeShop || !token) {
            toast.error('Authentication required');
            return;
        }

        if (!values.name.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (!values.price || Number(values.price) <= 0) {
            toast.error('Valid price is required');
            return;
        }
        if (!values.image.trim()) {
            toast.error('Image URL is required');
            return;
        }

        setSaving(true);

        const payload = {
            name: values.name.trim(),
            price: Number(values.price),
            image: values.image.trim(),
            description: values.description?.trim() || null,
            inStock: values.inStock,
            commissionRate: values.commissionRate ? Number(values.commissionRate) : null,
            shopId: activeShop.id,
        };

        const url = formMode === 'edit' && selectedProduct ? `/api/products?id=${selectedProduct.id}` : '/api/products';
        const method = formMode === 'edit' ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.error || 'Failed to save product');
            }

            toast.success(formMode === 'edit' ? 'Product updated' : 'Product created');
            setFormOpen(false);
            setSelectedProduct(null);
            await fetchProducts();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Unable to save product');
        } finally {
            setSaving(false);
        }
    };

    if (!activeShop) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Select a shop to view products</h2>
                <p className="text-slate-500 text-sm">Choose a shop from the selector above to manage inventory.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-semibold">Catalog</p>
                    <h1 className="text-2xl font-bold text-slate-900">Products for {activeShop.name}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchProducts}
                        className="border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                        <Plus className="h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                        <tr className="text-left text-slate-500 uppercase text-xs tracking-widest">
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Base Price</th>
                            <th className="px-4 py-3">Commission</th>
                            <th className="px-4 py-3">Display Price</th>
                            <th className="px-4 py-3">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map((product) => {
                            const basePrice = product.price ?? 0;
                            const commissionRate = product.commissionRateApplied ?? 0;
                            const commissionValue = product.commissionAmount ?? 0;
                            const displayPrice = product.displayPrice ?? basePrice;
                            return (
                                <tr key={product.id} className="hover:bg-slate-50">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        {product.image && (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-lg object-cover border"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold text-slate-900">{product.name}</p>
                                            <p className="text-xs text-slate-400">#{product.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">E£ {basePrice.toFixed(2)}</td>
                                <td className="px-4 py-4">
                                    {commissionRate.toFixed(2)}%
                                    <span className="text-xs text-slate-400 block">
                                        E£ {commissionValue.toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-4 py-4 font-semibold text-emerald-600">
                                    E£ {displayPrice.toFixed(2)}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                            product.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                        <div className="flex gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-800"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg text-red-500 hover:text-red-700"
                                                onClick={() => handleDelete(product)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            );
                        })}
                        {products.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500">
                                    No products found for this shop yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

            <ShopProductFormModal
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) {
                        setSelectedProduct(null);
                    }
                }}
                mode={formMode}
                initialValues={initialFormValues}
                onSubmit={handleSubmit}
                loading={saving}
            />
        </>
    );
}
