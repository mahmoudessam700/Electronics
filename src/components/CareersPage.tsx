import { Briefcase, MapPin, Clock, Users, Heart, Rocket, Coffee, GraduationCap, Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

interface CareersPageProps {
  onNavigate: (page: string) => void;
}

export function CareersPage({ onNavigate: _onNavigate }: CareersPageProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const benefits = [
    {
      icon: Heart,
      title: t('careers.benefitHealth'),
      description: t('careers.benefitHealthDesc')
    },
    {
      icon: GraduationCap,
      title: t('careers.benefitLearning'),
      description: t('careers.benefitLearningDesc')
    },
    {
      icon: Coffee,
      title: t('careers.benefitBalance'),
      description: t('careers.benefitBalanceDesc')
    },
    {
      icon: Rocket,
      title: t('careers.benefitGrowth'),
      description: t('careers.benefitGrowthDesc')
    }
  ];

  const departments = [
    { id: 'all', name: t('careers.allDepartments') },
    { id: 'engineering', name: t('careers.engineering') },
    { id: 'product', name: t('careers.product') },
    { id: 'marketing', name: t('careers.marketing') },
    { id: 'operations', name: t('careers.operations') },
    { id: 'customer-service', name: t('careers.customerService') }
  ];

  const jobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'engineering',
      location: 'Cairo, Egypt',
      type: 'Full-time',
      posted: '2 days ago'
    },
    {
      id: '2',
      title: 'Product Manager',
      department: 'product',
      location: 'Cairo, Egypt',
      type: 'Full-time',
      posted: '1 week ago'
    },
    {
      id: '3',
      title: 'Digital Marketing Specialist',
      department: 'marketing',
      location: 'Giza, Egypt',
      type: 'Full-time',
      posted: '3 days ago'
    },
    {
      id: '4',
      title: 'UX Designer',
      department: 'product',
      location: 'Remote',
      type: 'Full-time',
      posted: '5 days ago'
    },
    {
      id: '5',
      title: 'Warehouse Operations Manager',
      department: 'operations',
      location: '6th of October, Egypt',
      type: 'Full-time',
      posted: '1 day ago'
    },
    {
      id: '6',
      title: 'Customer Support Representative',
      department: 'customer-service',
      location: 'Remote',
      type: 'Part-time',
      posted: '2 weeks ago'
    },
    {
      id: '7',
      title: 'Frontend Developer',
      department: 'engineering',
      location: 'Cairo, Egypt',
      type: 'Full-time',
      posted: '4 days ago'
    },
    {
      id: '8',
      title: 'Data Analyst',
      department: 'engineering',
      location: 'Cairo, Egypt',
      type: 'Full-time',
      posted: '6 days ago'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#7c3aed] text-orange-600 py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl mb-4">{t('careers.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            {t('careers.subtitle')}
          </p>
          <div className="flex max-w-lg mx-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('careers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-black h-12"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Why Join Us */}
        <section className="mb-16">
          <h2 className="text-3xl mb-8 text-center">{t('careers.whyJoinUs')}</h2>
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

        {/* Life at Shop.com */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl mb-6">{t('careers.lifeAtShop')}</h2>
              <p className="text-lg text-[#565959] mb-4">
                {t('careers.lifeAtShopText1')}
              </p>
              <p className="text-lg text-[#565959]">
                {t('careers.lifeAtShopText2')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400" 
                alt="Team collaboration"
                className="rounded-lg w-full h-40 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400" 
                alt="Office space"
                className="rounded-lg w-full h-40 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400" 
                alt="Team event"
                className="rounded-lg w-full h-40 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400" 
                alt="Meeting"
                className="rounded-lg w-full h-40 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section>
          <h2 className="text-3xl mb-8 text-center">{t('careers.openPositions')}</h2>
          
          {/* Department Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedDepartment === dept.id
                    ? 'bg-[#718096] text-white'
                    : 'bg-white text-[#565959] hover:bg-gray-100'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-[#565959]">{t('careers.noJobsFound')}</p>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-xl mb-2">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-[#565959]">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {departments.find(d => d.id === job.department)?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[#565959]">{job.posted}</span>
                        <Button className="bg-[#718096] hover:bg-[#4A5568] text-white">
                          {t('careers.applyNow')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-[#718096] to-[#4A5568] text-orange-600">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h2 className="text-2xl mb-4">{t('careers.dontSeeRole')}</h2>
              <p className="mb-6 max-w-2xl mx-auto">
                {t('careers.dontSeeRoleText')}
              </p>
              <Button className="bg-white text-[#718096] hover:bg-gray-100">
                {t('careers.sendResume')}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
