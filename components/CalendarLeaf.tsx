'use client';

import { formatHijri, getRumiDate } from '@/lib/calendar';
import { CalendarDay } from '@/lib/calendar-types';
import { getCalendarDay } from '@/data/calendar-2026-official';
import { getDefaultCity } from '@/lib/cities-helper';

interface CalendarLeafProps {
  date: Date;
  cityLabel?: string;
  times?: {
    imsak: string;
    gunes: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
  };
  calendarData?: CalendarDay;
  /** Günün devamı (güneş → akşam) */
  dayDuration?: { hours: number; minutes: number };
  /** Gecenin devamı (akşam → imsak) */
  nightDuration?: { hours: number; minutes: number };
  /** Günün kısalması/uzaması (dakika). Pozitif = kısalıyor */
  dayChangeMinutes?: number;
}

const defaultTimes = {
  imsak: '05:45',
  gunes: '07:15',
  ogle: '12:45',
  ikindi: '15:30',
  aksam: '18:00',
  yatsi: '19:30',
};

export default function CalendarLeaf({
  date,
  cityLabel,
  times,
  calendarData,
  dayDuration,
  nightDuration,
  dayChangeMinutes,
}: CalendarLeafProps) {
  const defaultCity = getDefaultCity();
  const displayCityLabel = cityLabel || defaultCity.name;
  const dateString = date.toISOString().split('T')[0];
  const dayData = calendarData || getCalendarDay(dateString);
  const hijriDate = dayData?.hijriDate || formatHijri(date);

  const day = date.getDate();
  const months = [
    'OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN',
    'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK',
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
  const dayName = dayNames[date.getDay()];

  const prayerTimes = times || defaultTimes;
  const hijriParts = hijriDate?.split(' ') || [];
  const hijriDay = hijriParts[0] || '';
  const hijriMonth = hijriParts[1] || '';
  const hijriYear = hijriParts[2] || '';
  const rumi = getRumiDate(date);
  const monthNumber = date.getMonth() + 1;
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);

  const dayChangeText =
    dayChangeMinutes != null
      ? `${Math.abs(dayChangeMinutes)} dakika ${dayChangeMinutes > 0 ? 'kısalıyor' : 'uzuyor'}`
      : '2 dakika';

  return (
    <div className="relative w-full max-w-[100vw] mx-auto overflow-x-hidden print:max-w-full box-border px-3 sm:px-4">
      <div className="absolute inset-0 bg-gray-300 dark:bg-gray-900 transform rotate-0.5 scale-[0.99] opacity-30 print:hidden pointer-events-none" />
      <div className="relative bg-white dark:bg-gray-900 shadow-2xl border-[3px] border-black dark:border-gray-300 w-full max-w-2xl mx-auto print:max-w-full print:shadow-none print:border-2 box-border">
        {/* Yıldız bordür */}
        <div className="border-b-[2px] border-black dark:border-gray-300 py-0.5 overflow-hidden">
          <div className="flex justify-center text-[9px] leading-none">
            <span className="tracking-[0.3px] text-black dark:text-gray-300">★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★</span>
          </div>
        </div>

        {/* Üst bilgi: Hicri / Günün kısalması / Rumi - grid, taşma yok */}
        <div className="grid grid-cols-3 gap-2 px-3 py-2.5 text-[11px] border-b-[2px] border-black dark:border-gray-300 w-full box-border">
          <div className="text-left leading-[1.1] min-w-0">
            <div className="font-black text-black dark:text-white">{hijriYear} Hicri</div>
            <div className="font-black uppercase text-[10px] sm:text-[14px] text-black dark:text-white truncate">{hijriMonth}</div>
            <div className="font-black text-[14px] sm:text-[17px] text-black dark:text-white">{hijriDay}</div>
          </div>
          <div className="text-center leading-[1.2] min-w-0">
            <div className="font-black text-[10px] text-black dark:text-white">Günün</div>
            <div className="font-black text-[10px] text-black dark:text-white">kısalması</div>
            <div className="font-black text-[11px] text-black dark:text-white">{dayChangeText}</div>
          </div>
          <div className="text-right leading-[1.1] min-w-0">
            <div className="font-black text-black dark:text-white">{rumi.yil} Rumi</div>
            <div className="font-black uppercase text-[10px] sm:text-[14px] text-black dark:text-white truncate">{rumi.ay}</div>
            <div className="font-black text-[14px] sm:text-[17px] text-black dark:text-white">{day}</div>
          </div>
        </div>

        {/* Yıl, Ay, Gün, Kasım */}
        <div className="text-center py-1.5 border-b-[2px] border-black dark:border-gray-300">
          <div className="text-[10px] sm:text-[12px] leading-tight text-black dark:text-white">
            <span className="font-black">Yıl: {year},</span> <span className="font-black">Ay: {monthNumber},</span> <span className="font-black">Gün: {dayOfYear},</span> <span className="font-black">Kasım: {Math.floor(dayOfYear / 7) + 1}</span>
          </div>
        </div>

        {/* Ana içerik: Sol saat, sağda şehir adı + namaz vakitleri tablosu */}
        <div className="py-3 px-3 sm:px-4">
          <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6">
            {/* Sol: Sadece analog saat (şehir adı burada değil) */}
            <div className="flex flex-col items-center flex-shrink-0 order-1">
              <div
                className="rounded-full border-[3px] border-black dark:border-white bg-white dark:bg-gray-900 relative flex-shrink-0"
                style={{ width: 'clamp(80px, 28vw, 140px)', height: 'clamp(80px, 28vw, 140px)' }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black dark:text-white" />
                  <text x="50" y="16" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">12</text>
                  <text x="84" y="54" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">3</text>
                  <text x="50" y="92" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">6</text>
                  <text x="16" y="54" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">9</text>
                  <line x1="50" y1="50" x2="50" y2="18" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white" />
                  <line x1="50" y1="50" x2="72" y2="32" stroke="currentColor" strokeWidth="3" className="text-black dark:text-white" />
                  <circle cx="50" cy="50" r="3" className="fill-black dark:fill-white" />
                </svg>
              </div>
            </div>

            {/* Sağ: İl adı (üstte) + Namaz vakitleri tablosu */}
            <div className="flex flex-col items-end flex-shrink-0 order-2 min-w-0 ml-auto sm:ml-0">
              <div className="text-[11px] sm:text-[13px] font-black text-black dark:text-white mb-1.5 text-right w-full sm:min-w-[160px]">
                {displayCityLabel}
              </div>
              <div className="border-[3px] border-black dark:border-white bg-white dark:bg-gray-900 flex-shrink-0 w-full sm:w-auto sm:min-w-[160px]">
                <table className="w-full text-[11px] sm:text-[13px]">
                  <tbody>
                    {[
                      { label: 'Güneş', time: prayerTimes.gunes },
                      { label: 'Öğle', time: prayerTimes.ogle },
                      { label: 'İkindi', time: prayerTimes.ikindi },
                      { label: 'Akşam', time: prayerTimes.aksam },
                      { label: 'Yatsı', time: prayerTimes.yatsi },
                      { label: 'İmsak', time: prayerTimes.imsak },
                    ].map(({ label, time }) => (
                      <tr key={label} className="border-b-[2px] border-black dark:border-white last:border-b-0">
                        <td className="py-1 px-2 font-black text-left text-black dark:text-white">{label}</td>
                        <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Günün devamı / Gecenin devamı - dinamik */}
        <div className="text-center py-2 border-t-[2px] border-b-[2px] border-black dark:border-gray-300">
          <div className="text-[10px] sm:text-[11px] leading-tight text-black dark:text-white">
            {dayDuration && nightDuration ? (
              <>
                <span className="font-black">Günün devamı: {dayDuration.hours} S. {dayDuration.minutes} D.</span>
                {' — '}
                <span className="font-black">Gecenin devamı: {nightDuration.hours} S. {nightDuration.minutes} D.</span>
              </>
            ) : (
              <>
                <span className="font-black">Günün devamı: 10 S. 09 D.</span> — <span className="font-black">Gecenin devamı: 13 S. 51 D.</span>
              </>
            )}
          </div>
        </div>

        {/* Gün adı - clamp + truncate */}
        <div className="text-center py-3 sm:py-4 border-b-[3px] border-black dark:border-gray-300 overflow-hidden">
          <h3
            className="font-black leading-none text-black dark:text-white truncate max-w-full inline-block px-1"
            style={{ fontSize: 'clamp(1.25rem, 6vw, 3.75rem)', letterSpacing: '0.05em' }}
            title={dayName}
          >
            {dayName}
          </h3>
        </div>

        {/* Alt bilgi - özel günler */}
        <div className="text-center py-2.5 border-b-[2px] border-black dark:border-gray-300 min-h-[32px]">
          <div className="text-[10px] px-3 sm:px-4 leading-snug text-black dark:text-white">
            {dayData?.religiousDays?.length ? (
              <span className="font-black italic">⭐ {dayData.religiousDays[0].name}</span>
            ) : dayData?.seasonalInfo ? (
              <span className="font-black italic">🌿 {dayData.seasonalInfo.name}</span>
            ) : dayData?.specialNotes?.length ? (
              <span className="font-black italic">{dayData.specialNotes[0]}</span>
            ) : (
              <span className="font-black italic">(Günün bereketine mazhar olunuz)</span>
            )}
          </div>
        </div>

        {/* Şiir / hikmetli söz (tarihte bugün burada değil, en altta) */}
        <div className="text-center py-3 border-b-[2px] border-black dark:border-gray-300 min-h-[90px] flex items-center justify-center">
          <div className="text-[10px] sm:text-[11px] px-4 sm:px-6 leading-snug text-black dark:text-white">
            {dayData?.quote ? (
              <>
                <p className="font-normal italic">{dayData.quote.text}</p>
                <div className="text-[10px] mt-2 font-black uppercase">{dayData.quote.author || dayData.quote.source || ''}</div>
              </>
            ) : (
              <>
                <p className="font-normal italic">Her gün yeni bir fırsattır.<br />Hayatınızı şükürle doldurun.</p>
                <div className="text-[10px] mt-2 font-black">HİKMETLİ SÖZ</div>
              </>
            )}
          </div>
        </div>

        {/* Ay ve gün numarası — en alta */}
        <div className="text-center py-4 border-b-[2px] border-black dark:border-gray-300">
          <h2
            className="font-black tracking-[0.1em] sm:tracking-[0.2em] leading-none text-black dark:text-white mb-1"
            style={{ fontSize: 'clamp(1.25rem, 8vw, 3rem)' }}
          >
            {monthName}
          </h2>
          <div
            className="font-black leading-none text-black dark:text-white"
            style={{ fontSize: 'clamp(3rem, 22vw, 7rem)', letterSpacing: '-0.05em' }}
          >
            {day}
          </div>
        </div>

        {/* Tarihte bugün önemli ne oldu — en alt not */}
        {dayData?.historyToday && dayData.historyToday.length > 0 && (
          <div className="text-center py-3 border-b-[2px] border-black dark:border-gray-300 px-3">
            <div className="text-[10px] font-black uppercase text-black dark:text-white mb-1.5">Tarihte bugün önemli ne oldu</div>
            <div className="text-[10px] sm:text-[11px] leading-snug text-black dark:text-white">
              {dayData.historyToday.map((item, idx) => (
                <div key={idx} className="mb-1.5 last:mb-0">
                  <span className="font-black">{item.title}</span>
                  {item.description && <span className="font-normal"> — {item.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center py-2">
          <h4 className="text-[11px] sm:text-[13px] font-black tracking-wide text-black dark:text-white">Büyük Saatli Maarif Takvimi</h4>
        </div>

        <div className="border-t-[2px] border-black dark:border-gray-300 py-0.5 overflow-hidden">
          <div className="flex justify-center text-[9px] leading-none">
            <span className="tracking-[0.3px] text-black dark:text-gray-300">★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
