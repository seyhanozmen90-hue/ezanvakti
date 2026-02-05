'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCityBySlug, getDefaultCity } from '@/lib/cities-helper';

interface PageProps {
  searchParams?: { city?: string };
}

export default function TakvimRedirectPage({ searchParams }: PageProps) {
  const router = useRouter();
  const defaultCity = getDefaultCity();

  useEffect(() => {
    // Query string'den şehir al ve slug'a çevir
    let citySlug = defaultCity.slug;
    
    if (searchParams?.city) {
      // city parametresinden slug bulmaya çalış
      const cityName = searchParams.city;
      // Slug formatında mı kontrol et
      let city = getCityBySlug(cityName.toLowerCase());
      
      if (!city) {
        // İsim olabilir, normalizasyon yap
        const normalizedSlug = cityName
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/\s+/g, '-');
        city = getCityBySlug(normalizedSlug);
      }
      
      if (city) {
        citySlug = city.slug;
      }
    } else if (typeof window !== 'undefined') {
      // localStorage'dan slug al
      const storedSlug = localStorage.getItem('selectedCitySlug');
      if (storedSlug) {
        const city = getCityBySlug(storedSlug);
        if (city) {
          citySlug = city.slug;
        }
      }
    }
    
    // Slug-based route'a redirect et
    router.replace(`/${citySlug}/takvim`);
  }, [searchParams, router, defaultCity]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📅</div>
        <p className="text-gray-600 dark:text-gray-400">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
