import { useState, useEffect } from 'react';
import { Heart, Trash2, Loader2, ArrowRight, Bell, Share2, Lightbulb, ShoppingCart } from 'lucide-react';
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

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 style={{ width: 48, height: 48, color: '#ffffff', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 16, fontWeight: 500 }}>Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '60px 24px 80px',
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Heart Icon with Glassmorphism */}
                <div style={{
                    width: 72,
                    height: 72,
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Heart style={{ width: 32, height: 32, color: '#ffffff', fill: '#ffffff' }} />
                </div>

                <h1 style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                    letterSpacing: '-0.02em'
                }}>
                    Your Wishlist
                </h1>
                <p style={{
                    fontSize: 18,
                    color: 'rgba(255,255,255,0.8)',
                    margin: '12px 0 0',
                    fontWeight: 400
                }}>
                    Curate your perfect collection
                </p>
            </div>

            {/* Main Content */}
            <div style={{
                maxWidth: 1280,
                margin: '-40px auto 0',
                padding: '0 24px 60px',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Content Card */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 24,
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    padding: 32,
                    minHeight: 400
                }}>
                    {/* Section Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 32,
                        flexWrap: 'wrap',
                        gap: 16
                    }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 600, color: '#18181b', margin: 0 }}>Saved Items</h2>
                            <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>
                                {items.length} {items.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 20px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e4e4e7',
                                borderRadius: 999,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#18181b',
                                transition: 'all 0.2s'
                            }}>
                                <Bell style={{ width: 16, height: 16 }} />
                                Price Alerts
                            </button>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 20px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e4e4e7',
                                borderRadius: 999,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#18181b',
                                transition: 'all 0.2s'
                            }}>
                                <Share2 style={{ width: 16, height: 16 }} />
                                Share
                            </button>
                        </div>
                    </div>

                    {items.length > 0 ? (
                        /* Product Grid - 4 columns */
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: 24
                        }}>
                            {items.map((item) => {
                                const onSale = item.originalPrice && item.originalPrice > item.price;
                                const savings = onSale ? item.originalPrice! - item.price : 0;

                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            position: 'relative',
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #f4f4f5',
                                            borderRadius: 24,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s',
                                            cursor: 'pointer'
                                        }}
                                        className="wishlist-card"
                                        onClick={() => onNavigate('product', item)}
                                    >
                                        {/* Sale Badge */}
                                        {onSale && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 12,
                                                left: 12,
                                                background: 'linear-gradient(135deg, #dc2626 0%, #e11d48 100%)',
                                                color: '#ffffff',
                                                padding: '6px 14px',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 500,
                                                zIndex: 10,
                                                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
                                            }}>
                                                On Sale
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(item.productId);
                                            }}
                                            disabled={removingId === item.productId}
                                            style={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                width: 36,
                                                height: 36,
                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                backdropFilter: 'blur(8px)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                opacity: 0,
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}
                                            className="remove-btn"
                                        >
                                            {removingId === item.productId ? (
                                                <Loader2 style={{ width: 16, height: 16, color: '#71717a', animation: 'spin 1s linear infinite' }} />
                                            ) : (
                                                <Trash2 style={{ width: 16, height: 16, color: '#71717a' }} />
                                            )}
                                        </button>

                                        {/* Image Container */}
                                        <div style={{
                                            aspectRatio: '1',
                                            background: 'linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 20,
                                            overflow: 'hidden'
                                        }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    transition: 'transform 0.5s'
                                                }}
                                                className="product-image"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div style={{ padding: 20 }}>
                                            <h3 style={{
                                                fontSize: 15,
                                                fontWeight: 500,
                                                color: '#18181b',
                                                margin: '0 0 12px',
                                                lineHeight: 1.4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {item.name}
                                            </h3>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 20, fontWeight: 600, color: '#18181b' }}>
                                                    E£{item.price.toLocaleString()}
                                                </span>
                                                {item.originalPrice && item.originalPrice > item.price && (
                                                    <span style={{ fontSize: 14, color: '#a1a1aa', textDecoration: 'line-through' }}>
                                                        E£{item.originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            {onSale && (
                                                <div style={{
                                                    marginTop: 8,
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    color: '#16a34a'
                                                }}>
                                                    Save E£{savings.toLocaleString()}
                                                </div>
                                            )}

                                            {/* Add to Cart Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddToCart(item);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    marginTop: 16,
                                                    padding: '12px 20px',
                                                    backgroundColor: '#18181b',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: 12,
                                                    cursor: 'pointer',
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 8,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <ShoppingCart style={{ width: 16, height: 16 }} />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            {/* Heart Icon */}
                            <div style={{
                                width: 120,
                                height: 120,
                                background: 'linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 32px'
                            }}>
                                <Heart style={{ width: 48, height: 48, color: '#a1a1aa' }} />
                            </div>

                            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#18181b', margin: '0 0 12px' }}>
                                Your wishlist is empty
                            </h2>
                            <p style={{ fontSize: 16, color: '#71717a', margin: '0 0 32px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                                Start adding items you love by clicking the heart icon on any product. We'll keep them safe for you here.
                            </p>

                            {/* Tip Card */}
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 12,
                                backgroundColor: '#fef9c3',
                                padding: '14px 24px',
                                borderRadius: 16,
                                marginBottom: 32
                            }}>
                                <Lightbulb style={{ width: 20, height: 20, color: '#ca8a04' }} />
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#854d0e' }}>
                                    Get notified when your saved items go on sale!
                                </span>
                            </div>

                            <div>
                                <button
                                    onClick={() => onNavigate('home')}
                                    style={{
                                        padding: '16px 32px',
                                        backgroundColor: '#18181b',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 999,
                                        cursor: 'pointer',
                                        fontSize: 16,
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 14px rgba(24, 24, 27, 0.25)'
                                    }}
                                >
                                    Explore Products
                                    <ArrowRight style={{ width: 18, height: 18 }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for hover effects */}
            <style>{`
        .wishlist-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border-color: #e4e4e7;
        }
        .wishlist-card:hover .remove-btn {
          opacity: 1;
        }
        .wishlist-card:hover .product-image {
          transform: scale(1.1);
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
