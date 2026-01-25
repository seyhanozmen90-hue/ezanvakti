import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CalendarLeaf from '@/components/CalendarLeaf';
import { 
  generateAllDaysIn2026, 
  getMonthNameTurkish, 
  isValidDate,
  pad2 
} from '@/lib/calendar';

interface PageProps {
  params: {
    locale: string;
    year: string;
    month: string;
    day: string;
  };
  searchParams: { city?: string };
}

// 2026 yılının 365 gününü static olarak generate et
export async function generateStaticParams() {
  return generateAllDaysIn2026();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month, day } = params;
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  const monthName = getMonthNameTurkish(monthNum);
  
  return {
    title: `${dayNum} ${monthName} ${year} Namaz Vakitleri | Günlük Ezan Saatleri`,
    description: `${dayNum} ${monthName} ${year} günü için namaz vakitleri. İmsak, güneş, öğle, ikindi, akşam ve yatsı vakitleri.`,
    keywords: `${dayNum} ${monthName} ${year} namaz vakitleri, günlük ezan saatleri, bugünün namaz vakitleri`,
    openGraph: {
      title: `${dayNum} ${monthName} ${year} Namaz Vakitleri`,
      description: `${dayNum} ${monthName} ${year} günü için namaz vakitleri`,
      type: 'article',
    },
  };
}

export default function DayPage({ params, searchParams }: PageProps) {
  const { year, month, day } = params;
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  
  // Geçerlilik kontrolü
  if (!isValidDate(yearNum, monthNum, dayNum)) {
    notFound();
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);
  const monthName = getMonthNameTurkish(monthNum);
  
  // URL'den veya default olarak İstanbul
  const cityLabel = searchParams.city || 'İstanbul';
  
  // City parametresini URL'ye eklemek için helper
  const addCityParam = (url: string) => {
    return cityLabel !== 'İstanbul' ? `${url}?city=${encodeURIComponent(cityLabel)}` : url;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
        <Link href={addCityParam('/takvim')} className="hover:text-primary-600 dark:hover:text-primary-400">
          Takvim
        </Link>
        <span>/</span>
        <Link href={addCityParam(`/takvim/${year}`)} className="hover:text-primary-600 dark:hover:text-primary-400">
          {year}
        </Link>
        <span>/</span>
        <Link href={addCityParam(`/takvim/${year}/${month}`)} className="hover:text-primary-600 dark:hover:text-primary-400">
          {monthName}
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{dayNum}</span>
      </div>

      {/* Takvim Yaprağı */}
      <div className="mb-12">
        <CalendarLeaf date={date} cityLabel={cityLabel} />
      </div>

      {/* Navigasyon Butonları */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        {/* Önceki Gün */}
        <Link
          href={addCityParam(
            dayNum > 1 
              ? `/takvim/${year}/${month}/${pad2(dayNum - 1)}`
              : monthNum > 1
                ? `/takvim/${year}/${pad2(monthNum - 1)}/${pad2(new Date(yearNum, monthNum - 2, 0).getDate())}`
                : `/takvim/${yearNum - 1}/12/31`
          )}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Önceki Gün</span>
        </Link>

        {/* Aya Dön */}
        <Link
          href={addCityParam(`/takvim/${year}/${month}`)}
          className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 font-bold"
        >
          📅 Aylık Takvim
        </Link>

        {/* Sonraki Gün */}
        <Link
          href={addCityParam(
            dayNum < new Date(yearNum, monthNum, 0).getDate()
              ? `/takvim/${year}/${month}/${pad2(dayNum + 1)}`
              : monthNum < 12
                ? `/takvim/${year}/${pad2(monthNum + 1)}/01`
                : `/takvim/${yearNum + 1}/01/01`
          )}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700 group"
        >
          <span className="font-semibold">Sonraki Gün</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Paylaşım */}
      <div className="text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Paylaş:</span>
          <button className="text-2xl hover:scale-125 transition-transform" title="WhatsApp">📱</button>
          <button className="text-2xl hover:scale-125 transition-transform" title="Link Kopyala">🔗</button>
          <button className="text-2xl hover:scale-125 transition-transform" title="E-posta">📧</button>
        </div>
      </div>
    </div>
  );
}
