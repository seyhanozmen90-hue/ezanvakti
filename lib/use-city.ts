'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCityBySlug, getDefaultCity } from './cities-helper';

/**
 * Merkezi şehir yönetimi hook'u
 * 
 * Öncelik sırası:
 * 1. URL'deki şehir slug'ı (/istanbul, /ankara vb.)
 * 2. localStorage'daki şehir adı
 * 3. Varsayılan şehir (İstanbul)
 */
export function useCurrentCity() {
  const pathname = usePathname();
  const defaultCity = getDefaultCity();
  
  const [citySlug, setCitySlug] = useState<string>(defaultCity.slug);
  const [cityName, setCityName] = useState<string>(defaultCity.name);

  useEffect(() => {
    // 1. URL'den şehir slug'ını çıkar
    // Pathname format: /tr/istanbul veya /istanbul
    const pathSegments = pathname.split('/').filter(Boolean);
    
    // İlk segment 'tr' ise ikinci segment şehir, değilse ilk segment şehir
    let urlCitySlug = '';
    if (pathSegments.length > 0) {
      // Locale check
      if (pathSegments[0] === 'tr' && pathSegments.length > 1) {
        urlCitySlug = pathSegments[1];
      } else if (pathSegments[0] !== 'tr' && pathSegments[0] !== 'takvim' && pathSegments[0] !== 'kible' && pathSegments[0] !== 'hakkimizda' && pathSegments[0] !== 'iletisim' && pathSegments[0] !== 'gizlilik-politikasi') {
        urlCitySlug = pathSegments[0];
      }
    }

    // URL'de şehir var mı kontrol et
    if (urlCitySlug) {
      const city = getCityBySlug(urlCitySlug);
      if (city) {
        setCitySlug(city.slug);
        setCityName(city.name);
        // localStorage'a da kaydet
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedCity', city.name);
          localStorage.setItem('selectedCitySlug', city.slug);
        }
        return;
      }
    }

    // 2. localStorage'dan al
    if (typeof window !== 'undefined') {
      const storedSlug = localStorage.getItem('selectedCitySlug');
      const storedName = localStorage.getItem('selectedCity');
      
      if (storedSlug && storedName) {
        const city = getCityBySlug(storedSlug);
        if (city) {
          setCitySlug(city.slug);
          setCityName(city.name);
          return;
        }
      }
    }

    // 3. Varsayılan
    setCitySlug(defaultCity.slug);
    setCityName(defaultCity.name);
  }, [pathname, defaultCity]);

  return {
    citySlug,
    cityName,
  };
}

/**
 * Takvim linkini şehirli formatta döndürür
 * Artık slug-based routing kullanılıyor
 */
export function useCalendarLink() {
  const { citySlug } = useCurrentCity();
  
  // Slug-based routing: /{citySlug}/takvim
  return `/${citySlug}/takvim`;
}
