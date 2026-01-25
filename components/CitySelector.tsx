'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { City, District } from '@/lib/types';
import { PROVINCES, provinceToSlug, getDistrictsByCity, districtToSlug } from '@/lib/tr-locations';

interface CitySelectorProps {
  currentCity?: City;
  currentDistrict?: District;
  locale: string;
}

export default function CitySelector({ currentCity, currentDistrict, locale }: CitySelectorProps) {
  const t = useTranslations('location');
  const router = useRouter();

  // State - Mevcut şehir/ilçeyi başlangıçta yükle
  const [selectedProvince, setSelectedProvince] = useState<string>(currentCity?.name || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(currentDistrict?.name || '');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>(() => {
    if (currentCity) {
      return getDistrictsByCity(currentCity.slug);
    }
    return [];
  });

  // currentCity değiştiğinde state'i güncelle
  useEffect(() => {
    if (currentCity) {
      setSelectedProvince(currentCity.name);
      const districts = getDistrictsByCity(currentCity.slug);
      setAvailableDistricts(districts);
      
      if (currentDistrict) {
        setSelectedDistrict(currentDistrict.name);
      } else {
        setSelectedDistrict('');
      }
    } else {
      setSelectedProvince('');
      setSelectedDistrict('');
      setAvailableDistricts([]);
    }
  }, [currentCity, currentDistrict]);

  // İl değiştiğinde
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict(''); // İlçeyi sıfırla

    if (province) {
      const citySlug = provinceToSlug(province);
      const districts = getDistrictsByCity(citySlug);
      setAvailableDistricts(districts);

      // localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCity', province);
        localStorage.removeItem('selectedDistrict'); // İlçeyi temizle
      }

      // İl seçilince direkt o ile git
      router.push(`/${citySlug}`);
    } else {
      setAvailableDistricts([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedCity');
        localStorage.removeItem('selectedDistrict');
      }
    }
  };

  // İlçe değiştiğinde
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setSelectedDistrict(district);

    if (district && selectedProvince) {
      const citySlug = provinceToSlug(selectedProvince);
      const districtSlug = districtToSlug(district);
      
      // localStorage'a kaydet
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCity', selectedProvince);
        localStorage.setItem('selectedDistrict', district);
      }
      
      // İlçe seçilince o ilçeye git
      router.push(`/${citySlug}/${districtSlug}`);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* İl Dropdown */}
      <div className="relative">
        <select
          value={selectedProvince}
          onChange={handleProvinceChange}
          className="appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t('selectCity')}</option>
          {PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* İlçe Dropdown */}
      <div className="relative">
        <select
          value={selectedDistrict}
          onChange={handleDistrictChange}
          disabled={!selectedProvince || availableDistricts.length === 0}
          className="appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{t('selectDistrict')}</option>
          {availableDistricts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
