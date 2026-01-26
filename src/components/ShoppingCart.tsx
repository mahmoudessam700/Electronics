import { Trash2, Plus, Minus, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShoppingCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export function ShoppingCart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping
}: ShoppingCartProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl mb-4">Your Shopping Cart is empty</h1>
            <p className="text-[#565959] mb-6">
              You have no items in your cart. Start adding some!
            </p>
            <Button
              onClick={onContinueShopping}
              className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1500px] mx-auto px-4 py-6">
        <h1 className="text-3xl mb-6">Shopping Cart</h1>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-9">
            <div className="bg-white border-b border-[#D5D9D9]">
              <div className="flex items-center justify-between p-4 bg-[#F7F8F8]">
                <p className="text-sm text-[#565959]">Price</p>
              </div>
            </div>

            <div className="divide-y divide-[#D5D9D9]">
              {cartItems.map((item) => (
                <div key={item.product.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-[180px] h-[180px] flex-shrink-0 border border-[#D5D9D9] rounded flex items-center justify-center bg-white">
                      <ImageWithFallback
                        src={item.product.image}
                        alt={item.product.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg mb-2 hover:text-[#C7511F] cursor-pointer">
                        {item.product.name}
                      </h3>

                      {/* Stock Status */}
                      <p className="text-sm text-[#007600] mb-2">In Stock</p>

                      {/* Prime Badge */}
                      {item.product.isPrime && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-[#007185] text-white text-xs px-2 py-0.5 rounded">
                            prime
                          </div>
                          <span className="text-sm text-[#0F1111]">
                            Eligible for FREE Delivery
                          </span>
                        </div>
                      )}

                      {/* Gift Option */}
                      <label className="flex items-center gap-2 text-sm text-[#007185] hover:text-[#C7511F] cursor-pointer mb-3">
                        <input type="checkbox" className="rounded" />
                        <span>This is a gift</span>
                      </label>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-[#D5D9D9] rounded">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 hover:bg-[#EAEDED] transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-1 border-x border-[#D5D9D9]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-[#EAEDED] transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <span className="text-[#D5D9D9]">|</span>

                        {/* Delete Button */}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-sm text-[#007185] hover:text-[#C7511F] flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>

                        <span className="text-[#D5D9D9]">|</span>

                        {/* Save for Later */}
                        <button className="text-sm text-[#007185] hover:text-[#C7511F]">
                          Save for later
                        </button>

                        <span className="text-[#D5D9D9]">|</span>

                        {/* Compare */}
                        <button className="text-sm text-[#007185] hover:text-[#C7511F]">
                          Compare with similar items
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm">E£</span>
                        <span className="text-2xl">
                          {Math.floor(item.product.price)}
                        </span>
                        <span className="text-sm">
                          {(item.product.price % 1).toFixed(2).substring(1)}
                        </span>
                      </div>
                      {item.product.originalPrice && (
                        <p className="text-sm text-[#565959] line-through">
                          E£{item.product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal at bottom for mobile */}
            <div className="lg:hidden mt-6 p-4 bg-[#F7F8F8] rounded">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg">
                  Subtotal ({itemCount} items):
                </span>
                <span className="text-2xl">
                  E£{subtotal.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={onProceedToCheckout}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
              >
                Proceed to checkout
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#D5D9D9] rounded-lg p-4 sticky top-24">
              <div className="flex items-center gap-2 text-sm text-[#007600] mb-4">
                <ShieldCheck className="h-5 w-5" />
                <span>
                  Your order qualifies for FREE Delivery.
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-4">
                <span className="text-lg">
                  Subtotal ({itemCount} items):
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm">E£</span>
                  <span className="text-2xl">
                    {Math.floor(subtotal)}
                  </span>
                  <span className="text-sm">
                    {(subtotal % 1).toFixed(2).substring(1)}
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm mb-4 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded" />
                <span>This order contains a gift</span>
              </label>

              <Button
                onClick={onProceedToCheckout}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] mb-2"
              >
                Proceed to checkout
              </Button>

              <div className="pt-4 border-t border-[#D5D9D9] mt-4">
                <p className="text-xs text-[#565959] mb-2">
                  The price and availability of items are subject to change.
                </p>
                <p className="text-xs text-[#007185] hover:text-[#C7511F] cursor-pointer">
                  Learn more about Shopping Cart and Checkout
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 bg-white border border-[#D5D9D9] rounded-lg p-4">
              <h3 className="mb-4">Customers also bought</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-20 h-20 border border-[#D5D9D9] rounded flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200"
                      alt="Recommended product"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm line-clamp-2 hover:text-[#C7511F] cursor-pointer mb-1">
                      Premium Carrying Case
                    </p>
                    <p className="text-sm">E£19.99</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-20 h-20 border border-[#D5D9D9] rounded flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200"
                      alt="Recommended product"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm line-clamp-2 hover:text-[#C7511F] cursor-pointer mb-1">
                      USB-C Fast Charging Cable
                    </p>
                    <p className="text-sm">E£12.99</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 pt-8 border-t border-[#D5D9D9]">
          <Button
            onClick={onContinueShopping}
            variant="outline"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
