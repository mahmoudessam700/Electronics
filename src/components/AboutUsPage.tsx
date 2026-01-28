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
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2D3748] to-[#4A5568] text-white py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl mb-4">{t('aboutUs.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto">
            {t('aboutUs.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl mb-6">{t('aboutUs.ourMission')}</h2>
              <p className="text-lg text-[#565959] mb-4">
                {t('aboutUs.missionText1')}
              </p>
              <p className="text-lg text-[#565959]">
                {t('aboutUs.missionText2')}
              </p>
            </div>
            <div className="bg-white rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold text-[#718096] mb-2">{stat.value}</p>
                    <p className="text-sm text-[#565959]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('aboutUs.ourValues')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#718096]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-[#718096]" />
                  </div>
                  <h3 className="mb-2">{value.title}</h3>
                  <p className="text-sm text-[#565959]">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('aboutUs.ourJourney')}</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#718096]/20 hidden md:block"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={milestone.year} 
                  className={`flex flex-col md:flex-row items-center gap-4 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <Card>
                      <CardContent className="p-6">
                        <span className="text-2xl font-bold text-[#718096]">{milestone.year}</span>
                        <h3 className="mt-2 mb-2">{milestone.title}</h3>
                        <p className="text-sm text-[#565959]">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-[#718096] rounded-full z-10 hidden md:block"></div>
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('aboutUs.leadershipTeam')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="mb-1">{member.name}</h3>
                  <p className="text-sm text-[#565959]">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Awards Section */}
        <section>
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-[#718096] mx-auto mb-4" />
              <h2 className="text-2xl mb-4">{t('aboutUs.awardsTitle')}</h2>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-4 bg-[#F7F8F8] rounded-lg">
                  <p className="font-medium">{t('aboutUs.award1')}</p>
                  <p className="text-sm text-[#565959]">2025</p>
                </div>
                <div className="p-4 bg-[#F7F8F8] rounded-lg">
                  <p className="font-medium">{t('aboutUs.award2')}</p>
                  <p className="text-sm text-[#565959]">2024</p>
                </div>
                <div className="p-4 bg-[#F7F8F8] rounded-lg">
                  <p className="font-medium">{t('aboutUs.award3')}</p>
                  <p className="text-sm text-[#565959]">2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
