import { Metadata } from 'next';
import Link from 'next/link';
import { getCityBySlug } from '@/lib/cities-helper';
import { fetchMonthlyPrayerTimes } from '@/lib/providers/aladhan-monthly';
import { hasCoordsExist } from '@/lib/geo/tr';
import CityComingSoon from '@/components/CityComingSoon';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

const RAMAZAN_YIL = 2026;
const RAMAZAN_AY = 3; // Mart

interface ImsakiyePageProps {
  params: { locale: string; il: string };
}

export async function generateMetadata({ params }: ImsakiyePageProps): Promise<Metadata> {
  const city = getCityBySlug(params.il);
  const sehirAdi = city?.name ?? params.il;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const url = `${baseUrl}/tr/${params.il}/imsakiye`;

  if (!city) {
    return {
      title: `${sehirAdi} İmsakiye | Ezan Vakitleri`,
      description: 'Bu şehir için imsakiye yakında eklenecek.',
      alternates: { canonical: baseUrl },
    };
  }

  return {
    title: `${sehirAdi} Ramazan ${RAMAZAN_YIL} İmsakiye | İftar ve Sahur Vakitleri`,
    description: `${sehirAdi} Ramazan ${RAMAZAN_YIL} imsakiye. Günlük iftar vakitleri, sahur saatleri, imsak tablosu.`,
    keywords: `${sehirAdi} imsakiye, ${sehirAdi} Ramazan ${RAMAZAN_YIL}, iftar vakti ${sehirAdi}, sahur vakti ${sehirAdi}`,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: `${sehirAdi} Ramazan ${RAMAZAN_YIL} İmsakiye`,
      description: `${sehirAdi} Ramazan ${RAMAZAN_YIL} iftar ve sahur vakitleri tablosu.`,
    },
  };
}

function formatGun(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const gun = d.getDay();
  const day = d.getDate();
  const month = d.toLocaleDateString('tr-TR', { month: 'long' });
  return `${day} ${month} ${gunler[gun]}`;
}

export default async function ImsakiyePage({ params }: ImsakiyePageProps) {
  const city = getCityBySlug(params.il);

  if (!city) {
    return <CityComingSoon requestedSlug={params.il} locale={params.locale} />;
  }

  const hasCoords = hasCoordsExist(city.slug);
  let days: Array<{ date: string; timings: { fajr: string; maghrib: string } }> = [];

  if (hasCoords) {
    try {
      const monthly = await fetchMonthlyPrayerTimes(city.slug, RAMAZAN_YIL, RAMAZAN_AY);
      days = monthly.map((d) => ({
        date: d.date,
        timings: { fajr: d.timings.fajr, maghrib: d.timings.maghrib },
      }));
    } catch (e) {
      console.error('İmsakiye verisi alınamadı:', e);
    }
  }

  const tableSchema = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name: `${city.name} Ramazan ${RAMAZAN_YIL} İmsakiye`,
    description: `Ramazan ${RAMAZAN_YIL} boyunca ${city.name} için sahur ve iftar vakitleri`,
  };

  return (
    <>
      <JsonLd data={tableSchema} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mb-2">
              {city.name} Ramazan {RAMAZAN_YIL} İmsakiye
            </h1>
            <p className="text-navy-700 dark:text-gold-300/80 text-sm">
              İftar ve sahur (imsak) vakitleri – Mart {RAMAZAN_YIL}
            </p>
            <Link
              href={`/tr/${city.slug}`}
              className="inline-block mt-3 text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline"
            >
              ← {city.name} günlük namaz vakitleri
            </Link>
          </header>

          {days.length === 0 ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-amber-800 dark:text-amber-200">
              Bu şehir için Ramazan {RAMAZAN_YIL} imsakiye verisi şu an yüklenemiyor. Lütfen{' '}
              <Link href={`/tr/${city.slug}`} className="underline font-semibold">
                günlük namaz vakitleri
              </Link>{' '}
              sayfasını kullanın.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gold-500/30 dark:border-gold-500/20 shadow-lg">
              <table className="w-full text-left text-sm sm:text-base">
                <thead>
                  <tr className="bg-navy-900 dark:bg-navy-darkest text-gold-400">
                    <th className="px-3 py-3 font-bold">Tarih</th>
                    <th className="px-3 py-3 font-bold">Gün</th>
                    <th className="px-3 py-3 font-bold">İmsak (Sahur)</th>
                    <th className="px-3 py-3 font-bold">İftar (Akşam)</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((row) => (
                    <tr
                      key={row.date}
                      className="border-t border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-dark/50 text-navy-900 dark:text-gold-300/90"
                    >
                      <td className="px-3 py-2.5 font-medium">{row.date.split('-').reverse().join('.')}</td>
                      <td className="px-3 py-2.5">{formatGun(row.date)}</td>
                      <td className="px-3 py-2.5 font-mono">{row.timings.fajr}</td>
                      <td className="px-3 py-2.5 font-mono font-semibold">{row.timings.maghrib}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
