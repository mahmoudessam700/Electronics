import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <Link to="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left">
                            <th className="p-4 font-medium text-gray-500">Image</th>
                            <th className="p-4 font-medium text-gray-500">Name</th>
                            <th className="p-4 font-medium text-gray-500">Category</th>
                            <th className="p-4 font-medium text-gray-500">Supplier</th>
                            <th className="p-4 font-medium text-gray-500">Price</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-right text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="p-4">
                                    <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded" />
                                </td>
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4 text-gray-500">
                                    {product.parentCategoryName ? (
                                        <span>
                                            {product.parentCategoryName}{' '}
                                            <span className="text-gray-300 mx-1">/</span>{' '}
                                            <span className="text-gray-600 font-medium">{product.subcategoryName}</span>
                                        </span>
                                    ) : (
                                        product.subcategoryName || product.category || '-'
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="text-gray-600">
                                        {product.supplierName || '-'}
                                    </span>
                                </td>
                                <td className="p-4">E£{product.price.toFixed(2)}</td>
                                <td className="p-4">
                                    {product.inStock ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            In Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            Out of Stock
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link to={`/admin/products/${product.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No products found. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
