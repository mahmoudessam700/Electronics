import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Heart, Loader2, ArrowRight, Sparkles, Bell, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

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
    const [removingId, setRemovingId] = useState<string | null>(null);

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
        setRemovingId(productId);
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
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = (item: ListItem) => {
        onAddToCart(item);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-rose-100"></div>
                        <Loader2 className="h-16 w-16 animate-spin text-rose-400 absolute inset-0" />
                    </div>
                    <p className="text-gray-400 font-medium">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50">
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
                                <Heart className="h-6 w-6 text-white fill-white" />
                            </div>
                            <h1 className="text-4xl font-black text-[#0F1111] tracking-tight">Your Wishlist</h1>
                        </div>
                        <p className="text-gray-500 text-lg font-medium pl-15">Items you've saved for later</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-500 hover:text-[#0F1111]">
                            <Bell className="h-4 w-4" />
                            <span className="font-bold text-sm">Price Alerts</span>
                        </button>
                        <button className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-gray-500 hover:text-[#0F1111]">
                            <Share2 className="h-4 w-4" />
                            <span className="font-bold text-sm">Share List</span>
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                {items.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                            <p className="text-3xl font-black text-[#0F1111]">{items.length}</p>
                            <p className="text-sm text-gray-400 font-medium mt-1">Saved Items</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                            <p className="text-3xl font-black text-[#0F1111]">
                                E£{items.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400 font-medium mt-1">Total Value</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-6 shadow-lg shadow-emerald-200 text-center text-white">
                            <p className="text-3xl font-black">
                                E£{items.reduce((sum, item) => sum + ((item.originalPrice || item.price) - item.price), 0).toLocaleString()}
                            </p>
                            <p className="text-sm font-medium mt-1 opacity-90">You'll Save</p>
                        </div>
                    </div>
                )}

                {items.length > 0 ? (
                    <div className="space-y-5">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-300 group ${removingId === item.productId ? 'opacity-50 scale-98' : ''
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex flex-col md:flex-row items-stretch">
                                    {/* Product Image */}
                                    <div
                                        className="md:w-56 h-48 md:h-auto bg-gradient-to-br from-gray-50 to-white flex-shrink-0 p-6 flex items-center justify-center cursor-pointer group-hover:bg-gray-50 transition-colors"
                                        onClick={() => onNavigate('product', item)}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="max-w-full max-h-40 object-contain group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <h3
                                                    className="text-xl font-bold text-[#0F1111] group-hover:text-[#007185] cursor-pointer transition-colors line-clamp-2 flex-1"
                                                    onClick={() => onNavigate('product', item)}
                                                >
                                                    {item.name}
                                                </h3>
                                                <button
                                                    onClick={() => handleRemove(item.productId)}
                                                    disabled={removingId === item.productId}
                                                    className="p-3 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                                >
                                                    {removingId === item.productId ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 mb-2">
                                                <span className="text-3xl font-black text-[#0F1111]">E£{item.price.toLocaleString()}</span>
                                                {item.originalPrice && item.originalPrice > item.price && (
                                                    <>
                                                        <span className="text-lg text-gray-400 line-through font-medium">E£{item.originalPrice.toLocaleString()}</span>
                                                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-black">
                                                            {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <p className="text-xs text-gray-400 font-medium">
                                                Added {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 mt-6">
                                            <Button
                                                onClick={() => handleAddToCart(item)}
                                                className="flex-1 md:flex-none bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-black h-14 px-10 rounded-2xl shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
                                            >
                                                <ShoppingCart className="h-5 w-5" />
                                                Add to Cart
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => onNavigate('product', item)}
                                                className="h-14 px-8 rounded-2xl border-gray-200 hover:bg-gray-50 font-bold"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-16 md:p-24 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Heart className="h-14 w-14 text-rose-300" />
                        </div>
                        <h2 className="text-3xl font-black text-[#0F1111] mb-4">Your wishlist is empty</h2>
                        <p className="text-gray-400 max-w-md mx-auto font-medium mb-4">
                            Start adding items you love by clicking the heart icon on any product. We'll keep them safe for you here.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-rose-400 mb-10">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-bold">Get notified when your saved items go on sale!</span>
                        </div>
                        <Button
                            className="bg-[#0F1111] hover:bg-[#2D3748] text-white h-14 px-12 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
                            onClick={() => onNavigate('home')}
                        >
                            Explore Products
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
