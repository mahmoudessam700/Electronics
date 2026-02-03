import { useState, useEffect } from 'react';
import { Star, MapPin, ShieldCheck, TruckIcon, RefreshCw, Heart, Share2, ChevronRight, Loader2, MessageSquare, ThumbsUp, Flag, Clock } from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  status: string;
}

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailPage({ product, onAddToCart, onBuyNow }: ProductDetailPageProps) {
  const { t, formatCurrency, language, isRTL } = useLanguage();
  const { user, token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${product.id}&status=APPROVED`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please sign in to write a review');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment
        })
      });

      if (res.ok) {
        toast.success('Review submitted for moderation');
        setNewComment('');
        setNewRating(5);
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get translated product name
  const getProductName = () => {
    if (language === 'ar' && product.nameAr) {
      return product.nameAr;
    }
    if (product.nameEn) {
      return product.nameEn;
    }
    return product.name;
  };

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

  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { stars, percentage, count };
  });

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
          <span className="text-[#0F1111]">{getProductName()}</span>
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
                      alt={getProductName()}
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
            <h1 className="text-xl md:text-2xl mb-2">{getProductName()}</h1>

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
              {product.inStock !== false ? (
                <div>
                  <p className="text-lg text-[#007600] font-medium">{isRTL ? 'متوفر' : 'In Stock'}</p>
                  {product.tracksInventory && product.inventoryQuantity !== undefined && product.inventoryQuantity <= 5 && (
                    <p className="text-xs text-amber-600 font-bold mt-0.5">
                      {isRTL 
                        ? `لقد تبقى لدينا ${product.inventoryQuantity} فقط - اطلب قريباً.` 
                        : `Only ${product.inventoryQuantity} left in stock - order soon.`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-lg text-rose-600 font-bold">{isRTL ? 'غير متوفر حالياً' : 'Currently Out of Stock'}</p>
              )}
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
              <div className="mb-4">
                {product.inStock !== false ? (
                  <p className="text-lg text-[#007600] font-medium">{isRTL ? 'متوفر' : 'In Stock'}</p>
                ) : (
                  <p className="text-lg text-rose-600 font-bold">{isRTL ? 'غير متوفر' : 'Out of Stock'}</p>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <Select 
                  disabled={product.inStock === false}
                  value={quantity.toString()} 
                  onValueChange={(val: string) => setQuantity(parseInt(val))}
                >
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
                disabled={product.inStock === false}
              >
                {isRTL ? 'أضف إلى العربة' : 'Add to Cart'}
              </Button>

              {/* Buy Now Button */}
              <Button
                className="w-full bg-[#FFA41C] hover:bg-[#FF8F00] text-[#0F1111] mb-4"
                onClick={() => onBuyNow(product, quantity)}
                disabled={product.inStock === false}
              >
                {isRTL ? 'اشتري الآن' : 'Buy Now'}
              </Button>

              {/* Additional Info */}
              <div className="text-xs text-[#565959] space-y-2 pt-4 border-t border-[#D5D9D9]">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Secure transaction</span>
                </p>
                <p>Ships from: Adsolutions</p>
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
                <img src={product.image} alt={getProductName()} className="max-w-full max-h-full object-contain" />
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
          <div className="flex flex-wrap gap-4 mb-8">
            <Button variant="outline" className="bg-slate-50 border-slate-200">All reviews</Button>
            <Button variant="outline">Verified purchase only</Button>
            <Button variant="outline">Images & videos</Button>
          </div>

          {/* Write a Review Section */}
          <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-400" />
              Write a Review
            </h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">Overall Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={`h-6 w-6 ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 min-h-[120px] bg-white transition-all shadow-sm"
                  placeholder="What did you like or dislike? How was the quality?..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  disabled={submittingReview}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-xl font-bold flex items-center gap-2"
                >
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Review'}
                </Button>
                <p className="text-[10px] text-slate-400 italic">
                  * All reviews are moderated and will appear shortly after approval.
                </p>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-500 text-sm mb-4 font-medium">Please sign in to share your experience with this product.</p>
                <Button variant="outline" className="rounded-xl px-6 border-slate-300 shadow-sm" onClick={() => window.location.href = '/login'}>
                  Sign In
                </Button>
              </div>
            )}
          </div>

          {/* Individual Reviews */}
          <div className="space-y-6">
            {loadingReviews ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-8 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs shrink-0 border border-slate-200 shadow-sm">
                      {review.userName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-slate-900 text-sm">{review.userName}</p>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                        {review.comment}
                      </p>
                      <div className="flex items-center gap-6 mt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Helpful
                        </button>
                        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-red-600">
                          <Flag className="h-3.5 w-3.5" />
                          Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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