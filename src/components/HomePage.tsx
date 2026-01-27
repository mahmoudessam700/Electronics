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
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes, settingsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
          fetch(`/api/settings?type=homepage&t=${Date.now()}`, {
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          })
        ]);

        const catsData = await catsRes.json();
        const prodsData = await prodsRes.json();
        const settingsData = await settingsRes.json();

        console.log('--- Home Layout Loaded ---');
        console.log('Sections state:', settingsData?.sections?.map((s: any) => `${s.id}: ${s.isEnabled}`).join(', '));
        
        setCategories(catsData);
        setProducts(prodsData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Failed to fetch home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isVisible = (id: string) => {
    if (!settings || !settings.sections) return true;
    const section = settings.sections.find((s: any) => s.id === id);
    return section ? section.isEnabled : true;
  };

  const getSectionName = (id: string, defaultName: string) => {
    if (!settings || !settings.sections) return defaultName;
    const section = settings.sections.find((s: any) => s.id === id);
    return section && section.name ? section.name : defaultName;
  };

  const getSectionBadge = (id: string) => {
    if (!settings || !settings.sections) return { show: true, text: 'Ends in 12:34:56' };
    const section = settings.sections.find((s: any) => s.id === id);
    if (!section) return { show: true, text: 'Ends in 12:34:56' };
    return {
      show: section.showBadge !== undefined ? section.showBadge : true,
      text: section.badgeText || 'Ends in 12:34:56'
    };
  };

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
      <div style={{ minHeight: '100vh', backgroundColor: '#EAEDED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: '#718096' }} />
          <p style={{ color: '#718096', fontWeight: 500 }}>Loading your premium electronics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#EAEDED', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero Slider */}
      <HeroSlider onNavigate={onNavigate} />

      {/* Main Content */}
      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '32px 16px' }}>

        {/* Categories Grid - 4 columns */}
        {categories.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F1111', marginBottom: 16 }}>Shop by Category</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24
            }}>
              {categories
                .filter(cat => cat.name.toLowerCase() !== 'electronics')
                .slice(0, 8)
                .map((category) => (
                  <CategoryCard
                    key={category.id}
                    title={category.name}
                    image={category.image}
                    onClick={() => onNavigate('search', undefined, category.name)}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Deals of the Day */}
        {dealsOfTheDay.length > 0 && isVisible('deals-of-the-day') && (
          <section style={{ marginBottom: 32 }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: 24,
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              border: '1px solid #D5D9D9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F1111', margin: 0 }}>
                  {getSectionName('deals-of-the-day', 'Deals of the Day')}
                </h2>
                {getSectionBadge('deals-of-the-day').show && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: '#C7511F',
                    backgroundColor: '#FEF1EE',
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600
                  }}>
                    <Clock style={{ width: 16, height: 16 }} />
                    <span>{getSectionBadge('deals-of-the-day').text}</span>
                  </div>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 16
              }}>
                {dealsOfTheDay.map((product) => (
                  <div
                    key={product.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('product', product)}
                  >
                    <div style={{
                      aspectRatio: '1',
                      marginBottom: 12,
                      overflow: 'hidden',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #D5D9D9',
                      position: 'relative'
                    }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: 16,
                          transition: 'transform 0.2s'
                        }}
                      />
                      {/* Discount Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: '#CC0C39',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 4
                      }}>
                        -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#CC0C39'
                        }}>
                          -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#0F1111' }}>
                          E£{product.price.toLocaleString()}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 13,
                        color: '#565959',
                        margin: '4px 0 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.4
                      }}>
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
        {recommendedProducts.length > 0 && isVisible('inspired-browsing') && (
          <ProductCarousel
            title={getSectionName('inspired-browsing', 'Inspired by your browsing history')}
            products={recommendedProducts}
            onProductClick={(product) => onNavigate('product', product)}
          />
        )}

        {trendingProducts.length > 0 && isVisible('trending') && (
          <ProductCarousel
            title={getSectionName('trending', 'Trending in Electronics')}
            products={trendingProducts}
            onProductClick={(product) => onNavigate('product', product)}
          />
        )}

        {/* Sign Up Banner */}
        {isVisible('signup-banner') && (
          <section style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: 16,
            padding: '48px 32px',
            marginBottom: 32,
            color: '#ffffff',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 16px' }}>
              {getSectionName('signup-banner', 'Sign up and save')}
            </h2>
            <p style={{ fontSize: 18, margin: '0 0 24px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', opacity: 0.9 }}>
              Get exclusive deals, personalized recommendations, and early access to sales
            </p>
            <button
              onClick={() => onNavigate('account')}
              style={{
                backgroundColor: '#ffffff',
                color: '#0F1111',
                padding: '14px 32px',
                borderRadius: 8,
                border: 'none',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Create your account
            </button>
          </section>
        )}

        {peripherals.length > 0 && isVisible('pc-peripherals') && (
          <ProductCarousel
            title={getSectionName('pc-peripherals', 'PC Accessories & Peripherals')}
            products={peripherals}
            onProductClick={(product) => onNavigate('product', product)}
          />
        )}
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}