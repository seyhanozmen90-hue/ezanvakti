import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getMonthlyPrayerTimes } from '@/lib/api';
import { getCityBySlug, getAllCities } from '@/lib/cities-helper';
import { getNextPrayerTime, formatDate, formatHijriDate } from '@/lib/utils';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { hasCoordsExist } from '@/lib/geo/tr';
import CountdownTimer from '@/components/CountdownTimer';
import PrayerTimeCard from '@/components/PrayerTimeCard';
import MonthlyTable from '@/components/MonthlyTable';
import ThemeToggle from '@/components/ThemeToggle';
import CitySelector from '@/components/CitySelector';
import JsonLd from '@/components/JsonLd';
import CityComingSoon from '@/components/CityComingSoon';
import { PrayerName, PrayerTime } from '@/lib/types';

// Force dynamic rendering (SSR) - no static generation
export const dynamic = 'force-dynamic';

/**
 * Convert YYYY-MM-DD to DD.MM.YYYY for display
 */
function formatDateForDisplay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
}

interface CityPageProps {
  params: {
    locale: string;
    il: string;
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityBySlug(params.il);
  
  if (!city) {
    // Tanımsız şehir için SEO metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';
    return {
      title: 'Bu Şehir Yakında Eklenecek | Ezan Vakitleri',
      description: 'Namaz vakitleri ve takvim bilgileri bu şehir için henüz yayında değil. Veriler kademeli olarak eklenmektedir.',
      robots: {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
      alternates: {
        canonical: baseUrl,
      },
    };
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

export default async function CityPage({ params }: CityPageProps) {
  const city = getCityBySlug(params.il);

  // Şehir bulunamazsa "Yakında Eklenecek" sayfası göster
  if (!city) {
    return <CityComingSoon requestedSlug={params.il} locale={params.locale} />;
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'site' });
  const tPrayer = await getTranslations({ locale: params.locale, namespace: 'prayer' });
  const tStatus = await getTranslations({ locale: params.locale, namespace: 'status' });
  const tLocation = await getTranslations({ locale: params.locale, namespace: 'location' });
  const tFooter = await getTranslations({ locale: params.locale, namespace: 'footer' });

  // Check if coordinates exist for this city
  const hasCoordinates = hasCoordsExist(city.slug);
  
  let todayTimes: PrayerTime | null = null;
  let monthlyTimes: PrayerTime[] = [];
  let isDbBacked = false;

  if (hasCoordinates) {
    // New system: DB-backed with provider fallback
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      const result = await getPrayerTimes({
        city_slug: city.slug,
        date,
      });

      // Convert service result to PrayerTime format
      todayTimes = {
        imsak: result.timings.fajr, // Note: Aladhan uses 'fajr' for 'imsak'
        gunes: result.timings.sunrise,
        ogle: result.timings.dhuhr,
        ikindi: result.timings.asr,
        aksam: result.timings.maghrib,
        yatsi: result.timings.isha,
        date: formatDateForDisplay(date), // Convert to DD.MM.YYYY for consistency
      };

      isDbBacked = true;

      // Fetch monthly data from DB-backed system (direct service call, not HTTP)
      try {
        const [year, monthNum] = currentMonth.split('-').map(Number);
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        
        const monthlyResults = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          try {
            const dayResult = await getPrayerTimes({
              city_slug: city.slug,
              date: dateStr,
            });
            
            monthlyResults.push({
              date: formatDateForDisplay(dateStr),
              imsak: dayResult.timings.fajr,
              gunes: dayResult.timings.sunrise,
              ogle: dayResult.timings.dhuhr,
              ikindi: dayResult.timings.asr,
              aksam: dayResult.timings.maghrib,
              yatsi: dayResult.timings.isha,
            });
          } catch (dayError) {
            console.error(`Failed to fetch prayer times for ${dateStr}:`, dayError);
            // Skip days with errors - don't add placeholder rows
            // This prevents empty "--:--" rows in the monthly table
          }
        }
        
        monthlyTimes = monthlyResults;
      } catch (monthlyError) {
        console.error('Monthly prayer times generation failed:', monthlyError);
        // Fallback to legacy only if entire monthly generation fails
        monthlyTimes = await getMonthlyPrayerTimes(city.id);
      }
    } catch (error) {
      console.error('DB-backed prayer times failed:', error);
      // Fallback to old system
      todayTimes = await getTodayPrayerTimes(city.id);
      monthlyTimes = await getMonthlyPrayerTimes(city.id);
    }
  } else {
    // Old system: Diyanet API (city ID based)
    todayTimes = await getTodayPrayerTimes(city.id);
    monthlyTimes = await getMonthlyPrayerTimes(city.id);
  }

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

  // JSON-LD Structured Data - Daha detaylı namaz vakitleri schema
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';
  const todayDateString = new Date().toISOString().split('T')[0];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebSite', 'LocalBusiness'],
    name: 'Ezan Vakitleri',
    alternateName: 'Namaz Vakitleri',
    description: `${city.name} ve Türkiye'nin tüm illeri için güncel, doğru ve Diyanet onaylı namaz vakitleri`,
    url: baseUrl,
    inLanguage: 'tr-TR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    about: {
      '@type': 'Thing',
      name: 'Namaz Vakitleri',
      description: 'İslam dininde farz olan beş vakit namazın vakitleri',
    },
    mainEntity: {
      '@type': 'Schedule',
      name: `${city.name} Namaz Vakitleri - ${formatDate(currentDate)}`,
      description: `${city.name} için ${formatDate(currentDate)} tarihli günlük namaz vakitleri. Diyanet İşleri Başkanlığı verilerine göre hesaplanmıştır.`,
      scheduleTimezone: 'Europe/Istanbul',
      ...(todayTimes && {
        event: [
          {
            '@type': 'Event',
            name: 'İmsak Vakti',
            description: `${city.name} İmsak vakti - Sabah namazı için hazırlık zamanı`,
            startDate: `${todayDateString}T${todayTimes.imsak}:00+03:00`,
            location: {
              '@type': 'Place',
              name: city.name,
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'TR',
                addressLocality: city.name,
              },
            },
          },
          {
            '@type': 'Event',
            name: 'Güneş Doğuşu',
            description: `${city.name} Güneş doğuşu vakti - Sabah namazının son zamanı`,
            startDate: `${todayDateString}T${todayTimes.gunes}:00+03:00`,
            location: {
              '@type': 'Place',
              name: city.name,
            },
          },
          {
            '@type': 'Event',
            name: 'Öğle Namazı Vakti',
            description: `${city.name} Öğle namazı vakti`,
            startDate: `${todayDateString}T${todayTimes.ogle}:00+03:00`,
            location: {
              '@type': 'Place',
              name: city.name,
            },
          },
          {
            '@type': 'Event',
            name: 'İkindi Namazı Vakti',
            description: `${city.name} İkindi namazı vakti`,
            startDate: `${todayDateString}T${todayTimes.ikindi}:00+03:00`,
            location: {
              '@type': 'Place',
              name: city.name,
            },
          },
          {
            '@type': 'Event',
            name: 'Akşam Namazı Vakti (Ezan)',
            description: `${city.name} Akşam ezanı ve namaz vakti`,
            startDate: `${todayDateString}T${todayTimes.aksam}:00+03:00`,
            location: {
              '@type': 'Place',
              name: city.name,
            },
          },
          {
            '@type': 'Event',
            name: 'Yatsı Namazı Vakti',
            description: `${city.name} Yatsı namazı vakti`,
            startDate: `${todayDateString}T${todayTimes.yatsi}:00+03:00`,
            location: {
              '@type': 'Place',
              name: city.name,
            },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
          {/* SEO H1 + Location & Date */}
          <header className="mb-5">
            {/* SEO H1 - Görünür başlık */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-navy-900 dark:text-white mb-2 text-center">
              {city.name} Namaz Vakitleri – {formatDate(currentDate)}
            </h1>
            <p className="text-center text-navy-700 dark:text-gold-300/80 text-xs sm:text-sm mb-4">
              Diyanet İşleri Başkanlığı verilerine göre güncel ve doğru namaz saatleri
            </p>

            {/* Location & Date Card */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-navy-dark/90 dark:to-navy-darker/90 backdrop-blur-md rounded-xl shadow-lg dark:shadow-xl p-4 sm:p-5 border border-gold-500 dark:border-gold-500/30">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4">
                {/* Sol: Konum & Tarih Bilgisi */}
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-bold text-navy-900 dark:bg-gradient-to-r dark:from-gold-400 dark:to-gold-600 dark:bg-clip-text dark:text-transparent mb-1.5 flex items-center gap-2">
                    📍 {city.name}
                    {isDbBacked && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-300 dark:border-green-700">
                        DB-Backed
                      </span>
                    )}
                  </div>
                  <p className="text-navy-900 dark:text-gold-300/80 text-xs sm:text-sm font-semibold">
                    {formatDate(currentDate)}
                  </p>
                  {todayTimes?.hijriDate && (
                    <p className="text-xs sm:text-sm text-navy-900 dark:text-gold-400/60 mt-1">
                      {formatHijriDate(todayTimes.hijriDate)}
                    </p>
                  )}
                  {/* Koordinat bilgisi yoksa uyarı */}
                  {!hasCoordinates && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300 dark:border-amber-700/50">
                      ℹ️ Bu şehir için geçici olarak Diyanet verisi gösteriliyor.
                    </div>
                  )}
                  {/* Duvar Takvimi Linki */}
                  <Link
                    href={`/${city.slug}/takvim`}
                    className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gradient-to-r from-gold-500/10 to-gold-600/10 dark:from-gold-500/20 dark:to-gold-600/20 hover:from-gold-500/20 hover:to-gold-600/20 dark:hover:from-gold-500/30 dark:hover:to-gold-600/30 border border-gold-500/30 dark:border-gold-500/40 rounded-lg text-sm font-semibold text-navy-900 dark:text-gold-300 transition-all hover:scale-105"
                  >
                    📅 Bugünün Duvar Takvimi
                  </Link>
                </div>

                {/* Sağ: Konum Seçici */}
                <div className="flex-shrink-0">
                  <CitySelector currentCity={city} locale={params.locale} />
                </div>
              </div>
            </div>
          </header>

          {/* Next Prayer Countdown - BIG CARD */}
          {nextPrayer && (
            <div className="mb-5 bg-white dark:bg-gradient-to-br dark:from-navy-dark/90 dark:to-navy-darker/90 backdrop-blur-md rounded-xl shadow-lg dark:shadow-xl p-4 sm:p-5 text-navy-900 dark:text-gold-300 border border-gold-500 dark:border-gold-500/30">
              <div className="text-center mb-2.5">
                <h2 className="text-xs sm:text-sm font-bold mb-1 flex items-center justify-center gap-1.5 text-navy-900 dark:text-gold-300">
                  <span className="text-base sm:text-lg">🕌</span>
                  <span>{tPrayer('nextPrayerWithCity', { city: city.name })}</span>
                </h2>
                <div className="text-lg sm:text-xl font-bold mb-1 drop-shadow-lg text-navy-900 dark:text-gold-400">
                  {nextPrayer.displayName}
                </div>
                <div className="text-base sm:text-lg font-mono font-bold bg-navy-100 dark:bg-navy-darkest/40 py-1 px-2.5 rounded-lg inline-block border border-gold-500 dark:border-gold-500/20 text-navy-900 dark:text-gold-400">
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

          {/* Today's Prayer Times */}
          <div className="mb-6">
            <h2 className="text-base sm:text-lg font-bold text-navy-900 dark:bg-gradient-to-r dark:from-gold-400 dark:to-gold-600 dark:bg-clip-text dark:text-transparent mb-3 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📅</span>
              <span className="text-navy-900 dark:text-transparent">{tPrayer('todaysPrayersWithCity', { city: city.name })}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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

          {/* Monthly Table */}
          {monthlyTimes.length > 0 && (
            <MonthlyTable times={monthlyTimes} locale={params.locale} cityName={city.name} />
          )}

          {/* Footer */}
          <footer className="mt-8 text-center text-xs sm:text-sm text-navy-900 dark:text-gold-400/70 bg-white dark:bg-navy-darkest/60 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-gold-500 dark:border-gold-500/20 shadow-lg dark:shadow-none">
            <p className="mb-3 text-xs text-navy-700 dark:text-gold-400/60 italic">
              ℹ️ Namaz vakitleri, hesaplama yöntemlerine bağlı olarak birkaç dakikalık farklılık gösterebilir.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
              <a
                href="/hakkimizda"
                className="text-navy-700 dark:text-gold-400/60 hover:text-gold-600 dark:hover:text-gold-400 hover:underline transition-colors"
              >
                Hakkımızda
              </a>
              <span className="text-navy-400 dark:text-gold-400/30">•</span>
              <a
                href="/iletisim"
                className="text-navy-700 dark:text-gold-400/60 hover:text-gold-600 dark:hover:text-gold-400 hover:underline transition-colors"
              >
                İletişim
              </a>
              <span className="text-navy-400 dark:text-gold-400/30">•</span>
              <a
                href="/gizlilik-politikasi"
                className="text-navy-700 dark:text-gold-400/60 hover:text-gold-600 dark:hover:text-gold-400 hover:underline transition-colors"
              >
                Gizlilik Politikası
              </a>
            </div>
            <p className="text-navy-900 dark:text-gold-400/50">
              © 2026 {t('title')}. {t('copyright')}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
