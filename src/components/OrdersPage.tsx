import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, Loader2, ArrowRight, Calendar, MapPin, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type OrderTab = 'all' | 'in-progress' | 'delivered';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image: string;
    price: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: 'DELIVERED' | 'PROCESSING' | 'SHIPPED' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  items: OrderItem[];
  shippingAddress: string;
}

interface OrdersPageProps {
  onNavigate: (page: string, product?: any) => void;
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderTab>('all');

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return { icon: CheckCircle, color: '#16a34a', bg: '#dcfce7', label: 'Delivered' };
      case 'SHIPPED':
        return { icon: Truck, color: '#2563eb', bg: '#dbeafe', label: 'Shipped' };
      case 'PROCESSING':
        return { icon: Clock, color: '#d97706', bg: '#fef3c7', label: 'Processing' };
      case 'CANCELLED':
        return { icon: RotateCcw, color: '#dc2626', bg: '#fee2e2', label: 'Cancelled' };
      default:
        return { icon: Package, color: '#6b7280', bg: '#f3f4f6', label: 'Pending' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    return true;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ width: 48, height: 48, color: '#ffffff', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 16, fontWeight: 500 }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', height: 256, overflow: 'hidden' }}>
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%)',
          zIndex: 10
        }} />

        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80"
          alt="Shopping"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Hero Content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: '#ffffff', padding: '0 16px' }}>
            <h1 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Your Orders
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: 400 }}>
              Track, manage, and reorder with ease
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px 64px', marginTop: -32, position: 'relative', zIndex: 30 }}>
        {/* Stats Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
          border: '1px solid #f3f4f6',
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{
              fontSize: 40,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {orders.length}
            </span>
            <span style={{ fontSize: 18, color: '#6b7280' }}>Total Orders</span>
          </div>
          <div style={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package style={{ width: 28, height: 28, color: '#ffffff' }} />
          </div>
        </div>

        {/* Orders Card with Tabs */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6',
          overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex' }}>
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'in-progress', label: 'In Progress' },
                { key: 'delivered', label: 'Delivered' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as OrderTab)}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    border: 'none',
                    background: activeTab === tab.key ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                    color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                    }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List or Empty State */}
          {filteredOrders.length > 0 ? (
            <div style={{ padding: 24 }}>
              {filteredOrders.map((order, index) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: '#fafafa',
                      border: '1px solid #f3f4f6',
                      borderRadius: 16,
                      padding: 24,
                      marginBottom: index < filteredOrders.length - 1 ? 16 : 0,
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Order Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Status Badge */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 14px',
                          backgroundColor: statusConfig.bg,
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          color: statusConfig.color
                        }}>
                          <StatusIcon style={{ width: 14, height: 14 }} />
                          {statusConfig.label}
                        </div>

                        {/* Order Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af', fontSize: 13 }}>
                          <Calendar style={{ width: 14, height: 14 }} />
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b', fontFamily: 'monospace' }}>#{order.orderNumber}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#18181b' }}>E£{order.totalAmount.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          {/* Product Image */}
                          <div style={{
                            width: 72,
                            height: 72,
                            backgroundColor: '#ffffff',
                            borderRadius: 12,
                            padding: 8,
                            border: '1px solid #f3f4f6',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {item.product && (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              />
                            )}
                          </div>

                          {/* Product Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: '#18181b',
                              margin: '0 0 4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.product?.name || 'Product'}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 13, color: '#9ca3af' }}>Qty: {item.quantity}</span>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>E£{item.price.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Buy Again Button */}
                          <button
                            onClick={() => onNavigate('search')}
                            style={{
                              padding: '8px 18px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 10,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              flexShrink: 0
                            }}
                          >
                            Buy Again
                          </button>
                        </div>
                      ))}

                      {order.items?.length > 3 && (
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div style={{
                        marginTop: 20,
                        paddingTop: 16,
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#9ca3af',
                        fontSize: 13
                      }}>
                        <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.shippingAddress}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #dbeafe 0%, #e9d5ff 100%)',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <Package style={{ width: 40, height: 40, color: '#3b82f6' }} />
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#18181b', margin: '0 0 12px' }}>
                No orders yet
              </h2>
              <p style={{ fontSize: 16, color: '#6b7280', margin: '0 0 32px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                When you place your first order, it will appear here for easy tracking and reordering.
              </p>

              <button
                onClick={() => onNavigate('home')}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 14,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.2s'
                }}
              >
                Start Shopping
                <ArrowRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
