import { Megaphone, Target, BarChart3, Eye, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';

interface AdvertisePageProps {
  onNavigate: (page: string) => void;
}

export function AdvertisePage({ onNavigate: _onNavigate }: AdvertisePageProps) {
  const { t } = useLanguage();

  const adTypes = [
    {
      icon: Eye,
      title: t('advertise.sponsoredProducts'),
      description: t('advertise.sponsoredProductsDesc'),
      features: [
        t('advertise.featurePayPerClick'),
        t('advertise.featureKeywordTargeting'),
        t('advertise.featureAutoOptimization')
      ]
    },
    {
      icon: Megaphone,
      title: t('advertise.sponsoredBrands'),
      description: t('advertise.sponsoredBrandsDesc'),
      features: [
        t('advertise.featureCustomHeadline'),
        t('advertise.featureBrandLogo'),
        t('advertise.featureMultipleProducts')
      ]
    },
    {
      icon: Target,
      title: t('advertise.displayAds'),
      description: t('advertise.displayAdsDesc'),
      features: [
        t('advertise.featureAudienceTargeting'),
        t('advertise.featureRetargeting'),
        t('advertise.featureRichMedia')
      ]
    }
  ];

  const stats = [
    { value: '10M+', label: t('advertise.statActiveShoppers') },
    { value: '500%', label: t('advertise.statAvgROI') },
    { value: 'E£0.10', label: t('advertise.statMinCPC') },
    { value: '24hrs', label: t('advertise.statCampaignApproval') }
  ];

  const steps = [
    {
      number: '1',
      title: t('advertise.step1Title'),
      description: t('advertise.step1Desc')
    },
    {
      number: '2',
      title: t('advertise.step2Title'),
      description: t('advertise.step2Desc')
    },
    {
      number: '3',
      title: t('advertise.step3Title'),
      description: t('advertise.step3Desc')
    },
    {
      number: '4',
      title: t('advertise.step4Title'),
      description: t('advertise.step4Desc')
    }
  ];

  const testimonials = [
    {
      company: 'TechGadgets Co.',
      quote: t('advertise.testimonial1'),
      result: '+250% sales increase',
      logo: '🔌'
    },
    {
      company: 'Fashion Forward',
      quote: t('advertise.testimonial2'),
      result: '+180% brand visibility',
      logo: '👗'
    },
    {
      company: 'Home Essentials',
      quote: t('advertise.testimonial3'),
      result: '+320% traffic',
      logo: '🏠'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl mb-6">{t('advertise.title')}</h1>
              <p className="text-xl mb-8">
                {t('advertise.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-[#7c3aed] hover:bg-gray-100 px-8 py-6 text-lg">
                  {t('advertise.getStarted')}
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg">
                  {t('advertise.contactSales')}
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <BarChart3 className="h-24 w-24 mb-4" />
                <h3 className="text-2xl mb-2">{t('advertise.reachYourCustomers')}</h3>
                <p className="text-white/90">
                  {t('advertise.reachYourCustomersDesc')}
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
                  <p className="text-3xl font-bold text-[#7c3aed] mb-2">{stat.value}</p>
                  <p className="text-sm text-[#565959]">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Ad Types */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('advertise.adSolutions')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {adTypes.map((adType) => (
              <Card key={adType.title} className="h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-[#7c3aed]/10 rounded-full flex items-center justify-center mb-4">
                    <adType.icon className="h-8 w-8 text-[#7c3aed]" />
                  </div>
                  <h3 className="text-xl mb-2">{adType.title}</h3>
                  <p className="text-sm text-[#565959] mb-4">{adType.description}</p>
                  <ul className="space-y-2">
                    {adType.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4 bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
                    {t('advertise.learnMore')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('advertise.howItWorks')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-[#7c3aed] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="mb-2">{step.title}</h3>
                    <p className="text-sm text-[#565959]">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-[#7c3aed]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('advertise.successStories')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.company}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.logo}
                    </div>
                    <div>
                      <h3 className="font-medium">{testimonial.company}</h3>
                      <p className="text-sm text-[#007600]">{testimonial.result}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#565959] italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <Card className="max-w-[700px] mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <TrendingUp className="h-12 w-12 text-[#7c3aed] mx-auto mb-4" />
                <h2 className="text-2xl mb-2">{t('advertise.startAdvertising')}</h2>
                <p className="text-[#565959]">{t('advertise.contactUsToday')}</p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">{t('advertise.companyName')}</Label>
                    <Input id="company-name" placeholder="Your company" />
                  </div>
                  <div>
                    <Label htmlFor="contact-name">{t('advertise.contactName')}</Label>
                    <Input id="contact-name" placeholder="Your name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t('advertise.email')}</Label>
                    <Input id="email" type="email" placeholder="you@company.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('advertise.phone')}</Label>
                    <Input id="phone" type="tel" placeholder="+20 xxx xxx xxxx" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">{t('advertise.monthlyBudget')}</Label>
                  <select 
                    id="budget"
                    className="w-full h-10 px-3 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  >
                    <option>{t('advertise.selectBudget')}</option>
                    <option>E£1,000 - E£5,000</option>
                    <option>E£5,000 - E£10,000</option>
                    <option>E£10,000 - E£50,000</option>
                    <option>E£50,000+</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">{t('advertise.message')}</Label>
                  <textarea
                    id="message"
                    className="w-full min-h-[100px] p-3 border border-[#D5D9D9] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                    placeholder={t('advertise.messagePlaceholder')}
                  />
                </div>

                <Button className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-6 text-lg">
                  {t('advertise.submitInquiry')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
