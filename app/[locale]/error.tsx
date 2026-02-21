'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const isDev = typeof window !== 'undefined' && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  const title = 'Hata';
  const description = 'Bir şeyler yanlış gitti.';
  const descriptionDetailed = 'Sayfa yüklenirken bir hata oluştu.';
  const retryLabel = 'Tekrar Dene';
  const homeLabel = 'Ana Sayfa';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">
          {title}
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {description}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {descriptionDetailed}
        </p>

        {/* Localhost / development: gerçek hata mesajını sayfada göster */}
        {isDev && error && (
          <div className="mb-8 text-left bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 overflow-auto">
            <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-2">
              Hata mesajı (konsola bakmadan burada görüyorsunuz):
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 font-mono whitespace-pre-wrap break-words mb-3">
              {error.message}
            </p>
            {error.stack && (
              <>
                <p className="text-xs font-bold text-red-600 dark:text-red-500 mb-1 mt-2">Stack:</p>
                <pre className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap break-words overflow-x-auto max-h-48 overflow-y-auto">
                  {error.stack}
                </pre>
              </>
            )}
            {error.digest && (
              <p className="text-xs text-red-500 dark:text-red-600 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            {retryLabel}
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
