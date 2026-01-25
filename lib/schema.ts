import { PrayerTime } from './types';

/**
 * JSON-LD schema oluşturur
 */
export function generateLocalBusinessSchema(
  cityName: string,
  districtName?: string
) {
  const location = districtName ? `${cityName} ${districtName}` : cityName;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${location} Ezan Vakitleri`,
    description: `${location} için güncel namaz vakitleri ve ezan saatleri`,
    url: typeof window !== 'undefined' ? window.location.href : '',
    inLanguage: 'tr-TR',
    publisher: {
      '@type': 'Organization',
      name: 'Ezan Vakitleri',
      url: 'https://ezanvakti.com',
    },
  };
}

/**
 * Namaz vakitleri için Event schema oluşturur
 */
export function generatePrayerTimesSchema(
  times: PrayerTime,
  cityName: string,
  districtName?: string
) {
  const location = districtName ? `${cityName} ${districtName}` : cityName;
  const prayers = [
    { name: 'İmsak', time: times.imsak },
    { name: 'Güneş', time: times.gunes },
    { name: 'Öğle', time: times.ogle },
    { name: 'İkindi', time: times.ikindi },
    { name: 'Akşam', time: times.aksam },
    { name: 'Yatsı', time: times.yatsi },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${location} Namaz Vakitleri`,
    description: `${times.date} tarihli ${location} namaz vakitleri`,
    itemListElement: prayers.map((prayer, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: `${prayer.name} Vakti`,
        startDate: `${times.date}T${prayer.time}:00`,
        location: {
          '@type': 'Place',
          name: location,
        },
      },
    })),
  };
}

/**
 * Breadcrumb schema oluşturur
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
