import { Search, ShoppingCart, MapPin, Menu, ChevronDown, Laptop, Monitor, Mouse, Headphones, Keyboard, Cable, Grid3x3, HardDrive } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from './ui/sheet';
import { useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './ui/hover-card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  onNavigate: (page: string, product?: any, category?: string) => void;
  cartItemCount: number;
}

export function Header({ onNavigate, cartItemCount }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-[#4A5568] text-white">
        <div className="max-w-[1500px] mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-2 lg:h-[60px] gap-2 lg:gap-0">

            {/* Mobile Menu & Logo Group */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu */}
              <Sheet>
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
                        <p className="font-bold">Hello, {user.name || user.email}</p>
                        <Button
                          variant="ghost"
                          className="text-sm p-0 h-auto text-red-600 mt-1"
                          onClick={() => {
                            logout();
                          }}
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start font-bold"
                          onClick={() => navigate('/login')}
                        >
                          Sign In
                        </Button>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate('/')}
                      >
                        Home
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate('/search')}
                      >
                        Browse Products
                      </Button>
                    </SheetClose>
                    <Button variant="ghost" className="justify-start">
                      Account & Lists
                    </Button>
                    <Button variant="ghost" className="justify-start">
                      Returns & Orders
                    </Button>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => navigate('/cart')}
                      >
                        Cart {cartItemCount > 0 && `(${cartItemCount})`}
                      </Button>
                    </SheetClose>
                    {user?.role === 'ADMIN' && (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-blue-600 font-bold"
                          onClick={() => navigate('/admin')}
                        >
                          Admin Dashboard
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
              <span className="text-xs text-gray-300">Deliver to</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-bold">Cairo & Giza</span>
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
                  <option>All</option>
                  <option>Electronics</option>
                  <option>Books</option>
                  <option>Fashion</option>
                  <option>Home & Kitchen</option>
                </select>
                <Input
                  type="text"
                  placeholder="Search products..."
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
              <HoverCard openDelay={200} closeDelay={150}>
                <HoverCardTrigger>
                  <button
                    className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                    onClick={() => !user && navigate('/login')}
                  >
                    <span className="text-xs">Hello, {user ? (user.name || user.email) : 'sign in'}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">Account & Lists</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex flex-col gap-4">
                    {user ? (
                      <>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                          className="text-sm font-bold hover:text-red-600 text-left px-2 py-1"
                          onClick={() => {
                            logout();
                          }}
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <Button
                        className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
                        onClick={() => navigate('/login')}
                      >
                        Sign in
                      </Button>
                    )}

                    {user?.role === 'ADMIN' && (
                      <button
                        className="text-sm font-bold text-blue-600 hover:underline text-left px-2 py-1"
                        onClick={() => navigate('/admin')}
                      >
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t pt-2">
                      <button
                        className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1 w-full text-left"
                        onClick={() => navigate('/account')}
                      >
                        Your Account
                      </button>
                      <button
                        className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1 w-full text-left"
                        onClick={() => navigate('/orders')}
                      >
                        Your Orders
                      </button>
                      <button
                        className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1 w-full text-left"
                        onClick={() => navigate('/lists')}
                      >
                        Your Lists
                      </button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <button className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white px-2 py-1" onClick={() => navigate('/orders')}>
                <span className="text-xs">Returns</span>
                <span className="text-sm font-bold">& Orders</span>
              </button>

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
                <span className="text-sm font-bold">Cart</span>
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
                  <span className="text-sm font-bold">All</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white w-[350px]">
                <SheetTitle className="sr-only">Department Menu</SheetTitle>
                <SheetDescription className="sr-only">Browse all departments and categories</SheetDescription>
                <div className="flex flex-col gap-2 mt-8">
                  <h3 className="font-bold mb-2">Shop by Department</h3>

                  {/* Electronics Label */}
                  <div className="text-[#0F1111] font-bold text-sm px-2 py-1 mt-2">
                    Electronics
                  </div>

                  {/* Electronics Subcategories */}
                  {[
                    { name: 'PCs', icon: Monitor },
                    { name: 'Laptops', icon: Laptop },
                    { name: 'Mice', icon: Mouse },
                    { name: 'Keyboards', icon: Keyboard },
                    { name: 'Headphones', icon: Headphones },
                    { name: 'Cables', icon: Cable },
                    { name: 'Mouse Pads', icon: Grid3x3 },
                    { name: 'Hard Drives', icon: HardDrive }
                  ].map((category) => (
                    <SheetClose asChild key={category.name}>
                      <button
                        onClick={() => {
                          onNavigate('search', undefined, category.name); // Using onNavigate via prop for complex state logic if needed, or navigate directly? 
                          // App.tsx handleNavigate does specific logic 'if page===search setSelectedCategory...'. 
                          // It's better to navigate to /search?category=... but simpler to just call onNavigate for now to trigger App.tsx logic if we pass it down.
                          // But I am rewriting Header to use navigate directly... 
                          // I should probably manually trigger the navigation to URL.
                          // But 'setSelectedCategory' state in App.tsx is used by ProductListingPage.
                          // If I navigate to /search, the state is cleared/defaulted in App.tsx unless I pass state.
                          // App.tsx: 
                          // } else if (page === 'search') {
                          //    if (category !== undefined) setSelectedCategory(category); ... navigate('/search')

                          // So if I call navigate('/search'), selectedCategory is not updated in App.tsx state!
                          // This means I MUST call onNavigate prop if I want to update App's state.
                          onNavigate('search', undefined, category.name);
                        }}
                        className="text-left pl-6 pr-2 py-2 hover:bg-[#EAEDED] rounded text-[#0F1111] flex items-center gap-3"
                      >
                        <category.icon className="h-5 w-5 text-[#565959]" />
                        {category.name}
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
              Today's Deals
            </button>
            <button
              onClick={() => navigate('/customer-service')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Customer Service
            </button>
            <button
              onClick={() => navigate('/registry')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Registry
            </button>
            <button
              onClick={() => navigate('/gift-cards')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Gift Cards
            </button>
            <button
              onClick={() => navigate('/sell')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}