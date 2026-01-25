import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  generateMonthsForYear, 
  getMonthNameTurkish, 
  daysInMonth, 
  pad2,
  getDayNameTurkish 
} from '@/lib/calendar';

interface PageProps {
  params: {
    locale: string;
    year: string;
    month: string;
  };
}

export async function generateStaticParams() {
  return generateMonthsForYear(2026);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month } = params;
  const monthNum = parseInt(month);
  const monthName = getMonthNameTurkish(monthNum);
  
  return {
    title: `${monthName} ${year} Namaz Vakitleri Takvimi | Aylık Ezan Saatleri`,
    description: `${monthName} ${year} ayı için günlük namaz vakitleri. Her gün için imsak, güneş, öğle, ikindi, akşam ve yatsı vakitlerini görüntüleyin.`,
    keywords: `${monthName} ${year} namaz vakitleri, ${monthName} ${year} ezan saatleri, aylık namaz takvimi`,
    openGraph: {
      title: `${monthName} ${year} Namaz Vakitleri Takvimi`,
      description: `${monthName} ${year} ayı için günlük namaz vakitleri`,
      type: 'website',
    },
  };
}

export default function MonthPage({ params }: PageProps) {
  const { year, month } = params;
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  
  // Geçerlilik kontrolü
  if (yearNum !== 2026 || monthNum < 1 || monthNum > 12) {
    notFound();
  }

  const monthName = getMonthNameTurkish(monthNum);
  const days = daysInMonth(yearNum, monthNum);
  
  // İlk günün haftanın hangi günü olduğunu bul
  const firstDay = new Date(yearNum, monthNum - 1, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Pazar

  // Takvim grid için boş hücreler
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const monthDays = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/takvim" className="hover:text-primary-600 dark:hover:text-primary-400">
          Takvim
        </Link>
        <span>/</span>
        <Link href={`/takvim/${year}`} className="hover:text-primary-600 dark:hover:text-primary-400">
          {year}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{monthName}</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        {/* Tüm Aylar Linki */}
        <Link 
          href={`/takvim/${year}`}
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Tüm Aylar</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          📆 {monthName} {year}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {days} gün • Aylık namaz vakitleri
        </p>
      </div>

      {/* Takvim Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-8 mb-8">
        {/* Hafta günleri başlıkları */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day) => (
            <div 
              key={day} 
              className="text-center font-bold text-gray-700 dark:text-gray-300 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Günler grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Boş hücreler */}
          {emptyDays.map((i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Günler */}
          {monthDays.map((day) => {
            const dayStr = pad2(day);
            const date = new Date(yearNum, monthNum - 1, day);
            const dayName = getDayNameTurkish(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = 
              new Date().getDate() === day && 
              new Date().getMonth() === monthNum - 1 && 
              new Date().getFullYear() === yearNum;

            return (
              <Link
                key={day}
                href={`/takvim/${year}/${month}/${dayStr}`}
                className={`
                  group aspect-square flex flex-col items-center justify-center 
                  rounded-xl border-2 transition-all
                  ${isToday 
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                  }
                  ${isWeekend && !isToday
                    ? 'bg-red-50 dark:bg-red-900/10'
                    : 'bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className={`
                  text-2xl font-bold mb-1
                  ${isToday 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-900 dark:text-white'
                  }
                  group-hover:scale-110 transition-transform
                `}>
                  {day}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                  {dayName.slice(0, 3)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Navigasyon */}
      <div className="flex items-center justify-between">
        {/* Önceki Ay */}
        <Link
          href={monthNum > 1 ? `/takvim/${year}/${pad2(monthNum - 1)}` : `/takvim/${yearNum - 1}/12`}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden md:inline">Önceki Ay</span>
        </Link>

        {/* Bugün */}
        <Link
          href="/takvim"
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          Ana Sayfa
        </Link>

        {/* Sonraki Ay */}
        <Link
          href={monthNum < 12 ? `/takvim/${year}/${pad2(monthNum + 1)}` : `/takvim/${yearNum + 1}/01`}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <span className="hidden md:inline">Sonraki Ay</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
