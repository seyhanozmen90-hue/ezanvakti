import Link from 'next/link';
import { notFound } from 'next/navigation';
import CalendarLeaf from '@/components/CalendarLeaf';
import { getCalendarDay } from '@/data/calendar-2026-official';
import { getCityBySlug } from '@/lib/cities-helper';
import { hasCoordsExist } from '@/lib/geo/tr';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { getDayDuration, getNightDuration, getDayChangeMinutes } from '@/lib/calendar';

interface PageProps {
  params: { locale: string; il: string; year: string; month: string; day: string };
}

export default async function DayPage({ params }: PageProps) {
  const city = getCityBySlug(params.il);
  if (!city) notFound();

  const year = parseInt(params.year);
  const month = parseInt(params.month);
  const day = parseInt(params.day);
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const date = new Date(year, month - 1, day);
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const dayData = getCalendarDay(dateString);

  let times: { imsak: string; gunes: string; ogle: string; ikindi: string; aksam: string; yatsi: string } | undefined;
  let dayDuration: { hours: number; minutes: number } | undefined;
  let nightDuration: { hours: number; minutes: number } | undefined;
  let dayChangeMinutes: number | undefined;

  if (hasCoordsExist(city.slug)) {
    try {
      const [dayResult, prevResult] = await Promise.all([
        getPrayerTimes({ city_slug: city.slug, date: dateString, skipCache: dateString === todayStr }),
        getPrayerTimes({ city_slug: city.slug, date: yesterdayString }),
      ]);
      const t = dayResult.timings;
      times = {
        imsak: t.fajr,
        gunes: t.sunrise,
        ogle: t.dhuhr,
        ikindi: t.asr,
        aksam: t.maghrib,
        yatsi: t.isha,
      };
      dayDuration = getDayDuration(t.sunrise, t.maghrib);
      nightDuration = getNightDuration(t.maghrib, t.fajr);
      dayChangeMinutes = getDayChangeMinutes(t.sunrise, prevResult.timings.sunrise);
    } catch (_) {}
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl min-w-0 overflow-x-hidden">
      {/* Navigasyon */}
      <div className="mb-8 flex flex-wrap gap-3 justify-center">
        <Link 
          href={`/${params.il}/takvim`}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-black text-gray-900 dark:text-white border-2 border-black dark:border-gray-300 transition-all hover:scale-105 hover:shadow-lg"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">🏠</span>
          Ana Takvim
        </Link>
        <Link 
          href={`/${params.il}/takvim/${year}/${String(month).padStart(2, '0')}`}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-black text-gray-900 dark:text-white border-2 border-black dark:border-gray-300 transition-all hover:scale-105 hover:shadow-lg"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">📅</span>
          {dayData?.monthName || 'Ay'} Takvimi
        </Link>
      </div>

      {/* Takvim Yaprağı - şehre göre dinamik vakitler */}
      <div className="mb-6">
        <CalendarLeaf
          date={date}
          cityLabel={city.name}
          calendarData={dayData}
          times={times}
          dayDuration={dayDuration}
          nightDuration={nightDuration}
          dayChangeMinutes={dayChangeMinutes}
        />
      </div>

      {/* Yazdır ve Paylaş Butonları */}
      <div className="mb-10 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => window.print()}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-bold text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 transition-all hover:scale-105 hover:shadow-lg"
        >
          <span className="text-xl">🖨️</span>
          Yazdır
        </button>
        <button
          onClick={() => {
            const url = window.location.href;
            const text = `${dayData?.dayName} ${day} ${dayData?.monthName} ${year} Duvar Takvimi - ${city.name}`;
            if (navigator.share) {
              navigator.share({ title: text, url });
            } else {
              navigator.clipboard.writeText(url);
              alert('Link kopyalandı!');
            }
          }}
          className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all hover:scale-105 hover:shadow-lg"
        >
          <span className="text-xl">📤</span>
          Paylaş
        </button>
      </div>

      {/* Detaylı Bilgiler */}
      {dayData && (
        <div className="space-y-6">
          {/* Tarihte Bugün */}
          {dayData.historyToday && dayData.historyToday.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-black dark:border-gray-300">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">📜</span>
                Tarihte Bugün
              </h3>
              <div className="space-y-4">
                {dayData.historyToday.map((history, idx) => (
                  <div key={idx} className="border-l-[6px] border-black dark:border-gray-300 pl-5 py-2">
                    <div className="font-black text-xl text-gray-900 dark:text-white mb-2">
                      {history.title} {history.year && `(${history.year})`}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                      {history.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dini Günler */}
          {dayData.religiousDays && dayData.religiousDays.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-8 shadow-lg border-[3px] border-yellow-700 dark:border-yellow-500">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                Mübarek Gün
              </h3>
              {dayData.religiousDays.map((religious, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="font-black text-2xl text-yellow-900 dark:text-yellow-300 mb-3">
                    {religious.name}
                  </div>
                  {religious.description && (
                    <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                      {religious.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mevsimsel Bilgiler */}
          {dayData.seasonalInfo && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-8 shadow-lg border-[3px] border-green-700 dark:border-green-500">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <span className="text-3xl">🌿</span>
                Mevsimsel Bilgi
              </h3>
              <div className="font-black text-xl text-green-900 dark:text-green-300 mb-3">
                {dayData.seasonalInfo.name}
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                {dayData.seasonalInfo.description}
              </p>
            </div>
          )}

          {/* Günün Sözü - Detaylı */}
          {dayData.quote && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-8 shadow-lg border-l-[6px] border-amber-600 dark:border-amber-500">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-3">
                <span className="text-3xl">💭</span>
                Günün Sözü
              </h3>
              <blockquote className="text-xl italic text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                &ldquo;{dayData.quote.text}&rdquo;
              </blockquote>
              {(dayData.quote.author || dayData.quote.source) && (
                <div className="text-right font-black text-amber-900 dark:text-amber-300">
                  — {dayData.quote.author || dayData.quote.source}
                </div>
              )}
            </div>
          )}

          {/* Önemli Notlar - Tek Satır Bilgi Düzeni */}
          {dayData.specialNotes && dayData.specialNotes.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 shadow-md border border-gray-300 dark:border-gray-600">
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center justify-center text-sm">
                {dayData.specialNotes.map((note, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                    <span className="text-base">•</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gün Navigasyonu */}
      <div className="mt-10 flex flex-wrap gap-4 justify-between items-center">
        <Link
          href={`/${params.il}/takvim/${year}/${String(month).padStart(2, '0')}/${String(day - 1).padStart(2, '0')}`}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-700 dark:to-gray-600 hover:from-gray-800 hover:to-gray-600 text-white rounded-xl font-black transition-all hover:scale-105 hover:shadow-xl border-2 border-black dark:border-gray-300"
        >
          <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Önceki Gün</span>
        </Link>
        <Link
          href={`/${params.il}/takvim/${year}/${String(month).padStart(2, '0')}/${String(day + 1).padStart(2, '0')}`}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-xl font-black transition-all hover:scale-105 hover:shadow-xl border-2 border-black dark:border-gray-300"
        >
          <span>Sonraki Gün</span>
          <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
