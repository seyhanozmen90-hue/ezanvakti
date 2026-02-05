'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCityBySlug, getDefaultCity } from '@/lib/cities-helper';

export default function HomeRedirect() {
  const router = useRouter();
  const defaultCity = getDefaultCity();

  useEffect(() => {
    // localStorage'dan seçili şehri al
    if (typeof window !== 'undefined') {
      const storedSlug = localStorage.getItem('selectedCitySlug');
      
      if (storedSlug) {
        const city = getCityBySlug(storedSlug);
        if (city) {
          // Seçili şehir varsa ona yönlendir
          router.replace(`/${city.slug}`);
          return;
        }
      }
    }
    
    // localStorage'da şehir yoksa varsayılan şehre yönlendir
    router.replace(`/${defaultCity.slug}`);
  }, [router, defaultCity]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="text-center">
        <div className="text-4xl mb-4">🕌</div>
        <p className="text-gray-600 dark:text-gray-400">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
