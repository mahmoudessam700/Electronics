import { useState, useEffect } from 'react';
import { ProductCard, Product } from './ProductCard';
import { ChevronDown, SlidersHorizontal, Star, ChevronRight, Loader2 } from 'lucide-react';
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
import { getProducts } from '../lib/api';

interface ProductListingPageProps {
  onProductClick: (product: Product) => void;
  selectedCategory?: string | null;
  onNavigate: (page: string, product?: any, category?: string) => void;
}

export function ProductListingPage({ onProductClick, selectedCategory, onNavigate }: ProductListingPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('featured');

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await getProducts({
          category: selectedCategory || undefined,
        });
        setProducts(data as Product[]);
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        // Show a generic error message for any failure
        setError('Unable to load products right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory]);

  // Filter products by price range
  const filteredByCategory = products.filter(
    p => p.price >= priceRange[0] && p.price <= priceRange[1]
  );


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
                      className={`h-4 w-4 ${i < rating ? 'fill-[#718096] text-[#718096]' : 'fill-none text-[#718096]'
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#718096]" />
                <span className="ml-2 text-[#565959]">Loading products...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : filteredByCategory.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-medium text-[#0F1111] mb-2">No products available</h3>
                <p className="text-[#565959]">
                  {products.length === 0
                    ? "There are no products in this category yet. Check back later!"
                    : "No products match your current filters. Try adjusting your filters."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredByCategory.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onProductClick(product)}
                  />
                ))}
              </div>
            )}

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