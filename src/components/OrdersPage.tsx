import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Loader2, ArrowRight, Clock, Calendar, CreditCard, MapPin, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

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
  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'delivered'>('all');

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
        return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Delivered' };
      case 'SHIPPED':
        return { icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Shipped' };
      case 'PROCESSING':
        return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Processing' };
      case 'CANCELLED':
        return { icon: RotateCcw, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'Cancelled' };
      default:
        return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', label: 'Pending' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'DELIVERED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
            <Loader2 className="h-16 w-16 animate-spin text-[#FFD814] absolute inset-0" />
          </div>
          <p className="text-gray-400 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-[#0F1111] tracking-tight">Your Orders</h1>
            <p className="text-gray-500 text-lg font-medium">Track, manage, and reorder with ease</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
              <Package className="h-5 w-5 text-[#FFD814]" />
              <span className="font-black text-[#0F1111]">{orders.length}</span>
              <span className="text-gray-400 font-medium">Total Orders</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'processing', label: 'In Progress' },
            { key: 'delivered', label: 'Delivered' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.key
                  ? 'bg-[#0F1111] text-white shadow-lg'
                  : 'text-gray-400 hover:text-[#0F1111] hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-300 group"
                >
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${statusConfig.bg} ${statusConfig.border} border`}>
                          <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                          <span className={`font-black text-sm ${statusConfig.color}`}>{statusConfig.label}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium text-sm">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</p>
                          <p className="font-mono font-bold text-[#0F1111]">#{order.orderNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                          <p className="font-black text-xl text-[#0F1111]">E£{order.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-8">
                    <div className="space-y-6">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-6 group/item">
                          <div className="w-24 h-24 bg-gray-50 rounded-2xl p-3 flex-shrink-0 border border-gray-100 group-hover/item:scale-105 transition-transform">
                            {item.product && (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#0F1111] line-clamp-1 text-lg group-hover/item:text-[#007185] transition-colors cursor-pointer">
                              {item.product?.name || 'Product Details'}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-400 font-medium">Qty: {item.quantity}</span>
                              <span className="text-sm font-black text-[#0F1111]">E£{item.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <Button
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold h-12 px-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                            onClick={() => onNavigate('search')}
                          >
                            Buy Again
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    {order.shippingAddress && (
                      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3 text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium line-clamp-1">{order.shippingAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-16 md:p-24 text-center">
            <div className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
            <h2 className="text-3xl font-black text-[#0F1111] mb-4">No orders yet</h2>
            <p className="text-gray-400 max-w-sm mx-auto font-medium mb-10">
              When you place your first order, it will appear here for easy tracking and reordering.
            </p>
            <Button
              className="bg-[#0F1111] hover:bg-[#2D3748] text-white h-14 px-12 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
              onClick={() => onNavigate('home')}
            >
              Start Shopping
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
