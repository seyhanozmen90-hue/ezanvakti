'use client';

import { useTranslations } from 'next-intl';
import CountdownTimer from './CountdownTimer';

interface IftarCardProps {
  iftarTime: string;
  cityName: string;
  locale: string;
}

export default function IftarCard({ iftarTime, cityName, locale }: IftarCardProps) {
  const t = useTranslations('iftar');
  
  return (
    <div className="mb-5 bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-purple-800/30 backdrop-blur-md rounded-xl shadow-xl p-4 sm:p-5 border-2 border-purple-500 dark:border-purple-500/50 relative overflow-hidden">
      {/* Dekoratif ay yıldız icon */}
      <div className="absolute top-2 right-2 text-4xl opacity-20 dark:opacity-10">
        🌙
      </div>
      
      <div className="text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🌙</span>
          <h2 className="text-base sm:text-lg font-bold text-purple-900 dark:text-purple-200">
            {t('title', { city: cityName })}
          </h2>
        </div>
        
        <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mb-3">
          {t('subtitle')}
        </p>
        
        <div className="text-2xl sm:text-3xl font-bold mb-1 text-purple-900 dark:text-purple-100">
          {t('iftarTime')}
        </div>
        
        <div className="text-xl sm:text-2xl font-mono font-bold bg-white dark:bg-purple-950/40 py-2 px-4 rounded-lg inline-block border-2 border-purple-500 dark:border-purple-400/30 text-purple-900 dark:text-purple-200 mb-4">
          {iftarTime}
        </div>
        
        {/* Geri sayım sayacı */}
        <div className="mt-4">
          <CountdownTimer 
            targetTime={iftarTime} 
            prayerName={t('iftarTime')}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
