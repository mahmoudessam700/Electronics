import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Heart, Loader2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';

interface ListItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    createdAt: string;
}

interface ListsPageProps {
    onNavigate: (page: string, product?: any) => void;
    onAddToCart: (product: any) => void;
}

export function ListsPage({ onNavigate, onAddToCart }: ListsPageProps) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<ListItem[]>([]);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const res = await fetch('/api/wishlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Failed to fetch lists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        try {
            const res = await fetch(`/api/wishlist?productId=${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setItems(items.filter(item => item.productId !== productId));
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#718096]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EAEDED] py-10 px-4">
            <div className="max-w-[1000px] mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F1111] mb-2">Your Lists</h1>
                        <p className="text-[#565959]">Manage your shopping wishlists</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        <span className="font-bold text-[#0F1111]">{items.length} Items</span>
                    </div>
                </div>

                {items.length > 0 ? (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <Card key={item.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                                        {/* Product Image */}
                                        <div
                                            className="w-32 h-32 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer p-4 group-hover:scale-105 transition-transform"
                                            onClick={() => onNavigate('product', item)}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 space-y-2 text-center sm:text-left">
                                            <h3
                                                className="text-lg font-bold text-[#0F1111] hover:text-[#007185] cursor-pointer line-clamp-2"
                                                onClick={() => onNavigate('product', item)}
                                            >
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                                <span className="text-2xl font-black text-[#0F1111]">E£{item.price.toLocaleString()}</span>
                                                {item.originalPrice && (
                                                    <span className="text-sm text-gray-400 line-through">E£{item.originalPrice.toLocaleString()}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">Added on {new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                                            <Button
                                                onClick={() => onAddToCart(item)}
                                                className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold h-11 px-8 rounded-xl flex items-center gap-2"
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                                Add to Cart
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 sm:flex-none border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all rounded-xl h-11"
                                                    onClick={() => handleRemove(item.productId)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 sm:flex-none border-gray-200 hover:bg-gray-50 rounded-xl h-11"
                                                    onClick={() => onNavigate('product', item)}
                                                >
                                                    View Product
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <Heart className="h-10 w-10 text-gray-300" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-[#0F1111]">Your list is empty</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Save items you love and they'll show up here. You can even get notified when they go on sale!
                            </p>
                        </div>
                        <Button
                            className="bg-[#0F1111] hover:bg-[#2D3748] text-white h-12 px-10 rounded-xl font-bold flex items-center gap-2 mx-auto"
                            onClick={() => onNavigate('home')}
                        >
                            Start Exploring
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
