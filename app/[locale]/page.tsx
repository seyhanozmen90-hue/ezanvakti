import { Metadata } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getMonthlyPrayerTimes } from '@/lib/api';
import { getDefaultCity } from '@/lib/cities-helper';
import { getNextPrayerTime, formatDate, formatHijriDate } from '@/lib/utils';
import CountdownTimer from '@/components/CountdownTimer';
import PrayerTimeCard from '@/components/PrayerTimeCard';
import MonthlyTable from '@/components/MonthlyTable';
import CitySelector from '@/components/CitySelector';
import JsonLd from '@/components/JsonLd';
import { PrayerName } from '@/lib/types';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'site' });
  const tSeo = await getTranslations({ locale, namespace: 'seo' });

  const title = 'Ezan Vakitleri | Namaz Saatleri 2026 - Türkiye Namaz Vakitleri';
  const description = 'Türkiye\'nin tüm illeri ve ilçeleri için güncel ezan vakitleri, namaz saatleri ve aylık vakit cetveli. Diyanet onaylı, güncel ve doğru namaz vakitleri.';
  
  const keywords = [
    'ezan vakitleri',
    'namaz vakitleri',
    'namaz saatleri',
    'imsak vakti',
    'akşam ezanı',
    'ezan vakitleri 2026',
    'diyanet namaz vakitleri',
    'türkiye namaz vakitleri',
    'günlük namaz vakitleri',
    'aylık vakit cetveli',
    'istanbul ezan vakitleri',
    'ankara namaz vakitleri',
    'izmir namaz saatleri',
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'Ezan Vakitleri' }],
    creator: 'Ezan Vakitleri',
    publisher: 'Ezan Vakitleri',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: 'website',
      locale,
      url: baseUrl,
      title,
      description,
      siteName: 'Ezan Vakitleri',
      images: [
        {
          url: `${baseUrl}/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: 'Ezan Vakitleri Logo',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [`${baseUrl}/icon-512x512.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'YOUR_GOOGLE_VERIFICATION_CODE', // Kullanıcı Google Search Console'dan alacak
    },
  };
}

export const revalidate = 3600; // 1 saat cache

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'site' });
  const tPrayer = await getTranslations({ locale, namespace: 'prayer' });
  const tStatus = await getTranslations({ locale, namespace: 'status' });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });

  const defaultCity = getDefaultCity();
  const todayTimes = await getTodayPrayerTimes(defaultCity.id);
  const monthlyTimes = await getMonthlyPrayerTimes(defaultCity.id);

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
    '@type': 'WebSite',
    name: 'Ezan Vakitleri',
    description: 'Türkiye\'nin tüm illeri için güncel ezan vakitleri ve namaz saatleri',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'Schedule',
      name: 'İstanbul Namaz Vakitleri',
      description: 'İstanbul için günlük namaz vakitleri cetveli',
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
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Location & Date */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Sol: Konum & Tarih Bilgisi */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📍 {defaultCity.name}
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

          {/* Sağ: Konum Seçici */}
          <div className="flex-shrink-0">
            <CitySelector currentCity={defaultCity} locale={locale} />
          </div>
        </div>
      </div>

      {/* Next Prayer Countdown - BIG CARD */}
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
            locale={locale}
          />
        </div>
      )}

      {/* Today's Prayer Times */}
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
              locale={locale}
            />
          ))}
        </div>
      </div>

      {/* Monthly Table */}
      {monthlyTimes.length > 0 && (
        <MonthlyTable times={monthlyTimes} locale={locale} />
      )}

      {/* Footer */}
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
