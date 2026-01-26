import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard, Product } from './ProductCard';
import { useRef } from 'react';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductCarousel({ title, products, onProductClick }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: 24,
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #D5D9D9',
      marginBottom: 32
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0F1111', margin: 0 }}>{title}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => scroll('left')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid #D5D9D9',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft style={{ width: 18, height: 18, color: '#0F1111' }} />
          </button>
          <button
            onClick={() => scroll('right')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid #D5D9D9',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight style={{ width: 18, height: 18, color: '#0F1111' }} />
          </button>
        </div>
      </div>

      {/* Products Scroll Container */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {products.map((product) => (
          <div key={product.id} style={{ flexShrink: 0, width: 200 }}>
            <ProductCard product={product} onClick={() => onProductClick(product)} />
          </div>
        ))}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
