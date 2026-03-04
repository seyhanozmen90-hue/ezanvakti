'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PrayerTime, PrayerName } from '@/lib/types';
import { getNextPrayerTime, getNowInTurkey } from '@/lib/utils';
import CountdownTimer from '@/components/CountdownTimer';
import PrayerTimeCard from '@/components/PrayerTimeCard';

const PRAYER_ORDER: PrayerName[] = ['imsak', 'gunes', 'ogle', 'ikindi', 'aksam', 'yatsi'];

function timeToMinutes(time: string): number {
  const [h, m] = time.trim().split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

interface NextPrayerAndCardsProps {
  todayTimes: PrayerTime;
  cityLabel: string;
  locale: string;
  /** İl sayfasında iftar bildirimi için; ilçe sayfasında boş bırakılabilir */
  cityName?: string;
  aksamTime?: string;
  /** İlçe sayfasında CountdownTimer'a ekstra prop verilmez */
  withIftarNotification?: boolean;
}

export default function NextPrayerAndCards({
  todayTimes,
  cityLabel,
  locale,
  cityName,
  aksamTime,
  withIftarNotification = true,
}: NextPrayerAndCardsProps) {
  const tPrayer = useTranslations('prayer');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const nextPrayer = getNextPrayerTime(todayTimes);
  const nowTurkey = getNowInTurkey();

  return (
    <>
      {/* Bir sonraki vakit + geri sayım — her saniye Türkiye saatine göre güncellenir */}
      {nextPrayer && (
        <div className="mb-5 bg-white dark:bg-gradient-to-br dark:from-navy-dark/90 dark:to-navy-darker/90 backdrop-blur-md rounded-xl shadow-lg dark:shadow-xl p-4 sm:p-5 text-navy-900 dark:text-gold-300 border border-gold-500 dark:border-gold-500/30">
          <div className="text-center mb-2.5">
            <h2 className="text-xs sm:text-sm font-bold mb-1 flex items-center justify-center gap-1.5 text-navy-900 dark:text-gold-300">
              <span className="text-base sm:text-lg">🕌</span>
              <span>{tPrayer('nextPrayerWithCity', { city: cityLabel })}</span>
            </h2>
            <div className="text-lg sm:text-xl font-bold mb-1 drop-shadow-lg text-navy-900 dark:text-gold-400">
              {nextPrayer.displayName}
            </div>
            <div className="text-base sm:text-lg font-mono font-bold bg-navy-100 dark:bg-navy-darkest/40 py-1 px-2.5 rounded-lg inline-block border border-gold-500 dark:border-gold-500/20 text-navy-900 dark:text-gold-400">
              {nextPrayer.time}
            </div>
          </div>
          <CountdownTimer
            targetTime={nextPrayer.time}
            prayerName={nextPrayer.displayName}
            locale={locale}
            cityName={withIftarNotification ? cityName : undefined}
            aksamTime={withIftarNotification ? aksamTime : undefined}
            prayerKey={nextPrayer.name}
          />
        </div>
      )}

      {/* Bugünün vakitleri — Geçti / Yaklaşıyor Türkiye saatine göre */}
      <div className="mb-8 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-navy-900 dark:bg-gradient-to-r dark:from-gold-400 dark:to-gold-600 dark:bg-clip-text dark:text-transparent mb-4 sm:mb-3 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">📅</span>
          <span className="text-navy-900 dark:text-transparent">{tPrayer('todaysPrayersWithCity', { city: cityLabel })}</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-4">
          {PRAYER_ORDER.map((prayerName) => {
            const time = todayTimes[prayerName];
            const prayerMinutes = timeToMinutes(time);
            const isPassed = prayerMinutes < nowTurkey.minutesOfDay;
            const isNext = nextPrayer?.name === prayerName;
            return (
              <PrayerTimeCard
                key={prayerName}
                prayerName={prayerName}
                time={time}
                isNext={isNext}
                isPassed={isPassed}
                locale={locale}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
