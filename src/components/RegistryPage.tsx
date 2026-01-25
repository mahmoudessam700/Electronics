import { Gift, Heart, Baby, Home, GraduationCap, Users, Plus, Search, Share2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface RegistryPageProps {
  onNavigate: (page: string) => void;
}

export function RegistryPage({ onNavigate }: RegistryPageProps) {
  const registryTypes = [
    {
      icon: Heart,
      title: 'Wedding Registry',
      description: 'Start your new life together with gifts you\'ll love',
      color: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      icon: Baby,
      title: 'Baby Registry',
      description: 'Get ready for your little one with everything you need',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: GraduationCap,
      title: 'Birthday & Graduation',
      description: 'Celebrate milestones with the perfect gifts',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: Home,
      title: 'Housewarming',
      description: 'Make your new house feel like home',
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  const popularRegistryItems = [
    {
      id: '1',
      name: 'KitchenAid Stand Mixer',
      price: 379.99,
      image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400',
      registries: 15234
    },
    {
      id: '2',
      name: 'Instant Pot Duo Crisp',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400',
      registries: 12876
    },
    {
      id: '3',
      name: 'Luxury Bedding Set',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      registries: 11543
    },
    {
      id: '4',
      name: 'Smart Home Security System',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
      registries: 9876
    }
  ];

  const benefits = [
    {
      icon: Gift,
      title: 'Easy to Create',
      description: 'Set up your registry in minutes'
    },
    {
      icon: Share2,
      title: 'Easy to Share',
      description: 'Share with family and friends instantly'
    },
    {
      icon: Users,
      title: 'Group Gifting',
      description: 'Let multiple people contribute to big items'
    },
    {
      icon: Home,
      title: 'Free Returns',
      description: '90-day return policy on registry items'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl mb-4">Gift Registry</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Create your perfect registry and share it with loved ones
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#0F1111] hover:bg-gray-100 px-8 py-6 text-lg">
              <Plus className="h-5 w-5 mr-2" />
              Create a Registry
            </Button>
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg">
              <Search className="h-5 w-5 mr-2" />
              Find a Registry
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Registry Types */}
        <section className="mb-12">
          <h2 className="text-3xl mb-6">Choose Your Registry Type</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {registryTypes.map((type) => (
              <Card key={type.title} className="group cursor-pointer hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-4 rounded-full ${type.color}`}>
                      <type.icon className={`h-8 w-8 ${type.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl mb-2 group-hover:text-[#C7511F]">{type.title}</h3>
                      <p className="text-[#565959] mb-4">{type.description}</p>
                      <Button className="bg-[#718096] hover:bg-[#4A5568] text-white">
                        Get Started
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Find a Registry */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl mb-6">Find a Registry</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Input placeholder="First Name" />
                <Input placeholder="Last Name" />
                <Input placeholder="Event Date (Optional)" type="date" />
              </div>
              <Button className="mt-4 bg-[#718096] hover:bg-[#4A5568] text-white">
                <Search className="h-4 w-4 mr-2" />
                Search Registries
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Popular Registry Items */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Most Popular Registry Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularRegistryItems.map((item) => (
              <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 overflow-hidden rounded-md bg-white flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h3 className="text-sm mb-2 line-clamp-2 group-hover:text-[#C7511F]">
                    {item.name}
                  </h3>
                  <p className="text-lg mb-1">E£{item.price}</p>
                  <p className="text-xs text-[#565959]">
                    On {item.registries.toLocaleString()} registries
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl mb-6">Why Create a Registry?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="p-6">
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

        {/* CTA Banner */}
        <section>
          <Card className="bg-gradient-to-r from-[#4A5568] to-[#718096] border-none text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl mb-4">Ready to Create Your Registry?</h2>
              <p className="text-lg mb-6 max-w-2xl mx-auto">
                It only takes a few minutes to set up. Add items from millions of products and share with friends and family.
              </p>
              <div className="flex gap-4 justify-center">
                <Button className="bg-white text-[#0F1111] hover:bg-gray-100 px-8 py-6 text-lg">
                  Create Registry
                </Button>
                <Button 
                  onClick={() => onNavigate('search')}
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg"
                >
                  Browse Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}