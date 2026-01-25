import { Metadata } from 'next';
import Link from 'next/link';
import CalendarLeaf from '@/components/CalendarLeaf';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Namaz Vakitleri Takvimi 2026 | Yıllık Ezan Vakitleri',
    description: '2026 yılı için günlük namaz vakitleri takvimi. İmsak, güneş, öğle, ikindi, akşam ve yatsı vakitlerini görüntüleyin.',
    keywords: 'namaz takvimi, ezan takvimi 2026, yıllık namaz vakitleri, günlük ibadet takvimi',
    openGraph: {
      title: 'Namaz Vakitleri Takvimi 2026',
      description: '2026 yılı için günlük namaz vakitleri takvimi',
      type: 'website',
    },
  };
}

interface PageProps {
  searchParams: { city?: string };
}

export default function TakvimPage({ searchParams }: PageProps) {
  // Bugünün tarihi
  const today = new Date();
  
  // URL'den veya default olarak İstanbul
  const cityLabel = searchParams.city || 'İstanbul';
  
  // City parametresini URL'ye eklemek için helper
  const addCityParam = (url: string) => {
    return cityLabel !== 'İstanbul' ? `${url}?city=${encodeURIComponent(cityLabel)}` : url;
  };
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          📅 Namaz Vakitleri Takvimi
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          365 günlük detaylı namaz vakitleri takvimi
        </p>
      </div>

      {/* Bugünün Takvim Yaprağı */}
      <div className="mb-12">
        <CalendarLeaf date={today} cityLabel={cityLabel} />
      </div>

      {/* CTA Butonu */}
      <div className="text-center mb-12">
        <Link
          href={addCityParam('/takvim/2026')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="text-2xl">📆</span>
          <span>Takvimi Detaylı Gör</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Özellikler */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-3xl mb-3">🕌</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            6 Vakit
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-3xl mb-3">🌙</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Hicri Tarih
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Her gün için Hicri karşılığı
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="text-3xl mb-3">⭐</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Özel Günler
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Dini ve milli bayramlar
          </p>
        </div>
      </div>

      {/* Hızlı Erişim */}
      <div className="mt-12 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Hızlı Erişim
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => {
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            return (
              <Link
                key={month}
                href={addCityParam(`/takvim/2026/${month}`)}
                className="bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg p-4 text-center transition-colors shadow-sm hover:shadow-md"
              >
                <div className="font-bold text-gray-900 dark:text-white">
                  {monthNames[parseInt(month) - 1]}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  2026
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
