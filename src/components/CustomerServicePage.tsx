import { Search, MessageCircle, Package, CreditCard, TruckIcon, RefreshCw, Shield, Headphones, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface CustomerServicePageProps {
  onNavigate: (page: string) => void;
}

export function CustomerServicePage({ onNavigate }: CustomerServicePageProps) {
  const { t } = useLanguage();

  const quickLinks = [
    {
      icon: Package,
      title: t('customerService.trackPackage'),
      description: t('customerService.trackPackageDesc'),
      color: 'text-blue-600'
    },
    {
      icon: RefreshCw,
      title: t('customerService.returnsRefunds'),
      description: t('customerService.returnsRefundsDesc'),
      color: 'text-green-600'
    },
    {
      icon: CreditCard,
      title: t('customerService.paymentSettings'),
      description: t('customerService.paymentSettingsDesc'),
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: t('customerService.accountSecurity'),
      description: t('customerService.accountSecurityDesc'),
      color: 'text-orange-600'
    },
    {
      icon: TruckIcon,
      title: t('customerService.deliveryIssues'),
      description: t('customerService.deliveryIssuesDesc'),
      color: 'text-red-600'
    },
    {
      icon: MessageCircle,
      title: t('customerService.contactUs'),
      description: t('customerService.contactUsDesc'),
      color: 'text-indigo-600'
    }
  ];

  const faqs = [
    {
      category: t('customerService.ordersShipping'),
      questions: [
        t('customerService.ordersShippingQ1'),
        t('customerService.ordersShippingQ2'),
        t('customerService.ordersShippingQ3'),
        t('customerService.ordersShippingQ4')
      ]
    },
    {
      category: t('customerService.returnsRefundsSection'),
      questions: [
        t('customerService.returnsRefundsQ1'),
        t('customerService.returnsRefundsQ2'),
        t('customerService.returnsRefundsQ3'),
        t('customerService.returnsRefundsQ4')
      ]
    },
    {
      category: t('customerService.accountSecuritySection'),
      questions: [
        t('customerService.accountSecurityQ1'),
        t('customerService.accountSecurityQ2'),
        t('customerService.accountSecurityQ3'),
        t('customerService.accountSecurityQ4')
      ]
    },
    {
      category: t('customerService.paymentPricing'),
      questions: [
        t('customerService.paymentPricingQ1'),
        t('customerService.paymentPricingQ2'),
        t('customerService.paymentPricingQ3'),
        t('customerService.paymentPricingQ4')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">{t('customerService.howCanWeHelp')}</h1>
          <p className="text-[#565959] mb-6">
            {t('customerService.searchHelp')}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-[600px] mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#565959]" />
              <Input
                type="text"
                placeholder={t('customerService.searchPlaceholder')}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">{t('customerService.quickLinks')}</h2>
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
          <h2 className="text-2xl mb-6">{t('customerService.browseByTopic')}</h2>
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
          <h2 className="text-2xl mb-6">{t('customerService.stillNeedHelp')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#718096] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">{t('customerService.liveChat')}</h3>
                <p className="text-sm text-[#565959] mb-4">
                  {t('customerService.liveChatDesc')}
                </p>
                <Button className="bg-[#718096] hover:bg-[#4A5568] text-white">
                  {t('customerService.startChat')}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#007185] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">{t('customerService.phoneSupport')}</h3>
                <p className="text-sm text-[#565959] mb-4">
                  {t('customerService.phoneSupportDesc')}
                </p>
                <Button variant="outline">
                  {t('customerService.requestCallback')}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#232F3E] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl mb-2">{t('customerService.emailSupport')}</h3>
                <p className="text-sm text-[#565959] mb-4">
                  {t('customerService.emailSupportDesc')}
                </p>
                <Button variant="outline">
                  {t('customerService.sendEmail')}
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
                  <h2 className="text-2xl mb-2">{t('customerService.lookingForOrders')}</h2>
                  <p className="text-[#565959]">
                    {t('customerService.lookingForOrdersDesc')}
                  </p>
                </div>
                <Button 
                  onClick={() => onNavigate('home')}
                  className="bg-[#718096] hover:bg-[#4A5568] text-white"
                >
                  {t('customerService.viewOrders')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}