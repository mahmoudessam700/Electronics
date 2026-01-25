import { Gift, Mail, Smartphone, CreditCard, Send, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useState } from 'react';

interface GiftCardsPageProps {
  onNavigate: (page: string) => void;
}

export function GiftCardsPage({ onNavigate }: GiftCardsPageProps) {
  const [selectedAmount, setSelectedAmount] = useState('50');
  const [deliveryMethod, setDeliveryMethod] = useState('email');

  const giftCardDesigns = [
    {
      id: '1',
      name: 'Birthday Celebration',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400',
      category: 'Birthday'
    },
    {
      id: '2',
      name: 'Thank You',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
      category: 'Thank You'
    },
    {
      id: '3',
      name: 'Congratulations',
      image: 'https://images.unsplash.com/photo-1464983308776-8f12bdb1f242?w=400',
      category: 'Celebration'
    },
    {
      id: '4',
      name: 'Holiday Special',
      image: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400',
      category: 'Holiday'
    },
    {
      id: '5',
      name: 'Classic Blue',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400',
      category: 'Classic'
    },
    {
      id: '6',
      name: 'Wedding Gift',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
      category: 'Wedding'
    }
  ];

  const amounts = ['25', '50', '100', '150', '200', '250', '500', '1000'];

  const features = [
    {
      icon: Send,
      title: 'Instant Delivery',
      description: 'Email gift cards are delivered within minutes'
    },
    {
      icon: Star,
      title: 'No Fees',
      description: 'No purchase or inactivity fees'
    },
    {
      icon: CreditCard,
      title: 'Never Expires',
      description: 'Our gift cards never expire'
    },
    {
      icon: Gift,
      title: 'Perfect Gift',
      description: 'Let them choose what they want'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Gift className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl mb-4">Gift Cards</h1>
          <p className="text-xl max-w-2xl mx-auto">
            The perfect gift for any occasion. Choose from millions of items.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Main Gift Card Builder */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl mb-6">Create Your Gift Card</h2>

                <Tabs defaultValue="design" className="mb-6">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="design">1. Design</TabsTrigger>
                    <TabsTrigger value="amount">2. Amount</TabsTrigger>
                    <TabsTrigger value="delivery">3. Delivery</TabsTrigger>
                  </TabsList>

                  <TabsContent value="design" className="space-y-6">
                    <div>
                      <h3 className="mb-4">Choose a Design</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {giftCardDesigns.map((design) => (
                          <div
                            key={design.id}
                            className="group cursor-pointer border-2 border-[#D5D9D9] hover:border-[#718096] rounded-lg overflow-hidden transition-all"
                          >
                            <div className="aspect-[16/10] overflow-hidden">
                              <img
                                src={design.image}
                                alt={design.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div className="p-3 bg-white">
                              <p className="text-sm font-medium">{design.name}</p>
                              <p className="text-xs text-[#565959]">{design.category}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="amount" className="space-y-6">
                    <div>
                      <h3 className="mb-4">Select Amount</h3>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {amounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedAmount(amount)}
                            className={`p-4 border-2 rounded-lg transition-all ${
                              selectedAmount === amount
                                ? 'border-[#718096] bg-[#718096]/10'
                                : 'border-[#D5D9D9] hover:border-[#565959]'
                            }`}
                          >
                            <span className="text-lg font-medium">E£{amount}</span>
                          </button>
                        ))}
                      </div>
                      <div>
                        <Label htmlFor="custom-amount">Or enter a custom amount</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xl">E£</span>
                          <Input
                            id="custom-amount"
                            type="number"
                            placeholder="0.00"
                            min="1"
                            max="2000"
                          />
                        </div>
                        <p className="text-xs text-[#565959] mt-2">
                          Minimum: E£1.00 | Maximum: E£2,000.00
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="delivery" className="space-y-6">
                    <div>
                      <h3 className="mb-4">Delivery Method</h3>
                      <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-4 border-2 border-[#D5D9D9] rounded-lg">
                            <RadioGroupItem value="email" id="email" />
                            <Label htmlFor="email" className="cursor-pointer flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Mail className="h-5 w-5 text-[#007185]" />
                                <div>
                                  <p className="font-medium">Email</p>
                                  <p className="text-sm text-[#565959]">Instant delivery</p>
                                </div>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 border-2 border-[#D5D9D9] rounded-lg">
                            <RadioGroupItem value="text" id="text" />
                            <Label htmlFor="text" className="cursor-pointer flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Smartphone className="h-5 w-5 text-[#007185]" />
                                <div>
                                  <p className="font-medium">Text Message</p>
                                  <p className="text-sm text-[#565959]">Delivered in minutes</p>
                                </div>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 border-2 border-[#D5D9D9] rounded-lg">
                            <RadioGroupItem value="physical" id="physical" />
                            <Label htmlFor="physical" className="cursor-pointer flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="h-5 w-5 text-[#007185]" />
                                <div>
                                  <p className="font-medium">Physical Card</p>
                                  <p className="text-sm text-[#565959]">
                                    Ships in 3-5 business days (+ E£5.99)
                                  </p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {deliveryMethod === 'email' && (
                      <div className="space-y-4 p-4 bg-[#F7F8F8] rounded-lg">
                        <div>
                          <Label htmlFor="recipient-email">Recipient Email</Label>
                          <Input id="recipient-email" type="email" placeholder="recipient@example.com" />
                        </div>
                        <div>
                          <Label htmlFor="sender-name">Your Name</Label>
                          <Input id="sender-name" placeholder="Your name" />
                        </div>
                        <div>
                          <Label htmlFor="message">Personal Message (Optional)</Label>
                          <textarea
                            id="message"
                            className="w-full min-h-[100px] p-3 border border-[#D5D9D9] rounded-lg resize-none"
                            placeholder="Add a personal message..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="delivery-date">Delivery Date</Label>
                          <Input id="delivery-date" type="date" />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl mb-4">Order Summary</h3>
                
                {/* Preview */}
                <div className="aspect-[16/10] bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Gift className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-2xl font-bold">E£{selectedAmount}.00</p>
                    <p className="text-sm">Gift Card</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#565959]">Card Value:</span>
                    <span>E£{selectedAmount}.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#565959]">Delivery:</span>
                    <span>{deliveryMethod === 'physical' ? 'E£5.99' : 'FREE'}</span>
                  </div>
                  <div className="border-t border-[#D5D9D9] pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-medium">
                        E£{(parseFloat(selectedAmount) + (deliveryMethod === 'physical' ? 5.99 : 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-[#718096] hover:bg-[#4A5568] text-white mb-3">
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onNavigate('home')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Why Choose Our Gift Cards?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-[#718096]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-[#718096]" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#565959]">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2">How do I check my gift card balance?</h3>
                  <p className="text-sm text-[#565959]">
                    You can check your gift card balance by logging into your account and viewing the "Gift Card Balance" section.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Can I use multiple gift cards on one order?</h3>
                  <p className="text-sm text-[#565959]">
                    Yes, you can apply multiple gift cards to a single order during checkout.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Do gift cards expire?</h3>
                  <p className="text-sm text-[#565959]">
                    No, our gift cards never expire and have no fees.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Can I reload my gift card?</h3>
                  <p className="text-sm text-[#565959]">
                    Yes, you can reload your gift card with any amount from E£1 to E£2,000.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}