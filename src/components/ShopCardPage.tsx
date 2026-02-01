import { CreditCard, Shield, Gift, Percent, CheckCircle, Lock, Star, Wallet } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';

interface ShopCardPageProps {
  onNavigate: (page: string) => void;
}

export function ShopCardPage({ onNavigate: _onNavigate }: ShopCardPageProps) {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: Percent,
      title: t('shopCard.cashback'),
      description: t('shopCard.cashbackDesc')
    },
    {
      icon: Gift,
      title: t('shopCard.welcomeBonus'),
      description: t('shopCard.welcomeBonusDesc')
    },
    {
      icon: Shield,
      title: t('shopCard.nannualFee'),
      description: t('shopCard.noAnnualFeeDesc')
    },
    {
      icon: Lock,
      title: t('shopCard.secureShopping'),
      description: t('shopCard.secureShoppingDesc')
    }
  ];

  const features = [
    t('shopCard.feature1'),
    t('shopCard.feature2'),
    t('shopCard.feature3'),
    t('shopCard.feature4'),
    t('shopCard.feature5'),
    t('shopCard.feature6')
  ];

  const tiers = [
    {
      name: t('shopCard.tierBasic'),
      minSpend: 'E£0',
      cashback: '2%',
      color: 'bg-gray-400'
    },
    {
      name: t('shopCard.tierSilver'),
      minSpend: 'E£5,000/year',
      cashback: '3%',
      color: 'bg-gray-500'
    },
    {
      name: t('shopCard.tierGold'),
      minSpend: 'E£15,000/year',
      cashback: '5%',
      color: 'bg-yellow-500'
    },
    {
      name: t('shopCard.tierPlatinum'),
      minSpend: 'E£30,000/year',
      cashback: '7%',
      color: 'bg-gray-700'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-orange-600 py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl mb-6">{t('shopCard.title')}</h1>
              <p className="text-xl mb-8">
                {t('shopCard.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg">
                  {t('shopCard.applyNow')}
                </Button>
                <Button variant="outline" className="border-2 border-white text-orange-600 hover:bg-white/20 px-8 py-6 text-lg">
                  {t('shopCard.learnMore')}
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                {/* Card Design */}
                <div className="w-80 h-48 bg-gradient-to-br from-[#1e3a8a] to-[#3730a3] rounded-xl shadow-2xl p-6 text-white">
                  <div className="flex justify-between items-start">
                    <div className="text-2xl font-bold">Adsolutions</div>
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-700" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="text-lg tracking-widest">•••• •••• •••• 1234</div>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-white/70">{t('shopCard.cardHolder')}</p>
                      <p className="text-sm">YOUR NAME</p>
                    </div>
                    <CreditCard className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('shopCard.cardBenefits')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#1e40af]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-8 w-8 text-[#1e40af]" />
                  </div>
                  <h3 className="mb-2">{benefit.title}</h3>
                  <p className="text-sm text-[#565959]">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Cashback Tiers */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('shopCard.cashbackTiers')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <Card key={tier.name} className="overflow-hidden">
                <div className={`h-2 ${tier.color}`}></div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl mb-2">{tier.name}</h3>
                  <p className="text-4xl font-bold text-[#1e40af] mb-2">{tier.cashback}</p>
                  <p className="text-sm text-[#565959]">{t('shopCard.cashbackLabel')}</p>
                  <div className="border-t border-[#D5D9D9] my-4"></div>
                  <p className="text-sm">
                    <span className="text-[#565959]">{t('shopCard.minSpend')}: </span>
                    <span className="font-medium">{tier.minSpend}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Features */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl mb-6">{t('shopCard.allFeatures')}</h2>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Wallet className="h-12 w-12 text-[#1e40af]" />
                  <div>
                    <h3 className="text-xl">{t('shopCard.rewardsBalance')}</h3>
                    <p className="text-3xl font-bold text-[#1e40af]">E£1,234.56</p>
                  </div>
                </div>
                <p className="text-sm text-[#565959] mb-4">
                  {t('shopCard.rewardsBalanceDesc')}
                </p>
                <Button className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white">
                  {t('shopCard.redeemRewards')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Application Form */}
        <section>
          <Card className="max-w-[600px] mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <CreditCard className="h-12 w-12 text-[#1e40af] mx-auto mb-4" />
                <h2 className="text-2xl mb-2">{t('shopCard.applyForCard')}</h2>
                <p className="text-[#565959]">{t('shopCard.quickApproval')}</p>
              </div>

              <form className="space-y-4">
                <div>
                  <Label htmlFor="full-name">{t('shopCard.fullName')}</Label>
                  <Input id="full-name" placeholder="As shown on ID" />
                </div>

                <div>
                  <Label htmlFor="email">{t('shopCard.email')}</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>

                <div>
                  <Label htmlFor="phone">{t('shopCard.phone')}</Label>
                  <Input id="phone" type="tel" placeholder="+20 xxx xxx xxxx" />
                </div>

                <div>
                  <Label htmlFor="national-id">{t('shopCard.nationalId')}</Label>
                  <Input id="national-id" placeholder="14 digit ID number" maxLength={14} />
                </div>

                <div>
                  <Label htmlFor="income">{t('shopCard.monthlyIncome')}</Label>
                  <select 
                    id="income"
                    className="w-full h-10 px-3 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e40af]"
                  >
                    <option>{t('shopCard.selectIncome')}</option>
                    <option>E£3,000 - E£7,000</option>
                    <option>E£7,000 - E£15,000</option>
                    <option>E£15,000 - E£30,000</option>
                    <option>E£30,000+</option>
                  </select>
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" id="agree" className="mt-1" />
                  <Label htmlFor="agree" className="text-sm text-[#565959]">
                    {t('shopCard.agreeTerms')}
                  </Label>
                </div>

                <Button className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white py-6 text-lg">
                  {t('shopCard.submitApplication')}
                </Button>
              </form>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#565959]">
                <Lock className="h-4 w-4" />
                {t('shopCard.secureApplication')}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl mb-6">{t('shopCard.faq')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t('shopCard.faq1')}</h3>
                  <p className="text-sm text-[#565959]">{t('shopCard.faq1Answer')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('shopCard.faq2')}</h3>
                  <p className="text-sm text-[#565959]">{t('shopCard.faq2Answer')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{t('shopCard.faq3')}</h3>
                  <p className="text-sm text-[#565959]">{t('shopCard.faq3Answer')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
