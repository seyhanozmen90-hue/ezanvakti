'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PrayerTime } from '@/lib/types';
import { formatHijriDate } from '@/lib/utils';
import { getCalendarDay } from '@/data/calendar-2026-official';

interface MonthlyTableProps {
  times: PrayerTime[];
  locale: string;
  cityName?: string;
}

export default function MonthlyTable({ times, locale, cityName }: MonthlyTableProps) {
  const t = useTranslations('calendar');
  const tPrayers = useTranslations('prayers');
  // Monthly table open by default
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full bg-white dark:bg-gradient-to-br dark:from-navy-dark/60 dark:to-navy-darker/60 backdrop-blur-sm rounded-xl shadow-lg dark:shadow-xl overflow-hidden border border-gold-500 dark:border-gold-500/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 sm:py-2.5 flex justify-between items-center text-left hover:bg-gray-100 dark:hover:bg-gold-500/10 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">📅</span>
          <span className="text-base font-bold text-navy-900 dark:text-gold-400">
            {cityName ? t('monthlyWithCity', { city: cityName }) : t('monthly')}
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
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full border-collapse min-w-[600px] sm:min-w-0" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '24%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
              <col style={{ width: '12.5%' }} />
            </colgroup>
            <thead className="bg-navy-100 dark:bg-navy-darkest/70 border-b-2 border-gold-500 dark:border-gold-500/20">
              <tr>
                <th className="px-2 sm:px-2 py-2.5 sm:py-2 text-left text-[10px] sm:text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {t('date')}
                </th>
                <th className="px-2 sm:px-1 py-2.5 sm:py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('imsak')}
                </th>
                <th className="px-2 sm:px-1 py-2.5 sm:py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('gunes')}
                </th>
                <th className="px-2 sm:px-1 py-2.5 sm:py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('ogle')}
                </th>
                <th className="px-2 sm:px-1 py-2.5 sm:py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('ikindi')}
                </th>
                <th className="px-2 sm:px-1 py-2.5 sm:py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('aksam')}
                </th>
                <th className="px-2 sm:px-1 py-2.5 sm:py-2 text-center text-[10px] font-bold text-navy-900 dark:text-gold-400 uppercase tracking-wide">
                  {tPrayers('yatsi')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gold-500/10" style={{ lineHeight: '1.6' }}>
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
                    <td className="px-2 sm:px-2 py-2.5 sm:py-2 text-xs text-navy-900 dark:text-gold-300 min-w-0 align-top">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isToday && <span className="text-xs">👉</span>}
                          <span className="font-semibold whitespace-nowrap text-xs">{time.date}</span>
                        </div>
                        {/* Özel Günler - mobilde alt satırda, taşma yok */}
                        {(specialDays.length > 0 || ramadanDayInfo) && (
                          <div className="flex flex-wrap gap-1">
                            {specialDays.map((dayInfo, i) => {
                              const emoji = dayInfo.type === 'kandil' ? '🌙' :
                                          dayInfo.type === 'bayram' ? '🎉' :
                                          dayInfo.type === 'holiday' ? '🇹🇷' :
                                          dayInfo.type === 'ramazan' ? '🌙' : '📌';
                              const bgColor = dayInfo.type === 'kandil' ? 'bg-purple-500' :
                                            dayInfo.type === 'bayram' ? 'bg-green-500' :
                                            dayInfo.type === 'holiday' ? 'bg-red-500' :
                                            dayInfo.type === 'ramazan' ? 'bg-blue-500' : 'bg-rose-500';
                              return (
                                <span
                                  key={i}
                                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 ${bgColor} text-white rounded text-[10px] font-bold leading-none whitespace-nowrap max-w-full overflow-hidden text-ellipsis`}
                                  title={dayInfo.text}
                                  style={{ maxWidth: '120px' }}
                                >
                                  <span className="text-[10px] shrink-0">{emoji}</span>
                                  <span className="truncate">{dayInfo.text}</span>
                                </span>
                              );
                            })}
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
                        )}
                      </div>
                      {(time.hijriDateLong || time.hijriDate) && (
                        <div className="text-[10px] text-navy-600 dark:text-gold-400/50 mt-1">
                          {time.hijriDateLong || formatHijriDate(time.hijriDate!)}
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-1 py-2.5 sm:py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono whitespace-nowrap">
                      {time.imsak}
                    </td>
                    <td className="px-2 sm:px-1 py-2.5 sm:py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono whitespace-nowrap">
                      {time.gunes}
                    </td>
                    <td className="px-2 sm:px-1 py-2.5 sm:py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono whitespace-nowrap">
                      {time.ogle}
                    </td>
                    <td className="px-2 sm:px-1 py-2.5 sm:py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono whitespace-nowrap">
                      {time.ikindi}
                    </td>
                    <td className="px-2 sm:px-1 py-2.5 sm:py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono whitespace-nowrap">
                      {time.aksam}
                    </td>
                    <td className="px-2 sm:px-1 py-2.5 sm:py-2 text-xs text-center text-navy-900 dark:text-gold-300 font-mono whitespace-nowrap">
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
