import { Store, TrendingUp, Users, Package, DollarSign, Headphones, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';

interface SellPageProps {
  onNavigate: (page: string) => void;
}

export function SellPage({ onNavigate: _onNavigate }: SellPageProps) {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Users,
      title: t('sell.millionsOfCustomers'),
      description: t('sell.millionsOfCustomersDesc')
    },
    {
      icon: TrendingUp,
      title: t('sell.growYourBusiness'),
      description: t('sell.growYourBusinessDesc')
    },
    {
      icon: Package,
      title: t('sell.easyFulfillment'),
      description: t('sell.easyFulfillmentDesc')
    },
    {
      icon: Headphones,
      title: t('sell.sellerSupport'),
      description: t('sell.sellerSupportDesc')
    }
  ];

  const plans = [
    {
      name: t('sell.individual'),
      price: '0.99',
      per: t('sell.perItemSold'),
      features: [
        t('sell.individualFeature1'),
        t('sell.individualFeature2'),
        t('sell.individualFeature3'),
        t('sell.individualFeature4')
      ],
      recommended: false
    },
    {
      name: t('sell.professional'),
      price: '39.99',
      per: t('sell.perMonth'),
      features: [
        t('sell.professionalFeature1'),
        t('sell.professionalFeature2'),
        t('sell.professionalFeature3'),
        t('sell.professionalFeature4'),
        t('sell.professionalFeature5'),
        t('sell.professionalFeature6')
      ],
      recommended: true
    }
  ];

  const steps = [
    {
      number: '1',
      title: t('sell.step1Title'),
      description: t('sell.step1Desc')
    },
    {
      number: '2',
      title: t('sell.step2Title'),
      description: t('sell.step2Desc')
    },
    {
      number: '3',
      title: t('sell.step3Title'),
      description: t('sell.step3Desc')
    },
    {
      number: '4',
      title: t('sell.step4Title'),
      description: t('sell.step4Desc')
    }
  ];

  const stats = [
    { value: '10M+', label: t('sell.statActiveBuyers') },
    { value: '2M+', label: t('sell.statSellersWorldwide') },
    { value: '500M+', label: t('sell.statProductsListed') },
    { value: '99%', label: t('sell.statCustomerSatisfaction') }
  ];

  const successStories = [
    {
      name: t('sell.story1Name'),
      quote: t('sell.story1Quote'),
      revenue: t('sell.story1Revenue')
    },
    {
      name: t('sell.story2Name'),
      quote: t('sell.story2Quote'),
      revenue: t('sell.story2Revenue')
    },
    {
      name: t('sell.story3Name'),
      quote: t('sell.story3Quote'),
      revenue: t('sell.story3Revenue')
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#4A5568] to-[#718096] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl mb-6">{t('sell.title')}</h1>
              <p className="text-xl mb-8">
                {t('sell.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-[#0F1111] hover:bg-gray-100 px-8 py-6 text-lg">
                  {t('sell.startSelling')}
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg">
                  {t('sell.learnMore')}
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <Store className="h-24 w-24 mb-4" />
                <h3 className="text-2xl mb-2">{t('sell.yourStoreYourSuccess')}</h3>
                <p className="text-white/90">
                  {t('sell.yourStoreDesc')}
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
          <h2 className="text-3xl mb-8 text-center">{t('sell.whySellWithUs')}</h2>
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
          <h2 className="text-3xl mb-8 text-center">{t('sell.choosePlan')}</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.recommended ? 'border-2 border-[#718096]' : ''}`}>
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#718096] text-white px-4 py-1 rounded-full text-sm">
                    {t('sell.recommended')}
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
                    {t('registry.getStarted')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('sell.howItWorks')}</h2>
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
                <h2 className="text-2xl mb-2">{t('sell.readyToStart')}</h2>
                <p className="text-[#565959]">{t('sell.createInMinutes')}</p>
              </div>

              <form className="space-y-4">
                <div>
                  <Label htmlFor="business-name">{t('sell.businessName')}</Label>
                  <Input id="business-name" placeholder={t('sell.businessName')} />
                </div>

                <div>
                  <Label htmlFor="email">{t('sell.emailAddress')}</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>

                <div>
                  <Label htmlFor="phone">{t('sell.phoneNumber')}</Label>
                  <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                </div>

                <div>
                  <Label htmlFor="category">{t('sell.productCategory')}</Label>
                  <select 
                    id="category"
                    className="w-full h-10 px-3 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#718096]"
                  >
                    <option>{t('sell.selectCategory')}</option>
                    <option>{t('sell.electronics')}</option>
                    <option>{t('sell.fashion')}</option>
                    <option>{t('sell.homeKitchen')}</option>
                    <option>{t('sell.books')}</option>
                    <option>{t('sell.sportsOutdoors')}</option>
                    <option>{t('sell.other')}</option>
                  </select>
                </div>

                <Button className="w-full bg-[#718096] hover:bg-[#4A5568] text-white py-6 text-lg">
                  {t('sell.createSellerAccount')}
                </Button>
              </form>

              <p className="text-xs text-[#565959] text-center mt-4">
                {t('sell.termsAgreement')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Success Stories */}
        <section>
          <h2 className="text-3xl mb-8 text-center">{t('sell.successStories')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story) => (
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