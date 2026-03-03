import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getMonthlyPrayerTimes, tryFetchPrayerTimesFromDiyanet } from '@/lib/api';
import { getDistrictBySlug, getAllCityDistrictCombinations, getCityBySlug } from '@/lib/cities-helper';
import { getNextPrayerTime, formatDate, formatHijriDate, isRamadan, getTodayInIstanbul, getCurrentMonthInIstanbul } from '@/lib/utils';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { hasCoordsExist } from '@/lib/geo/tr';
import CountdownTimer from '@/components/CountdownTimer';
import PrayerTimeCard from '@/components/PrayerTimeCard';
import MonthlyTable from '@/components/MonthlyTable';
import ThemeToggle from '@/components/ThemeToggle';
import CitySelector from '@/components/CitySelector';
import JsonLd from '@/components/JsonLd';
import IftarCard from '@/components/IftarCard';
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

/** DD.MM.YYYY veya YYYY-MM-DD → YYYY-MM-DD (Diyanet tarih eşlemesi) */
function toISOKey(d: string): string {
  if (d.includes('-') && d.length === 10) return d;
  const parts = d.trim().split('.');
  if (parts.length !== 3) return d;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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
    notFound();
  }

  const { city, district } = result;
  const todayTimes = await getTodayPrayerTimes(city.id, district.id);

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

  return {
    title: `${city.name} ${district.name} Namaz Vakitleri ${currentYear} | Ezan Vakti`,
    description: `${city.name} ${district.name} namaz vakitleri ${currentYear}. Güncel imsak, öğle, ikindi, akşam, yatsı saatleri. ${district.name} ilçesi için ezan vakitleri ve aylık takvim.`,
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
  };
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  if (params.il === 'adapazari') {
    permanentRedirect(`/${params.locale}/sakarya/adapazari`);
  }
  const result = getDistrictBySlug(params.il, params.ilce);

  if (!result) {
    notFound();
  }

  const { city, district } = result;
  const t = await getTranslations({ locale: params.locale, namespace: 'site' });
  const tPrayer = await getTranslations({ locale: params.locale, namespace: 'prayer' });
  const tStatus = await getTranslations({ locale: params.locale, namespace: 'status' });
  const tNav = await getTranslations({ locale: params.locale, namespace: 'nav' });
  const tFooter = await getTranslations({ locale: params.locale, namespace: 'footer' });

  const hasCoordinates = hasCoordsExist(city.slug, district.slug);
  const date = getTodayInIstanbul();
  const { year: currentYearNum, month: currentMonthNum } = getCurrentMonthInIstanbul();
  const currentMonth = `${currentYearNum}-${String(currentMonthNum).padStart(2, '0')}`;

  let todayTimes: PrayerTime | null = null;
  let monthlyTimes: PrayerTime[] = [];
  let isDbBacked = false;
  let usedSecondaryOrFallback = true;

  // 1) Primary: Diyanet API (ilçe ID ile)
  const diyanetMonthly = await tryFetchPrayerTimesFromDiyanet(city.id, district.id);
  if (diyanetMonthly && diyanetMonthly.length > 0) {
    const todayKey = date;
    const found = diyanetMonthly.find((t) => toISOKey(t.date) === todayKey) || diyanetMonthly[0];
    todayTimes = {
      ...found,
      date: formatDateForDisplay(date),
    };
    monthlyTimes = diyanetMonthly.map((t) => ({
      ...t,
      date: t.date,
      hijriDateShort: t.hijriDate ?? '',
      hijriDateLong: t.hijriDate ?? '',
    }));
    usedSecondaryOrFallback = false;
  }

  // 2) Secondary: Aladhan / DB (koordinat varsa)
  if (!todayTimes && hasCoordinates) {
    try {
      const serviceResult = await getPrayerTimes({
        city_slug: city.slug,
        district_slug: district.slug,
        date,
        skipCache: true,
      });
      todayTimes = {
        imsak: serviceResult.timings.fajr,
        gunes: serviceResult.timings.sunrise,
        ogle: serviceResult.timings.dhuhr,
        ikindi: serviceResult.timings.asr,
        aksam: serviceResult.timings.maghrib,
        yatsi: serviceResult.timings.isha,
        date: formatDateForDisplay(date),
      };
      isDbBacked = true;
      try {
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
          } catch {
            // skip day
          }
        }
        monthlyTimes = monthlyResults;
      } catch {
        monthlyTimes = await getMonthlyPrayerTimes(city.id, district.id);
      }
    } catch {
      // fallback below
    }
  }

  // 3) Last fallback: legacy (boş sayfa dönme)
  if (!todayTimes) {
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
  const currentDate = new Date(`${date}T12:00:00+03:00`);
  
  // Ramazan ayı kontrolü
  const isRamadanMonth = isRamadan(todayTimes.hijriDate);

  // JSON-LD: WebPage + BreadcrumbList (Event schema kaldırıldı — GSC Rich Results hatası önlemi)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const districtPageUrl = `${baseUrl}/tr/${city.slug}/${district.slug}`;
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${city.name} ${district.name} Namaz Vakitleri`,
        description: `${city.name} ${district.name} için güncel namaz vakitleri ve ezan saatleri. İmsak, öğle, ikindi, akşam, yatsı.`,
        url: districtPageUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'ezanvakti.site',
          url: baseUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${baseUrl}/tr` },
          { '@type': 'ListItem', position: 2, name: city.name, item: `${baseUrl}/tr/${city.slug}` },
          { '@type': 'ListItem', position: 3, name: district.name, item: districtPageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={pageJsonLd} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 max-w-7xl">
          {/* SEO H1 + Location & Date */}
          <header className="mb-6 sm:mb-8">
            {/* SEO H1 - Görünür başlık */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-navy-900 dark:text-white mb-3 text-center">
              {city.name} {district.name} Namaz Vakitleri – {formatDate(currentDate)}
            </h1>
            <p className="text-center text-navy-700 dark:text-gold-300/80 text-sm sm:text-base mb-6">
              ℹ️ Namaz vakitleri, hesaplama yöntemlerine bağlı olarak birkaç dakikalık farklılık gösterebilir.
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
                  {/* Primary dışı kaynak kullanıldıysa nötr uyarı */}
                  {usedSecondaryOrFallback && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300 dark:border-amber-700/50">
                      ℹ️ Bu ilçe için yedek veri kaynağı kullanılıyor.
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

          {/* İftar Vakti - Ramazan Ayında Göster */}
          {isRamadanMonth && (
            <IftarCard 
              iftarTime={todayTimes.aksam}
              cityName={`${city.name} / ${district.name}`}
              locale={params.locale}
            />
          )}

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-4">
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

          {/* Monthly Table - mobilde üstten daha fazla boşluk */}
          {monthlyTimes.length > 0 && (
            <div className="mt-8 sm:mt-6">
              <MonthlyTable times={monthlyTimes} locale={params.locale} cityName={`${city.name} / ${district.name}`} />
            </div>
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
