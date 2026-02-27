/**
 * Server-rendered internal links for city pages: popular cities + current city districts.
 * Plain <a href=""> so links are visible in HTML source for SEO.
 */

import { getCityBySlug } from '@/lib/cities-helper';
import type { City } from '@/lib/types';

/** Popüler Şehirler: 10 il (Istanbul, Ankara, Izmir, Bursa, Konya, Antalya, Adana, Gaziantep, Kayseri, Mersin) */
const POPULAR_CITY_SLUGS = [
  'istanbul',
  'ankara',
  'izmir',
  'bursa',
  'konya',
  'antalya',
  'adana',
  'gaziantep',
  'kayseri',
  'mersin',
];

interface CityInternalLinksProps {
  locale: string;
  currentCity: City;
}

export default function CityInternalLinks({ locale, currentCity }: CityInternalLinksProps) {
  const base = `/${locale}`;
  const citiesToShow = POPULAR_CITY_SLUGS.map((slug) => getCityBySlug(slug))
    .filter((c): c is City => !!c && c.slug !== currentCity.slug);
  const districts = currentCity.districts || [];

  return (
    <nav
      className="mt-8 rounded-xl bg-white dark:bg-navy-dark/60 border border-gold-500/20 dark:border-gold-500/20 p-5 sm:p-6 text-navy-800 dark:text-gold-300/90 text-sm sm:text-base"
      aria-label="İç linkler"
    >
      <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-3">
        Popüler Şehirler
      </h2>
      <p className="mb-3 text-navy-700 dark:text-gold-300/80">
        Namaz vakitleri sayfaları:{' '}
        {citiesToShow.map((city, i) => (
          <span key={city.slug}>
            <a
              href={`${base}/${city.slug}`}
              className="text-gold-600 dark:text-gold-400 hover:underline"
            >
              {city.name}
            </a>
            {i < citiesToShow.length - 1 ? ', ' : ''}
          </span>
        ))}
        .
      </p>

      {districts.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-navy-900 dark:text-white mt-6 mb-3">
            {currentCity.name} ilçeleri
          </h2>
          <p className="text-navy-700 dark:text-gold-300/80">
            {currentCity.name} ilçe namaz vakitleri:{' '}
            {districts.map((d, i) => (
              <span key={d.slug}>
                <a
                  href={`${base}/${currentCity.slug}/${d.slug}`}
                  className="text-gold-600 dark:text-gold-400 hover:underline"
                >
                  {d.name}
                </a>
                {i < districts.length - 1 ? ', ' : ''}
              </span>
            ))}
            .
          </p>
        </>
      )}
    </nav>
  );
}
