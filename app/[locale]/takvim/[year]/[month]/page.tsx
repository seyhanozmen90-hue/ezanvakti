'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCityBySlug, getDefaultCity } from '@/lib/cities-helper';

interface PageProps {
  params: { year: string; month: string };
  searchParams?: { city?: string };
}

export default function MonthRedirectPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const defaultCity = getDefaultCity();

  useEffect(() => {
    // Şehir slug'ını belirle
    let citySlug = defaultCity.slug;
    
    if (searchParams?.city) {
      const cityName = searchParams.city;
      let city = getCityBySlug(cityName.toLowerCase());
      
      if (!city) {
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
      const storedSlug = localStorage.getItem('selectedCitySlug');
      if (storedSlug) {
        const city = getCityBySlug(storedSlug);
        if (city) {
          citySlug = city.slug;
        }
      }
    }
    
    // Yeni slug-based route'a redirect
    router.replace(`/${citySlug}/takvim/${params.year}/${params.month}`);
  }, [searchParams, params, router, defaultCity]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📅</div>
        <p className="text-gray-600 dark:text-gray-400">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
