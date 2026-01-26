import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isPrime?: boolean;
  deliveryDate?: string;
  category?: string;
  categoryId?: string;
  supplierId?: string;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-shadow duration-200 border-[#D5D9D9]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="aspect-square mb-3 overflow-hidden rounded-md bg-white flex items-center justify-center">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Product Name */}
          <h3 className="text-sm line-clamp-2 text-[#0F1111] group-hover:text-[#4A5568]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating)
                      ? 'fill-[#718096] text-[#718096]'
                      : 'fill-none text-[#718096]'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm text-[#4A5568] hover:text-[#2D3748]">
              {product.reviewCount.toLocaleString()}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-[#0F1111]">E£</span>
              <span className="text-2xl text-[#0F1111]">
                {Math.floor(product.price)}
              </span>
              <span className="text-xs text-[#0F1111]">
                {(product.price % 1).toFixed(2).substring(1)}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-sm text-[#565959] line-through">
                E£{product.originalPrice.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-sm text-[#2D3748]">
                -{discount}%
              </span>
            )}
          </div>

          {/* Prime Badge */}
          {product.isPrime && (
            <div className="flex items-center gap-1">
              <div className="bg-[#718096] text-white text-xs px-2 py-0.5 rounded">
                prime
              </div>
            </div>
          )}

          {/* Delivery Date */}
          {product.deliveryDate && (
            <p className="text-xs text-[#565959]">
              Get it by <span className="font-bold text-[#0F1111]">{product.deliveryDate}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}