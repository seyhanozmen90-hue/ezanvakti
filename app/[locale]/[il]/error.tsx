'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function CityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="text-center px-4 py-12 max-w-2xl">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
          Bir Hata Oluştu
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Üzgünüz, sayfa yüklenirken bir sorun oluştu.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold border-2 border-gray-300 dark:border-gray-600 transition-all hover:scale-105"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
