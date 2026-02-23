'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { calculateTimeRemaining, TimeRemaining } from '@/lib/utils';
import { iftarBildirimi } from '@/lib/iftar-bildirim';

interface CountdownTimerProps {
  targetTime: string;
  prayerName: string;
  locale: string;
  /** Akşam vakti geri sayımı bittiğinde Ramazan iftar bildirimi için */
  cityName?: string;
  aksamTime?: string;
  prayerKey?: string;
}

export default function CountdownTimer({
  targetTime,
  prayerName,
  locale,
  cityName,
  aksamTime,
  prayerKey,
}: CountdownTimerProps) {
  const t = useTranslations('time');
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const iftarFiredRef = useRef(false);

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining(targetTime));
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  // Ramazan: akşam vakti sıfıra ulaştığında bir kez iftar bildirimi
  useEffect(() => {
    if (
      timeRemaining?.totalSeconds === 0 &&
      prayerKey === 'aksam' &&
      cityName &&
      aksamTime &&
      !iftarFiredRef.current
    ) {
      iftarFiredRef.current = true;
      iftarBildirimi(cityName, aksamTime);
    }
  }, [timeRemaining?.totalSeconds, prayerKey, cityName, aksamTime]);

  if (!timeRemaining) {
    return <div className="text-2xl font-bold">{t('loading', { ns: 'loading' })}</div>;
  }

  if (timeRemaining.totalSeconds <= 0) {
    return (
      <div className="text-2xl font-bold text-navy-900 dark:text-green-400 animate-pulse">
        🕌 {t('timeEntered')}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-5">
      <div className="text-center">
        <div className="text-sm sm:text-base font-semibold text-navy-900 dark:text-gold-400/90 mb-3 sm:mb-4">
          {t('remainingTime', { prayer: prayerName })}
        </div>
        <div className="flex gap-2 sm:gap-3 md:gap-4 items-center justify-center">
          <div className="flex flex-col items-center bg-navy-100 dark:bg-navy-darkest/60 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[85px] shadow-xl border-2 border-gold-500 dark:border-gold-500/20">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 dark:text-gold-400">
              {String(timeRemaining.hours).padStart(2, '0')}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-navy-900 dark:text-gold-400/80 mt-1 sm:mt-1.5 uppercase tracking-wide">{t('hours')}</div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold-600 dark:text-gold-400/60">:</div>
          <div className="flex flex-col items-center bg-navy-100 dark:bg-navy-darkest/60 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[85px] shadow-xl border-2 border-gold-500 dark:border-gold-500/20">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 dark:text-gold-400">
              {String(timeRemaining.minutes).padStart(2, '0')}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-navy-900 dark:text-gold-400/80 mt-1 sm:mt-1.5 uppercase tracking-wide">{t('minutes')}</div>
          </div>
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gold-600 dark:text-gold-400/60">:</div>
          <div className="flex flex-col items-center bg-navy-100 dark:bg-navy-darkest/60 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-5 min-w-[60px] sm:min-w-[70px] md:min-w-[85px] shadow-xl border-2 border-gold-500 dark:border-gold-500/20">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy-900 dark:text-gold-400">
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-navy-900 dark:text-gold-400/80 mt-1 sm:mt-1.5 uppercase tracking-wide">{t('seconds')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
