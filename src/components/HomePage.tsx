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

        {/* Categories Grid (Top Level) */}
        {categories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-[#0F1111]">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.name}
                  image={category.image || 'https://via.placeholder.com/400?text=Category'}
                  link={`/search?category=${category.name}`}
                  onClick={() => onNavigate('search', undefined, category.name)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Deals of the Day */}
        {dealsOfTheDay.length > 0 && (
          <section>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D5D9D9]">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-[#0F1111]">Deals of the Day</h2>
                <div className="flex items-center gap-2 text-[#C7511F] bg-[#FEF1EE] px-2 py-1 rounded text-xs font-bold">
                  <Clock className="h-4 w-4" />
                  <span>Limited Time Offers</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {dealsOfTheDay.map((product) => (
                  <div key={product.id} className="group cursor-pointer" onClick={() => onNavigate('product', product)}>
                    <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center border border-transparent group-hover:border-[#FFD814] transition-all relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-[#0F1111]">E£{product.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 line-through">E£{product.originalPrice?.toLocaleString()}</span>
                      </div>
                      <p className="text-sm line-clamp-2 text-[#0F1111] group-hover:text-[#007185] transition-colors leading-snug">
                        {product.name}
                      </p>
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

        {/* Sign In Banner (Only for guests) */}
        {!localStorage.getItem('auth_token') && (
          <section className="bg-white rounded-lg p-8 border border-[#D5D9D9] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="relative z-10 flex-1">
              <h2 className="text-3xl font-bold text-[#0F1111] mb-2">Join our premium community</h2>
              <p className="text-[#565959] text-lg max-w-xl">
                Get exclusive deals, real-time order tracking, and a personalized experience tailored to your needs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <button
                className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] px-10 py-3 rounded-lg font-bold shadow-sm transition-all"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  // This assumes Header will handle the modal, or we can trigger it via a custom event
                  // For now, redirect to search or show a message
                }}
              >
                Sign In Securely
              </button>
              <button
                className="bg-white hover:bg-gray-50 text-[#0F1111] border border-gray-300 px-10 py-3 rounded-lg font-bold transition-all"
                onClick={() => onNavigate('search')}
              >
                Start Browsing
              </button>
            </div>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[#EAEDED] -skew-x-12 translate-x-1/2"></div>
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