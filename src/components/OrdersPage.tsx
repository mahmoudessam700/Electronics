import { Package, Truck, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { allProducts } from '../data/products';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'delivered' | 'in-transit' | 'processing';
  items: {
    product: typeof allProducts[0];
    quantity: number;
    price: number;
  }[];
  deliveryDate?: string;
}

// Mock order data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: '403-8234567-1234567',
    date: 'January 20, 2026',
    total: 15499,
    status: 'delivered',
    deliveryDate: 'January 23, 2026',
    items: [
      {
        product: allProducts[0],
        quantity: 1,
        price: 15499
      }
    ]
  },
  {
    id: '2',
    orderNumber: '403-8234567-7654321',
    date: 'January 18, 2026',
    total: 3198,
    status: 'in-transit',
    deliveryDate: 'January 27, 2026',
    items: [
      {
        product: allProducts[10],
        quantity: 2,
        price: 1599
      }
    ]
  },
  {
    id: '3',
    orderNumber: '403-8234567-9876543',
    date: 'January 15, 2026',
    total: 8497,
    status: 'delivered',
    deliveryDate: 'January 18, 2026',
    items: [
      {
        product: allProducts[5],
        quantity: 1,
        price: 8497
      }
    ]
  }
];

interface OrdersPageProps {
  onNavigate: (page: string, product?: any) => void;
}

export function OrdersPage({ onNavigate }: OrdersPageProps) {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-transit':
        return <Truck className="h-5 w-5 text-[#718096]" />;
      case 'processing':
        return <Package className="h-5 w-5 text-[#718096]" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in-transit':
        return 'In Transit';
      case 'processing':
        return 'Processing';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600';
      case 'in-transit':
        return 'text-[#718096]';
      case 'processing':
        return 'text-[#718096]';
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Your Orders</h1>
          <p className="text-[#565959]">View, track, and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-[#D5D9D9] mb-6">
          <div className="flex gap-4 p-4 border-b border-[#D5D9D9] overflow-x-auto">
            <button className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-[#718096] text-[#0F1111] font-medium">
              All Orders
            </button>
            <button className="px-4 py-2 text-sm whitespace-nowrap text-[#565959] hover:text-[#0F1111]">
              Not Yet Shipped
            </button>
            <button className="px-4 py-2 text-sm whitespace-nowrap text-[#565959] hover:text-[#0F1111]">
              Cancelled Orders
            </button>
            <button className="px-4 py-2 text-sm whitespace-nowrap text-[#565959] hover:text-[#0F1111]">
              Returns & Refunds
            </button>
          </div>

          {/* Search Orders */}
          <div className="p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search all orders"
                className="flex-1 px-3 py-2 border border-[#888C8C] rounded-md focus:outline-none focus:ring-2 focus:ring-[#718096]"
              />
              <Button className="bg-[#718096] hover:bg-[#4A5568] text-white px-6">
                Search Orders
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-[#D5D9D9] overflow-hidden">
              {/* Order Header */}
              <div className="bg-[#F0F2F2] px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b border-[#D5D9D9]">
                <div>
                  <div className="text-xs text-[#565959]">ORDER PLACED</div>
                  <div className="text-[#0F1111]">{order.date}</div>
                </div>
                <div>
                  <div className="text-xs text-[#565959]">TOTAL</div>
                  <div className="text-[#0F1111]">E£{order.total.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-[#565959]">SHIP TO</div>
                  <div className="text-[#2D3748] hover:text-[#C7511F] cursor-pointer flex items-center gap-1">
                    Cairo & Giza
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#565959] mb-1">ORDER # {order.orderNumber}</div>
                  <div className="flex gap-3 justify-end">
                    <button className="text-[#2D3748] hover:text-[#C7511F] text-xs">
                      View order details
                    </button>
                    <button className="text-[#2D3748] hover:text-[#C7511F] text-xs">
                      Invoice
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className={`font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                      {order.deliveryDate && ` ${order.status === 'delivered' ? 'on' : 'by'} ${order.deliveryDate}`}
                    </div>
                    {order.status === 'in-transit' && (
                      <button className="text-[#2D3748] hover:text-[#C7511F] text-sm">
                        Track package
                      </button>
                    )}
                  </div>
                </div>

                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 mb-4">
                    <div 
                      className="w-24 h-24 flex-shrink-0 bg-white border border-[#D5D9D9] rounded cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onNavigate('product', item.product)}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-[#2D3748] hover:text-[#C7511F] cursor-pointer mb-1"
                        onClick={() => onNavigate('product', item.product)}
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-[#565959] mb-2">Quantity: {item.quantity}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#D5D9D9] text-[#0F1111] hover:bg-[#F7FAFA]"
                          onClick={() => onNavigate('product', item.product)}
                        >
                          Buy it again
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#D5D9D9] text-[#0F1111] hover:bg-[#F7FAFA]"
                        >
                          View your item
                        </Button>
                        {order.status === 'delivered' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[#D5D9D9] text-[#0F1111] hover:bg-[#F7FAFA]"
                            >
                              Write a product review
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[#D5D9D9] text-[#0F1111] hover:bg-[#F7FAFA]"
                            >
                              Return or replace items
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Archive Order */}
                <div className="pt-4 border-t border-[#D5D9D9]">
                  <button className="text-[#2D3748] hover:text-[#C7511F] text-sm flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Archive order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for when no orders */}
        {mockOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-[#D5D9D9] p-12 text-center">
            <Package className="h-16 w-16 text-[#D5D9D9] mx-auto mb-4" />
            <h2 className="text-2xl mb-2">No orders yet</h2>
            <p className="text-[#565959] mb-6">Looks like you haven't placed any orders.</p>
            <Button 
              className="bg-[#718096] hover:bg-[#4A5568] text-white"
              onClick={() => onNavigate('home')}
            >
              Start Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
