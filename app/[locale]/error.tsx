'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.general');
  const tStatus = useTranslations('status');

  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
          {t('title')}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('description')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('descriptionDetailed')}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            {tStatus('retry')}
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            {useTranslations('nav')('home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
