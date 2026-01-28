import { Search, ShoppingCart, Bell, MapPin, Menu, ChevronDown, Laptop, Monitor, Mouse, Headphones, Keyboard, Cable, Grid3x3, HardDrive, LogIn, UserPlus, User, Package, List, Settings, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from './ui/sheet';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './ui/hover-card';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from './auth/AuthModal';

interface HeaderProps {
  onNavigate: (page: string, product?: any, category?: string) => void;
  cartItemCount: number;
}

export function Header({ onNavigate, cartItemCount }: HeaderProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isHoverCardOpen, setIsHoverCardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleSignInClick = () => {
    setAuthView('signin');
    setIsHoverCardOpen(false);
    setIsMobileMenuOpen(false);
    // Small delay to let the sheet close first
    setTimeout(() => setIsAuthModalOpen(true), 100);
  };

  const handleSignUpClick = () => {
    setAuthView('signup');
    setIsHoverCardOpen(false);
    setIsMobileMenuOpen(false);
    // Small delay to let the sheet close first
    setTimeout(() => setIsAuthModalOpen(true), 100);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#4A5568] text-white">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-2 lg:h-[60px] gap-2 lg:gap-0">

            {/* Mobile Menu & Logo Group */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden text-white p-2 hover:outline hover:outline-1 hover:outline-white">
                    <Menu className="h-6 w-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white w-[300px]">
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  <SheetDescription className="sr-only">Navigate to different sections of the site</SheetDescription>
                  <div className="flex flex-col gap-4 mt-8">
                    {user ? (
                      <div className="px-4 py-2 bg-gray-100 rounded mb-2">
                        <p className="font-bold">{t('header.hello')}, {user.name || user.email}</p>
                        <Button
                          variant="ghost"
                          className="text-sm p-0 h-auto text-red-600 mt-1"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          {t('header.signOut')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 px-4 py-2">
                        <Button
                          className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] w-full font-bold"
                          onClick={handleSignInClick}
                        >
                          {t('header.signIn')}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleSignUpClick}
                        >
                          {t('header.createAccount')}
                        </Button>
                      </div>
                    )}
                    {/* Mobile Language Toggle */}
                    <div className="px-4 py-2 border-b mb-2">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={toggleLanguage}
                      >
                        <Globe className="h-4 w-4" />
                        {language === 'en' ? 'العربية' : 'English'}
                      </Button>
                    </div>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate('/')}
                      >
                        {t('header.home')}
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate('/search')}
                      >
                        {t('header.browseProducts')}
                      </Button>
                    </SheetClose>
                    <Button variant="ghost" className="justify-start">
                      {t('header.accountAndLists')}
                    </Button>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate('/cart')}
                      >
                        {t('header.cart')} {cartItemCount > 0 && `(${cartItemCount})`}
                      </Button>
                    </SheetClose>
                    {user?.role === 'ADMIN' && (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-blue-600 font-bold"
                          onClick={() => navigate('/admin')}
                        >
                          {t('header.adminDashboard')}
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white px-2 py-1"
              >
                <div className="text-xl lg:text-2xl font-bold">
                  <span className="text-white">Adsolutions</span>
                </div>
              </button>
            </div>

            {/* Deliver to */}
            <div className="hidden lg:flex flex-col items-start px-2 py-1">
              <span className="text-xs text-gray-300">{t('header.deliverTo')}</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-bold">{t('header.location')}</span>
              </div>
            </div>

            {/* Mobile Cart Icon (Visible on small screens) */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 hover:outline hover:outline-1 hover:outline-white px-2 py-1 relative"
              >
                <div className="relative">
                  <ShoppingCart className="h-7 w-7" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#718096] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* Search Bar - Full width on mobile */}
            <div className="flex-1 w-full lg:w-auto lg:max-w-[800px] order-last lg:order-none mx-0 lg:mx-4">
              <div className="flex items-center">
                <select className="hidden sm:block h-10 px-2 bg-[#F3F3F3] border-none rounded-l-md text-[#0F1111] text-sm focus:outline-none focus:ring-2 focus:ring-[#718096]">
                  <option>{t('header.all')}</option>
                  <option>{t('category.books')}</option>
                  <option>{t('category.fashion')}</option>
                  <option>{t('category.homeKitchen')}</option>
                </select>
                <Input
                  type="text"
                  placeholder={t('header.searchPlaceholder')}
                  className="h-10 flex-1 rounded-md sm:rounded-none sm:rounded-r-none border-none focus-visible:ring-0"
                />
                <Button
                  onClick={() => navigate('/search')}
                  className="h-10 bg-[#718096] hover:bg-[#4A5568] text-white rounded-md rounded-l-none px-4 ml-[-4px] z-10"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Account & Orders (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <HoverCard open={isHoverCardOpen} onOpenChange={setIsHoverCardOpen} openDelay={200} closeDelay={150}>
                <HoverCardTrigger asChild>
                  {user ? (
                    <button
                      className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                      onClick={() => navigate('/account')}
                    >
                      <span className="text-xs">{t('header.hello')}, {user.name || user.email}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">{t('header.accountAndLists')}</span>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </button>
                  ) : (
                    <button className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white px-2 py-1 text-left">
                      <span className="text-xs">{t('header.hello')}, {t('header.signIn')}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">{t('header.accountAndLists')}</span>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </button>
                  )}
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-0 border-0 shadow-2xl rounded-xl overflow-hidden">
                  <div className="flex flex-col bg-white">
                    {/* Header/Greeting */}
                    <div className="p-4 bg-gray-50 border-b">
                      {user ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#FFD814] flex items-center justify-center font-bold text-[#0F1111]">
                            {user.name?.[0].toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0F1111]">{user.name}</span>
                            <span className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] w-full h-10 shadow-sm font-bold flex items-center justify-center gap-2"
                            onClick={handleSignInClick}
                          >
                            <LogIn className="h-4 w-4" />
                            {t('header.signIn')}
                          </Button>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-2">{t('header.newCustomer')}</p>
                            <Button
                              variant="outline"
                              className="w-full h-10 border-gray-300 hover:bg-gray-50 text-[#0F1111] font-bold flex items-center justify-center gap-2 transition-all"
                              onClick={handleSignUpClick}
                            >
                              <UserPlus className="h-4 w-4" />
                              {t('header.createNewAccount')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Links */}
                    <div className="p-2 space-y-1">
                      {user?.role === 'ADMIN' && (
                        <button
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => {
                            navigate('/admin');
                            setIsHoverCardOpen(false);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          {t('header.adminDashboard')}
                        </button>
                      )}

                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">
                        {t('header.yourAccount')}
                      </div>

                      {[
                        { label: t('header.yourAccount'), icon: User, path: '/account' },
                        { label: t('header.yourOrders'), icon: Package, path: '/orders' },
                        { label: t('header.yourLists'), icon: List, path: '/lists' }
                      ].map((item) => (
                        <button
                          key={item.path}
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                          onClick={() => {
                            navigate(item.path);
                            setIsHoverCardOpen(false);
                          }}
                        >
                          <item.icon className="h-4 w-4 text-gray-400 group-hover:text-[#0F1111]" />
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Footer */}
                    {user && (
                      <div className="p-2 border-t mt-1">
                        <button
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => {
                            logout();
                            setIsHoverCardOpen(false);
                          }}
                        >
                          <LogIn className="h-4 w-4 rotate-180" />
                          {t('header.signOut')}
                        </button>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* Notification Bell */}
              <button
                className="flex flex-col items-center hover:outline hover:outline-1 hover:outline-white px-2 py-1 relative"
                onClick={() => navigate('/notifications')}
              >
                <div className="relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </div>
                <span className="text-xs font-bold">{t('header.alerts')}</span>
              </button>

              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex flex-col items-center hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
              >
                <Globe className="h-6 w-6" />
                <span className="text-xs font-bold">{language === 'en' ? 'عربي' : 'EN'}</span>
              </button>

              {/* Auth Modal - controlled separately */}
              <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={setIsAuthModalOpen}
                defaultView={authView}
              />

              <button
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 hover:outline hover:outline-1 hover:outline-white px-2 py-1 relative"
              >
                <div className="relative">
                  <ShoppingCart className="h-8 w-8" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#718096] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold">{t('header.cart')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Bar */}
      <div className="bg-[#2D3748] text-white">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex items-center gap-4 h-10 overflow-x-auto">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap">
                  <Menu className="h-4 w-4" />
                  <span className="text-sm font-bold">{t('header.all')}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white w-[350px]">
                <SheetTitle className="sr-only">Department Menu</SheetTitle>
                <SheetDescription className="sr-only">Browse all departments and categories</SheetDescription>
                <div className="flex flex-col gap-2 mt-8">
                  <h3 className="font-bold mb-2">{t('header.departments')}</h3>

                  {/* Electronics Subcategories */}
                  {[
                    { name: 'PCs', translationKey: 'category.pcs', icon: Monitor },
                    { name: 'Laptops', translationKey: 'category.laptops', icon: Laptop },
                    { name: 'Mice', translationKey: 'category.mice', icon: Mouse },
                    { name: 'Keyboards', translationKey: 'category.keyboards', icon: Keyboard },
                    { name: 'Headphones', translationKey: 'category.headphones', icon: Headphones },
                    { name: 'Cables', translationKey: 'category.cables', icon: Cable },
                    { name: 'Mouse Pads', translationKey: 'category.mousePads', icon: Grid3x3 },
                    { name: 'Hard Drives', translationKey: 'category.hardDrives', icon: HardDrive }
                  ].map((category) => (
                    <SheetClose asChild key={category.name}>
                      <button
                        onClick={() => {
                          onNavigate('search', undefined, category.name);
                        }}
                        className="text-left pl-6 pr-2 py-2 hover:bg-[#EAEDED] rounded text-[#0F1111] flex items-center gap-3"
                      >
                        <category.icon className="h-5 w-5 text-[#565959]" />
                        {t(category.translationKey)}
                      </button>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <button
              onClick={() => navigate('/search')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              {t('header.todaysDeals')}
            </button>
            <button
              onClick={() => navigate('/customer-service')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              {t('header.customerService')}
            </button>
            <button
              onClick={() => navigate('/registry')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              {t('header.registry')}
            </button>
            <button
              onClick={() => navigate('/gift-cards')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              {t('header.giftCards')}
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              {t('header.sell')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}