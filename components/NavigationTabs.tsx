'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function NavigationTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState<string>('İstanbul'); // Default: İstanbul
  const [isClient, setIsClient] = useState(false);
  
  // localStorage'dan şehir bilgisini oku
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const city = localStorage.getItem('selectedCity') || 'İstanbul';
      setSelectedCity(city);
    }
  }, []);
  
  // Takvim'e tıklandığında localStorage'dan şehri al ve URL'e ekle
  const handleCalendarClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const city = localStorage.getItem('selectedCity') || 'İstanbul';
      if (city !== 'İstanbul') {
        router.push(`/takvim?city=${encodeURIComponent(city)}`);
      } else {
        router.push('/takvim');
      }
    }
  };
  
  // Aktif sekmeyi belirle
  const isHome = pathname === '/' || (!pathname.includes('/takvim') && !pathname.includes('/kible'));
  const isCalendar = pathname.includes('/takvim');
  const isQibla = pathname.includes('/kible');

  const tabs = [
    { 
      name: 'Ana Sayfa', 
      href: '/', 
      icon: '🏠',
      active: isHome 
    },
    { 
      name: 'Takvim', 
      href: selectedCity !== 'İstanbul' ? `/takvim?city=${encodeURIComponent(selectedCity)}` : '/takvim', 
      icon: '📅',
      active: isCalendar 
    },
    { 
      name: 'Kıble', 
      href: '/kible', 
      icon: '🧭',
      active: isQibla 
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900 shadow-lg sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Başlık */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-4xl group-hover:scale-110 transition-transform">
              🕌
            </div>
            <div className="hidden md:block">
              <div className="text-white font-bold text-2xl leading-tight">
                Ezan Vakitleri
              </div>
              <div className="text-primary-100 text-sm">
                Türkiye Namaz Vakitleri
              </div>
            </div>
          </Link>

          {/* Sekmeler + Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Sekmeler */}
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl p-1.5">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  onClick={tab.name === 'Takvim' ? handleCalendarClick : undefined}
                  className={`
                    flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg font-semibold transition-all
                    ${tab.active
                      ? 'bg-white text-primary-600 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/20'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="hidden sm:inline text-sm md:text-base">{tab.name}</span>
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="ml-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
