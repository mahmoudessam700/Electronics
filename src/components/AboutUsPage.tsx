import { Building2, Globe, Award, Heart, Rocket, Shield } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutUsPageProps {
  onNavigate: (page: string) => void;
}

export function AboutUsPage({ onNavigate: _onNavigate }: AboutUsPageProps) {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: t('aboutUs.customerFirst'),
      description: t('aboutUs.customerFirstDesc')
    },
    {
      icon: Rocket,
      title: t('aboutUs.innovation'),
      description: t('aboutUs.innovationDesc')
    },
    {
      icon: Shield,
      title: t('aboutUs.trust'),
      description: t('aboutUs.trustDesc')
    },
    {
      icon: Globe,
      title: t('aboutUs.sustainability'),
      description: t('aboutUs.sustainabilityDesc')
    }
  ];

  const stats = [
    { value: '10M+', label: t('aboutUs.statCustomers') },
    { value: '50+', label: t('aboutUs.statCountries') },
    { value: '500K+', label: t('aboutUs.statProducts') },
    { value: '24/7', label: t('aboutUs.statSupport') }
  ];

  const milestones = [
    { year: '2015', title: t('aboutUs.milestone2015'), description: t('aboutUs.milestone2015Desc') },
    { year: '2017', title: t('aboutUs.milestone2017'), description: t('aboutUs.milestone2017Desc') },
    { year: '2019', title: t('aboutUs.milestone2019'), description: t('aboutUs.milestone2019Desc') },
    { year: '2021', title: t('aboutUs.milestone2021'), description: t('aboutUs.milestone2021Desc') },
    { year: '2023', title: t('aboutUs.milestone2023'), description: t('aboutUs.milestone2023Desc') },
    { year: '2025', title: t('aboutUs.milestone2025'), description: t('aboutUs.milestone2025Desc') }
  ];

  const team = [
    {
      name: 'Ahmed Hassan',
      role: t('aboutUs.roleCEO'),
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'
    },
    {
      name: 'Sarah Mohamed',
      role: t('aboutUs.roleCTO'),
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
    },
    {
      name: 'Omar Khalil',
      role: t('aboutUs.roleCOO'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    },
    {
      name: 'Nour Ahmed',
      role: t('aboutUs.roleCMO'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      {/* Hero Section */}
      <div className="bg-[#FFF5EB] text-[#2D3748] py-24 rounded-b-[80px]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{t('aboutUs.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto text-gray-600 leading-relaxed">
            {t('aboutUs.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-20">
        {/* Mission Section */}
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-600 font-semibold tracking-wider uppercase text-sm mb-4 block">Our Story</span>
              <h2 className="text-4xl font-bold mb-8 text-[#2D3748]">{t('aboutUs.ourMission')}</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {t('aboutUs.missionText1')}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('aboutUs.missionText2')}
              </p>
            </div>
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-orange-100/50">
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-4xl font-bold text-orange-600 mb-2">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-[#2D3748]">{t('aboutUs.ourValues')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="border-none shadow-lg shadow-orange-50/50 rounded-[32px] overflow-hidden hover:scale-105 transition-transform duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#2D3748]">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold mb-16 text-center text-[#2D3748]">{t('aboutUs.ourJourney')}</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-100 hidden md:block"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.year} 
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <div className="bg-white p-8 rounded-[32px] shadow-md">
                      <span className="text-3xl font-black text-orange-100 mb-2 block">{milestone.year}</span>
                      <h3 className="text-xl font-bold mb-3 text-[#2D3748]">{milestone.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-orange-400 rounded-full border-4 border-white shadow-md z-10 hidden md:block"></div>
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold mb-12 text-center text-[#2D3748]">{t('aboutUs.leadershipTeam')}</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="w-48 h-48 rounded-[48px] overflow-hidden mx-auto mb-6 shadow-xl group-hover:rounded-[24px] transition-all duration-500">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#2D3748] mb-1">{member.name}</h3>
                <p className="text-orange-600 font-medium text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Awards Section */}
        <section>
          <div className="bg-white rounded-[40px] p-12 text-center shadow-xl shadow-orange-100/30">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-[#2D3748]">{t('aboutUs.awardsTitle')}</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-10">
              <div className="p-6 bg-[#FFF9F5] rounded-3xl border border-orange-50">
                <p className="font-bold text-[#2D3748] mb-1">{t('aboutUs.award1')}</p>
                <p className="text-sm text-orange-400 font-medium">2025</p>
              </div>
              <div className="p-6 bg-[#FFF9F5] rounded-3xl border border-orange-50">
                <p className="font-bold text-[#2D3748] mb-1">{t('aboutUs.award2')}</p>
                <p className="text-sm text-orange-400 font-medium">2024</p>
              </div>
              <div className="p-6 bg-[#FFF9F5] rounded-3xl border border-orange-50">
                <p className="font-bold text-[#2D3748] mb-1">{t('aboutUs.award3')}</p>
                <p className="text-sm text-orange-400 font-medium">2023</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
