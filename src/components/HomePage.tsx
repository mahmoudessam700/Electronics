import { HeroSlider } from './HeroSlider';
import { CategoryCard } from './CategoryCard';
import { ProductCarousel } from './ProductCarousel';
import { Product } from './ProductCard';
import { Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
  children?: Category[];
}

interface HomePageProps {
  onNavigate: (page: string, product?: Product, category?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetch('/api/categories?parentId=null'),
          fetch('/api/products')
        ]);

        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();

        setCategories(catsData);
        setProducts(prodsData);
      } catch (error) {
        console.error('Failed to fetch home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products for different sections
  const dealsOfTheDay = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 5);
  const recommendedProducts = products.slice(0, 10);
  const trendingProducts = products.filter(p => p.price > 1000).slice(0, 10);
  const peripherals = products.filter(p =>
    p.category?.toLowerCase().includes('mouse') ||
    p.category?.toLowerCase().includes('keyboard') ||
    p.category?.toLowerCase().includes('headphone')
  ).slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#718096]" />
          <p className="text-gray-500 font-medium">Loading your premium electronics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Slider */}
      <HeroSlider onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="max-w-[1500px] mx-auto px-4 py-8 space-y-8">

        {/* Premium Department Grid (Shows Categories & Subcategories) */}
        {categories.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-b border-gray-200 pb-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F1111]">Explore Departments</h2>
              <button
                onClick={() => onNavigate('search')}
                className="text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline transition-all"
              >
                View all categories &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Category Header with Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image || 'https://via.placeholder.com/400?text=Category'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="space-y-3 mb-6">
                      {category.children && category.children.length > 0 ? (
                        category.children.slice(0, 5).map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => onNavigate('search', undefined, sub.name)}
                            className="flex items-center gap-2 text-sm text-[#565959] hover:text-[#0F1111] hover:translate-x-1 transition-all w-full text-left font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD814]"></span>
                            {sub.name}
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">No subcategories yet</p>
                      )}
                    </div>

                    <button
                      onClick={() => onNavigate('search', undefined, category.name)}
                      className="mt-auto w-full py-2 px-4 rounded-lg bg-gray-50 text-[#007185] text-sm font-bold hover:bg-[#FFD814] hover:text-[#0F1111] border border-gray-200 hover:border-[#FFD814] transition-all"
                    >
                      Browse {category.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Deals of the Day - Premium Layout */}
        {dealsOfTheDay.length > 0 && (
          <section>
            <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD814]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F1111]">Daily Lightning Deals</h2>
                    <p className="text-sm text-gray-500 font-medium">Limited quantities. Refreshed every 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#FEF1EE] text-[#C7511F] px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  <span>Ends in 08:42:15</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {dealsOfTheDay.map((product) => (
                  <div key={product.id} className="group cursor-pointer flex flex-col" onClick={() => onNavigate('product', product)}>
                    <div className="aspect-square mb-5 overflow-hidden rounded-2xl bg-[#F7F8FA] flex items-center justify-center border border-gray-100 group-hover:border-[#FFD814] transition-all relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                        -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                      </div>
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-2xl font-black text-[#0F1111]">E£{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-400 line-through">E£{product.originalPrice?.toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#0F1111] line-clamp-2 group-hover:text-[#007185] transition-colors h-10 overflow-hidden">
                        {product.name}
                      </p>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
                        <div className="bg-red-500 h-full w-[65%] rounded-full"></div>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">65% Claimed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Product Carousels */}
        {recommendedProducts.length > 0 && (
          <ProductCarousel
            title="Recommended for you"
            products={recommendedProducts}
            onProductClick={(product) => onNavigate('product', product)}
          />
        )}

        {trendingProducts.length > 0 && (
          <ProductCarousel
            title="Premium Selection"
            products={trendingProducts}
            onProductClick={(product) => onNavigate('product', product)}
          />
        )}

        {/* Sign In Banner - Super Premium Design */}
        {!localStorage.getItem('auth_token') && (
          <section className="relative rounded-[2rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D3748] to-[#4A5568]"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD814] rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
            </div>

            <div className="relative z-10 p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-left max-w-2xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#FFD814] text-sm font-bold mb-6 backdrop-blur-md">
                  Join 10k+ Tech Enthusiasts
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                  Unlock the full power of <span className="text-[#FFD814]">Adsolutions</span>
                </h2>
                <p className="text-gray-300 text-lg md:text-xl font-medium mb-10 leading-relaxed">
                  Track orders in real-time, get personalized tech recommendations, and access VIP-only checkout experiences.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <button
                    className="w-full sm:w-auto bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] px-10 py-4 rounded-xl font-black shadow-[0_10px_40px_-10px_rgba(255,216,20,0.5)] hover:-translate-y-1 transition-all text-lg"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      // Assuming account link click triggers the modal or we use an event
                    }}
                  >
                    Get Started Free
                  </button>
                  <button
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-xl font-black backdrop-blur-md transition-all text-lg"
                    onClick={() => onNavigate('search')}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              <div className="hidden lg:block relative">
                <div className="w-80 h-80 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                  <div className="w-64 h-64 rounded-full border border-white/20 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-[#FFD814] rounded-3xl rotate-12 flex items-center justify-center shadow-2xl">
                      <span className="text-5xl font-black text-[#0F1111] -rotate-12 whitespace-nowrap">SIGN UP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {peripherals.length > 0 && (
          <ProductCarousel
            title="PC Accessories & Peripherals"
            products={peripherals}
            onProductClick={(product) => onNavigate('product', product)}
          />
        )}
      </div>
    </div>
  );
}