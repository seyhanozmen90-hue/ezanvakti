import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupportedYears, getMonthNameTurkish, daysInMonth } from '@/lib/calendar';

interface PageProps {
  params: {
    locale: string;
    year: string;
  };
}

export async function generateStaticParams() {
  return getSupportedYears();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = params;
  
  return {
    title: `${year} Namaz Vakitleri Takvimi | Yıllık Ezan Vakitleri`,
    description: `${year} yılı için aylık namaz vakitleri takvimi. 12 ay boyunca günlük imsak, güneş, öğle, ikindi, akşam ve yatsı vakitlerini görüntüleyin.`,
    keywords: `${year} namaz takvimi, ${year} ezan vakitleri, yıllık namaz saatleri ${year}`,
    openGraph: {
      title: `${year} Namaz Vakitleri Takvimi`,
      description: `${year} yılı için aylık namaz vakitleri takvimi`,
      type: 'website',
    },
  };
}

export default function YearPage({ params }: PageProps) {
  const { year } = params;
  const yearNum = parseInt(year);
  
  // Sadece 2026 destekleniyor
  if (yearNum !== 2026) {
    notFound();
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/takvim" className="hover:text-primary-600 dark:hover:text-primary-400">
          Takvim
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{year}</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          📅 {year} Namaz Vakitleri Takvimi
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          12 ay boyunca günlük namaz vakitleri
        </p>
      </div>

      {/* Aylar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {months.map((month) => {
          const monthStr = month.toString().padStart(2, '0');
          const monthName = getMonthNameTurkish(month);
          const days = daysInMonth(yearNum, month);

          // Ay emojileri
          const monthEmojis = ['❄️', '🌨️', '🌸', '🌼', '🌻', '☀️', '🏖️', '🌾', '🍂', '🍁', '🌧️', '🎄'];

          return (
            <Link
              key={month}
              href={`/takvim/${year}/${monthStr}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:scale-105 transform"
            >
              {/* Ay Başlığı */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-5 text-white relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 text-6xl">{monthEmojis[month - 1]}</div>
                </div>
                
                <div className="relative">
                  <div className="text-3xl font-bold mb-1">{monthName}</div>
                  <div className="text-sm opacity-90 font-medium">{year}</div>
                </div>
              </div>

              {/* Ay İçeriği */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {days} gün
                    </span>
                  </div>
                  <svg 
                    className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                {/* Mini Takvim Preview */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: Math.min(days, 28) }, (_, i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-primary-100 dark:bg-primary-900/30 rounded group-hover:bg-primary-200 dark:group-hover:bg-primary-800/50 transition-colors"
                    />
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Alt Bilgi */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-50 dark:bg-gray-800 rounded-lg">
          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Tüm vakitler Diyanet İşleri Başkanlığı verilerine göre gösterilmektedir
          </span>
        </div>
      </div>
    </div>
  );
}
