import { Store, TrendingUp, Users, Package, DollarSign, Headphones, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SellPageProps {
  onNavigate: (page: string) => void;
}

export function SellPage({ onNavigate }: SellPageProps) {
  const benefits = [
    {
      icon: Users,
      title: 'Millions of Customers',
      description: 'Reach millions of active shoppers looking for products like yours'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Business',
      description: 'Tools and insights to help scale your business'
    },
    {
      icon: Package,
      title: 'Easy Fulfillment',
      description: 'We can handle storage, packing, and shipping for you'
    },
    {
      icon: Headphones,
      title: 'Seller Support',
      description: 'Dedicated support team to help you succeed'
    }
  ];

  const plans = [
    {
      name: 'Individual',
      price: '0.99',
      per: 'per item sold',
      features: [
        'No monthly subscription fee',
        'Pay only when you sell',
        'Access to basic selling tools',
        'Sell up to 40 items per month'
      ],
      recommended: false
    },
    {
      name: 'Professional',
      price: '39.99',
      per: 'per month',
      features: [
        'No per-item fees',
        'Unlimited listings',
        'Advanced selling tools',
        'Bulk listing and reporting',
        'API access',
        'Featured placement options'
      ],
      recommended: true
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Your Account',
      description: 'Sign up and provide your business information'
    },
    {
      number: '2',
      title: 'List Your Products',
      description: 'Add product details, images, and pricing'
    },
    {
      number: '3',
      title: 'Start Selling',
      description: 'Receive orders and manage your inventory'
    },
    {
      number: '4',
      title: 'Get Paid',
      description: 'Receive payments directly to your bank account'
    }
  ];

  const stats = [
    { value: '10M+', label: 'Active Buyers' },
    { value: '2M+', label: 'Sellers Worldwide' },
    { value: '500M+', label: 'Products Listed' },
    { value: '99%', label: 'Customer Satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4A5568] to-[#718096] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl mb-6">Start Selling Today</h1>
              <p className="text-xl mb-8">
                Join millions of sellers and grow your business with our powerful e-commerce platform
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-[#0F1111] hover:bg-gray-100 px-8 py-6 text-lg">
                  Start Selling
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <Store className="h-24 w-24 mb-4" />
                <h3 className="text-2xl mb-2">Your Store, Your Success</h3>
                <p className="text-white/90">
                  Everything you need to build and manage a successful online business
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-[#718096] mb-2">{stat.value}</p>
                  <p className="text-sm text-[#565959]">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">Why Sell With Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#718096]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-[#718096]" />
                  </div>
                  <h3 className="mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#565959]">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">Choose Your Selling Plan</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.recommended ? 'border-2 border-[#718096]' : ''}`}>
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#718096] text-white px-4 py-1 rounded-full text-sm">
                    Recommended
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl mb-4">{plan.name}</h3>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-bold">E£{plan.price}</span>
                      <span className="text-[#565959]">{plan.per}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.recommended 
                        ? 'bg-[#718096] hover:bg-[#4A5568] text-white' 
                        : 'bg-[#718096] hover:bg-[#4A5568] text-white'
                    }`}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-[#718096] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="mb-2">{step.title}</h3>
                    <p className="text-sm text-[#565959]">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-[#718096]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sign Up Form */}
        <section className="mb-16">
          <Card className="max-w-[600px] mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <DollarSign className="h-12 w-12 text-[#718096] mx-auto mb-4" />
                <h2 className="text-2xl mb-2">Ready to Start Selling?</h2>
                <p className="text-[#565959]">Create your seller account in minutes</p>
              </div>

              <form className="space-y-4">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" placeholder="Your business name" />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                </div>

                <div>
                  <Label htmlFor="category">Product Category</Label>
                  <select 
                    id="category"
                    className="w-full h-10 px-3 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#718096]"
                  >
                    <option>Select a category</option>
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home & Kitchen</option>
                    <option>Books</option>
                    <option>Sports & Outdoors</option>
                    <option>Other</option>
                  </select>
                </div>

                <Button className="w-full bg-[#718096] hover:bg-[#4A5568] text-white py-6 text-lg">
                  Create Seller Account
                </Button>
              </form>

              <p className="text-xs text-[#565959] text-center mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Success Stories */}
        <section>
          <h2 className="text-3xl mb-8 text-center">Seller Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah\'s Boutique',
                quote: 'I went from selling locally to reaching customers nationwide. My sales have tripled!',
                revenue: 'E£50K+ monthly'
              },
              {
                name: 'Tech Gadgets Pro',
                quote: 'The fulfillment service saved me so much time. I can focus on growing my product line.',
                revenue: 'E£100K+ monthly'
              },
              {
                name: 'HomeStyle Decor',
                quote: 'Starting was so easy. Within a week, I made my first sale. Now it\'s my full-time business!',
                revenue: 'E£30K+ monthly'
              }
            ].map((story) => (
              <Card key={story.name}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#718096]/10 rounded-full flex items-center justify-center">
                      <Store className="h-6 w-6 text-[#718096]" />
                    </div>
                    <div>
                      <h3 className="font-medium">{story.name}</h3>
                      <p className="text-sm text-[#007600]">{story.revenue}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#565959] italic">"{story.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}