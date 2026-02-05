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
  
  // İmsak için özel şeffaf stil
  const isImsak = prayerName === 'imsak';

  return (
    <div
      className={`relative transition-all duration-300 ${
        isNext
          ? 'p-2 sm:p-2.5 rounded-lg border bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-navy-darker/95 dark:to-navy-dark/95 backdrop-blur-md text-navy-900 dark:text-gold-300 shadow-lg scale-105 ring-1 ring-gold-500 dark:ring-gold-500/50 border-gold-500 dark:border-gold-500/70'
          : isPassed
          ? 'p-2 sm:p-2.5 rounded-lg border bg-gray-200 dark:bg-navy-darker/50 border-gold-400/40 dark:border-navy-dark/60 opacity-60'
          : isImsak
          ? 'p-1.5 sm:p-2 rounded-lg border bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700/25 dark:via-slate-600/15 dark:to-slate-700/25 backdrop-blur-lg border-gold-400/60 dark:border-slate-400/50 hover:border-gold-500 dark:hover:border-slate-400/70 hover:bg-gray-300 dark:hover:bg-slate-700/35 hover:shadow-md'
          : 'p-2 sm:p-2.5 rounded-lg border bg-white dark:bg-gradient-to-br dark:from-navy-dark/70 dark:to-navy-darker/70 backdrop-blur-md border-gold-500 dark:border-gold-500/50 hover:border-gold-600 dark:hover:border-gold-500/70 hover:shadow-lg'
      } shadow-md`}
    >
      {isNext && (
        <div className="absolute -top-1.5 right-2 bg-yellow-500 dark:bg-gold-500 text-navy-darkest px-2 py-0.5 rounded-full text-[8px] font-bold shadow-md animate-pulse border border-gold-400 dark:border-gold-400">
          {tTime('approaching')}
        </div>
      )}
      
      {isPassed && !isNext && (
        <div className="absolute -top-1.5 right-2 bg-gray-300 dark:bg-navy-darkest text-navy-900 dark:text-gold-400/60 px-2 py-0.5 rounded-full text-[8px] font-bold shadow-md border border-gold-400/50 dark:border-gold-500/30">
          {tTime('passed')}
        </div>
      )}

      <div className={`flex flex-col items-center ${isImsak ? 'gap-0.5' : 'gap-1'}`}>
        <div className={`font-semibold tracking-wide uppercase ${
          isNext ? 'text-[9px] sm:text-[10px] text-navy-900 dark:text-gold-400' : isImsak ? 'text-[7px] sm:text-[8px] text-navy-900 dark:text-slate-300' : 'text-[9px] sm:text-[10px] text-navy-900 dark:text-gold-400/80'
        }`}>
          {displayName}
        </div>
        <div className={`font-bold tracking-tight ${
          isNext ? 'text-base sm:text-lg text-navy-900 dark:text-gold-400 drop-shadow-md' : isImsak ? 'text-xs sm:text-sm text-navy-900 dark:text-slate-200' : 'text-base sm:text-lg text-navy-900 dark:text-gold-500'
        }`}>
          {time}
        </div>
      </div>
    </div>
  );
}
