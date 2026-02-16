'use client';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="max-w-md">
        {/* Icon */}
        <div className="text-8xl mb-6 animate-pulse">🕌</div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold mb-4 text-navy-900 dark:text-gold-400">
          İnternet Bağlantısı Yok
        </h1>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
          Bağlantı kesildi. Daha önce görüntülediğiniz namaz vakitleri 
          tarayıcınızın cache&apos;inde saklanmıştır.
        </p>
        
        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-5 mb-6">
          <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">
            💡 <strong>Bilgi:</strong> İnternet bağlantısı kurulduğunda 
            sayfa otomatik olarak güncellenecektir.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            🔄 Tekrar Dene
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 dark:bg-navy-dark hover:bg-gray-300 dark:hover:bg-navy-darker text-navy-900 dark:text-gold-400 px-6 py-3 rounded-xl font-semibold transition-all"
          >
            ← Geri Dön
          </button>
        </div>
        
        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-8">
          Offline modu Progressive Web App (PWA) teknolojisi sayesinde çalışmaktadır.
        </p>
      </div>
    </div>
  );
}
