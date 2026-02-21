'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { getDefaultCity, getCityBySlug } from '@/lib/cities-helper';

// Varsayılan şehir bilgisi merkezi fonksiyondan alınıyor
const DEFAULT_CITY = getDefaultCity();
const DEFAULT_CITY_SLUG = DEFAULT_CITY.slug;

export default function NavigationTabs() {
  const pathname = usePathname();
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

  // Header orta bölüm: Anasayfa, Takvim, Kıble (desktop + mobil aynı)
  const headerNavTabs = [
    { name: 'Anasayfa', href: `/${currentCitySlug}`, active: isHome, description: 'Namaz vakitleri' },
    { name: 'Takvim', href: `/${currentCitySlug}/takvim`, active: isCalendar, description: 'Aylık vakit cetveli' },
    { name: 'Kıble', href: '/kible', active: isQibla, description: 'Kıble yönü bul' },
  ];

  return (
    <nav className="bg-gradient-to-r from-navy-darkest via-navy-darker to-navy-dark dark:from-navy-darkest dark:via-navy-darkest dark:to-navy-darker shadow-2xl sticky top-0 z-50 backdrop-blur-lg border-b border-gold-500/30">
      <div className="container mx-auto px-3 md:px-4 max-w-6xl">
        {/* Ana Navigation */}
        <div className="flex items-center justify-between py-1 md:py-1.5 gap-2 md:gap-3">
          {/* Logo - BÜYÜK */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 min-w-0 shrink-0 group">
            <div className="relative h-28 md:h-32 w-auto overflow-visible">
              <Image 
                src="/ezan-vakti-logo.svg?v=6" 
                alt="Ezan Vakti - Türkiye Namaz Vakitleri" 
                width={440}
                height={188}
                className="h-full w-auto object-contain group-hover:scale-105 transition-transform"
                priority
                unoptimized
                key="ezan-vakti-logo-v6-scaled"
              />
            </div>
            <div className="hidden lg:flex items-center border-l-2 border-gold-500/40 pl-3">
              <div className="text-gold-400/90 text-xs md:text-sm tracking-wide uppercase font-bold whitespace-nowrap">
                Türkiye Namaz Saatleri
              </div>
            </div>
          </Link>

          {/* Orta bölüm: Anasayfa, Takvim, Kıble (desktop + mobil aynı), hover'da gold border */}
          <div className="flex flex-1 items-center justify-center md:justify-center min-w-0 gap-0 md:gap-1 px-2">
            {headerNavTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  relative px-2 py-2 md:px-4 md:py-3 text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${tab.active
                    ? 'text-gold-400 border-b-2 border-gold-500'
                    : 'text-gold-400/90 hover:text-gold-300 border-b-2 border-transparent hover:border-gold-500'
                  }
                `}
                title={tab.description}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* Sağ: Tema */}
          <div className="flex items-center shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
