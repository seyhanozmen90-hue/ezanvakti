'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PrayerTime } from '@/lib/types';
import { formatHijriDate } from '@/lib/utils';

interface MonthlyTableProps {
  times: PrayerTime[];
  locale: string;
}

export default function MonthlyTable({ times, locale }: MonthlyTableProps) {
  const t = useTranslations('calendar');
  const tPrayers = useTranslations('prayers');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('monthly')}
          </span>
        </div>
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {t('date')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {tPrayers('imsak')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {tPrayers('gunes')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {tPrayers('ogle')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {tPrayers('ikindi')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {tPrayers('aksam')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                  {tPrayers('yatsi')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {times.map((time, index) => {
                const today = new Date().toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                const isToday = time.date === today;

                return (
                  <tr
                    key={index}
                    className={`${
                      isToday
                        ? 'bg-accent-50 dark:bg-accent-900/20 font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {isToday && <span className="mr-2">👉</span>}
                      {time.date}
                      {time.hijriDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatHijriDate(time.hijriDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {time.imsak}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {time.gunes}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {time.ogle}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {time.ikindi}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {time.aksam}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
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
