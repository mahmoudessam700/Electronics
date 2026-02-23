import { useState, useEffect } from 'react';
import { Product, ProductCard } from './ProductCard';
import { Store, ArrowLeft, ArrowRight, Loader2, Package, Grid3X3, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  productCount: number;
}

interface ShopCategory {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

interface HomePageProps {
  onNavigate: (page: string, product?: Product, category?: string) => void;
}

type ViewState =
  | { type: 'shops' }
  | { type: 'categories'; shop: Shop }
  | { type: 'products'; shop: Shop; category: ShopCategory };

export function HomePage({ onNavigate }: HomePageProps) {
  const { t, isRTL } = useLanguage();

  const [viewState, setViewState] = useState<ViewState>({ type: 'shops' });
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch shops on mount
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shops?action=public');
      if (res.ok) {
        const data = await res.json();
        setShops(data);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = async (shop: Shop) => {
    setLoading(true);
    try {
      // Fetch real categories for this shop
      const res = await fetch(`/api/categories?shopId=${shop.id}`);
      if (res.ok) {
        const data: ShopCategory[] = await res.json();
        setCategories(data);
        setViewState({ type: 'categories', shop });
      }
    } catch (err) {
      console.error('Failed to fetch shop categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (shop: Shop, category: ShopCategory) => {
    setLoading(true);
    try {
      // Fetch products for this shop filtered by category
      const res = await fetch(`/api/products?shopId=${shop.id}&categoryId=${category.id}`);
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);
        setViewState({ type: 'products', shop, category });
      }
    } catch (err) {
      console.error('Failed to fetch category products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (viewState.type === 'products') {
      // Go back to categories
      handleShopClick(viewState.shop);
    } else if (viewState.type === 'categories') {
      // Go back to shops
      setViewState({ type: 'shops' });
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}>
        <Loader2 style={{ width: 40, height: 40, animation: 'spin 1s linear infinite', color: '#374151' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>{t('common.loading') || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '80vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        padding: '32px 24px',
        color: '#ffffff',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {viewState.type !== 'shops' && (
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                padding: '8px 16px',
                borderRadius: 8,
                marginBottom: 16,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              <BackArrow style={{ width: 16, height: 16 }} />
              {viewState.type === 'categories'
                ? t('home.backToShops')
                : t('home.backToCategories')
              }
            </button>
          )}

          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {viewState.type === 'shops' && (
              <>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{t('home.ourShops')}</h1>
                <p style={{ fontSize: 15, opacity: 0.8, marginTop: 8, margin: 0 }}>{t('home.browseShops')}</p>
              </>
            )}
            {viewState.type === 'categories' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  {viewState.shop.logo && (
                    <img
                      src={viewState.shop.logo}
                      alt={viewState.shop.name}
                      style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }}
                    />
                  )}
                  <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{viewState.shop.name}</h1>
                    <p style={{ fontSize: 15, opacity: 0.8, marginTop: 4, margin: 0 }}>{t('home.shopCategories')}</p>
                  </div>
                </div>
              </>
            )}
            {viewState.type === 'products' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.7, fontSize: 13, marginBottom: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <span>{viewState.shop.name}</span>
                  <span style={{ opacity: 0.5 }}>›</span>
                  <span>{viewState.category.name}</span>
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{viewState.category.name}</h1>
                <p style={{ fontSize: 15, opacity: 0.8, marginTop: 4, margin: 0 }}>
                  {products.length} {t('home.products')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* === SHOPS VIEW === */}
        {viewState.type === 'shops' && (
          <>
            {shops.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{
                  width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Store style={{ width: 40, height: 40, color: '#9ca3af' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', margin: 0 }}>{t('home.noShops')}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{t('home.noShopsDesc')}</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}>
                {shops.map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => handleShopClick(shop)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 16,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      border: '1px solid #f3f4f6',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* Shop Logo / Gradient */}
                    <div style={{
                      height: 160,
                      background: shop.logo ? undefined : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Store style={{ width: 56, height: 56, color: 'rgba(255,255,255,0.4)' }} />
                      )}
                    </div>

                    {/* Shop Info */}
                    <div style={{ padding: '20px 20px 24px', textAlign: isRTL ? 'right' : 'left' }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>
                        {shop.name}
                      </h3>
                      {shop.description && (
                        <p style={{
                          fontSize: 13, color: '#6b7280', marginTop: 6, margin: '6px 0 0',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {shop.description}
                        </p>
                      )}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, marginTop: 16,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      }}>
                        <Package style={{ width: 14, height: 14, color: '#9ca3af' }} />
                        <span style={{ fontSize: 13, color: '#6b7280' }}>
                          {shop.productCount} {t('home.products')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* === CATEGORIES VIEW === */}
        {viewState.type === 'categories' && (
          <>
            {categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{
                  width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Grid3X3 style={{ width: 40, height: 40, color: '#9ca3af' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', margin: 0 }}>{t('home.noCategories')}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{t('home.noCategoriesDesc')}</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 20,
              }}>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(viewState.shop, cat)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 16,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      border: '1px solid #f3f4f6',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Category Image */}
                    <div style={{
                      height: 140,
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ShoppingBag style={{ width: 40, height: 40, color: '#d1d5db' }} />
                      )}
                    </div>

                    {/* Category Info */}
                    <div style={{ padding: '16px 20px 20px', textAlign: isRTL ? 'right' : 'left' }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        {cat.name}
                      </h4>
                      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6, margin: '6px 0 0' }}>
                        {cat._count?.products || 0} {t('home.products')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* === PRODUCTS VIEW === */}
        {viewState.type === 'products' && (
          <>
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <div style={{
                  width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Package style={{ width: 40, height: 40, color: '#9ca3af' }} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#374151', margin: 0 }}>{t('home.noProducts')}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>{t('home.noProductsDesc')}</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 20,
              }}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onNavigate('product', product)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}