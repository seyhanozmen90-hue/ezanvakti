'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const cityInputRef = useRef<HTMLInputElement>(null);
  const districtInputRef = useRef<HTMLInputElement>(null);
  const [cityDropdownRect, setCityDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [districtDropdownRect, setDistrictDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

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

  const updateCityDropdownRect = () => {
    const el = cityInputRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setCityDropdownRect({ top: r.bottom, left: r.left, width: r.width });
    }
  };
  const updateDistrictDropdownRect = () => {
    const el = districtInputRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setDistrictDropdownRect({ top: r.bottom, left: r.left, width: r.width });
    }
  };

  useLayoutEffect(() => {
    if (cityOpen) {
      updateCityDropdownRect();
      const onScrollOrResize = () => updateCityDropdownRect();
      window.addEventListener('scroll', onScrollOrResize, true);
      window.addEventListener('resize', onScrollOrResize);
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      };
    } else {
      setCityDropdownRect(null);
    }
  }, [cityOpen]);

  useLayoutEffect(() => {
    if (districtOpen) {
      updateDistrictDropdownRect();
      const onScrollOrResize = () => updateDistrictDropdownRect();
      window.addEventListener('scroll', onScrollOrResize, true);
      window.addEventListener('resize', onScrollOrResize);
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      };
    } else {
      setDistrictDropdownRect(null);
    }
  }, [districtOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (cityRef.current && !cityRef.current.contains(target) && !document.getElementById('city-dropdown-portal')?.contains(target)) setCityOpen(false);
      if (districtRef.current && !districtRef.current.contains(target) && !document.getElementById('district-dropdown-portal')?.contains(target)) setDistrictOpen(false);
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
  const dropdownListBase = 'max-h-56 overflow-y-auto rounded-lg border border-gold-500/30 bg-navy-darkest shadow-xl z-[9999]';

  const cityDropdownEl =
    cityOpen && cityDropdownRect && typeof document !== 'undefined'
      ? createPortal(
          <ul
            id="city-dropdown-portal"
            role="listbox"
            className={dropdownListBase + ' mt-1'}
            style={{
              position: 'fixed',
              top: cityDropdownRect.top + 4,
              left: cityDropdownRect.left,
              width: cityDropdownRect.width,
              minWidth: 200,
            }}
          >
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
          </ul>,
          document.body
        )
      : null;

  const districtDropdownEl =
    districtOpen && selectedCitySlug && districtDropdownRect && typeof document !== 'undefined'
      ? createPortal(
          <ul
            id="district-dropdown-portal"
            role="listbox"
            className={dropdownListBase + ' mt-1'}
            style={{
              position: 'fixed',
              top: districtDropdownRect.top + 4,
              left: districtDropdownRect.left,
              width: districtDropdownRect.width,
              minWidth: 200,
            }}
          >
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
          </ul>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      {/* İl: yazarak ara + dropdown (portal ile body'de render) */}
      <div ref={cityRef} className="relative w-full sm:w-auto sm:min-w-[200px]">
        <input
          ref={cityInputRef}
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
      </div>
      {cityDropdownEl}

      {/* İlçe: yazarak ara + dropdown (portal ile body'de render) */}
      <div ref={districtRef} className="relative w-full sm:w-auto sm:min-w-[200px]">
        <input
          ref={districtInputRef}
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
      </div>
      {districtDropdownEl}
    </div>
  );
}
