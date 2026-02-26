import Link from 'next/link';
import { notFound } from 'next/navigation';
import CalendarLeaf from '@/components/CalendarLeaf';
import { getCalendarDay } from '@/data/calendar-2026-official';
import { getCityBySlug } from '@/lib/cities-helper';
import { hasCoordsExist } from '@/lib/geo/tr';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { getDayDuration, getNightDuration, getDayChangeMinutes } from '@/lib/calendar';

interface PageProps {
  params: { locale: string; il: string };
}

export default async function TakvimPage({ params }: PageProps) {
  const city = getCityBySlug(params.il);
  if (!city) notFound();

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  const dayData = getCalendarDay(todayString);

  let times: { imsak: string; gunes: string; ogle: string; ikindi: string; aksam: string; yatsi: string } | undefined;
  let dayDuration: { hours: number; minutes: number } | undefined;
  let nightDuration: { hours: number; minutes: number } | undefined;
  let dayChangeMinutes: number | undefined;

  if (hasCoordsExist(city.slug)) {
    try {
      const [todayResult, yesterdayResult] = await Promise.all([
        getPrayerTimes({ city_slug: city.slug, date: todayString, skipCache: true }),
        getPrayerTimes({ city_slug: city.slug, date: yesterdayString }),
      ]);
      const t = todayResult.timings;
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
      dayChangeMinutes = getDayChangeMinutes(t.sunrise, yesterdayResult.timings.sunrise);
    } catch (_) {
      // API hatasında CalendarLeaf varsayılan değerleri kullanır
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-4">
          <span className="text-5xl">📅</span>
          Duvar Takvimi - {city.name}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          365 günlük detaylı namaz vakitleri takvimi
        </p>
        <a 
          href="#ay-secimi"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-2xl font-black text-lg transition-all hover:scale-105 hover:shadow-2xl border-2 border-yellow-800 shadow-lg"
        >
          <span className="text-2xl">🗓️</span>
          <span>Ay Seç & Takvimi Gör</span>
          <span className="text-xl group-hover:translate-y-1 transition-transform">↓</span>
        </a>
      </div>

      {/* Bugünün Takvim Yaprağı - şehre göre dinamik vakitler */}
      <div className="mb-12">
        <CalendarLeaf
          date={today}
          cityLabel={city.name}
          calendarData={dayData}
          times={times}
          dayDuration={dayDuration}
          nightDuration={nightDuration}
          dayChangeMinutes={dayChangeMinutes}
        />
      </div>

      {/* Ek Bilgiler - Detaylı Takvim Bilgileri */}
      {dayData && (
        <div className="mb-12 space-y-6">
          {/* Tarihte Bugün */}
          {dayData.historyToday && dayData.historyToday.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-2 border-black dark:border-gray-300">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📜</span>
                Tarihte Bugün
              </h3>
              <div className="space-y-3">
                {dayData.historyToday.map((history, idx) => (
                  <div key={idx} className="border-l-4 border-black dark:border-gray-300 pl-4">
                    <div className="font-black text-gray-900 dark:text-white mb-1">
                      {history.title} {history.year && `(${history.year})`}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {history.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dini Günler - Detay */}
          {dayData.religiousDays && dayData.religiousDays.length > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 shadow-md border-2 border-yellow-600 dark:border-yellow-500">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                Dini Günler ve Özel Geceler
              </h3>
              {dayData.religiousDays.map((religious, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <div className="font-black text-lg text-gray-900 dark:text-white mb-2">
                    {religious.name}
                  </div>
                  {religious.description && (
                    <p className="text-gray-700 dark:text-gray-300">
                      {religious.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mevsimsel Bilgiler */}
          {dayData.seasonalInfo && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 shadow-md border-2 border-green-600 dark:border-green-500">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                {dayData.seasonalInfo.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {dayData.seasonalInfo.description}
              </p>
            </div>
          )}

          {/* Özel Notlar */}
          {dayData.specialNotes && dayData.specialNotes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-2 border-black dark:border-gray-300">
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">📌</span>
                Önemli Notlar
              </h3>
              <ul className="space-y-2">
                {dayData.specialNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-black mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Hızlı Erişim - Aylar */}
      <div id="ay-secimi" className="mt-12 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl border-[3px] border-black dark:border-gray-300 scroll-mt-8">
        <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 text-center tracking-wide flex items-center justify-center gap-3">
          <span className="text-5xl">🗓️</span>
          2026 Takvimi - Ay Seçin
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Görmek istediğiniz ayı seçerek detaylı takvime ulaşın
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((month) => {
            const monthNamesLocal = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            const monthEmojis = ['❄️', '❄️', '🌸', '🌸', '🌺', '☀️', '☀️', '☀️', '🍂', '🍂', '🍁', '❄️'];
            const monthHighlights = [
              'Yılbaşı 🎊',
              'Berat Kandili 🌙',
              'Ramazan 🕌',
              '23 Nisan 🎈',
              'Kurban Bayramı 🕋',
              'Aşure 🥘',
              '15 Temmuz 🇹🇷',
              'Mevlid Kandili 🌙',
              'Eylül ☕',
              '29 Ekim 🇹🇷',
              'Kasım 🍂',
              'Regaib Kandili 🌙'
            ];
            return (
              <Link
                key={month}
                href={`/${params.il}/takvim/2026/${month}`}
                className="group bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-700 dark:via-gray-750 dark:to-gray-800 hover:from-yellow-50 hover:via-yellow-100 hover:to-yellow-50 dark:hover:from-gray-600 dark:hover:to-gray-700 rounded-2xl p-6 text-center transition-all hover:scale-110 border-[3px] border-black dark:border-gray-300 shadow-lg hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full font-black opacity-0 group-hover:opacity-100 transition-opacity">
                  Gör
                </div>
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {monthEmojis[parseInt(month) - 1]}
                </div>
                <div className="font-black text-2xl text-gray-900 dark:text-white mb-2">
                  {monthNamesLocal[parseInt(month) - 1]}
                </div>
                <div className="text-sm font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                  {monthHighlights[parseInt(month) - 1]}
                </div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  2026
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Özellikler */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-2 border-black dark:border-gray-300">
          <div className="text-4xl mb-3 text-center">🕌</div>
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2 text-center">
            6 Vakit
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-2 border-black dark:border-gray-300">
          <div className="text-4xl mb-3 text-center">🌙</div>
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2 text-center">
            Hicri Tarih
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Her gün için Hicri karşılığı
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border-2 border-black dark:border-gray-300">
          <div className="text-4xl mb-3 text-center">⭐</div>
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-2 text-center">
            Özel Günler
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Dini ve milli bayramlar
          </p>
        </div>
      </div>
    </div>
  );
}
