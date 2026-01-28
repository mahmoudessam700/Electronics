import { Link, DollarSign, TrendingUp, BarChart3, Users, ArrowRight, Share2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';

interface AffiliatePageProps {
  onNavigate: (page: string) => void;
}

export function AffiliatePage({ onNavigate: _onNavigate }: AffiliatePageProps) {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: DollarSign,
      title: t('affiliate.earnCommissions'),
      description: t('affiliate.earnCommissionsDesc')
    },
    {
      icon: BarChart3,
      title: t('affiliate.trackPerformance'),
      description: t('affiliate.trackPerformanceDesc')
    },
    {
      icon: Share2,
      title: t('affiliate.easySharing'),
      description: t('affiliate.easySharingDesc')
    },
    {
      icon: Users,
      title: t('affiliate.dedicatedSupport'),
      description: t('affiliate.dedicatedSupportDesc')
    }
  ];

  const steps = [
    {
      number: '1',
      title: t('affiliate.step1Title'),
      description: t('affiliate.step1Desc')
    },
    {
      number: '2',
      title: t('affiliate.step2Title'),
      description: t('affiliate.step2Desc')
    },
    {
      number: '3',
      title: t('affiliate.step3Title'),
      description: t('affiliate.step3Desc')
    },
    {
      number: '4',
      title: t('affiliate.step4Title'),
      description: t('affiliate.step4Desc')
    }
  ];

  const commissionTiers = [
    { category: t('affiliate.tierElectronics'), rate: '8%' },
    { category: t('affiliate.tierFashion'), rate: '10%' },
    { category: t('affiliate.tierHome'), rate: '7%' },
    { category: t('affiliate.tierBooks'), rate: '5%' },
    { category: t('affiliate.tierBeauty'), rate: '12%' },
    { category: t('affiliate.tierSports'), rate: '6%' }
  ];

  const stats = [
    { value: 'E£50M+', label: t('affiliate.statPaid') },
    { value: '100K+', label: t('affiliate.statAffiliates') },
    { value: '15%', label: t('affiliate.statAvgCommission') },
    { value: '30', label: t('affiliate.statCookieDays') }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#059669] to-[#10b981] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl mb-6">{t('affiliate.title')}</h1>
              <p className="text-xl mb-8">
                {t('affiliate.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-[#059669] hover:bg-gray-100 px-8 py-6 text-lg">
                  {t('affiliate.joinNow')}
                </Button>
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg">
                  {t('affiliate.learnMore')}
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <Link className="h-24 w-24 mb-4" />
                <h3 className="text-2xl mb-2">{t('affiliate.earnWhileYouShare')}</h3>
                <p className="text-white/90">
                  {t('affiliate.earnWhileYouShareDesc')}
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
                  <p className="text-3xl font-bold text-[#059669] mb-2">{stat.value}</p>
                  <p className="text-sm text-[#565959]">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('affiliate.whyJoin')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-[#059669]" />
                  </div>
                  <h3 className="mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#565959]">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Commission Rates */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('affiliate.commissionRates')}</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commissionTiers.map((tier) => (
                  <div key={tier.category} className="flex items-center justify-between p-4 bg-[#F7F8F8] rounded-lg">
                    <span className="font-medium">{tier.category}</span>
                    <span className="text-2xl font-bold text-[#059669]">{tier.rate}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#565959] mt-6 text-center">
                {t('affiliate.ratesDisclaimer')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('affiliate.howItWorks')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-[#059669] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="mb-2">{step.title}</h3>
                    <p className="text-sm text-[#565959]">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-[#059669]" />
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
                <TrendingUp className="h-12 w-12 text-[#059669] mx-auto mb-4" />
                <h2 className="text-2xl mb-2">{t('affiliate.startEarning')}</h2>
                <p className="text-[#565959]">{t('affiliate.joinFree')}</p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">{t('affiliate.firstName')}</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="last-name">{t('affiliate.lastName')}</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t('affiliate.email')}</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>

                <div>
                  <Label htmlFor="website">{t('affiliate.website')}</Label>
                  <Input id="website" type="url" placeholder="https://yoursite.com" />
                </div>

                <div>
                  <Label htmlFor="audience">{t('affiliate.audience')}</Label>
                  <select 
                    id="audience"
                    className="w-full h-10 px-3 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#059669]"
                  >
                    <option>{t('affiliate.selectAudience')}</option>
                    <option>&lt; 1,000</option>
                    <option>1,000 - 10,000</option>
                    <option>10,000 - 100,000</option>
                    <option>100,000+</option>
                  </select>
                </div>

                <Button className="w-full bg-[#059669] hover:bg-[#047857] text-white py-6 text-lg">
                  {t('affiliate.createAccount')}
                </Button>
              </form>

              <p className="text-xs text-[#565959] text-center mt-4">
                {t('affiliate.termsAgreement')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl mb-6">{t('affiliate.faq')}</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{t('affiliate.faq1')}</h3>
                  <p className="text-sm text-[#565959]">{t('affiliate.faq1Answer')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('affiliate.faq2')}</h3>
                  <p className="text-sm text-[#565959]">{t('affiliate.faq2Answer')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('affiliate.faq3')}</h3>
                  <p className="text-sm text-[#565959]">{t('affiliate.faq3Answer')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('affiliate.faq4')}</h3>
                  <p className="text-sm text-[#565959]">{t('affiliate.faq4Answer')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
