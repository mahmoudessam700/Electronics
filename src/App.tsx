import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ProductListingPage } from './components/ProductListingPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ShoppingCart } from './components/ShoppingCart';
import { CheckoutPage } from './components/CheckoutPage';
import { CustomerServicePage } from './components/CustomerServicePage';
import { RegistryPage } from './components/RegistryPage';
import { GiftCardsPage } from './components/GiftCardsPage';
import { SellPage } from './components/SellPage';
import { OrdersPage } from './components/OrdersPage';
import { AccountPage } from './components/AccountPage';
import { ListsPage } from './components/ListsPage';
import { AboutUsPage } from './components/AboutUsPage';
import { CareersPage } from './components/CareersPage';
import { PressReleasesPage } from './components/PressReleasesPage';
import { AffiliatePage } from './components/AffiliatePage';
import { AdvertisePage } from './components/AdvertisePage';
import { ShopCardPage } from './components/ShopCardPage';
import { CurrencyConverterPage } from './components/CurrencyConverterPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminFilesPage } from './pages/admin/AdminFilesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSuppliersPage } from './pages/admin/AdminSuppliersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminFinancialPage } from './pages/admin/AdminFinancialPage';
import { AdminHomePageSettings } from './pages/admin/AdminHomePageSettings';
import { AdminPageContentSettings } from './pages/admin/AdminPageContentSettings';
import { Product } from './components/ProductCard';
import { toast, Toaster } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

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
  const { user, cartItems, addToCart, updateCartQuantity, removeFromCart, clearCart } = useAuth();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/settings?type=homepage&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch settings in App:', error);
      }
    };
    fetchSettings();
  }, []);

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

  const handleAddToCart = async (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    await addToCart(product, quantity);
    
    if (existingItem) {
      toast.success(`Updated ${product.name} quantity in cart`, {
        duration: 3000,
      });
    } else {
      toast.success(`Added ${product.name} to cart`, {
        duration: 3000,
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart'),
        },
      });
    }
  };

  const handleBuyNow = async (product: Product, quantity: number) => {
    await handleAddToCart(product, quantity);
    // Require login for checkout
    if (!user) {
      localStorage.setItem('checkout_redirect', 'true');
      toast.info('Please sign in to continue checkout', { duration: 3000 });
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    await updateCartQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    await removeFromCart(productId);
    if (item) {
      toast.success(`Removed ${item.product.name} from cart`, {
        duration: 3000,
      });
    }
  };

  const handlePlaceOrder = async () => {
    navigate('/confirmation');
    setTimeout(async () => {
      await clearCart();
    }, 2000);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      localStorage.setItem('checkout_redirect', 'true');
      toast.info('Please sign in to continue checkout', { duration: 3000 });
      navigate('/login');
    } else {
      navigate('/checkout');
    }
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

  const isFooterLinkVisible = (id: string) => {
    if (!settings || !settings.sections) return true;
    const section = settings.sections.find((s: any) => s.id === id);
    return section ? section.isEnabled : true;
  };

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
            onContinueShopping={() => handleNavigate('home')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        } />
        <Route path="/checkout" element={
          <CheckoutPage
            cartItems={cartItems}
            onPlaceOrder={handlePlaceOrder}
          />
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id" element={<AdminProductFormPage />} />
          <Route path="suppliers" element={<AdminSuppliersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="financial" element={<AdminFinancialPage />} />
          <Route path="homepage" element={<AdminHomePageSettings />} />
          <Route path="pages" element={<AdminPageContentSettings />} />
          <Route path="files" element={<AdminFilesPage />} />
        </Route>

        <Route path="/customer-service" element={<CustomerServicePage onNavigate={handleNavigate} />} />
        <Route path="/registry" element={<RegistryPage onNavigate={handleNavigate} />} />
        <Route path="/gift-cards" element={<GiftCardsPage onNavigate={handleNavigate} />} />
        <Route path="/sell" element={<SellPage onNavigate={handleNavigate} />} />
        <Route path="/orders" element={<OrdersPage onNavigate={handleNavigate} />} />
        <Route path="/account" element={<AccountPage onNavigate={handleNavigate} />} />
        <Route path="/lists" element={<ListsPage onNavigate={handleNavigate} onAddToCart={handleAddToCart} />} />
        <Route path="/about-us" element={<AboutUsPage onNavigate={handleNavigate} />} />
        <Route path="/careers" element={<CareersPage onNavigate={handleNavigate} />} />
        <Route path="/press" element={<PressReleasesPage onNavigate={handleNavigate} />} />
        <Route path="/affiliate" element={<AffiliatePage onNavigate={handleNavigate} />} />
        <Route path="/advertise" element={<AdvertisePage onNavigate={handleNavigate} />} />
        <Route path="/shop-card" element={<ShopCardPage onNavigate={handleNavigate} />} />
        <Route path="/currency-converter" element={<CurrencyConverterPage onNavigate={handleNavigate} />} />
        <Route path="/confirmation" element={
          <div className="min-h-screen bg-white">
            <div className="max-w-[800px] mx-auto px-4 py-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#007600] rounded-full flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl mb-4">{t('confirmation.orderPlaced')}</h1>
                <p className="text-lg text-[#565959] mb-2">
                  {t('confirmation.thankYou')}
                </p>
                <p className="text-[#565959] mb-8">
                  {t('confirmation.emailConfirmation')}
                </p>

                <div className="bg-[#F7F8F8] rounded-lg p-6 mb-8 text-left">
                  <h2 className="text-xl mb-4">{t('confirmation.orderDetails')}</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#565959]">{t('confirmation.orderNumber')}:</span>
                      <span className="font-medium">#{Math.floor(Math.random() * 1000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#565959]">{t('confirmation.orderDate')}:</span>
                      <span className="font-medium">January 25, 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#565959]">{t('confirmation.estimatedDelivery')}:</span>
                      <span className="font-medium">January 28 - 30, 2026</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[#A0AEC0] hover:bg-[#718096] text-[#0F1111] rounded-lg transition-colors"
                  >
                    {t('cart.continueShopping')}
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="px-6 py-3 border border-[#D5D9D9] hover:bg-[#EAEDED] text-[#0F1111] rounded-lg transition-colors"
                  >
                    {t('confirmation.viewOrders')}
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
                <h3 className="mb-4">{t('footer.getToKnowUs')}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {isFooterLinkVisible('footer-about-us') && <li><button onClick={() => handleNavigate('about-us')} className="hover:underline">{t('footer.aboutUs')}</button></li>}
                  {isFooterLinkVisible('footer-careers') && <li><button onClick={() => handleNavigate('careers')} className="hover:underline">{t('footer.careers')}</button></li>}
                  {isFooterLinkVisible('footer-press') && <li><button onClick={() => handleNavigate('press')} className="hover:underline">{t('footer.pressReleases')}</button></li>}
                </ul>
              </div>
              <div>
                <h3 className="mb-4">{t('footer.makeMoneyWithUs')}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {isFooterLinkVisible('footer-sell') && <li><button onClick={() => handleNavigate('sell')} className="hover:underline">{t('footer.sellOnShop')}</button></li>}
                  {isFooterLinkVisible('footer-affiliate') && <li><button onClick={() => handleNavigate('affiliate')} className="hover:underline">{t('footer.becomeAffiliate')}</button></li>}
                  {isFooterLinkVisible('footer-advertise') && <li><button onClick={() => handleNavigate('advertise')} className="hover:underline">{t('footer.advertiseProducts')}</button></li>}
                </ul>
              </div>
              <div>
                <h3 className="mb-4">{t('footer.paymentProducts')}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {isFooterLinkVisible('footer-shop-card') && <li><button onClick={() => handleNavigate('shop-card')} className="hover:underline">{t('footer.shopCard')}</button></li>}
                  {isFooterLinkVisible('footer-currency') && <li><button onClick={() => handleNavigate('currency-converter')} className="hover:underline">{t('footer.currencyConverter')}</button></li>}
                  {isFooterLinkVisible('footer-gift-cards') && <li><button onClick={() => handleNavigate('gift-cards')} className="hover:underline">{t('header.giftCards')}</button></li>}
                </ul>
              </div>
              <div>
                <h3 className="mb-4">{t('footer.letUsHelpYou')}</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  {isFooterLinkVisible('footer-account') && <li><button onClick={() => handleNavigate('account')} className="hover:underline">{t('header.yourAccount')}</button></li>}
                  {isFooterLinkVisible('footer-orders') && <li><button onClick={() => handleNavigate('orders')} className="hover:underline">{t('footer.returnsCenter')}</button></li>}
                  {isFooterLinkVisible('footer-help') && <li><button onClick={() => handleNavigate('customer-service')} className="hover:underline">{t('footer.help')}</button></li>}
                </ul>
              </div>
            </div>

            <div className="border-t border-[#4A5568] pt-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="text-2xl font-bold">
                  <span className="text-white">Adsolutions</span>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                {t('footer.copyright')}
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
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}