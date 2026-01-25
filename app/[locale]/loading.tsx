import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('status');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {t('loading')}
        </p>
      </div>
    </div>
  );
}
