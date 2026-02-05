import Link from 'next/link';
import { Home, MapPin } from 'lucide-react';

interface CityComingSoonProps {
  requestedSlug: string;
  locale?: string;
  type?: 'city' | 'district'; // Şehir mi ilçe mi
  cityName?: string; // İlçe için şehir adı
}

export default function CityComingSoon({ 
  requestedSlug, 
  locale = 'tr',
  type = 'city',
  cityName
}: CityComingSoonProps) {
  // Popüler şehirler
  const popularCities = [
    { name: 'İstanbul', slug: 'istanbul' },
    { name: 'Ankara', slug: 'ankara' },
    { name: 'İzmir', slug: 'izmir' },
  ];

  const isDistrict = type === 'district';
  const mainTitle = isDistrict 
    ? 'Bu İlçe Yakında Eklenecek' 
    : 'Bu Şehir Yakında Eklenecek';
  const description = isDistrict
    ? `Namaz vakitleri ve takvim bilgileri ${cityName ? cityName + ' ' : ''}${requestedSlug} için henüz yayında değil.`
    : 'Namaz vakitleri ve takvim bilgileri bu şehir için henüz yayında değil.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 max-w-4xl">
        {/* Ana Kart */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-navy-dark/90 dark:to-navy-darker/90 backdrop-blur-md rounded-2xl shadow-xl dark:shadow-2xl p-8 sm:p-10 md:p-12 border-2 border-gold-500 dark:border-gold-500/30">
          {/* İkon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Başlık */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center text-navy-900 dark:text-white mb-4">
            {mainTitle}
          </h1>

          {/* İstenen Slug Bilgisi */}
          {requestedSlug && (
            <div className="text-center mb-6">
              <p className="text-sm sm:text-base text-navy-700 dark:text-gold-400/60">
                Aradığınız: <span className="font-bold text-navy-900 dark:text-gold-400">/{requestedSlug}</span>
              </p>
            </div>
          )}

          {/* Açıklama */}
          <p className="text-center text-lg sm:text-xl text-navy-700 dark:text-gold-300/80 mb-4">
            {description}
          </p>

          {/* Alt Bilgi */}
          <p className="text-center text-sm sm:text-base text-navy-600 dark:text-gold-400/60 mb-8">
            Veriler kademeli olarak eklenmektedir.
          </p>

          {/* Ayırıcı */}
          <div className="border-t-2 border-gold-500 dark:border-gold-500/30 my-8"></div>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {/* Ana Sayfa Butonu */}
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-xl font-bold text-base sm:text-lg transition-all hover:scale-105 hover:shadow-xl border-2 border-gold-700 shadow-lg"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Ana Sayfaya Dön
            </Link>
          </div>

          {/* Popüler Şehirler */}
          <div className="bg-navy-50 dark:bg-navy-darkest/40 rounded-xl p-6 border border-navy-200 dark:border-gold-500/20">
            <h2 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-gold-300 mb-4 text-center">
              Şu An Yayında Olan Şehirler
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {popularCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-dark hover:bg-navy-100 dark:hover:bg-navy-darker rounded-lg font-semibold text-navy-900 dark:text-gold-300 transition-all hover:scale-105 border-2 border-navy-300 dark:border-gold-500/30 shadow-sm hover:shadow-md"
                >
                  <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {city.name}
                </Link>
              ))}
            </div>
            <p className="text-center text-xs sm:text-sm text-navy-600 dark:text-gold-400/60 mt-4">
              + 27 şehir daha
            </p>
          </div>
        </div>

        {/* Alt Bilgi Kartı */}
        <div className="mt-6 text-center">
          <p className="text-sm text-navy-600 dark:text-gold-400/60">
            Şehrinizin eklenmesini istiyorsanız{' '}
            <Link 
              href="/iletisim" 
              className="text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 font-semibold hover:underline"
            >
              bizimle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
