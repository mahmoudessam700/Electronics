import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { Product } from './components/ProductCard';
import { toast, Toaster } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { allProducts as products } from './data/products';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavigate = (page: string, product?: Product, category?: string | null) => {
    if (page === 'product' && product) {
      setSelectedProduct(product);
      navigate(`/product/${product.id}`);
    } else if (page === 'search') {
      if (category !== undefined) {
        setSelectedCategory(category);
      } else {
        setSelectedCategory(null);
      }
      navigate('/search');
    } else if (page === 'home') {
      navigate('/');
    } else if (page === 'signin') {
      navigate('/login');
    } else if (page === 'signup') {
      navigate('/signup');
    } else {
      navigate(`/${page}`);
    }
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
            onClick: () => navigate('/cart'),
          },
        });
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const handleBuyNow = (product: Product, quantity: number) => {
    handleAddToCart(product, quantity);
    navigate('/checkout');
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
    navigate('/confirmation');
    setTimeout(() => {
      setCartItems([]);
    }, 2000);
  };

  const ProductDetailWrapper = () => {
    if (selectedProduct) {
      return (
        <ProductDetailPage
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      );
    }
    return <Navigate to="/" replace />;
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      {!isAuthPage && !isAdminPage && <Header onNavigate={handleNavigate} cartItemCount={cartItemCount} />}

      <Routes>
        <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/search" element={
          <ProductListingPage
            onProductClick={(product) => handleNavigate('product', product)}
            selectedCategory={selectedCategory}
            onNavigate={handleNavigate}
          />
        } />
        <Route path="/product/:id" element={<ProductDetailWrapper />} />
        <Route path="/cart" element={
          <ShoppingCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onNavigate={handleNavigate}
          />
        } />
        <Route path="/checkout" element={
          <CheckoutPage
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={handleNavigate}
          />
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>

        <Route path="/customer-service" element={<CustomerServicePage onNavigate={handleNavigate} />} />
        <Route path="/registry" element={<RegistryPage onNavigate={handleNavigate} />} />
        <Route path="/gift-cards" element={<GiftCardsPage onNavigate={handleNavigate} />} />
        <Route path="/sell" element={<SellPage onNavigate={handleNavigate} />} />
        <Route path="/orders" element={<OrdersPage onNavigate={handleNavigate} />} />
        <Route path="/confirmation" element={
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
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[#A0AEC0] hover:bg-[#718096] text-[#0F1111] rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="px-6 py-3 border border-[#D5D9D9] hover:bg-[#EAEDED] text-[#0F1111] rounded-lg transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAuthPage && !isAdminPage && (
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
      )}

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}