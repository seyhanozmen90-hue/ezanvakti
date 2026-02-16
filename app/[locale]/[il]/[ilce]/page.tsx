import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getMonthlyPrayerTimes } from '@/lib/api';
import { getDistrictBySlug, getAllCityDistrictCombinations, getCityBySlug } from '@/lib/cities-helper';
import { getNextPrayerTime, formatDate, formatHijriDate } from '@/lib/utils';
import { isDistrictIndexed } from '@/lib/seo.config';
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

interface DistrictPageProps {
  params: {
    locale: string;
    il: string;
    ilce: string;
  };
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
  const result = getDistrictBySlug(params.il, params.ilce);
  
  if (!result) {
    // Tanımsız ilçe için SEO metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';
    return {
      title: 'Bu İlçe Yakında Eklenecek | Ezan Vakitleri',
      description: 'Namaz vakitleri ve takvim bilgileri bu ilçe için henüz yayında değil. Veriler kademeli olarak eklenmektedir.',
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

  const { city, district } = result;
  const tSeo = await getTranslations({ locale: params.locale, namespace: 'seo' });
  const todayTimes = await getTodayPrayerTimes(city.id, district.id);
  
  const title = tSeo('districtTitle', { city: city.name, district: district.name });
  const description = todayTimes
    ? tSeo('districtDescription', {
        city: city.name,
        district: district.name,
        imsak: todayTimes.imsak,
        ogle: todayTimes.ogle,
        ikindi: todayTimes.ikindi,
        aksam: todayTimes.aksam,
        yatsi: todayTimes.yatsi,
      })
    : tSeo('defaultDescription', { location: `${city.name} ${district.name}` });

  const keywords = [
    `${city.name} ${district.name} ezan vakitleri`,
    `${city.name} ${district.name} namaz vakitleri`,
    `${city.name} ${district.name} namaz saatleri`,
    `${district.name} ezan vakitleri`,
    `${district.name} imsak vakti`,
    `${district.name} akşam ezanı`,
    `${city.name} ilçeleri namaz vakitleri`,
    'ezan vakitleri 2026',
    'diyanet namaz vakitleri',
  ];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const url = `${baseUrl}/tr/${city.slug}/${district.slug}`;
  const currentYear = new Date().getFullYear();

  // SEO Config: İlçenin index edilip edilmeyeceğini kontrol et
  const shouldIndex = isDistrictIndexed(city.slug, district.slug);

  return {
    title: `${city.name} ${district.name} Namaz Vakitleri ${currentYear} | Diyanet Onaylı`,
    description: `${city.name} ${district.name} namaz vakitleri ${currentYear}. Güncel imsak, öğle, ikindi, akşam, yatsı saatleri. ${district.name} ilçesi için Diyanet onaylı ezan vakitleri ve aylık takvim.`,
    keywords: keywords.join(', '),
    authors: [{ name: 'Ezan Vakitleri' }],
    creator: 'Ezan Vakitleri',
    publisher: 'Ezan Vakitleri',
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: params.locale === 'tr' ? 'tr_TR' : params.locale,
      url,
      title: `${city.name} ${district.name} Namaz Vakitleri ${currentYear}`,
      description: `${city.name} ${district.name} için güncel namaz vakitleri ve aylık takvim.`,
      siteName: 'EzanVakti.site',
      images: [
        {
          url: `${baseUrl}/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: `${city.name} ${district.name} Ezan Vakitleri`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${city.name} ${district.name} Namaz Vakitleri ${currentYear}`,
      description: `${city.name} ${district.name} için güncel namaz vakitleri`,
      images: [`${baseUrl}/icon-512x512.png`],
    },
    // NOINDEX kontrolü: seo.config.ts'deki ayara göre
    robots: {
      index: shouldIndex, // false ise NOINDEX
      follow: true, // Her zaman follow
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const result = getDistrictBySlug(params.il, params.ilce);

  // İlçe bulunamazsa "Yakında Eklenecek" sayfası göster
  if (!result) {
    const city = getCityBySlug(params.il);
    return (
      <CityComingSoon 
        requestedSlug={params.ilce} 
        locale={params.locale}
        type="district"
        cityName={city?.name}
      />
    );
  }

  const { city, district } = result;
  const t = await getTranslations({ locale: params.locale, namespace: 'site' });
  const tPrayer = await getTranslations({ locale: params.locale, namespace: 'prayer' });
  const tStatus = await getTranslations({ locale: params.locale, namespace: 'status' });
  const tNav = await getTranslations({ locale: params.locale, namespace: 'nav' });
  const tFooter = await getTranslations({ locale: params.locale, namespace: 'footer' });

  // Check if coordinates exist for this district
  const hasCoordinates = hasCoordsExist(city.slug, district.slug);
  
  let todayTimes: PrayerTime | null = null;
  let monthlyTimes: PrayerTime[] = [];
  let isDbBacked = false;

  if (hasCoordinates) {
    // New system: DB-backed with provider fallback (district-level)
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const serviceResult = await getPrayerTimes({
        city_slug: city.slug,
        district_slug: district.slug,
        date,
      });

      // Convert service result to PrayerTime format
      todayTimes = {
        imsak: serviceResult.timings.fajr,
        gunes: serviceResult.timings.sunrise,
        ogle: serviceResult.timings.dhuhr,
        ikindi: serviceResult.timings.asr,
        aksam: serviceResult.timings.maghrib,
        yatsi: serviceResult.timings.isha,
        date: formatDateForDisplay(date), // Convert to DD.MM.YYYY for consistency
      };

      isDbBacked = true;

      // Fetch monthly data from DB-backed system (direct service call, not HTTP)
      try {
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        const [year, monthNum] = currentMonth.split('-').map(Number);
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        
        const monthlyResults = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          try {
            const dayResult = await getPrayerTimes({
              city_slug: city.slug,
              district_slug: district.slug,
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
        monthlyTimes = await getMonthlyPrayerTimes(city.id, district.id);
      }
    } catch (error) {
      console.error('DB-backed prayer times failed for district:', error);
      // Fallback to old system
      todayTimes = await getTodayPrayerTimes(city.id, district.id);
      monthlyTimes = await getMonthlyPrayerTimes(city.id, district.id);
    }
  } else {
    // Old system: Diyanet API (city & district ID based)
    todayTimes = await getTodayPrayerTimes(city.id, district.id);
    monthlyTimes = await getMonthlyPrayerTimes(city.id, district.id);
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

  // JSON-LD Structured Data (Google için)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ezanvakti.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${city.name} ${district.name} Ezan Vakitleri`,
    description: `${city.name} ${district.name} için güncel namaz vakitleri ve ezan saatleri`,
    url: `${baseUrl}/${city.slug}/${district.slug}`,
    mainEntity: {
      '@type': 'Schedule',
      name: `${city.name} ${district.name} Namaz Vakitleri`,
      description: `${city.name} ${district.name} için günlük namaz vakitleri cetveli`,
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
        {
          '@type': 'ListItem',
          position: 3,
          name: district.name,
          item: `${baseUrl}/${city.slug}/${district.slug}`,
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-7xl">
          {/* SEO H1 + Location & Date */}
          <header className="mb-6 sm:mb-8">
            {/* SEO H1 - Görünür başlık */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy-900 dark:text-white mb-3 text-center">
              {city.name} {district.name} Namaz Vakitleri – {formatDate(currentDate)}
            </h1>
            <p className="text-center text-navy-700 dark:text-gold-300/80 text-sm sm:text-base mb-6">
              Diyanet İşleri Başkanlığı verilerine göre güncel ve doğru namaz saatleri
            </p>

            {/* Breadcrumb */}
            <nav className="mb-6 text-center text-xs sm:text-sm text-navy-700 dark:text-gold-400/60">
              <Link href="/" className="hover:text-gold-600 dark:hover:text-gold-400 hover:underline transition-colors">
                {tNav('home')}
              </Link>
              {' '}/{' '}
              <Link href={`/${city.slug}`} className="hover:text-gold-600 dark:hover:text-gold-400 hover:underline transition-colors">
                {city.name}
              </Link>
              {' '}/{' '}
              <span className="text-navy-900 dark:text-white font-semibold">{district.name}</span>
            </nav>

            {/* Location & Date Card */}
            <div className="bg-white dark:bg-gradient-to-br dark:from-navy-dark/90 dark:to-navy-darker/90 backdrop-blur-md rounded-2xl shadow-xl dark:shadow-2xl p-5 sm:p-6 md:p-8 border-2 border-gold-500 dark:border-gold-500/30">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6">
                {/* Sol: Konum & Tarih Bilgisi */}
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900 dark:bg-gradient-to-r dark:from-gold-400 dark:to-gold-600 dark:bg-clip-text dark:text-transparent mb-2 sm:mb-3 flex items-center gap-2">
                    📍 {city.name} / {district.name}
                    {isDbBacked && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-300 dark:border-green-700">
                        DB-Backed
                      </span>
                    )}
                  </div>
                  <p className="text-navy-900 dark:text-gold-300/80 text-sm sm:text-base md:text-lg font-semibold">
                    {formatDate(currentDate)}
                  </p>
                  {todayTimes.hijriDate && (
                    <p className="text-xs sm:text-sm text-navy-900 dark:text-gold-400/60 mt-1">
                      {formatHijriDate(todayTimes.hijriDate)}
                    </p>
                  )}
                  {/* Koordinat bilgisi yoksa uyarı */}
                  {!hasCoordinates && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300 dark:border-amber-700/50">
                      ℹ️ Bu ilçe için geçici olarak Diyanet verisi gösteriliyor.
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
                  <CitySelector currentCity={city} currentDistrict={district} locale={params.locale} />
                </div>
              </div>
            </div>
          </header>

          {/* Next Prayer Countdown - BIG CARD */}
          {nextPrayer && (
            <div className="mb-6 sm:mb-8 bg-white dark:bg-gradient-to-br dark:from-navy-dark/90 dark:to-navy-darker/90 backdrop-blur-md rounded-2xl shadow-xl dark:shadow-2xl p-5 sm:p-6 md:p-8 text-navy-900 dark:text-gold-300 border-2 border-gold-500 dark:border-gold-500/30">
              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 flex items-center justify-center gap-2 text-navy-900 dark:text-gold-300">
                  <span className="text-xl sm:text-2xl">🕌</span>
                  <span>{tPrayer('nextPrayerWithCity', { city: `${city.name} / ${district.name}` })}</span>
                </h2>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg text-navy-900 dark:text-gold-400">
                  {nextPrayer.displayName}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold bg-navy-100 dark:bg-navy-darkest/40 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg inline-block border-2 border-gold-500 dark:border-gold-500/20 text-navy-900 dark:text-gold-400">
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
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy-900 dark:bg-gradient-to-r dark:from-gold-400 dark:to-gold-600 dark:bg-clip-text dark:text-transparent mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl">📅</span>
              <span className="text-navy-900 dark:text-transparent">{tPrayer('todaysPrayersWithCity', { city: `${city.name} / ${district.name}` })}</span>
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
            <MonthlyTable times={monthlyTimes} locale={params.locale} cityName={`${city.name} / ${district.name}`} />
          )}

          {/* Footer */}
          <footer className="mt-10 sm:mt-12 md:mt-16 text-center text-xs sm:text-sm text-navy-900 dark:text-gold-400/70 bg-white dark:bg-navy-darkest/60 backdrop-blur-md rounded-2xl p-5 sm:p-6 md:p-8 border-2 border-gold-500 dark:border-gold-500/20 shadow-lg dark:shadow-none">
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
