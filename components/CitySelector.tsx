'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { City, District } from '@/lib/types';
import { getAllCities } from '@/lib/cities-helper';

interface CitySelectorProps {
  currentCity?: City;
  currentDistrict?: District;
  locale: string;
}

export default function CitySelector({ currentCity, currentDistrict, locale }: CitySelectorProps) {
  const t = useTranslations('location');
  const router = useRouter();
  
  // Tanımlı şehirler - cities.json'dan (30 şehir)
  const cities = getAllCities();
  
  // Alfabetik sırala (Türkçe karakter desteği ile)
  const sortedCities = [...cities].sort((a, b) => 
    a.name.localeCompare(b.name, 'tr-TR')
  );

  // State - Slug ile çalış (city.name değil!)
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>(currentCity?.slug || '');
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string>(currentDistrict?.slug || '');
  const [availableDistricts, setAvailableDistricts] = useState<District[]>(() => {
    if (currentCity) {
      return currentCity.districts || [];
    }
    return [];
  });

  // currentCity değiştiğinde state'i güncelle
  useEffect(() => {
    if (currentCity) {
      setSelectedCitySlug(currentCity.slug);
      setAvailableDistricts(currentCity.districts || []);
      
      if (currentDistrict) {
        setSelectedDistrictSlug(currentDistrict.slug);
      } else {
        setSelectedDistrictSlug('');
      }
    } else {
      setSelectedCitySlug('');
      setSelectedDistrictSlug('');
      setAvailableDistricts([]);
    }
  }, [currentCity, currentDistrict]);

  // İl değiştiğinde
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const citySlug = e.target.value;
    setSelectedCitySlug(citySlug);
    setSelectedDistrictSlug(''); // İlçeyi sıfırla

    if (citySlug) {
      // Seçilen şehri bul
      const selectedCity = cities.find(c => c.slug === citySlug);
      
      if (selectedCity) {
        setAvailableDistricts(selectedCity.districts || []);

        // localStorage'a kaydet (şehir adı ve slug ile)
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedCity', selectedCity.name);
          localStorage.setItem('selectedCitySlug', selectedCity.slug);
          localStorage.removeItem('selectedDistrict');
        }

        // İl seçilince direkt o ile git
        router.push(`/${citySlug}`);
      }
    } else {
      setAvailableDistricts([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedCity');
        localStorage.removeItem('selectedCitySlug');
        localStorage.removeItem('selectedDistrict');
      }
    }
  };

  // İlçe değiştiğinde
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtSlug = e.target.value;
    setSelectedDistrictSlug(districtSlug);

    if (districtSlug && selectedCitySlug) {
      // Seçilen ilçeyi bul
      const selectedDistrict = availableDistricts.find(d => d.slug === districtSlug);
      
      // localStorage'a kaydet (şehir ve ilçe adı ile slug'lar)
      if (typeof window !== 'undefined' && selectedDistrict) {
        const selectedCity = cities.find(c => c.slug === selectedCitySlug);
        if (selectedCity) {
          localStorage.setItem('selectedCity', selectedCity.name);
          localStorage.setItem('selectedCitySlug', selectedCity.slug);
          localStorage.setItem('selectedDistrict', selectedDistrict.name);
        }
      }
      
      // İlçe seçilince o ilçeye git
      router.push(`/${selectedCitySlug}/${districtSlug}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      {/* İl Dropdown */}
      <div className="relative min-w-[160px] sm:min-w-[200px]">
        <select
          value={selectedCitySlug}
          onChange={handleCityChange}
          className="w-full appearance-none px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 pr-10 sm:pr-12 bg-navy-darkest/70 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border border-gold-500/30 hover:border-gold-500/50 text-gold-300 dark:text-gold-300 text-sm sm:text-base font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="" className="bg-navy-darkest text-gold-300">{t('selectCity')}</option>
          {sortedCities.map((city) => (
            <option key={city.slug} value={city.slug} className="bg-navy-darkest text-gold-300">
              {city.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold-300 dark:text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* İlçe Dropdown */}
      <div className="relative min-w-[160px] sm:min-w-[200px]">
        <select
          value={selectedDistrictSlug}
          onChange={handleDistrictChange}
          disabled={!selectedCitySlug || availableDistricts.length === 0}
          className="w-full appearance-none px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 pr-10 sm:pr-12 bg-navy-darkest/70 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border border-gold-500/30 hover:border-gold-500/50 text-gold-300 dark:text-gold-300 text-sm sm:text-base font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="" className="bg-navy-darkest text-gold-300">{t('selectDistrict')}</option>
          {availableDistricts.map((district) => (
            <option key={district.slug} value={district.slug} className="bg-navy-darkest text-gold-300">
              {district.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold-300 dark:text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
