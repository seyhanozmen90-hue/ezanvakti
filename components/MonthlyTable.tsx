'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PrayerTime } from '@/lib/types';
import { formatHijriDate } from '@/lib/utils';
import { getCalendarDay } from '@/data/calendar-2026-official';

interface MonthlyTableProps {
  times: PrayerTime[];
  locale: string;
}

export default function MonthlyTable({ times, locale }: MonthlyTableProps) {
  const t = useTranslations('calendar');
  const tPrayers = useTranslations('prayers');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mt-8 bg-white dark:bg-gradient-to-br dark:from-navy-dark/60 dark:to-navy-darker/60 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border-2 border-gold-500 dark:border-gold-500/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-gray-100 dark:hover:bg-gold-500/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <span className="text-lg font-bold text-navy-900 dark:text-gold-400">
            {t('monthly')}
          </span>
        </div>
        <svg
          className={`w-6 h-6 transition-transform text-navy-900 dark:text-gold-400 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-100 dark:bg-navy-darkest/70 border-b-2 border-gold-500 dark:border-gold-500/20">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide min-w-[140px] lg:min-w-[200px]">
                  {t('date')}
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('imsak')}
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('gunes')}
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('ogle')}
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('ikindi')}
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('aksam')}
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('yatsi')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gold-500/10" style={{ lineHeight: '1.8' }}>
              {times.map((time, index) => {
                const today = new Date().toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                const isToday = time.date === today;

                // Tarihi YYYY-MM-DD formatına çevir (02.02.2026 -> 2026-02-02)
                const dateParts = time.date.split('.');
                const isoDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : '';
                const calendarData = isoDate ? getCalendarDay(isoDate) : null;

                // Özel günleri topla
                const specialDays: Array<{text: string, type: string}> = [];
                if (calendarData) {
                  // Dini günler
                  if (calendarData.religiousDays && calendarData.religiousDays.length > 0) {
                    calendarData.religiousDays.forEach(rd => {
                      specialDays.push({text: rd.name, type: rd.type});
                    });
                  }
                  // Resmi tatiller
                  if (calendarData.isHoliday && calendarData.holidayName) {
                    specialDays.push({text: calendarData.holidayName, type: 'holiday'});
                  }
                  // Mevsimsel bilgiler
                  if (calendarData.seasonalInfo) {
                    specialDays.push({text: calendarData.seasonalInfo.name, type: calendarData.seasonalInfo.type});
                  }
                }

                // Ramazan orucu gün sayısını belirle
                let ramadanDayInfo = '';
                if (calendarData?.religiousDays?.some(rd => rd.type === 'ramazan' && !rd.name.includes('Bayramı'))) {
                  const ramadanStartDate = new Date('2026-02-19');
                  const currentDate = new Date(isoDate);
                  const diffDays = Math.floor((currentDate.getTime() - ramadanStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  if (diffDays > 0 && diffDays <= 30) {
                    ramadanDayInfo = `${diffDays}. Gün`;
                  }
                }

                return (
                  <tr
                    key={index}
                    className={`${
                      isToday
                        ? 'bg-yellow-50 dark:bg-gold-500/20 border-l-2 border-gold-500 dark:border-gold-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gold-500/5'
                    } transition-colors`}
                  >
                    <td className="px-3 py-2 text-xs text-navy-900 dark:text-gold-300">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isToday && <span className="text-xs">👉</span>}
                        <span className="font-semibold whitespace-nowrap text-xs">{time.date}</span>
                        
                        {/* Özel Günler - Kompakt inline badge'ler */}
                        {specialDays.length > 0 && specialDays.map((dayInfo, i) => {
                          // Tip'e göre emoji seç
                          const emoji = dayInfo.type === 'kandil' ? '🌙' :
                                      dayInfo.type === 'bayram' ? '🎉' :
                                      dayInfo.type === 'holiday' ? '🇹🇷' :
                                      dayInfo.type === 'ramazan' ? '🌙' : '📌';
                          
                          const bgColor = dayInfo.type === 'kandil' ? 'bg-purple-500' :
                                        dayInfo.type === 'bayram' ? 'bg-green-500' :
                                        dayInfo.type === 'holiday' ? 'bg-red-500' :
                                        dayInfo.type === 'ramazan' ? 'bg-blue-500' :
                                        'bg-rose-500';
                          
                          return (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${bgColor} text-white rounded text-[10px] font-bold leading-none`}
                              title={dayInfo.text}
                            >
                              <span className="text-[10px]">{emoji}</span>
                              <span className="truncate max-w-[80px]">{dayInfo.text}</span>
                            </span>
                          );
                        })}

                        {/* Ramazan Oruç Gün Sayısı */}
                        {ramadanDayInfo && (
                          <span 
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-500 text-white rounded text-[10px] font-bold leading-none"
                            title={`Ramazan Orucu ${ramadanDayInfo}`}
                          >
                            <span className="text-[10px]">🌙</span>
                            <span>{ramadanDayInfo}</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Hicri tarih - altında küçük */}
                      {time.hijriDate && (
                        <div className="text-[10px] text-navy-600 dark:text-gold-400/50 mt-0.5">
                          {formatHijriDate(time.hijriDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono">
                      {time.imsak}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono">
                      {time.gunes}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono">
                      {time.ogle}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono">
                      {time.ikindi}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono">
                      {time.aksam}
                    </td>
                    <td className="px-2 py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono">
                      {time.yatsi}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
