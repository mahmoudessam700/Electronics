import { useState } from 'react';
import { Star, MapPin, ShieldCheck, TruckIcon, RefreshCw, Heart, Share2, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from './ProductCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Progress } from './ui/progress';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailPage({ product, onAddToCart, onBuyNow }: ProductDetailPageProps) {
  const { t, formatCurrency } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock additional images
  const images = [
    product.image,
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
  ];

  // Mock product features
  const features = [
    'Premium build quality with durable materials',
    'Advanced technology for superior performance',
    'Easy to use with intuitive controls',
    'Long-lasting battery life (up to 30 hours)',
    'Compatible with multiple devices',
    'Includes carrying case and accessories',
  ];

  // Mock reviews
  const reviews = [
    {
      id: '1',
      author: 'John D.',
      rating: 5,
      title: 'Excellent product!',
      comment: 'This product exceeded my expectations. The quality is outstanding and it works perfectly. Highly recommended!',
      date: 'January 20, 2026',
      helpful: 45,
      verified: true
    },
    {
      id: '2',
      author: 'Sarah M.',
      rating: 4,
      title: 'Great value for money',
      comment: 'Good product overall. Minor issues with setup but customer service was helpful. Very satisfied with the purchase.',
      date: 'January 18, 2026',
      helpful: 32,
      verified: true
    },
    {
      id: '3',
      author: 'Mike R.',
      rating: 5,
      title: 'Best purchase this year',
      comment: 'Absolutely love it! The features are amazing and it\'s very easy to use. Worth every penny.',
      date: 'January 15, 2026',
      helpful: 28,
      verified: true
    }
  ];

  // Mock frequently bought together
  const frequentlyBoughtTogether = [
    {
      id: 'fbt-1',
      name: 'Premium Carrying Case',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200'
    },
    {
      id: 'fbt-2',
      name: 'USB-C Fast Charging Cable',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200'
    }
  ];

  const totalPrice = product.price + frequentlyBoughtTogether.reduce((sum, item) => sum + item.price, 0);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const ratingBreakdown = [
    { stars: 5, percentage: 71, count: 8843 },
    { stars: 4, percentage: 17, count: 2117 },
    { stars: 3, percentage: 7, count: 872 },
    { stars: 2, percentage: 3, count: 374 },
    { stars: 1, percentage: 2, count: 249 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-[#565959] mb-6">
          <span className="hover:text-[#C7511F] cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-[#C7511F] cursor-pointer">Electronics</span>
          <span className="mx-2">/</span>
          <span className="hover:text-[#C7511F] cursor-pointer">Headphones</span>
          <span className="mx-2">/</span>
          <span className="text-[#0F1111]">{product.name}</span>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              {/* Thumbnail Strip */}
              <div className="flex lg:flex-row flex-col-reverse gap-4">
                <div className="flex flex-row lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto pb-2 lg:pb-0">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 lg:w-12 lg:h-12 border-2 rounded overflow-hidden flex-shrink-0 ${selectedImage === index ? 'border-[#718096]' : 'border-[#D5D9D9]'
                        }`}
                    >
                      <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="flex-1 border border-[#D5D9D9] rounded-lg p-4 order-1 lg:order-2">
                  <div className="aspect-square flex items-center justify-center relative">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to List
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Middle: Product Info */}
          <div className="lg:col-span-4">
            <h1 className="text-xl md:text-2xl mb-2">{product.name}</h1>

            {/* Brand */}
            <p className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer mb-2">
              Visit the TechBrand Store
            </p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <span className="text-[#0F1111]">{product.rating}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating)
                        ? 'fill-[#718096] text-[#718096]'
                        : 'fill-none text-[#718096]'
                        }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer">
                {product.reviewCount.toLocaleString()} ratings
              </span>
              <span className="text-sm text-[#565959]">|</span>
              <span className="text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer">
                1,234 answered questions
              </span>
            </div>

            <div className="border-t border-[#D5D9D9] pt-4 mb-4">
              {/* Price */}
              <div className="mb-2">
                {discount > 0 && (
                  <span className="text-sm text-[#C7511F] mr-2">-{discount}%</span>
                )}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-[#0F1111]">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                {product.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#565959]">{t('product.originalPrice')}:</span>
                    <span className="text-sm text-[#565959] line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Prime Badge */}
              {product.isPrime && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#007185] text-white text-sm px-2 py-1 rounded">
                    prime
                  </div>
                  <span className="text-sm text-[#0F1111]">
                    FREE delivery <span className="font-bold">{product.deliveryDate}</span>
                  </span>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer">
                <MapPin className="h-4 w-4" />
                <span>Deliver to Cairo, Egypt</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              <p className="text-lg text-[#007600]">In Stock</p>
            </div>

            {/* Features */}
            <div className="border-t border-[#D5D9D9] pt-4">
              <h3 className="mb-3">About this item</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex gap-2 text-sm text-[#0F1111]">
                    <span className="text-[#565959]">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-[#F7F8F8] rounded">
              <div className="flex flex-col items-center text-center">
                <TruckIcon className="h-6 w-6 text-[#007185] mb-1" />
                <span className="text-xs text-[#565959]">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="h-6 w-6 text-[#007185] mb-1" />
                <span className="text-xs text-[#565959]">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RefreshCw className="h-6 w-6 text-[#007185] mb-1" />
                <span className="text-xs text-[#565959]">Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Right: Buy Box */}
          <div className="lg:col-span-3">
            <div className="border border-[#D5D9D9] rounded-lg p-4 sticky top-4 lg:top-24 bg-white shadow-sm lg:shadow-none z-10">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-[#0F1111]">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {/* Delivery */}
              {product.isPrime && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#007185] text-white text-xs px-2 py-0.5 rounded">
                      prime
                    </div>
                    <span className="text-sm">FREE delivery</span>
                  </div>
                  <p className="text-sm">
                    <span className="font-bold">{product.deliveryDate}</span>
                  </p>
                  <p className="text-xs text-[#007185] hover:text-[#C7511F] cursor-pointer mt-1">
                    Or fastest delivery Tomorrow
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer mb-4">
                <MapPin className="h-4 w-4" />
                <span>Deliver to Cairo, Egypt</span>
              </div>

              {/* Stock */}
              <p className="text-lg text-[#007600] mb-4">In Stock</p>

              {/* Quantity Selector */}
              <div className="mb-4">
                <Select value={quantity.toString()} onValueChange={(val: string) => setQuantity(parseInt(val))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Qty: {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full bg-[#718096] hover:bg-[#4A5568] text-white mb-2"
                onClick={() => onAddToCart(product, quantity)}
              >
                Add to Cart
              </Button>

              {/* Buy Now Button */}
              <Button
                className="w-full bg-[#FFA41C] hover:bg-[#FF8F00] text-[#0F1111] mb-4"
                onClick={() => onBuyNow(product, quantity)}
              >
                Buy Now
              </Button>

              {/* Additional Info */}
              <div className="text-xs text-[#565959] space-y-2 pt-4 border-t border-[#D5D9D9]">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Secure transaction</span>
                </p>
                <p>Ships from: shop.com</p>
                <p>Sold by: TechBrand Official</p>
                <p className="text-[#007185] hover:text-[#C7511F] cursor-pointer">
                  Return policy: Eligible for Return, Refund or Replacement within 30 days
                </p>
              </div>

              {/* Gift Option */}
              <div className="mt-4 p-3 bg-[#F7F8F8] rounded text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span>Add gift options</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-12 border-t border-[#D5D9D9] pt-8">
          <h2 className="text-2xl mb-6">Frequently bought together</h2>
          <div className="bg-white border border-[#D5D9D9] rounded-lg p-6">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="w-24 h-24 border border-[#D5D9D9] rounded flex items-center justify-center">
                <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
              </div>
              <span className="text-2xl text-[#565959]">+</span>
              {frequentlyBoughtTogether.map((item) => (
                <>
                  <div key={item.id} className="w-24 h-24 border border-[#D5D9D9] rounded flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className="text-2xl text-[#565959]">+</span>
                </>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm">{t('checkout.orderTotal')}:</span>
              <span className="text-2xl text-[#0F1111]">{formatCurrency(totalPrice)}</span>
            </div>
            <Button className="bg-[#718096] hover:bg-[#4A5568] text-white">
              Add all to Cart
            </Button>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-12 border-t border-[#D5D9D9] pt-8">
          <h2 className="text-2xl mb-6">Customer reviews</h2>

          {/* Rating Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < Math.floor(product.rating)
                        ? 'fill-[#718096] text-[#718096]'
                        : 'fill-none text-[#718096]'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-2xl">{product.rating} out of 5</span>
              </div>
              <p className="text-sm text-[#565959] mb-4">
                {product.reviewCount.toLocaleString()} global ratings
              </p>
            </div>

            <div className="space-y-2">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-sm">
                  <button className="text-[#007185] hover:text-[#C7511F] whitespace-nowrap">
                    {item.stars} star
                  </button>
                  <Progress value={item.percentage} className="flex-1 h-5" />
                  <span className="text-[#007185] hover:text-[#C7511F] cursor-pointer">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Filters */}
          <div className="flex gap-4 mb-6">
            <Button variant="outline">All reviews</Button>
            <Button variant="outline">Verified purchase only</Button>
            <Button variant="outline">Images & videos</Button>
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-t border-[#D5D9D9] pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#EAEDED] flex items-center justify-center text-[#0F1111]">
                    {review.author[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#0F1111] mb-1">{review.author}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating
                              ? 'fill-[#718096] text-[#718096]'
                              : 'fill-none text-[#718096]'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-[#0F1111]">{review.title}</span>
                    </div>
                    <p className="text-sm text-[#565959] mb-2">
                      Reviewed in the United States on {review.date}
                    </p>
                    {review.verified && (
                      <p className="text-xs text-[#C7511F] mb-2 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Purchase
                      </p>
                    )}
                    <p className="text-sm text-[#0F1111] mb-3">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <button className="text-[#565959] hover:text-[#0F1111]">
                        Helpful ({review.helpful})
                      </button>
                      <button className="text-[#565959] hover:text-[#0F1111]">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* See More Reviews */}
          <Button variant="outline" className="mt-6 w-full md:w-auto">
            See all reviews <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}