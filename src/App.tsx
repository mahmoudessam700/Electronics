import { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ProductListingPage } from './components/ProductListingPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ShoppingCart, CartItem } from './components/ShoppingCart';
import { CheckoutPage } from './components/CheckoutPage';
import { CustomerServicePage } from './components/CustomerServicePage';
import { RegistryPage } from './components/RegistryPage';
import { GiftCardsPage } from './components/GiftCardsPage';
import { SellPage } from './components/SellPage';
import { OrdersPage } from './components/OrdersPage';
import { Product } from './components/ProductCard';
import { toast, Toaster } from 'sonner@2.0.3';
import { CheckCircle } from 'lucide-react';

type Page = 'home' | 'search' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'customer-service' | 'registry' | 'gift-cards' | 'sell' | 'orders';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavigate = (page: string, product?: Product, category?: string | null) => {
    if (page === 'product' && product) {
      setSelectedProduct(product);
      setCurrentPage('product');
    } else {
      setCurrentPage(page as Page);
      if (page === 'search') {
        if (category !== undefined) {
          setSelectedCategory(category);
        }
      } else {
        setSelectedCategory(null);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        toast.success(`Updated ${product.name} quantity in cart`, {
          duration: 3000,
        });
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success(`Added ${product.name} to cart`, {
          duration: 3000,
          action: {
            label: 'View Cart',
            onClick: () => setCurrentPage('cart'),
          },
        });
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    if (item) {
      toast.success(`Removed ${item.product.name} from cart`, {
        duration: 3000,
      });
    }
  };

  const handlePlaceOrder = () => {
    setCurrentPage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Clear cart after order
    setTimeout(() => {
      setCartItems([]);
    }, 2000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      
      case 'search':
        return (
          <ProductListingPage
            onProductClick={(product) => handleNavigate('product', product)}
            selectedCategory={selectedCategory}
            onNavigate={handleNavigate}
          />
        );
      
      case 'product':
        if (!selectedProduct) {
          setCurrentPage('home');
          return null;
        }
        return (
          <ProductDetailPage
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        );
      
      case 'cart':
        return (
          <ShoppingCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onProceedToCheckout={() => setCurrentPage('checkout')}
            onContinueShopping={() => setCurrentPage('home')}
          />
        );
      
      case 'checkout':
        return (
          <CheckoutPage
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
          />
        );
      
      case 'customer-service':
        return <CustomerServicePage onNavigate={handleNavigate} />;
      
      case 'registry':
        return <RegistryPage onNavigate={handleNavigate} />;
      
      case 'gift-cards':
        return <GiftCardsPage onNavigate={handleNavigate} />;
      
      case 'sell':
        return <SellPage onNavigate={handleNavigate} />;
      
      case 'confirmation':
        return (
          <div className="min-h-screen bg-white">
            <div className="max-w-[800px] mx-auto px-4 py-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#007600] rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl mb-4">Order Placed Successfully!</h1>
                <p className="text-lg text-[#565959] mb-2">
                  Thank you for your order!
                </p>
                <p className="text-[#565959] mb-8">
                  You will receive an email confirmation shortly.
                </p>
                
                <div className="bg-[#F7F8F8] rounded-lg p-6 mb-8 text-left">
                  <h2 className="text-xl mb-4">Order Details</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#565959]">Order Number:</span>
                      <span className="font-medium">#{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#565959]">Order Date:</span>
                      <span className="font-medium">January 25, 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#565959]">Estimated Delivery:</span>
                      <span className="font-medium">January 28 - 30, 2026</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-6 py-3 bg-[#A0AEC0] hover:bg-[#718096] text-[#0F1111] rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className="px-6 py-3 border border-[#D5D9D9] hover:bg-[#EAEDED] text-[#0F1111] rounded-lg transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'orders':
        return <OrdersPage onNavigate={handleNavigate} />;
      
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={handleNavigate} cartItemCount={cartItemCount} />
      {renderPage()}
      
      {/* Footer */}
      <footer className="bg-[#2D3748] text-white mt-12">
        <div className="max-w-[1500px] mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="mb-4">Get to Know Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press Releases</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Make Money with Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Sell on Shop</a></li>
                <li><a href="#" className="hover:underline">Become an Affiliate</a></li>
                <li><a href="#" className="hover:underline">Advertise Your Products</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Payment Products</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Shop Card</a></li>
                <li><a href="#" className="hover:underline">Shop Currency Converter</a></li>
                <li><a href="#" className="hover:underline">Gift Cards</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Let Us Help You</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:underline">Your Account</a></li>
                <li><a href="#" className="hover:underline">Returns Center</a></li>
                <li><a href="#" className="hover:underline">Help</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#4A5568] pt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-2xl font-bold">
                <span className="text-white">shop</span>
                <span className="text-[#A0AEC0]">.com</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © 2026 Shop.com, Inc. or its affiliates
            </p>
          </div>
        </div>
      </footer>
      
      <Toaster position="top-right" richColors />
    </div>
  );
}