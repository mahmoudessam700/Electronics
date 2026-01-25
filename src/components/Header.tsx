import { Search, ShoppingCart, MapPin, Menu, ChevronDown, Laptop, Monitor, Mouse, Headphones, Keyboard, Cable, Grid3x3, HardDrive } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from './ui/sheet';
import { SheetTitle, SheetDescription } from './ui/sheet';
import { useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './ui/hover-card';

interface HeaderProps {
  onNavigate: (page: string, product?: any, category?: string) => void;
  cartItemCount?: number;
}

export function Header({ onNavigate, cartItemCount = 0 }: HeaderProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);

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
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => onNavigate('home')}
                      >
                        Home
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => onNavigate('search')}
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
                        onClick={() => onNavigate('cart')}
                      >
                        Cart {cartItemCount > 0 && `(${cartItemCount})`}
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <button
                onClick={() => onNavigate('home')}
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
                onClick={() => onNavigate('cart')}
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
                  onClick={() => onNavigate('search')}
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
                  <button className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white px-2 py-1">
                    <span className="text-xs">Hello, {isSignedIn ? 'User' : 'sign in'}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold">Account & Lists</span>
                      <ChevronDown className="h-3 w-3" />
                    </div>
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex flex-col gap-4">
                    <button
                      className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                      onClick={() => setIsSignedIn(!isSignedIn)}
                    >
                      {isSignedIn ? 'Sign Out' : 'Sign In'}
                    </button>
                    <button
                      className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                      onClick={() => onNavigate('account')}
                    >
                      Your Account
                    </button>
                    <button
                      className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                      onClick={() => onNavigate('orders')}
                    >
                      Your Orders
                    </button>
                    <button
                      className="text-sm font-bold hover:outline hover:outline-1 hover:outline-white px-2 py-1"
                      onClick={() => onNavigate('lists')}
                    >
                      Your Lists
                    </button>
                  </div>
                </HoverCardContent>
              </HoverCard>

              <button className="flex flex-col items-start hover:outline hover:outline-1 hover:outline-white px-2 py-1" onClick={() => onNavigate('orders')}>
                <span className="text-xs">Returns</span>
                <span className="text-sm font-bold">& Orders</span>
              </button>

              <button
                onClick={() => onNavigate('cart')}
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
                        onClick={() => onNavigate('search', undefined, category.name)}
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
              onClick={() => onNavigate('search')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Today's Deals
            </button>
            <button
              onClick={() => onNavigate('customer-service')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Customer Service
            </button>
            <button
              onClick={() => onNavigate('registry')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Registry
            </button>
            <button
              onClick={() => onNavigate('gift-cards')}
              className="text-sm hover:outline hover:outline-1 hover:outline-white px-2 py-1 whitespace-nowrap"
            >
              Gift Cards
            </button>
            <button
              onClick={() => onNavigate('sell')}
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