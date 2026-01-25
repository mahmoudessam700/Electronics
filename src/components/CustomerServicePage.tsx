import { Search, MessageCircle, Package, CreditCard, TruckIcon, RefreshCw, Shield, Headphones, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface CustomerServicePageProps {
  onNavigate: (page: string) => void;
}

export function CustomerServicePage({ onNavigate }: CustomerServicePageProps) {
  const quickLinks = [
    {
      icon: Package,
      title: 'Track Package',
      description: 'Check the status of your orders',
      color: 'text-blue-600'
    },
    {
      icon: RefreshCw,
      title: 'Returns & Refunds',
      description: 'Return or exchange items',
      color: 'text-green-600'
    },
    {
      icon: CreditCard,
      title: 'Payment Settings',
      description: 'Manage payment methods',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Account Security',
      description: 'Update password and settings',
      color: 'text-orange-600'
    },
    {
      icon: TruckIcon,
      title: 'Delivery Issues',
      description: 'Report delivery problems',
      color: 'text-red-600'
    },
    {
      icon: MessageCircle,
      title: 'Contact Us',
      description: 'Chat with customer support',
      color: 'text-indigo-600'
    }
  ];

  const faqs = [
    {
      category: 'Orders & Shipping',
      questions: [
        'How do I track my order?',
        'What are the shipping options?',
        'Can I change my shipping address?',
        'How long does delivery take?'
      ]
    },
    {
      category: 'Returns & Refunds',
      questions: [
        'How do I return an item?',
        'What is your return policy?',
        'When will I get my refund?',
        'Can I exchange an item?'
      ]
    },
    {
      category: 'Account & Security',
      questions: [
        'How do I reset my password?',
        'How do I update my email?',
        'Is my payment information secure?',
        'How do I delete my account?'
      ]
    },
    {
      category: 'Payment & Pricing',
      questions: [
        'What payment methods do you accept?',
        'Why was I charged sales tax?',
        'Do you offer price matching?',
        'How do I use a gift card?'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">How can we help you?</h1>
          <p className="text-[#565959] mb-6">
            Search our help library or browse by category
          </p>
          
          {/* Search Bar */}
          <div className="max-w-[600px] mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#565959]" />
              <Input
                type="text"
                placeholder="Describe your issue..."
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Card key={link.title} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gray-100 ${link.color}`}>
                      <link.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 group-hover:text-[#C7511F]">{link.title}</h3>
                      <p className="text-sm text-[#565959]">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#565959] group-hover:text-[#C7511F]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Browse by Topic */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Browse by Topic</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((section) => (
              <Card key={section.category}>
                <CardContent className="p-6">
                  <h3 className="text-xl mb-4">{section.category}</h3>
                  <ul className="space-y-3">
                    {section.questions.map((question) => (
                      <li key={question}>
                        <button className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline text-left">
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Options */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Still Need Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#718096] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">Live Chat</h3>
                <p className="text-sm text-[#565959] mb-4">
                  Chat with our support team
                </p>
                <Button className="bg-[#718096] hover:bg-[#4A5568] text-white">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#007185] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">Phone Support</h3>
                <p className="text-sm text-[#565959] mb-4">
                  Call us: 1-800-123-4567
                </p>
                <Button variant="outline">
                  Request Callback
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#232F3E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">Email Support</h3>
                <p className="text-sm text-[#565959] mb-4">
                  Get help via email
                </p>
                <Button variant="outline">
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Your Orders */}
        <section>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl mb-2">Looking for your orders?</h2>
                  <p className="text-[#565959]">
                    View order status, tracking information, and more
                  </p>
                </div>
                <Button 
                  onClick={() => onNavigate('home')}
                  className="bg-[#718096] hover:bg-[#4A5568] text-white"
                >
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}