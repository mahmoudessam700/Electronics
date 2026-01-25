import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  gradient: string;
  navigationTarget: { type: 'category' | 'page'; value: string };
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'New Year Sale',
    subtitle: 'Up to 50% off on electronics',
    ctaText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1515940175183-6798529cb860?w=1200',
    gradient: 'from-blue-600/20 to-purple-600/20',
    navigationTarget: { type: 'page', value: 'search' }
  },
  {
    id: '2',
    title: 'Latest Laptops',
    subtitle: 'Powerful performance for work and play',
    ctaText: 'Explore Laptops',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
    gradient: 'from-gray-600/20 to-blue-600/20',
    navigationTarget: { type: 'category', value: 'Laptops' }
  },
  {
    id: '3',
    title: 'Gaming Accessories',
    subtitle: 'Upgrade your gaming setup',
    ctaText: 'Discover More',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200',
    gradient: 'from-purple-600/20 to-pink-600/20',
    navigationTarget: { type: 'page', value: 'search' }
  }
];

interface HeroSliderProps {
  onNavigate: (page: string, product?: any, category?: string) => void;
}

export function HeroSlider({ onNavigate }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-[#EAEDED] to-white overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />

            <div className="relative max-w-[1500px] mx-auto px-4 h-full flex items-center justify-center md:justify-start">
              <div className="max-w-xl bg-white/95 p-6 md:p-8 rounded-lg shadow-lg text-center md:text-left mx-4 md:mx-0">
                <h2 className="text-2xl md:text-5xl mb-2 md:mb-4 font-bold">{slide.title}</h2>
                <p className="text-sm md:text-xl text-[#565959] mb-4 md:mb-6">{slide.subtitle}</p>
                <Button
                  className="bg-[#718096] hover:bg-[#4A5568] text-white text-sm md:text-lg px-6 py-3 md:px-8 md:py-6"
                  onClick={() => {
                    if (slide.navigationTarget.type === 'category') {
                      onNavigate('category', undefined, slide.navigationTarget.value);
                    } else {
                      onNavigate(slide.navigationTarget.value);
                    }
                  }}
                >
                  {slide.ctaText}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/100 text-[#0F1111] h-12 w-12 rounded-full shadow-lg"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/100 text-[#0F1111] h-12 w-12 rounded-full shadow-lg"
        onClick={goToNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${index === currentSlide
              ? 'bg-[#718096] w-8'
              : 'bg-white/50 w-2 hover:bg-white/80'
              }`}
          />
        ))}
      </div>
    </div>
  );
}