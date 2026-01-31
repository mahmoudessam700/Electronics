import { RefreshCw, TrendingUp, Globe, Shield, ArrowUpDown, Info, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface CurrencyConverterPageProps {
  onNavigate: (page: string) => void;
}

export function CurrencyConverterPage({ onNavigate: _onNavigate }: CurrencyConverterPageProps) {
  const { t } = useLanguage();
  
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState('EGP');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<number | null>(null);

  // Mock exchange rates (relative to EGP)
  const exchangeRates: Record<string, number> = {
    EGP: 1,
    USD: 0.0323,
    EUR: 0.0298,
    GBP: 0.0256,
    SAR: 0.1212,
    AED: 0.1186,
    KWD: 0.0099,
    QAR: 0.1176,
    BHD: 0.0122,
    OMR: 0.0124,
    JOD: 0.0229,
    LBP: 2.906
  };

  const currencies = [
    { code: 'EGP', name: t('currency.egyptianPound'), flag: '🇪🇬' },
    { code: 'USD', name: t('currency.usDollar'), flag: '🇺🇸' },
    { code: 'EUR', name: t('currency.euro'), flag: '🇪🇺' },
    { code: 'GBP', name: t('currency.britishPound'), flag: '🇬🇧' },
    { code: 'SAR', name: t('currency.saudiRiyal'), flag: '🇸🇦' },
    { code: 'AED', name: t('currency.uaeDirham'), flag: '🇦🇪' },
    { code: 'KWD', name: t('currency.kuwaitiDinar'), flag: '🇰🇼' },
    { code: 'QAR', name: t('currency.qatariRiyal'), flag: '🇶🇦' },
    { code: 'BHD', name: t('currency.bahrainiDinar'), flag: '🇧🇭' },
    { code: 'OMR', name: t('currency.omaniRial'), flag: '🇴🇲' },
    { code: 'JOD', name: t('currency.jordanianDinar'), flag: '🇯🇴' }
  ];

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const amountNum = parseFloat(amount);
      const fromRate = exchangeRates[fromCurrency];
      const toRate = exchangeRates[toCurrency];
      const converted = (amountNum / fromRate) * toRate;
      setResult(converted);
    } else {
      setResult(null);
    }
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const features = [
    {
      icon: TrendingUp,
      title: t('currency.featureRealTime'),
      description: t('currency.featureRealTimeDesc')
    },
    {
      icon: Shield,
      title: t('currency.featureSecure'),
      description: t('currency.featureSecureDesc')
    },
    {
      icon: Globe,
      title: t('currency.featureGlobal'),
      description: t('currency.featureGlobalDesc')
    },
    {
      icon: Clock,
      title: t('currency.featureFast'),
      description: t('currency.featureFastDesc')
    }
  ];

  const popularConversions = [
    { from: 'USD', to: 'EGP', rate: (1 / exchangeRates['USD']).toFixed(2) },
    { from: 'EUR', to: 'EGP', rate: (1 / exchangeRates['EUR']).toFixed(2) },
    { from: 'GBP', to: 'EGP', rate: (1 / exchangeRates['GBP']).toFixed(2) },
    { from: 'SAR', to: 'EGP', rate: (1 / exchangeRates['SAR']).toFixed(2) },
    { from: 'AED', to: 'EGP', rate: (1 / exchangeRates['AED']).toFixed(2) },
    { from: 'KWD', to: 'EGP', rate: (1 / exchangeRates['KWD']).toFixed(2) }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] text-orange-200 py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <RefreshCw className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl mb-4 text-orange-200">{t('currency.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto text-orange-200">
            {t('currency.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Converter Card */}
        <section className="mb-12">
          <Card className="max-w-[800px] mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl mb-6 text-center">{t('currency.convertNow')}</h2>
              
              <div className="space-y-6">
                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount">{t('currency.amount')}</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl h-14"
                    placeholder="0.00"
                  />
                </div>

                {/* Currency Selection */}
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <div>
                    <Label>{t('currency.from')}</Label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full h-12 px-4 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={swapCurrencies}
                    className="w-12 h-12 bg-[#0891b2] text-white rounded-full flex items-center justify-center hover:bg-[#0e7490] transition-colors mt-6"
                  >
                    <ArrowUpDown className="h-5 w-5" />
                  </button>

                  <div>
                    <Label>{t('currency.to')}</Label>
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full h-12 px-4 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891b2]"
                    >
                      {currencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.flag} {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Result */}
                {result !== null && (
                  <div className="bg-[#F7F8F8] rounded-lg p-6 text-center">
                    <p className="text-sm text-[#565959] mb-2">
                      {amount} {fromCurrency} =
                    </p>
                    <p className="text-4xl font-bold text-[#0891b2]">
                      {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {toCurrency}
                    </p>
                    <p className="text-sm text-[#565959] mt-2">
                      1 {fromCurrency} = {(exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(4)} {toCurrency}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-[#565959]">
                  <Info className="h-4 w-4" />
                  {t('currency.rateDisclaimer')}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Popular Conversions */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6 text-center">{t('currency.popularRates')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {popularConversions.map((conversion) => (
              <Card key={`${conversion.from}-${conversion.to}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {currencies.find(c => c.code === conversion.from)?.flag}
                    </span>
                    <div>
                      <p className="font-medium">1 {conversion.from}</p>
                      <p className="text-sm text-[#565959]">{currencies.find(c => c.code === conversion.from)?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0891b2]">{conversion.rate}</p>
                    <p className="text-sm text-[#565959]">{conversion.to}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6 text-center">{t('currency.whyUseOurs')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-[#0891b2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-[#0891b2]" />
                  </div>
                  <h3 className="mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#565959]">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How to Use at Checkout */}
        <section>
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl mb-6 text-center">{t('currency.howToUse')}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0891b2] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    1
                  </div>
                  <h3 className="mb-2">{t('currency.step1Title')}</h3>
                  <p className="text-sm text-[#565959]">{t('currency.step1Desc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0891b2] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    2
                  </div>
                  <h3 className="mb-2">{t('currency.step2Title')}</h3>
                  <p className="text-sm text-[#565959]">{t('currency.step2Desc')}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#0891b2] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    3
                  </div>
                  <h3 className="mb-2">{t('currency.step3Title')}</h3>
                  <p className="text-sm text-[#565959]">{t('currency.step3Desc')}</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[#F7F8F8] rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('currency.noHiddenFees')}</p>
                    <p className="text-sm text-[#565959]">{t('currency.noHiddenFeesDesc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
