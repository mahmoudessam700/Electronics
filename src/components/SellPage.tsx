import { useState, useEffect, useRef } from 'react';
import { Store, TrendingUp, Users, Package, DollarSign, Headphones, CheckCircle, ArrowRight, Loader2, MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface SellPageProps {
  onNavigate: (page: string) => void;
}

export function SellPage({ onNavigate }: SellPageProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    shopDescription: '',
    address: '',
    category: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Initialize map
  useEffect(() => {
    if (user) return; // Don't init map if user is logged in
    
    // Wait for DOM to render
    const initTimeout = setTimeout(async () => {
      const mapContainer = document.getElementById('sell-page-map');
      if (!mapContainer || mapInstanceRef.current) return;

      // Add critical Leaflet CSS inline
      if (!document.getElementById('leaflet-inline-css')) {
        const style = document.createElement('style');
        style.id = 'leaflet-inline-css';
        style.textContent = `
          .leaflet-pane, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow,
          .leaflet-tile-container, .leaflet-pane > svg, .leaflet-pane > canvas,
          .leaflet-zoom-box, .leaflet-image-layer, .leaflet-layer { position: absolute; left: 0; top: 0; }
          .leaflet-container { overflow: hidden; }
          .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow { user-select: none; -webkit-user-select: none; }
          .leaflet-tile::selection { background: transparent; }
          .leaflet-safari .leaflet-tile { image-rendering: -webkit-optimize-contrast; }
          .leaflet-safari .leaflet-tile-container { width: 1600px; height: 1600px; -webkit-transform-origin: 0 0; }
          .leaflet-marker-icon, .leaflet-marker-shadow { display: block; }
          .leaflet-container .leaflet-overlay-pane svg { max-width: none !important; max-height: none !important; }
          .leaflet-container .leaflet-marker-pane img,
          .leaflet-container .leaflet-shadow-pane img,
          .leaflet-container .leaflet-tile-pane img,
          .leaflet-container img.leaflet-image-layer,
          .leaflet-container .leaflet-tile { max-width: none !important; max-height: none !important; width: auto; padding: 0; }
          .leaflet-container.leaflet-touch-zoom { touch-action: pan-x pan-y; }
          .leaflet-container.leaflet-touch-drag { touch-action: none; touch-action: pinch-zoom; }
          .leaflet-container.leaflet-touch-drag.leaflet-touch-zoom { touch-action: none; }
          .leaflet-container { -webkit-tap-highlight-color: transparent; }
          .leaflet-tile { filter: inherit; visibility: hidden; }
          .leaflet-tile-loaded { visibility: inherit; }
          .leaflet-zoom-box { width: 0; height: 0; box-sizing: border-box; z-index: 800; }
          .leaflet-overlay-pane svg { -moz-user-select: none; }
          .leaflet-pane { z-index: 400; }
          .leaflet-tile-pane { z-index: 200; }
          .leaflet-overlay-pane { z-index: 400; }
          .leaflet-shadow-pane { z-index: 500; }
          .leaflet-marker-pane { z-index: 600; }
          .leaflet-tooltip-pane { z-index: 650; }
          .leaflet-popup-pane { z-index: 700; }
          .leaflet-map-pane canvas { z-index: 100; }
          .leaflet-map-pane svg { z-index: 200; }
          .leaflet-control { position: relative; z-index: 800; pointer-events: visiblePainted; pointer-events: auto; }
          .leaflet-top, .leaflet-bottom { position: absolute; z-index: 1000; pointer-events: none; }
          .leaflet-top { top: 0; }
          .leaflet-right { right: 0; }
          .leaflet-bottom { bottom: 0; }
          .leaflet-left { left: 0; }
          .leaflet-control { float: left; clear: both; }
          .leaflet-right .leaflet-control { float: right; }
          .leaflet-top .leaflet-control { margin-top: 10px; }
          .leaflet-bottom .leaflet-control { margin-bottom: 10px; }
          .leaflet-left .leaflet-control { margin-left: 10px; }
          .leaflet-right .leaflet-control { margin-right: 10px; }
          .leaflet-control-zoom-in, .leaflet-control-zoom-out { font: bold 18px 'Lucida Console', Monaco, monospace; text-indent: 1px; }
          .leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out { font-size: 22px; }
          .leaflet-touch .leaflet-bar a { width: 30px; height: 30px; line-height: 30px; }
          .leaflet-touch .leaflet-bar a:first-child { border-top-left-radius: 2px; border-top-right-radius: 2px; }
          .leaflet-touch .leaflet-bar a:last-child { border-bottom-left-radius: 2px; border-bottom-right-radius: 2px; }
          .leaflet-bar { box-shadow: 0 1px 5px rgba(0,0,0,0.65); border-radius: 4px; }
          .leaflet-bar a, .leaflet-bar a:hover { background-color: #fff; border-bottom: 1px solid #ccc; width: 26px; height: 26px; line-height: 26px; display: block; text-align: center; text-decoration: none; color: black; }
          .leaflet-bar a:hover { background-color: #f4f4f4; }
          .leaflet-bar a:first-child { border-top-left-radius: 4px; border-top-right-radius: 4px; }
          .leaflet-bar a:last-child { border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; border-bottom: none; }
          .leaflet-container .leaflet-control-attribution { background: #fff; background: rgba(255,255,255,0.8); margin: 0; }
          .leaflet-control-attribution, .leaflet-control-scale-line { padding: 0 5px; color: #333; line-height: 1.4; }
          #sell-page-map { z-index: 0 !important; }
          #sell-page-map .leaflet-container { background: #e5e7eb; }
        `;
        document.head.appendChild(style);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.head.appendChild(script);
        });
      }

      // Wait a moment for Leaflet to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const L = (window as any).L;
      if (!L) {
        console.error('Leaflet not loaded');
        return;
      }

      // Fix Leaflet default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      
      // Default to Cairo, Egypt
      const defaultLat = 30.0444;
      const defaultLng = 31.2357;

      try {
        console.log('Initializing map...');
        const map = L.map(mapContainer, {
          center: [defaultLat, defaultLng],
          zoom: 13,
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
        console.log('Map initialized successfully');
      
        marker.on('dragend', function(e: any) {
          const position = e.target.getLatLng();
          setFormData(prev => ({
            ...prev,
            latitude: position.lat,
            longitude: position.lng
          }));
          reverseGeocode(position.lat, position.lng);
        });

        map.on('click', function(e: any) {
          marker.setLatLng(e.latlng);
          setFormData(prev => ({
            ...prev,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Invalidate size after a short delay to fix rendering
        setTimeout(() => {
          map.invalidateSize();
          // Auto-detect location after map is ready
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, latitude, longitude }));
                map.setView([latitude, longitude], 15);
                marker.setLatLng([latitude, longitude]);
                // Reverse geocode for address
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.display_name) {
                      setFormData(prev => ({ ...prev, address: data.display_name }));
                    }
                  })
                  .catch(console.error);
              },
              () => console.log('Geolocation denied'),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        }, 300);
      } catch (err) {
        console.error('Map initialization error:', err);
      }
    }, 500); // Wait 500ms for DOM to render

    return () => {
      clearTimeout(initTimeout);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [user]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('sell.geolocationNotSupported'));
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude
        }));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
        }

        reverseGeocode(latitude, longitude);
        setIsDetectingLocation(false);
        toast.success(t('sell.locationDetected'));
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsDetectingLocation(false);
        toast.error(t('sell.locationDetectionFailed'));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.shopName) {
      toast.error(t('sell.fillRequiredFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('sell.passwordsMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('sell.passwordTooShort'));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth?action=register-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          shopName: formData.shopName,
          shopDescription: formData.shopDescription,
          latitude: formData.latitude,
          longitude: formData.longitude,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t('sell.accountCreatedSuccess'));
        onNavigate('sign-in');
      } else {
        toast.error(data.error || t('sell.registrationFailed'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('sell.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Button variant="outline" className="border-2 border-white text-black hover:bg-white/20 px-8 py-6 text-lg">
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
          <Card className="max-w-[700px] mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <DollarSign className="h-12 w-12 text-[#718096] mx-auto mb-4" />
                <h2 className="text-2xl mb-2">{t('sell.readyToStart')}</h2>
                <p className="text-[#565959]">{t('sell.createInMinutes')}</p>
              </div>

              {user ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t('sell.alreadyLoggedIn')}</h3>
                  <p className="text-[#565959] mb-4">{t('sell.alreadyLoggedInDesc')}</p>
                  <Button 
                    onClick={() => onNavigate('shop/dashboard')}
                    className="bg-[#718096] hover:bg-[#4A5568] text-white"
                  >
                    {t('sell.goToDashboard')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('sell.fullName')} *</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('sell.fullName')}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('sell.emailAddress')} *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="text-left"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('sell.phoneNumber')}</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+20 100 123 4567"
                      className="text-left"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">{t('sell.password')} *</Label>
                      <Input 
                        id="password" 
                        type="password"
                        dir="ltr"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="text-left"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{t('sell.confirmPassword')} *</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        dir="ltr"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="text-left"
                        required
                      />
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Store className="h-5 w-5 text-[#718096]" />
                      {t('sell.shopInformation')}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shopName">{t('sell.businessName')} *</Label>
                        <Input 
                          id="shopName"
                          value={formData.shopName}
                          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                          placeholder={t('sell.businessName')}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="shopDescription">{t('sell.shopDescription')}</Label>
                        <textarea 
                          id="shopDescription"
                          value={formData.shopDescription}
                          onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                          placeholder={t('sell.shopDescriptionPlaceholder')}
                          className="w-full h-20 px-3 py-2 border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#718096] resize-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">{t('sell.productCategory')}</Label>
                        <select 
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            border: '1px solid #D5D9D9',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            WebkitAppearance: 'menulist',
                            MozAppearance: 'menulist',
                            appearance: 'menulist',
                          }}
                        >
                          <option value="">{t('sell.selectCategory')}</option>
                          <option value="electronics">{t('sell.electronics')}</option>
                          <option value="fashion">{t('sell.fashion')}</option>
                          <option value="home">{t('sell.homeKitchen')}</option>
                          <option value="books">{t('sell.books')}</option>
                          <option value="sports">{t('sell.sportsOutdoors')}</option>
                          <option value="other">{t('sell.other')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#718096]" />
                        {t('sell.shopLocation')}
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={detectLocation}
                        disabled={isDetectingLocation}
                        className="text-sm"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Navigation className="h-4 w-4 mr-1" />
                        )}
                        {t('sell.detectMyLocation')}
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="address">{t('sell.address')}</Label>
                      <Input 
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder={t('sell.addressPlaceholder')}
                        className="mb-3"
                      />
                    </div>

                    <p className="text-sm text-[#565959] mb-2">{t('sell.clickMapToSetLocation')}</p>
                    <div 
                      id="sell-page-map"
                      style={{
                        width: '100%',
                        height: '300px',
                        borderRadius: '8px',
                        border: '1px solid #D5D9D9',
                        backgroundColor: '#e5e7eb',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    />
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-[#565959] mt-2" dir="ltr">
                        📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#718096] hover:bg-[#4A5568] text-white py-6 text-lg mt-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {t('sell.creatingAccount')}
                      </>
                    ) : (
                      t('sell.createSellerAccount')
                    )}
                  </Button>
                </form>
              )}

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