import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hakkımızda | Ezan Vakti - Türkiye Namaz Saatleri',
    description: 'Ezan Vakti hakkında bilgi edinin. Türkiye geneli namaz vakitlerini doğru ve güncel olarak sunan platformumuz.',
  };
}

export default async function HakkimizdaPage() {
  const t = await getTranslations('about');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white mb-4">
            📖 Hakkımızda
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto"></div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Misyon */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              Misyonumuz
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-base sm:text-lg leading-relaxed">
              Ezan Vakti, Türkiye&apos;nin her yerinden Müslümanların namaz vakitlerini doğru ve kolay bir şekilde 
              öğrenmelerini sağlamak amacıyla kurulmuştur. Diyanet İşleri Başkanlığı&apos;nın resmi verilerini 
              kullanarak, tüm il ve ilçeler için güncel namaz vakitlerini sunuyoruz.
            </p>
          </div>

          {/* Özellikler */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-gold-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">✨</span>
              Özelliklerimiz
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🕌</span>
                <div>
                  <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Doğru Vakitler</h3>
                  <p className="text-sm text-navy-700 dark:text-gold-400/70">
                    Diyanet İşleri Başkanlığı&apos;nın resmi verilerinden güncel namaz vakitleri
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Şehir Seçimi</h3>
                  <p className="text-sm text-navy-700 dark:text-gold-400/70">
                    Türkiye&apos;nin tüm illeri ve ilçeleri için özel vakit hesaplamaları
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Geri Sayım</h3>
                  <p className="text-sm text-navy-700 dark:text-gold-400/70">
                    Bir sonraki namaz vaktine kalan süreyi anlık görebilme
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Takvim Sistemi</h3>
                  <p className="text-sm text-navy-700 dark:text-gold-400/70">
                    Dini günler, kandiller ve özel günlerle detaylı takvim
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🧭</span>
                <div>
                  <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Kıble Yönü</h3>
                  <p className="text-sm text-navy-700 dark:text-gold-400/70">
                    Bulunduğunuz konuma göre kıble yönünü gösterir
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Responsive Tasarım</h3>
                  <p className="text-sm text-navy-700 dark:text-gold-400/70">
                    Mobil, tablet ve masaüstü tüm cihazlarda uyumlu
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Veri Kaynağı */}
          <div className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/40">
            <h2 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-gold-300 mb-4 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              Veri Kaynağımız
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-base sm:text-lg leading-relaxed">
              Tüm namaz vakitleri <strong>Diyanet İşleri Başkanlığı</strong>&apos;nın resmi verilerine 
              dayanmaktadır. Hicri tarih bilgileri ve dini günler güncel kaynaklardan alınmakta 
              ve düzenli olarak güncellenmektedir.
            </p>
          </div>

          {/* Hizmet Süresi */}
          <div className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/40 text-center">
            <span className="text-4xl mb-3 block">🏆</span>
            <h2 className="text-xl font-black text-navy-900 dark:text-gold-300 mb-2">
              Güvenilir Hizmet
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-sm">
              2026 yılından itibaren Türkiye genelinde milyonlarca kullanıcıya 
              doğru ve güncel namaz vakitleri bilgisi sunmaktayız.
            </p>
          </div>

          {/* İletişim CTA */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-gold-400 mb-3">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-navy-700 dark:text-gold-300 mb-5">
              Sorularınız, önerileriniz veya geri bildirimleriniz için
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/iletisim"
                className="inline-block px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-darkest rounded-xl font-black transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
              >
                İletişim →
              </a>
              <a
                href="/gizlilik-politikasi"
                className="inline-block px-8 py-3 bg-white dark:bg-navy-darker border-2 border-gold-500 dark:border-gold-500/40 hover:bg-gold-50 dark:hover:bg-navy-darkest text-navy-900 dark:text-gold-400 rounded-xl font-black transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
              >
                Gizlilik Politikası
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
