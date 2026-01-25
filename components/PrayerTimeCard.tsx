'use client';

import { useTranslations } from 'next-intl';
import { PrayerName } from '@/lib/types';
import { getPrayerDisplayName, isPrayerTimePassed } from '@/lib/utils';

interface PrayerTimeCardProps {
  prayerName: PrayerName;
  time: string;
  isNext?: boolean;
  locale: string;
}

export default function PrayerTimeCard({ prayerName, time, isNext, locale }: PrayerTimeCardProps) {
  const t = useTranslations('prayers');
  const tTime = useTranslations('time');
  
  // Vakit ismini i18n'den al
  const displayName = t(prayerName);
  const isPassed = isPrayerTimePassed(time);

  return (
    <div
      className={`relative p-6 rounded-xl transition-all duration-300 ${
        isNext
          ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-2xl scale-105 ring-4 ring-accent-400/50'
          : isPassed
          ? 'bg-gray-100 dark:bg-gray-800 opacity-60'
          : 'bg-white dark:bg-gray-800 hover:shadow-lg'
      } shadow-md`}
    >
      {isNext && (
        <div className="absolute -top-3 right-4 bg-white dark:bg-gray-900 text-accent-600 dark:text-accent-400 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
          {tTime('approaching')}
        </div>
      )}
      
      {isPassed && !isNext && (
        <div className="absolute -top-3 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          {tTime('passed')}
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className={`text-sm font-medium ${isNext ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
          {displayName}
        </div>
        <div className={`text-3xl font-bold ${isNext ? 'text-white' : 'text-primary-700 dark:text-primary-400'}`}>
          {time}
        </div>
      </div>
    </div>
  );
}
