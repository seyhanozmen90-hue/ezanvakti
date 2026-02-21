import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Leaflet/window kullandığı için sadece client'ta yükle (window is not defined hatasını önler)
const QiblaCompass = dynamic(() => import('@/components/QiblaCompass'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
      Pusula yükleniyor…
    </div>
  ),
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kıble Yönü | Kıble Pusulası - Ezan Vakitleri',
    description: 'Bulunduğunuz konumdan Kabe\'ye yönü bulmak için dijital kıble pusulası.',
    keywords: 'kıble yönü, kıble pusulası, kabe yönü, namaz kılma yönü',
    openGraph: {
      title: 'Kıble Yönü | Kıble Pusulası',
      description: 'Dijital kıble pusulası ile Kabe yönünü bulun',
      type: 'website',
    },
  };
}

export default function KiblePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-4">
          <span className="text-5xl">🧭</span>
          <span>KIBLE YÖNÜ</span>
          <span className="text-5xl">🕋</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Canlı pusula ile Kabe yönünü bulun
        </p>
      </div>

      {/* Önemli Bilgi Bandı */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-4 shadow-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">ℹ️</span>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-1">
              Konum İzni Gereklidir
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Kıble yönünü doğru hesaplayabilmek için tarayıcınızın konum erişimine izin vermeniz gerekmektedir. 
              Konum bilginiz hiçbir şekilde kaydedilmez veya paylaşılmaz.
            </p>
          </div>
        </div>
      </div>

      {/* Canlı Pusula */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
        <QiblaCompass />
      </div>

      {/* Bilgi Kartları */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 shadow-md border border-green-200 dark:border-green-800">
          <div className="text-4xl mb-3">🕋</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Kabe Koordinatları
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Enlem:</span> 21.4225° K<br />
            <span className="font-semibold">Boylam:</span> 39.8262° D<br />
            <span className="text-xs mt-2 block">Mekke, Suudi Arabistan</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 shadow-md border border-blue-200 dark:border-blue-800">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Nasıl Kullanılır?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            1. &quot;Konumu Aktif Et&quot; butonuna tıklayın<br />
            2. Konum iznini verin<br />
            3. Cihazınızı düz tutun<br />
            4. 🕋 işaretine doğru dönün
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 shadow-md border border-purple-200 dark:border-purple-800">
          <div className="text-4xl mb-3">🧭</div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Pusula Özellikleri
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ✅ Canlı yön göstergesi<br />
            ✅ Otomatik hesaplama<br />
            ✅ Konum bazlı doğruluk<br />
            ✅ Mobil cihaz desteği
          </p>
        </div>
      </div>

      {/* Önemli Notlar */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Doğruluk Notu */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-2">⚠️ Doğruluk İçin:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cihazınızı metal yüzeylerden uzak tutun</li>
                <li>Elektronik cihazlardan uzaklaşın</li>
                <li>Açık alanda ölçüm yapın</li>
                <li>Pusulanın kalibrasyonunu yapın</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teknik Bilgi */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-semibold mb-2">ℹ️ Teknik Detaylar:</p>
              <p className="mb-2">
                Bu pusula, cihazınızın GPS&apos;i ile konumunuzu ve manyetik sensörü ile yönünüzü tespit ederek Kıble yönünü hesaplar.
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">Hesaplama Yöntemi:</span> Büyük daire formülü (Great Circle)<br />
                <span className="font-semibold">Hassasiyet:</span> ±5° (cihaz sensörüne bağlı)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
