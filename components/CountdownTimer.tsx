'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { calculateTimeRemaining, TimeRemaining } from '@/lib/utils';

interface CountdownTimerProps {
  targetTime: string;
  prayerName: string;
  locale: string;
}

export default function CountdownTimer({ targetTime, prayerName, locale }: CountdownTimerProps) {
  const t = useTranslations('time');
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    // İlk hesaplama
    setTimeRemaining(calculateTimeRemaining(targetTime));

    // Her saniye güncelle
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (!timeRemaining) {
    return <div className="text-2xl font-bold">{t('loading', { ns: 'loading' })}</div>;
  }

  if (timeRemaining.totalSeconds <= 0) {
    return (
      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
        🕌 {t('timeEntered')}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-sm text-white/80 dark:text-white/70 mb-2">
          {t('remainingTime', { prayer: prayerName })}
        </div>
        <div className="flex gap-4 items-center justify-center">
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-4 min-w-[80px] shadow-lg">
            <div className="text-4xl font-bold text-primary-700 dark:text-primary-400">
              {String(timeRemaining.hours).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('hours')}</div>
          </div>
          <div className="text-3xl font-bold text-white/60">:</div>
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-4 min-w-[80px] shadow-lg">
            <div className="text-4xl font-bold text-primary-700 dark:text-primary-400">
              {String(timeRemaining.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('minutes')}</div>
          </div>
          <div className="text-3xl font-bold text-white/60">:</div>
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-lg p-4 min-w-[80px] shadow-lg">
            <div className="text-4xl font-bold text-primary-700 dark:text-primary-400">
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('seconds')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
