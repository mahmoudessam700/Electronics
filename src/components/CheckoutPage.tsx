import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Lock, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CartItem } from './ShoppingCart';
import { Card, CardContent } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onPlaceOrder: () => void;
}

export function CheckoutPage({ cartItems, onPlaceOrder }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // Require login to access checkout
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('checkout_redirect', 'true');
      toast.info('Please sign in to continue checkout', { duration: 3000 });
      navigate('/login');
    }
  }, [user, loading, navigate]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [shippingSpeed, setShippingSpeed] = useState('free');

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = shippingSpeed === 'free' ? 0 : shippingSpeed === 'express' ? 9.99 : 4.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
      <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#718096]' : 'text-[#565959]'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#718096] text-white' : 'bg-[#EAEDED] text-[#565959]'
          }`}>
          {step > 1 ? '✓' : '1'}
        </div>
        <span className="text-sm hidden sm:inline">Shipping</span>
      </div>
      <ChevronRight className="h-4 w-4 text-[#565959]" />
      <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#718096]' : 'text-[#565959]'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#718096] text-white' : 'bg-[#EAEDED] text-[#565959]'
          }`}>
          {step > 2 ? '✓' : '2'}
        </div>
        <span className="text-sm hidden sm:inline">Payment</span>
      </div>
      <ChevronRight className="h-4 w-4 text-[#565959]" />
      <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#718096]' : 'text-[#565959]'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#718096] text-white' : 'bg-[#EAEDED] text-[#565959]'
          }`}>
          3
        </div>
        <span className="text-sm hidden sm:inline">Review</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Secure Checkout Banner */}
        <div className="flex items-center justify-center gap-2 mb-8 p-3 bg-[#F7F8F8] rounded">
          <Lock className="h-5 w-5 text-[#007600]" />
          <span className="text-sm">Secure Checkout</span>
        </div>

        <h1 className="text-3xl mb-6">Checkout</h1>

        <StepIndicator />

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl">1. Shipping address</h2>
                  </div>

                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        placeholder="123 Main Street, Apt 4B"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={() => setStep(2)}
                        className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
                      >
                        Continue to payment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Address Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="mb-2">1. Shipping address</h3>
                        <p className="text-sm text-[#565959]">
                          {shippingAddress.fullName}<br />
                          {shippingAddress.address}<br />
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                        </p>
                      </div>
                      <Button variant="link" onClick={() => setStep(1)}>
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl mb-6">2. Payment method</h2>

                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 border border-[#D5D9D9] rounded">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <div className="flex-1">
                            <Label htmlFor="credit-card" className="cursor-pointer">
                              <div className="flex items-center gap-2 mb-3">
                                <CreditCard className="h-5 w-5" />
                                <span>Credit or debit card</span>
                              </div>
                            </Label>
                            {paymentMethod === 'credit-card' && (
                              <div className="space-y-4 mt-4">
                                <div>
                                  <Label htmlFor="cardNumber">Card number</Label>
                                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                                </div>
                                <div>
                                  <Label htmlFor="cardName">Name on card</Label>
                                  <Input id="cardName" placeholder="John Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="expiry">Expiration date</Label>
                                    <Input id="expiry" placeholder="MM/YY" />
                                  </div>
                                  <div>
                                    <Label htmlFor="cvv">Security code</Label>
                                    <Input id="cvv" placeholder="CVV" maxLength={4} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 border border-[#D5D9D9] rounded">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="cursor-pointer flex items-center gap-2">
                            <span>PayPal</span>
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3 p-4 border border-[#D5D9D9] rounded">
                          <RadioGroupItem value="gift-card" id="gift-card" />
                          <Label htmlFor="gift-card" className="cursor-pointer flex items-center gap-2">
                            <span>Gift Card</span>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="pt-6">
                      <Button
                        onClick={() => setStep(3)}
                        className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
                      >
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Address Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="mb-2">1. Shipping address</h3>
                        <p className="text-sm text-[#565959]">
                          {shippingAddress.fullName}<br />
                          {shippingAddress.address}<br />
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                        </p>
                      </div>
                      <Button variant="link" onClick={() => setStep(1)}>
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="mb-2">2. Payment method</h3>
                        <p className="text-sm text-[#565959]">
                          {paymentMethod === 'credit-card' ? 'Credit Card ending in ****' : paymentMethod === 'paypal' ? 'PayPal' : 'Gift Card'}
                        </p>
                      </div>
                      <Button variant="link" onClick={() => setStep(2)}>
                        Change
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Review Items */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl mb-6">3. Review items and shipping</h2>

                    {/* Shipping Speed */}
                    <div className="mb-6">
                      <h3 className="mb-4">Choose your shipping speed:</h3>
                      <RadioGroup value={shippingSpeed} onValueChange={setShippingSpeed}>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 border border-[#D5D9D9] rounded">
                            <RadioGroupItem value="free" id="free" />
                            <Label htmlFor="free" className="cursor-pointer flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">FREE Delivery</p>
                                  <p className="text-sm text-[#565959]">Arrives: Jan 30 - Feb 2</p>
                                </div>
                                <span className="font-medium">E£0.00</span>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 border border-[#D5D9D9] rounded">
                            <RadioGroupItem value="standard" id="standard" />
                            <Label htmlFor="standard" className="cursor-pointer flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Standard Delivery</p>
                                  <p className="text-sm text-[#565959]">Arrives: Jan 28 - Jan 30</p>
                                </div>
                                <span className="font-medium">E£4.99</span>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 border border-[#D5D9D9] rounded">
                            <RadioGroupItem value="express" id="express" />
                            <Label htmlFor="express" className="cursor-pointer flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Express Delivery</p>
                                  <p className="text-sm text-[#565959]">Arrives: Tomorrow</p>
                                </div>
                                <span className="font-medium">E£9.99</span>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-[#D5D9D9] pt-6">
                      <h3 className="mb-4">Items in your order:</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.product.id} className="flex gap-4">
                            <div className="w-20 h-20 border border-[#D5D9D9] rounded flex items-center justify-center flex-shrink-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm mb-1">{item.product.name}</p>
                              <p className="text-sm text-[#565959]">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">E£{(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        onClick={onPlaceOrder}
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-lg py-6"
                      >
                        Place your order
                      </Button>

                      <div className="flex items-start gap-2 mt-4 p-3 bg-[#F7F8F8] rounded text-sm">
                        <ShieldCheck className="h-5 w-5 text-[#007600] flex-shrink-0 mt-0.5" />
                        <p className="text-[#565959]">
                          By placing your order, you agree to our privacy notice and conditions of use.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="mb-4">Order Summary</h3>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span>Items ({itemCount}):</span>
                    <span>E£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping & handling:</span>
                    <span>{shipping === 0 ? 'FREE' : `E£${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#D5D9D9]">
                    <span>Estimated tax:</span>
                    <span>E£{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-lg text-[#C7511F]">
                    <span>Order total:</span>
                    <span>E£{total.toFixed(2)}</span>
                  </div>
                </div>

                {step === 3 && (
                  <Button
                    onClick={onPlaceOrder}
                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]"
                  >
                    Place your order
                  </Button>
                )}

                <div className="mt-4 pt-4 border-t border-[#D5D9D9]">
                  <p className="text-xs text-[#565959]">
                    How are shipping costs calculated?
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}