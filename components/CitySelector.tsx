'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/navigation';
import { City, District } from '@/lib/types';
import { getAllCities } from '@/lib/cities-helper';

interface CitySelectorProps {
  currentCity?: City;
  currentDistrict?: District;
  locale: string;
}

/** Türkçe karakterleri dikkate alarak metinde arama (büyük/küçük harf duyarsız) */
function matchesSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;
  const n = text.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
  const q = query.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
  return n.includes(q);
}

export default function CitySelector({ currentCity, currentDistrict, locale }: CitySelectorProps) {
  const t = useTranslations('location');
  const router = useRouter();

  const cities = getAllCities();
  const sortedCities = [...cities].sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

  const [selectedCitySlug, setSelectedCitySlug] = useState<string>(currentCity?.slug || '');
  const [selectedDistrictSlug, setSelectedDistrictSlug] = useState<string>(currentDistrict?.slug || '');
  const [availableDistricts, setAvailableDistricts] = useState<District[]>(() => currentCity?.districts || []);

  const [cityQuery, setCityQuery] = useState('');
  const [districtQuery, setDistrictQuery] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentCity) {
      setSelectedCitySlug(currentCity.slug);
      setAvailableDistricts(currentCity.districts || []);
      setSelectedDistrictSlug(currentDistrict?.slug || '');
    } else {
      setSelectedCitySlug('');
      setSelectedDistrictSlug('');
      setAvailableDistricts([]);
    }
  }, [currentCity, currentDistrict]);

  const selectedCity = cities.find((c) => c.slug === selectedCitySlug);
  const selectedDistrict = availableDistricts.find((d) => d.slug === selectedDistrictSlug);

  const filteredCities = cityQuery.trim()
    ? sortedCities.filter((c) => matchesSearch(c.name, cityQuery) || matchesSearch(c.slug, cityQuery))
    : sortedCities;

  const sortedDistricts = [...availableDistricts].sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
  const filteredDistricts = districtQuery.trim()
    ? sortedDistricts.filter((d) => matchesSearch(d.name, districtQuery) || matchesSearch(d.slug, districtQuery))
    : sortedDistricts;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
      if (districtRef.current && !districtRef.current.contains(e.target as Node)) setDistrictOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    setSelectedCitySlug(city.slug);
    setCityQuery('');
    setCityOpen(false);
    setSelectedDistrictSlug('');
    setAvailableDistricts(city.districts || []);
    setDistrictQuery('');
    setDistrictOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCity', city.name);
      localStorage.setItem('selectedCitySlug', city.slug);
      localStorage.removeItem('selectedDistrict');
    }
    router.push(`/${city.slug}`);
  };

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrictSlug(district.slug);
    setDistrictQuery('');
    setDistrictOpen(false);
    if (selectedCitySlug && typeof window !== 'undefined') {
      const city = cities.find((c) => c.slug === selectedCitySlug);
      if (city) {
        localStorage.setItem('selectedCity', city.name);
        localStorage.setItem('selectedCitySlug', city.slug);
        localStorage.setItem('selectedDistrict', district.name);
      }
    }
    router.push(`/${selectedCitySlug}/${district.slug}`);
  };

  const inputBase = 'w-full px-3 py-2 pr-9 bg-navy-darkest/70 backdrop-blur-sm rounded-lg shadow-md border border-gold-500/30 hover:border-gold-500/50 text-gold-300 dark:text-gold-300 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-gold-500';
  const dropdownList = 'absolute left-0 right-0 top-full mt-1 z-50 max-h-56 overflow-y-auto rounded-lg border border-gold-500/30 bg-navy-darkest shadow-xl';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* İl: yazarak ara + dropdown */}
      <div ref={cityRef} className="relative w-full sm:w-auto sm:min-w-[200px]">
        <input
          type="text"
          value={cityOpen ? cityQuery : (selectedCity?.name ?? '')}
          onChange={(e) => {
            setCityQuery(e.target.value);
            setCityOpen(true);
          }}
          onFocus={() => setCityOpen(true)}
          placeholder={t('search')}
          className={inputBase}
          autoComplete="off"
          aria-expanded={cityOpen}
          aria-autocomplete="list"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gold-300 dark:text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {cityOpen && (
          <ul className={dropdownList} role="listbox">
            {filteredCities.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gold-300/70">Sonuç yok</li>
            ) : (
              filteredCities.map((city) => (
                <li
                  key={city.slug}
                  role="option"
                  onClick={() => handleCitySelect(city)}
                  className="px-3 py-2 text-sm font-medium text-gold-300 hover:bg-gold-500/20 cursor-pointer"
                >
                  {city.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* İlçe: yazarak ara + dropdown */}
      <div ref={districtRef} className="relative w-full sm:w-auto sm:min-w-[200px]">
        <input
          type="text"
          value={districtOpen ? districtQuery : (selectedDistrict?.name ?? '')}
          onChange={(e) => {
            setDistrictQuery(e.target.value);
            setDistrictOpen(true);
          }}
          onFocus={() => setDistrictOpen(true)}
          placeholder={t('searchDistrict')}
          disabled={!selectedCitySlug || availableDistricts.length === 0}
          className={inputBase + ' disabled:opacity-40 disabled:cursor-not-allowed'}
          autoComplete="off"
          aria-expanded={districtOpen}
          aria-autocomplete="list"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gold-300 dark:text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {districtOpen && selectedCitySlug && (
          <ul className={dropdownList} role="listbox">
            {filteredDistricts.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gold-300/70">Sonuç yok</li>
            ) : (
              filteredDistricts.map((district) => (
                <li
                  key={district.slug}
                  role="option"
                  onClick={() => handleDistrictSelect(district)}
                  className="px-3 py-2 text-sm font-medium text-gold-300 hover:bg-gold-500/20 cursor-pointer"
                >
                  {district.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
