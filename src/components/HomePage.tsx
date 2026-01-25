import { HeroSlider } from './HeroSlider';
import { CategoryCard } from './CategoryCard';
import { ProductCarousel } from './ProductCarousel';
import { Product } from './ProductCard';
import { Clock } from 'lucide-react';
import { allProducts } from '../data/products';

interface HomePageProps {
  onNavigate: (page: string, product?: Product, category?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  // Mock data for categories
  const categories = [
    {
      title: 'PCs',
      image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400',
      link: '/pcs'
    },
    {
      title: 'Laptops',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      link: '/laptops'
    },
    {
      title: 'Mice',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      link: '/mice'
    },
    {
      title: 'Keyboards',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      link: '/keyboards'
    },
    {
      title: 'Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      link: '/headphones'
    },
    {
      title: 'Cables & Adapters',
      image: 'https://images.unsplash.com/photo-1646768878729-ac69ab1cdb42?w=400',
      link: '/cables'
    },
    {
      title: 'Mouse Pads',
      image: 'https://images.unsplash.com/photo-1629429408708-3a59f51979c5?w=400',
      link: '/mousepads'
    },
    {
      title: 'Storage & Drives',
      image: 'https://images.unsplash.com/photo-1658954957744-9f4c52a929b1?w=400',
      link: '/storage'
    }
  ];

  // Use products from the data file - select items with discounts for deals
  const dealsOfTheDay: Product[] = allProducts.filter(p => p.originalPrice).slice(0, 8);
  const recommendedProducts: Product[] = allProducts.slice(8, 18);
  const trendingProducts: Product[] = allProducts.slice(18, 28);

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Slider */}
      <HeroSlider onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="max-w-[1500px] mx-auto px-4 py-8 space-y-8">
        {/* Categories Grid */}
        <section>
          <h2 className="text-2xl mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                image={category.image}
                link={category.link}
                onClick={() => onNavigate('search', undefined, category.title)}
              />
            ))}
          </div>
        </section>

        {/* Deals of the Day */}
        <section>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#D5D9D9] mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl">Deals of the Day</h2>
              <div className="flex items-center gap-2 text-[#C7511F]">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Ends in 12:34:56</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {dealsOfTheDay.map((product) => (
                <div key={product.id} className="flex-none">
                  <div onClick={() => onNavigate('product', product)}>
                    <div className="aspect-square mb-3 overflow-hidden rounded-md bg-white flex items-center justify-center border border-[#D5D9D9] cursor-pointer hover:shadow-lg transition-shadow">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-[#2D3748]">-{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%</span>
                        <span className="text-lg text-[#0F1111]">E£{product.price}</span>
                      </div>
                      <p className="text-xs line-clamp-2 text-[#565959]">{product.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Carousels */}
        <ProductCarousel
          title="Inspired by your browsing history"
          products={recommendedProducts}
          onProductClick={(product) => onNavigate('product', product)}
        />

        <ProductCarousel
          title="Trending in Electronics"
          products={trendingProducts}
          onProductClick={(product) => onNavigate('product', product)}
        />

        {/* Banner */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 md:p-12 text-white">
          <h2 className="text-3xl md:text-4xl mb-4">Sign up and save</h2>
          <p className="text-lg mb-6 max-w-xl">
            Get exclusive deals, personalized recommendations, and early access to sales
          </p>
          <button className="bg-white text-[#0F1111] px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Create your account
          </button>
        </section>

        <ProductCarousel
          title="PC Accessories & Peripherals"
          products={[...recommendedProducts].reverse()}
          onProductClick={(product) => onNavigate('product', product)}
        />
      </div>
    </div>
  );
}