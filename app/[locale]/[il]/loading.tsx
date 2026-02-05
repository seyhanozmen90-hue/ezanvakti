export default function CityLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Yükleniyor...
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Lütfen bekleyin
        </p>
      </div>
    </div>
  );
}
