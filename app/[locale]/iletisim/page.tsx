import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'İletişim | Ezan Vakti - Türkiye Namaz Saatleri',
    description: 'Ezan Vakti ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için bizimle iletişime geçebilirsiniz.',
  };
}

export default async function IletisimPage() {
  const t = await getTranslations('contact');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white mb-4">
            📧 İletişim
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto"></div>
          <p className="text-navy-700 dark:text-gold-300 mt-4 text-base sm:text-lg">
            Sorularınız, önerileriniz veya geri bildirimleriniz için bizimle iletişime geçin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* İletişim Bilgileri */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
              <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-6 flex items-center gap-3">
                <span className="text-3xl">📞</span>
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">📧</span>
                  <div>
                    <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">E-posta</h3>
                    <a 
                      href="mailto:info@ezanvakti.com" 
                      className="text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                    >
                      info@ezanvakti.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">🌐</span>
                  <div>
                    <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Web Sitesi</h3>
                    <a 
                      href="https://www.ezanvakti.com" 
                      className="text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      www.ezanvakti.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">🕌</span>
                  <div>
                    <h3 className="font-black text-navy-900 dark:text-gold-300 mb-1">Veri Kaynağı</h3>
                    <span className="text-gold-600 dark:text-gold-400">Veri kaynağı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/40">
              <h2 className="text-xl font-black text-navy-900 dark:text-gold-300 mb-4 flex items-center gap-3">
                <span className="text-2xl">💬</span>
                Sosyal Medya
              </h2>
              <p className="text-navy-900 dark:text-gold-300 text-sm mb-4">
                Güncellemeler ve duyurular için bizi takip edin
              </p>
              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <span className="text-xl">📸</span>
                  Instagram
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <span className="text-xl">👍</span>
                  Facebook
                </button>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-6 flex items-center gap-3">
              <span className="text-3xl">✉️</span>
              Mesaj Gönderin
            </h2>
            
            <form className="space-y-5">
              <div>
                <label htmlFor="name" className="block font-bold text-navy-900 dark:text-gold-300 mb-2">
                  Adınız Soyadınız
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border-2 border-gold-500/30 dark:border-gold-500/30 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 bg-white dark:bg-navy-darker text-navy-900 dark:text-gold-300 transition-all"
                  placeholder="Adınız ve soyadınız"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-bold text-navy-900 dark:text-gold-300 mb-2">
                  E-posta Adresiniz
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border-2 border-gold-500/30 dark:border-gold-500/30 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 bg-white dark:bg-navy-darker text-navy-900 dark:text-gold-300 transition-all"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block font-bold text-navy-900 dark:text-gold-300 mb-2">
                  Konu
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border-2 border-gold-500/30 dark:border-gold-500/30 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 bg-white dark:bg-navy-darker text-navy-900 dark:text-gold-300 transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Konu Seçiniz</option>
                  <option value="namaz-vakti-hatasi">Namaz Vakti Hatası</option>
                  <option value="takvim-duzeltme">Takvim Bilgisi Düzeltme</option>
                  <option value="oneri">Öneri</option>
                  <option value="hata-bildirimi">Hata Bildirimi</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block font-bold text-navy-900 dark:text-gold-300 mb-2">
                  Mesajınız
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gold-500/30 dark:border-gold-500/30 rounded-lg focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 bg-white dark:bg-navy-darker text-navy-900 dark:text-gold-300 transition-all resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-darkest py-3 px-6 rounded-xl font-black transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Gönder →
              </button>

              {/* Gizlilik Notu */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <span className="flex-shrink-0">🔒</span>
                  <span>
                    <strong>Gizlilik Taahhüdü:</strong> E-posta adresiniz ve kişisel bilgileriniz kesinlikle üçüncü kişilerle 
                    paylaşılmaz. Sadece talebinize yanıt vermek amacıyla kullanılır ve güvenli bir şekilde saklanır.
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* SSS */}
        <div className="mt-12 bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
          <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-6 flex items-center gap-3">
            <span className="text-3xl">❓</span>
            Sık Sorulan Sorular
          </h2>
          
          <div className="space-y-4">
            <details className="bg-gray-100 dark:bg-navy-darker rounded-lg p-4 cursor-pointer border border-gold-500/20">
              <summary className="font-bold text-navy-900 dark:text-gold-300">
                Namaz vakitleri nereden alınıyor?
              </summary>
              <p className="mt-2 text-navy-700 dark:text-gold-400/70 text-sm">
                Tüm namaz vakitleri güncel hesaplamalara göre alınmakta ve düzenli olarak güncellenmektedir.
              </p>
            </details>

            <details className="bg-gray-100 dark:bg-navy-darker rounded-lg p-4 cursor-pointer border border-gold-500/20">
              <summary className="font-bold text-navy-900 dark:text-gold-300">
                Şehrimi nasıl değiştirebilirim?
              </summary>
              <p className="mt-2 text-navy-700 dark:text-gold-400/70 text-sm">
                Ana sayfada bulunan şehir seçici menüsünden istediğiniz ili ve ilçeyi seçebilirsiniz. Seçiminiz tarayıcınızda kaydedilir.
              </p>
            </details>

            <details className="bg-gray-100 dark:bg-navy-darker rounded-lg p-4 cursor-pointer border border-gold-500/20">
              <summary className="font-bold text-navy-900 dark:text-gold-300">
                Mobil uygulamanız var mı?
              </summary>
              <p className="mt-2 text-navy-700 dark:text-gold-400/70 text-sm">
                Şu anda mobil uygulamamız bulunmamaktadır ancak web sitemiz tüm mobil cihazlarda sorunsuz çalışmaktadır.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
