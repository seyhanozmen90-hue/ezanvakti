import Link from 'next/link';
import { notFound } from 'next/navigation';
import { monthNames, getMonthDays } from '@/data/calendar-2026-official';
import { getCityBySlug } from '@/lib/cities-helper';

interface PageProps {
  params: { locale: string; il: string; year: string; month: string };
}

export default function MonthPage({ params }: PageProps) {
  // Şehir bilgisini URL'den al
  const city = getCityBySlug(params.il);
  
  if (!city) {
    notFound();
  }

  const year = parseInt(params.year);
  const month = parseInt(params.month);
  
  const monthData = getMonthDays(month, year);
  const monthName = monthNames[month - 1];

  // Ayın grid yapısını oluştur
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const calendarGrid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarGrid.push(day);
  }

  // Önceki ve sonraki ayları hesapla
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">
          {city.name} - {monthName} {year}
        </h1>
        
        {/* Üst Navigasyon */}
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <Link
            href={`/${params.il}/takvim/${prevYear}/${String(prevMonth).padStart(2, '0')}`}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600 hover:from-gray-800 hover:to-gray-600 text-white rounded-xl font-black transition-all hover:scale-105 hover:shadow-lg border-2 border-black dark:border-gray-300"
          >
            <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
            <span className="hidden sm:inline">Önceki Ay</span>
          </Link>
          
          <Link 
            href={`/${params.il}/takvim`}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-black text-gray-900 dark:text-white border-2 border-black dark:border-gray-300 transition-all hover:scale-105 hover:shadow-lg"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">🏠</span>
            <span className="hidden sm:inline">Ana Takvime Dön</span>
            <span className="sm:hidden">Ana Sayfa</span>
          </Link>
          
          <Link
            href={`/${params.il}/takvim/${nextYear}/${String(nextMonth).padStart(2, '0')}`}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-xl font-black transition-all hover:scale-105 hover:shadow-lg border-2 border-black dark:border-gray-300"
          >
            <span className="hidden sm:inline">Sonraki Ay</span>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Ay Takvimi Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-black dark:border-gray-300">
        {/* Gün başlıkları */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
            <div key={day} className="text-center font-black text-sm text-gray-900 dark:text-white py-2 border-b-2 border-black dark:border-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid grid-cols-7 gap-2">
          {calendarGrid.map((day, idx) => {
            if (!day) {
              return <div key={idx} className="aspect-square"></div>;
            }
            
            const dayInfo = monthData.find(d => d.dayNumber === day);
            const isSpecial = dayInfo?.isHoliday || dayInfo?.religiousDays;
            
            return (
              <Link
                key={idx}
                href={`/${params.il}/takvim/${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg
                  border-2 transition-all hover:scale-105
                  ${isSpecial
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <div className={`text-xl md:text-2xl font-black ${isSpecial ? 'text-yellow-800 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                  {day}
                </div>
                {isSpecial && (
                  <div className="text-xs">⭐</div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Önemli Günler Listesi */}
        {monthData.filter(d => d.isHoliday || d.religiousDays).length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-black dark:border-gray-300">
            <h3 className="font-black text-lg mb-3 text-gray-900 dark:text-white">
              Bu Ayın Özel Günleri:
            </h3>
            <div className="space-y-2">
              {monthData
                .filter(d => d.isHoliday || d.religiousDays)
                .map((day, idx) => (
                  <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-600 dark:border-yellow-500">
                    <div className="font-black text-gray-900 dark:text-white">
                      {day.dayNumber} {day.monthName} - {day.dayName}
                    </div>
                    {day.holidayName && (
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        ⭐ {day.holidayName}
                      </div>
                    )}
                    {day.religiousDays && day.religiousDays.map((rd, i) => (
                      <div key={i} className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        🌙 {rd.name}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Ay Navigasyonu */}
      <div className="mt-10 flex flex-wrap gap-4 justify-between items-center">
        <Link
          href={`/${params.il}/takvim/${prevYear}/${String(prevMonth).padStart(2, '0')}`}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600 hover:from-gray-800 hover:to-gray-600 text-white rounded-xl font-black transition-all hover:scale-105 hover:shadow-xl border-2 border-black dark:border-gray-300"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Önceki Ay</span>
        </Link>
        <Link
          href={`/${params.il}/takvim/${nextYear}/${String(nextMonth).padStart(2, '0')}`}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-xl font-black transition-all hover:scale-105 hover:shadow-xl border-2 border-black dark:border-gray-300"
        >
          <span>Sonraki Ay</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
