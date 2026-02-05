'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, CalendarDays, Compass, Info, Mail } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { getDefaultCity, getCityBySlug } from '@/lib/cities-helper';

// Varsayılan şehir bilgisi merkezi fonksiyondan alınıyor
const DEFAULT_CITY = getDefaultCity();
const DEFAULT_CITY_SLUG = DEFAULT_CITY.slug;

export default function NavigationTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentCitySlug, setCurrentCitySlug] = useState<string>(DEFAULT_CITY_SLUG);
  const [isClient, setIsClient] = useState(false);
  
  // URL ve localStorage'dan şehir bilgisini al
  useEffect(() => {
    setIsClient(true);
    
    // 1. URL'den şehir slug'ını çıkar
    const pathSegments = pathname.split('/').filter(Boolean);
    let urlCitySlug = '';
    
    if (pathSegments.length > 0) {
      // Locale check: /tr/istanbul veya /istanbul
      if (pathSegments[0] === 'tr' && pathSegments.length > 1) {
        urlCitySlug = pathSegments[1];
      } else if (pathSegments[0] !== 'tr' && pathSegments[0] !== 'takvim' && pathSegments[0] !== 'kible' && pathSegments[0] !== 'hakkimizda' && pathSegments[0] !== 'iletisim' && pathSegments[0] !== 'gizlilik-politikasi') {
        urlCitySlug = pathSegments[0];
      }
    }
    
    // URL'de şehir varsa onu kullan
    if (urlCitySlug) {
      const city = getCityBySlug(urlCitySlug);
      if (city) {
        setCurrentCitySlug(city.slug);
        return;
      }
    }
    
    // 2. localStorage'dan slug al
    if (typeof window !== 'undefined') {
      const storedSlug = localStorage.getItem('selectedCitySlug');
      if (storedSlug) {
        const city = getCityBySlug(storedSlug);
        if (city) {
          setCurrentCitySlug(city.slug);
          return;
        }
      }
    }
    
    // 3. Varsayılan
    setCurrentCitySlug(DEFAULT_CITY_SLUG);
  }, [pathname]);
  
  // Aktif sekmeyi belirle
  const isHome = pathname === '/' || (!pathname.includes('/takvim') && !pathname.includes('/kible') && !pathname.includes('/hakkimizda') && !pathname.includes('/iletisim') && !pathname.includes('/gizlilik-politikasi'));
  const isCalendar = pathname.includes('/takvim');
  const isQibla = pathname.includes('/kible');
  const isAbout = pathname.includes('/hakkimizda');
  const isContact = pathname.includes('/iletisim');

  const tabs = [
    { 
      name: 'Ana Sayfa', 
      href: `/${currentCitySlug}`, 
      Icon: Home,
      active: isHome 
    },
    { 
      name: 'Takvim', 
      href: `/${currentCitySlug}/takvim`,
      Icon: CalendarDays,
      active: isCalendar 
    },
    { 
      name: 'Kıble', 
      href: '/kible', 
      Icon: Compass,
      active: isQibla 
    },
    { 
      name: 'Hakkımızda', 
      href: '/hakkimizda', 
      Icon: Info,
      active: isAbout 
    },
    { 
      name: 'İletişim', 
      href: '/iletisim', 
      Icon: Mail,
      active: isContact 
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-navy-darkest via-navy-darker to-navy-dark dark:from-navy-darkest dark:via-navy-darkest dark:to-navy-darker shadow-2xl sticky top-0 z-50 backdrop-blur-lg border-b border-gold-500/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Ana Navigation */}
        <div className="flex items-center justify-between py-2 md:py-3">
          {/* Logo & Başlık */}
          <Link href="/" className="flex items-center gap-3 md:gap-5 group">
            <div className="relative w-[220px] h-[94px] sm:w-[280px] sm:h-[120px] md:w-[360px] md:h-[154px] lg:w-[440px] lg:h-[188px] overflow-visible">
              <Image 
                src="/ezan-vakti-logo.svg?v=6" 
                alt="Ezan Vakti Logo" 
                width={440}
                height={188}
                className="w-full h-full object-contain transform scale-125 origin-left group-hover:scale-[1.3] transition-transform"
                priority
                unoptimized
                key="ezan-vakti-logo-v6-scaled"
              />
            </div>
            <div className="hidden md:flex items-center border-l-2 border-gold-500/40 pl-4 md:pl-5">
              <div className="text-gold-400/90 text-sm md:text-base lg:text-lg tracking-wide uppercase font-bold">
                Türkiye Namaz Saatleri
              </div>
            </div>
          </Link>

          {/* Sekmeler + Theme Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Sekmeler - Desktop & Mobile */}
            <div className="flex items-center gap-1 md:gap-2 bg-navy-darkest/60 rounded-xl p-1.5 border border-gold-500/30 shadow-lg">
              {tabs.map((tab) => {
                const IconComponent = tab.Icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      group relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-[10px] sm:text-xs md:text-sm
                      ${tab.active
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-darkest shadow-md shadow-gold-500/40 scale-105'
                        : 'text-gold-400/80 hover:text-gold-300 hover:bg-navy-dark/60 hover:scale-105'
                      }
                    `}
                  >
                    <IconComponent 
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 stroke-[2] transition-transform ${
                        tab.active ? 'scale-110' : 'group-hover:scale-110'
                      }`}
                    />
                    <span className="leading-none">{tab.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle - Daha Belirgin */}
            <div className="relative">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
