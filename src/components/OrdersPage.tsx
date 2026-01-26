import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Loader2, ArrowRight, ChevronRight, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';

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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#718096]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0F1111] mb-2">Your Orders</h1>
          <p className="text-[#565959]">Track and manage your recent purchases</p>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm overflow-hidden">
                <div className="bg-[#F0F2F2] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b border-[#D5D9D9]">
                  <div>
                    <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider">ORDER PLACED</div>
                    <div className="font-bold text-[#0F1111]">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider">TOTAL</div>
                    <div className="font-bold text-[#0F1111]">E£{order.totalAmount.toLocaleString()}</div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider">STATUS</div>
                    <div className="font-bold text-[#0F1111] flex items-center gap-1">
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider mb-1">ORDER # {order.orderNumber}</div>
                    <button className="text-[#007185] hover:text-[#C7511F] text-xs font-bold hover:underline">
                      View details
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    {getStatusIcon(order.status)}
                    <span className="font-black text-[#0F1111] uppercase tracking-tight text-lg">
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-6 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-20 h-20 bg-white border border-gray-200 rounded-lg p-2 flex-shrink-0">
                          {item.product && (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-bold text-[#0F1111] line-clamp-1">{item.product?.name || 'Product Details'}</h3>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-sm font-bold text-[#0F1111]">E£{item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs font-bold h-8 px-4 rounded-lg"
                            onClick={() => onNavigate('search')}
                          >
                            Buy again
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center space-y-6">
            <Package className="h-16 w-16 text-gray-200 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0F1111]">You haven't placed any orders yet</h2>
              <p className="text-gray-500 max-w-xs mx-auto">When you do, you'll be able to track and manage them right here.</p>
            </div>
            <Button
              className="bg-[#0F1111] hover:bg-[#2D3748] text-white h-11 px-8 rounded-xl font-bold flex items-center gap-2 mx-auto"
              onClick={() => onNavigate('home')}
            >
              Go to Homepage
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
