import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getTodayPrayerTimes, getMonthlyPrayerTimes, tryFetchPrayerTimesFromDiyanet } from '@/lib/api';
import { getCityBySlug, getAllCities } from '@/lib/cities-helper';
import { getNextPrayerTime, formatDate, formatHijriDate, isRamadan, getTodayInIstanbul, getCurrentMonthInIstanbul } from '@/lib/utils';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { hasCoordsExist } from '@/lib/geo/tr';
import { SEHIR_ADLARI } from '@/lib/sehir-adlari';
import CountdownTimer from '@/components/CountdownTimer';
import PrayerTimeCard from '@/components/PrayerTimeCard';
import MonthlyTable from '@/components/MonthlyTable';
import ThemeToggle from '@/components/ThemeToggle';
import CitySelector from '@/components/CitySelector';
import JsonLd from '@/components/JsonLd';
import IftarCard from '@/components/IftarCard';
import CitySEOContent from '@/components/CitySEOContent';
import CityInternalLinks from '@/components/CityInternalLinks';
import { PrayerName, PrayerTime } from '@/lib/types';
import { locales } from '@/i18n';

// Her istekte sunucuda render (view-source'ta vakitler görünsün; build'de API bazen başarısız olabiliyor)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Geçerli path listesi (build'de statik üretim yok, sayfa her istekte SSR) */
export function generateStaticParams(): Array<{ locale: string; il: string }> {
  const cities = getAllCities().filter((c) => c.slug !== 'adapazari');
  return locales.flatMap((locale) =>
    cities.map((city) => ({ locale, il: city.slug }))
  );
}

// Doğrulama: /tr/adapazari => 301/308 → /tr/sakarya/adapazari. /tr/sakarya/adapazari => 200, robots index,follow, canonical https://www.ezanvakti.site/tr/sakarya/adapazari. View Source'da noindex yok; X-Robots-Tag noindex yok.

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
  const parts = d.split('.');
  if (parts.length === 3)
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  return d;
}

interface CityPageProps {
  params: {
    locale: string;
    il: string;
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  if (params.il === 'adapazari') {
    return { title: 'Adapazarı Namaz Vakitleri | Ezan Vakti', robots: { index: false, follow: true } };
  }
  const city = getCityBySlug(params.il);
  const sehirAdi = SEHIR_ADLARI[params.il] ?? city?.name ?? params.il;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const url = `${baseUrl}/tr/${params.il}`;
  const yil = new Date().getFullYear();
  const bugun = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateWithDayName = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  if (!city) {
    notFound();
  }

  return {
    title: `${sehirAdi} Namaz Vakitleri – ${dateWithDayName}`,
    description: `${sehirAdi} namaz vakitleri ${bugun}. Güncel imsak, güneş, öğle, ikindi, akşam, yatsı saatleri. ${sehirAdi} ${yil} imsakiye ve iftar vakitleri.`,
    keywords: [
      `${sehirAdi} namaz vakitleri`,
      `${sehirAdi} ezan vakitleri`,
      `${sehirAdi} imsak vakti`,
      `${sehirAdi} iftar vakti`,
      `${sehirAdi} imsakiye ${yil}`,
      `${sehirAdi} namaz saatleri`,
      `${sehirAdi} akşam ezanı`,
      `${sehirAdi} sahur vakti`,
    ],
    authors: [{ name: 'EzanVakti' }],
    creator: 'EzanVakti',
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: params.locale === 'tr' ? 'tr_TR' : params.locale,
      url,
      title: `${sehirAdi} Namaz Vakitleri – ${dateWithDayName}`,
      description: `${sehirAdi} için güncel ezan ve namaz vakitleri. İmsakiye, iftar saati.`,
      siteName: 'EzanVakti.site',
    },
    twitter: {
      card: 'summary',
      title: `${sehirAdi} Namaz Vakitleri – ${dateWithDayName}`,
      description: `${sehirAdi} için güncel ezan ve namaz vakitleri. İmsakiye, iftar saati.`,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  };
}

/**
 * Şehir (il) sayfası — SERVER RENDERED (SEO).
 * Namaz vakitleri yalnızca sunucuda çekilir; ilk HTML yanıtında düz metin olarak bulunur.
 * Client-side fetch yok (useEffect ile veri çekilmez).
 */
export default async function CityPage({ params }: CityPageProps) {
  // /tr/adapazari => 301/308 kalıcı yönlendirme → /tr/sakarya/adapazari (redirect sadece burada, server-side).
  if (params.il === 'adapazari') {
    permanentRedirect(`/${params.locale}/sakarya/adapazari`);
  }
  const city = getCityBySlug(params.il);

  if (!city) {
    notFound();
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'site' });
  const tPrayer = await getTranslations({ locale: params.locale, namespace: 'prayer' });
  const tStatus = await getTranslations({ locale: params.locale, namespace: 'status' });
  const tLocation = await getTranslations({ locale: params.locale, namespace: 'location' });
  const tFooter = await getTranslations({ locale: params.locale, namespace: 'footer' });

