'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, CalendarDays, Compass, Info, Mail, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

          {/* Desktop Menu - Hidden on Mobile */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-navy-darkest/60 rounded-xl p-1 border border-gold-500/30 shadow-lg">
              {tabs.map((tab) => {
                const IconComponent = tab.Icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={`
                      group relative flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-xs
                      ${tab.active
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-darkest shadow-md shadow-gold-500/40'
                        : 'text-gold-400/80 hover:text-gold-300 hover:bg-navy-dark/60'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4 stroke-[2]" />
                    <span className="leading-none">{tab.name}</span>
                  </Link>
                );
              })}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile: Hamburger + Theme Toggle */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-navy-darkest/60 border border-gold-500/30 text-gold-400 hover:text-gold-300 hover:bg-navy-dark/60 transition-all h-9 w-9 flex items-center justify-center"
              aria-label="Menü Aç/Kapat"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gold-500/30 py-2">
            <div className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const IconComponent = tab.Icon;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all text-sm
                      ${tab.active
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-navy-darkest shadow-md'
                        : 'text-gold-400/80 hover:text-gold-300 hover:bg-navy-dark/60'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5 stroke-[2]" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
