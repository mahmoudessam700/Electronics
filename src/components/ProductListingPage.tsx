import { useState } from 'react';
import { ProductCard, Product } from './ProductCard';
import { ChevronDown, SlidersHorizontal, Star, ChevronRight } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { allProducts } from '../data/products';

interface ProductListingPageProps {
  onProductClick: (product: Product) => void;
  selectedCategory?: string | null;
  onNavigate: (page: string, product?: any, category?: string) => void;
}

export function ProductListingPage({ onProductClick, selectedCategory, onNavigate }: ProductListingPageProps) {
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  // Category mapping for filtering
  const getCategoryProducts = (category: string | null | undefined) => {
    if (!category) return allProducts;
    
    const categoryLower = category.toLowerCase();
    
    // Map categories to product IDs or names
    if (categoryLower.includes('pc')) {
      return allProducts.filter(p => p.name.toLowerCase().includes('pc'));
    } else if (categoryLower.includes('laptop')) {
      return allProducts.filter(p => p.name.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('stand'));
    } else if (categoryLower.includes('mice') || categoryLower === 'mouse') {
      return allProducts.filter(p => p.id.startsWith('mouse-'));
    } else if (categoryLower.includes('keyboard')) {
      return allProducts.filter(p => p.id.startsWith('keyboard-') || p.id.startsWith('film-'));
    } else if (categoryLower.includes('headphone')) {
      return allProducts.filter(p => p.name.toLowerCase().includes('headphone'));
    } else if (categoryLower.includes('cable')) {
      return allProducts.filter(p => 
        p.id.startsWith('cable-') || 
        p.id.startsWith('splitter-') || 
        p.id.startsWith('converter-')
      );
    } else if (categoryLower.includes('mouse pad')) {
      return allProducts.filter(p => p.id.startsWith('pad-'));
    } else if (categoryLower.includes('storage') || categoryLower.includes('drive')) {
      return allProducts.filter(p => p.id.startsWith('hd-') || p.id.startsWith('adapter-'));
    }
    
    return allProducts;
  };

  const filteredByCategory = getCategoryProducts(selectedCategory);

  const brands = ['TechBrand', 'AudioPro', 'SmartGear', 'ProTech', 'EliteSound'];

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          step={10}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-[#718096]">
          <span>E£{priceRange[0]}</span>
          <span>E£{priceRange[1]}</span>
        </div>
      </div>

      <div className="border-t border-[#D5D9D9] pt-6">
        <h3 className="mb-4">Brand</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label
                htmlFor={brand}
                className="text-sm cursor-pointer hover:text-[#2D3748]"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#D5D9D9] pt-6">
        <h3 className="mb-4">Customer Rating</h3>
        <div className="space-y-3">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRatings.includes(rating)}
                onCheckedChange={() => toggleRating(rating)}
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="flex items-center gap-1 cursor-pointer hover:text-[#2D3748]"
              >
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating ? 'fill-[#718096] text-[#718096]' : 'fill-none text-[#718096]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm">& Up</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#D5D9D9] pt-6">
        <h3 className="mb-4">Prime Shipping</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="prime" />
          <Label htmlFor="prime" className="text-sm cursor-pointer hover:text-[#C7511F]">
            <div className="bg-[#007185] text-white text-xs px-2 py-0.5 rounded inline-block">
              prime
            </div>
          </Label>
        </div>
      </div>

      <div className="border-t border-[#D5D9D9] pt-6">
        <h3 className="mb-4">Delivery Day</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="tomorrow" />
            <Label htmlFor="tomorrow" className="text-sm cursor-pointer hover:text-[#2D3748]">
              Get It Tomorrow
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="two-days" />
            <Label htmlFor="two-days" className="text-sm cursor-pointer hover:text-[#C7511F]">
              Get It in 2 Days
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-[#565959] mb-4 flex items-center">
          <span 
            className="hover:text-[#C7511F] cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            Home
          </span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span 
            className="hover:text-[#C7511F] cursor-pointer"
            onClick={() => onNavigate('search', undefined, null)}
          >
            Electronics
          </span>
          {selectedCategory && (
            <>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-[#0F1111] font-medium">{selectedCategory}</span>
            </>
          )}
          {!selectedCategory && (
            <>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-[#0F1111] font-medium">All Products</span>
            </>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl mb-1">{selectedCategory || 'All Products'}</h1>
            <p className="text-sm text-[#565959]">
              {filteredByCategory.length} results
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription className="sr-only">Filter products by price, brand, rating, and more</SheetDescription>
                <div className="mt-8">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
                <SelectItem value="newest">Newest Arrivals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D5D9D9] sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredByCategory.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onProductClick(product)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="outline" className="bg-[#718096] text-white border-[#718096]">
                1
              </Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">4</Button>
              <span className="px-2">...</span>
              <Button variant="outline">10</Button>
              <Button variant="outline">Next</Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}