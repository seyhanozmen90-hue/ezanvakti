import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getMonthlyPrayerTimes } from '@/lib/api';
import { getCityBySlug, getAllCities } from '@/lib/cities-helper';
import { getNextPrayerTime, formatDate, formatHijriDate } from '@/lib/utils';
import CountdownTimer from '@/components/CountdownTimer';
import PrayerTimeCard from '@/components/PrayerTimeCard';
import MonthlyTable from '@/components/MonthlyTable';
import ThemeToggle from '@/components/ThemeToggle';
import CitySelector from '@/components/CitySelector';
import JsonLd from '@/components/JsonLd';
import { PrayerName } from '@/lib/types';

interface CityPageProps {
  params: {
    locale: string;
    il: string;
  };
}

export async function generateStaticParams() {
  const cities = getAllCities();
  return cities.map((city) => ({
    il: city.slug,
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityBySlug(params.il);
  
  if (!city) {
    return { title: 'Sayfa Bulunamadı' };
  }

  const tSeo = await getTranslations({ locale: params.locale, namespace: 'seo' });
  const todayTimes = await getTodayPrayerTimes(city.id);
  
  const title = tSeo('cityTitle', { city: city.name });
  const description = todayTimes
    ? tSeo('cityDescription', {
        city: city.name,
        imsak: todayTimes.imsak,
        ogle: todayTimes.ogle,
        ikindi: todayTimes.ikindi,
        aksam: todayTimes.aksam,
        yatsi: todayTimes.yatsi,
      })
    : tSeo('defaultDescription', { location: city.name });

  const keywords = [
    `${city.name} ezan vakitleri`,
    `${city.name} namaz vakitleri`,
    `${city.name} namaz saatleri`,
    `${city.name} imsak vakti`,
    `${city.name} akşam ezanı`,
    'ezan vakitleri 2026',
    'namaz vakitleri türkiye',
    'diyanet namaz vakitleri',
    'günlük namaz vakitleri',
    'aylık vakit cetveli',
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';
  const url = `${baseUrl}/${city.slug}`;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Ezan Vakitleri' }],
    creator: 'Ezan Vakitleri',
    publisher: 'Ezan Vakitleri',
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: params.locale,
      url,
      title,
      description,
      siteName: 'Ezan Vakitleri',
      images: [
        {
          url: `${baseUrl}/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: `${city.name} Ezan Vakitleri`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [`${baseUrl}/icon-512x512.png`],
    },
    // Şehir sayfaları HER ZAMAN INDEX edilir
    robots: {
      index: true, // Her zaman index
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export const revalidate = 3600;

export default async function CityPage({ params }: CityPageProps) {
  const city = getCityBySlug(params.il);

  if (!city) {
    notFound();
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'site' });
  const tPrayer = await getTranslations({ locale: params.locale, namespace: 'prayer' });
  const tStatus = await getTranslations({ locale: params.locale, namespace: 'status' });
  const tLocation = await getTranslations({ locale: params.locale, namespace: 'location' });
  const tFooter = await getTranslations({ locale: params.locale, namespace: 'footer' });

  const todayTimes = await getTodayPrayerTimes(city.id);
  const monthlyTimes = await getMonthlyPrayerTimes(city.id);

  if (!todayTimes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {tStatus('error')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {tStatus('errorDescription')}
          </p>
        </div>
      </div>
    );
  }

  const nextPrayer = getNextPrayerTime(todayTimes);
  const currentDate = new Date();

  // JSON-LD Structured Data (Google için)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${city.name} Ezan Vakitleri`,
    description: `${city.name} için güncel namaz vakitleri ve ezan saatleri`,
    url: `${baseUrl}/${city.slug}`,
    mainEntity: {
      '@type': 'Schedule',
      name: `${city.name} Namaz Vakitleri`,
      description: `${city.name} için günlük namaz vakitleri cetveli`,
      scheduleTimezone: 'Europe/Istanbul',
      ...(todayTimes && {
        event: [
          {
            '@type': 'Event',
            name: 'İmsak',
            startDate: `${new Date().toISOString().split('T')[0]}T${todayTimes.imsak}:00+03:00`,
          },
          {
            '@type': 'Event',
            name: 'Güneş',
            startDate: `${new Date().toISOString().split('T')[0]}T${todayTimes.gunes}:00+03:00`,
          },
          {
            '@type': 'Event',
            name: 'Öğle',
            startDate: `${new Date().toISOString().split('T')[0]}T${todayTimes.ogle}:00+03:00`,
          },
          {
            '@type': 'Event',
            name: 'İkindi',
            startDate: `${new Date().toISOString().split('T')[0]}T${todayTimes.ikindi}:00+03:00`,
          },
          {
            '@type': 'Event',
            name: 'Akşam',
            startDate: `${new Date().toISOString().split('T')[0]}T${todayTimes.aksam}:00+03:00`,
          },
          {
            '@type': 'Event',
            name: 'Yatsı',
            startDate: `${new Date().toISOString().split('T')[0]}T${todayTimes.yatsi}:00+03:00`,
          },
        ],
      }),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: city.name,
          item: `${baseUrl}/${city.slug}`,
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-700 dark:text-primary-400 mb-2 flex items-center gap-3">
                🕌 {t('title')}
              </h1>
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CitySelector currentCity={city} locale={params.locale} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📍 {city.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {formatDate(currentDate)}
            </p>
            {todayTimes.hijriDate && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {formatHijriDate(todayTimes.hijriDate)}
              </p>
            )}
          </div>
          {city.districts.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {tLocation('selectDistrict')}
            </div>
          )}
        </div>
      </div>

      {nextPrayer && (
        <div className="mb-8 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 rounded-2xl shadow-2xl p-8 text-white">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-semibold mb-2">
              🕌 {tPrayer('nextPrayer')}
            </h3>
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {nextPrayer.displayName}
            </div>
            <div className="text-3xl md:text-4xl font-mono">
              {nextPrayer.time}
            </div>
          </div>
          <CountdownTimer 
            targetTime={nextPrayer.time} 
            prayerName={nextPrayer.displayName}
            locale={params.locale}
          />
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          📅 {tPrayer('todaysPrayers')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'] as PrayerName[]).map((prayerName) => (
            <PrayerTimeCard
              key={prayerName}
              prayerName={prayerName}
              time={todayTimes[prayerName]}
              isNext={nextPrayer?.name === prayerName}
              locale={params.locale}
            />
          ))}
        </div>
      </div>

      {monthlyTimes.length > 0 && (
        <MonthlyTable times={monthlyTimes} locale={params.locale} />
      )}

      <footer className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          {tFooter('dataSource')}{' '}
          <a
            href="https://www.diyanet.gov.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            {tFooter('dataProvider')}
          </a>
          {' '}{tFooter('dataProviderLink')}
        </p>
        <p className="mt-2">
          © 2026 {t('title')}. {t('copyright')}
        </p>
      </footer>
      </div>
    </>
  );
}