  const hasCoordinates = hasCoordsExist(city.slug);
  const date = getTodayInIstanbul();
  const { year: currentYearNum, month: currentMonthNum } = getCurrentMonthInIstanbul();
  const currentMonth = `${currentYearNum}-${String(currentMonthNum).padStart(2, '0')}`;

  let todayTimes: PrayerTime | null = null;
  let monthlyTimes: PrayerTime[] = [];
  let isDbBacked = false;
  /** Primary (Diyanet) kullanılmadıysa nötr uyarı göster */
  let usedSecondaryOrFallback = true;

  // 1) Primary: Diyanet API (çalışıyorsa)
  const diyanetMonthly = await tryFetchPrayerTimesFromDiyanet(city.id);
  if (diyanetMonthly && diyanetMonthly.length > 0) {
    const todayKey = toISOKey(date);
    const found =
      diyanetMonthly.find((t) => toISOKey(t.date) === todayKey) ||
      diyanetMonthly[0];
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

  // 2) Secondary: Aladhan / mevcut sağlayıcı (Diyanet başarısızsa ve koordinat varsa)
  if (!todayTimes && hasCoordinates) {
    try {
      const result = await getPrayerTimes({ city_slug: city.slug, date, skipCache: true });
      todayTimes = {
        imsak: result.timings.fajr,
        gunes: result.timings.sunrise,
        ogle: result.timings.dhuhr,
        ikindi: result.timings.asr,
        aksam: result.timings.maghrib,
        yatsi: result.timings.isha,
        date: formatDateForDisplay(date),
      };
      isDbBacked = true;
      try {
        const [year, monthNum] = currentMonth.split('-').map(Number);
        const { fetchMonthlyPrayerTimes } = await import('@/lib/providers/aladhan-monthly');
        const monthlyData = await fetchMonthlyPrayerTimes(city.slug, year, monthNum);
        monthlyTimes = monthlyData.map((day) => ({
          date: formatDateForDisplay(day.date),
          imsak: day.timings.fajr,
          gunes: day.timings.sunrise,
          ogle: day.timings.dhuhr,
          ikindi: day.timings.asr,
          aksam: day.timings.maghrib,
          yatsi: day.timings.isha,
          hijriDateShort: day.hijri_date_short || '',
          hijriDateLong: day.hijri_date_long || '',
        }));
      } catch {
        monthlyTimes = await getMonthlyPrayerTimes(city.id);
      }
    } catch {
      // devam et, aşağıda fallback
    }
  }

  // 3) Last fallback: yerel cache / legacy (boş sayfa dönme)
  if (!todayTimes) {
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
  const currentDate = new Date(`${date}T12:00:00+03:00`);
  
  // Ramazan ayı kontrolü
  const isRamadanMonth = isRamadan(todayTimes.hijriDate);

  // JSON-LD Structured Data - Daha detaylı namaz vakitleri schema
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebSite', 'LocalBusiness'],
    name: 'Ezan Vakitleri',
    alternateName: 'Namaz Vakitleri',
    description: `${city.name} ve Türkiye'nin tüm illeri için güncel ve doğru namaz vakitleri`,
    url: `${baseUrl}/tr/${city.slug}`,
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
      description: `${city.name} için ${formatDate(currentDate)} tarihli günlük namaz vakitleri. Astronomik hesaplamalara göre belirlenmiştir.`,
      scheduleTimezone: 'Europe/Istanbul',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: `${baseUrl}/tr`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `${city.name} Namaz Vakitleri`,
          item: `${baseUrl}/tr/${city.slug}`,
        },
      ],
    },
  };

  // WebPage + BreadcrumbList JSON-LD (sayfa ve site adı, URL, şehir)
  const pageUrl = `${baseUrl}/${params.locale}/${city.slug}`;
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${city.name} Namaz Vakitleri`,
        url: pageUrl,
        isPartOf: {
          '@type': 'WebSite',
          name: 'ezanvakti.site',
          url: baseUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${baseUrl}/${params.locale}` },
          { '@type': 'ListItem', position: 2, name: `${city.name} Namaz Vakitleri`, item: pageUrl },
        ],
      },
    ],
  };

  // FAQ JSON-LD (şehir sayfası SEO)
  const yil = new Date().getFullYear();
  const faqSchema =
    todayTimes &&
    ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `${city.name} bugün imsak vakti saat kaçta?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${city.name} için bugün imsak vakti ${todayTimes.imsak} olarak belirlenmiştir.`,
          },
        },
        {
          '@type': 'Question',
          name: `${city.name} iftar vakti saat kaçta?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${city.name} için bugün iftar vakti (akşam ezanı) ${todayTimes.aksam} olarak belirlenmiştir.`,
          },
        },
        {
          '@type': 'Question',
          name: `${city.name} ${yil} imsakiye nedir?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${city.name} ${yil} Ramazan imsakiyesi için ezanvakti.site'yi ziyaret edin.`,
          },
        },
      ],
    } as const);

  return (
    <>
      <JsonLd data={jsonLd} />
      <JsonLd data={pageJsonLd} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
          {/* SSR: Namaz vakitleri ilk HTML'de düz metin (view-source); loading.tsx kaldırıldığı için artık ilk yanıtta gelir */}
          <section className="sr-only" aria-label="Namaz vakitleri">
            <h2>{city.name} Namaz Vakitleri</h2>
            <ul>
              <li>İmsak: {todayTimes.imsak}</li>
              <li>Güneş: {todayTimes.gunes}</li>
              <li>Öğle: {todayTimes.ogle}</li>
              <li>İkindi: {todayTimes.ikindi}</li>
              <li>Akşam: {todayTimes.aksam}</li>
              <li>Yatsı: {todayTimes.yatsi}</li>
            </ul>
          </section>

          {/* SEO H1 + Location & Date */}
          <header className="mb-5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-navy-900 dark:text-white mb-2 text-center">
              {city.name} Namaz Vakitleri – {formatDate(currentDate)}
            </h1>
            <p className="text-center text-navy-700 dark:text-gold-300/80 text-xs sm:text-sm mb-4">
              ℹ️ Namaz vakitleri, hesaplama yöntemlerine bağlı olarak birkaç dakikalık farklılık gösterebilir.
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
                  {/* Primary dışı kaynak kullanıldıysa nötr uyarı (kurum adı yok) */}
                  {usedSecondaryOrFallback && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-300 dark:border-amber-700/50">
                      ℹ️ Bu şehir için yedek veri kaynağı kullanılıyor.
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

          {/* İftar Vakti - Ramazan Ayında Göster */}
          {isRamadanMonth && (
            <IftarCard 
              iftarTime={todayTimes.aksam}
              cityName={city.name}
              locale={params.locale}
            />
          )}

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
                cityName={city.name}
                aksamTime={todayTimes.aksam}
                prayerKey={nextPrayer.name}
              />
            </div>
          )}

          {/* Today's Prayer Times */}
          <div className="mb-8 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-navy-900 dark:bg-gradient-to-r dark:from-gold-400 dark:to-gold-600 dark:bg-clip-text dark:text-transparent mb-4 sm:mb-3 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📅</span>
              <span className="text-navy-900 dark:text-transparent">{tPrayer('todaysPrayersWithCity', { city: city.name })}</span>
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
              <MonthlyTable times={monthlyTimes} locale={params.locale} cityName={city.name} />
            </div>
          )}

          {/* SEO: Şehir namaz vakitleri metni (250–400 kelime, SSR) */}
          <CitySEOContent cityName={city.name} citySlug={city.slug} />

          {/* İç linkler: popüler iller + ilçeler (HTML kaynağında görünür) */}
          <CityInternalLinks locale={params.locale} currentCity={city} />

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
