import { Newspaper, Calendar, ArrowRight, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

interface PressReleasesPageProps {
  onNavigate: (page: string) => void;
}

export function PressReleasesPage({ onNavigate: _onNavigate }: PressReleasesPageProps) {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState('2026');

  const years = ['2026', '2025', '2024', '2023'];

  const pressReleases = [
    {
      id: '1',
      title: t('press.release1Title'),
      date: 'January 15, 2026',
      summary: t('press.release1Summary'),
      year: '2026'
    },
    {
      id: '2',
      title: t('press.release2Title'),
      date: 'January 5, 2026',
      summary: t('press.release2Summary'),
      year: '2026'
    },
    {
      id: '3',
      title: t('press.release3Title'),
      date: 'December 20, 2025',
      summary: t('press.release3Summary'),
      year: '2025'
    },
    {
      id: '4',
      title: t('press.release4Title'),
      date: 'November 28, 2025',
      summary: t('press.release4Summary'),
      year: '2025'
    },
    {
      id: '5',
      title: t('press.release5Title'),
      date: 'October 15, 2025',
      summary: t('press.release5Summary'),
      year: '2025'
    },
    {
      id: '6',
      title: t('press.release6Title'),
      date: 'August 10, 2024',
      summary: t('press.release6Summary'),
      year: '2024'
    },
    {
      id: '7',
      title: t('press.release7Title'),
      date: 'March 22, 2024',
      summary: t('press.release7Summary'),
      year: '2024'
    },
    {
      id: '8',
      title: t('press.release8Title'),
      date: 'July 5, 2023',
      summary: t('press.release8Summary'),
      year: '2023'
    }
  ];

  const filteredReleases = pressReleases.filter(release => release.year === selectedYear);

  const mediaContacts = [
    {
      name: 'Media Relations',
      email: 'press@adsolutions.ai',
      phone: '+20 2 1234 5678'
    },
    {
      name: 'Investor Relations',
      email: 'investors@adsolutions.ai',
      phone: '+20 2 1234 5679'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1f2937] to-[#374151] text-orange-600 py-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <Newspaper className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl mb-4">{t('press.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto">
            {t('press.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Featured Press Release */}
        <section className="mb-12">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-[#718096] to-[#4A5568] p-8 text-white flex flex-col justify-center">
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full w-fit mb-4">
                  {t('press.featured')}
                </span>
                <h2 className="text-2xl mb-4">{pressReleases[0].title}</h2>
                <p className="text-white/90 mb-4">{pressReleases[0].summary}</p>
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Calendar className="h-4 w-4" />
                  {pressReleases[0].date}
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-lg font-medium mb-4">{t('press.latestNews')}</h3>
                <div className="space-y-4">
                  {pressReleases.slice(1, 4).map(release => (
                    <div key={release.id} className="border-b border-[#D5D9D9] pb-4 last:border-0">
                      <p className="text-sm text-[#565959] mb-1">{release.date}</p>
                      <p className="font-medium hover:text-[#718096] cursor-pointer">{release.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Year Filter & Press Releases */}
        <section className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">{t('press.filterByYear')}</h3>
                <div className="space-y-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedYear === year
                          ? 'bg-[#718096] text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {year}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#D5D9D9] mt-6 pt-6">
                  <h3 className="font-medium mb-4">{t('press.mediaContacts')}</h3>
                  {mediaContacts.map(contact => (
                    <div key={contact.name} className="mb-4 last:mb-0">
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-sm text-[#565959]">{contact.email}</p>
                      <p className="text-sm text-[#565959]">{contact.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Press Releases List */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">{t('press.newsFrom')} {selectedYear}</h2>
              <span className="text-sm text-[#565959]">
                {filteredReleases.length} {t('press.releases')}
              </span>
            </div>

            <div className="space-y-4">
              {filteredReleases.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-[#565959]">{t('press.noReleases')}</p>
                  </CardContent>
                </Card>
              ) : (
                filteredReleases.map(release => (
                  <Card key={release.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-[#565959] mb-2">
                        <Calendar className="h-4 w-4" />
                        {release.date}
                      </div>
                      <h3 className="text-xl mb-2 hover:text-[#718096]">{release.title}</h3>
                      <p className="text-[#565959] mb-4">{release.summary}</p>
                      <Button variant="link" className="text-[#718096] p-0 h-auto">
                        {t('press.readMore')} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Media Kit Section */}
        <section className="mt-12">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl mb-2">{t('press.mediaKit')}</h2>
                  <p className="text-[#565959]">
                    {t('press.mediaKitDesc')}
                  </p>
                </div>
                <Button className="bg-[#718096] hover:bg-[#4A5568] text-white">
                  <Download className="h-4 w-4 mr-2" />
                  {t('press.downloadKit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
