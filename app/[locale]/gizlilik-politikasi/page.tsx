import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Gizlilik Politikası | Ezan Vakti - Türkiye Namaz Saatleri',
    description: 'Ezan Vakti gizlilik politikası. Kişisel veri koruma, çerez kullanımı ve gizlilik uygulamalarımız hakkında bilgi edinin.',
  };
}

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-navy-darkest dark:via-navy-darker dark:to-navy-dark">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-navy-900 dark:text-white mb-4">
            🔒 Gizlilik Politikası
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto"></div>
          <p className="text-navy-700 dark:text-gold-300 mt-4 text-sm sm:text-base">
            Son Güncelleme: 2 Şubat 2026
          </p>
        </div>

        {/* İçerik */}
        <div className="space-y-8">
          {/* Giriş */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4">
              Gizliliğiniz Bizim İçin Önemli
            </h2>
            <p className="text-navy-900 dark:text-gold-300 leading-relaxed">
              Ezan Vakti olarak, kullanıcılarımızın gizliliğine saygı duyuyoruz. Bu gizlilik politikası, 
              web sitemizi kullanırken kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve 
              korunduğunu açıklamaktadır.
            </p>
          </div>

          {/* Toplanan Bilgiler */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">📊</span>
              Toplanan Bilgiler
            </h2>
            <div className="space-y-4 text-navy-900 dark:text-gold-300">
              <div>
                <h3 className="font-bold text-navy-900 dark:text-gold-300 mb-2">Otomatik Toplanan Bilgiler:</h3>
                <ul className="list-disc list-inside space-y-1 text-navy-700 dark:text-gold-400/70 text-sm">
                  <li>IP adresi ve tarayıcı bilgileri</li>
                  <li>Ziyaret edilen sayfalar ve kullanım süreleri</li>
                  <li>Şehir seçimi tercihiniz (LocalStorage)</li>
                  <li>Tema tercihiniz (gece/gündüz modu)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-navy-900 dark:text-gold-300 mb-2">İletişim Formu ile Toplanan Bilgiler:</h3>
                <ul className="list-disc list-inside space-y-1 text-navy-700 dark:text-gold-400/70 text-sm">
                  <li>Ad ve soyad</li>
                  <li>E-posta adresi</li>
                  <li>Mesaj içeriği</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Çerez Politikası */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">🍪</span>
              Çerez Kullanımı
            </h2>
            <div className="space-y-3 text-navy-900 dark:text-gold-300 text-sm sm:text-base">
              <p>
                Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler (cookies) kullanmaktadır.
              </p>
              <div>
                <h3 className="font-bold text-navy-900 dark:text-gold-300 mb-2">Kullanılan Çerez Türleri:</h3>
                <ul className="list-disc list-inside space-y-2 text-navy-700 dark:text-gold-400/70">
                  <li><strong>Zorunlu Çerezler:</strong> Web sitesinin temel işlevlerini sağlar</li>
                  <li><strong>Tercih Çerezleri:</strong> Şehir ve tema seçimlerinizi hatırlar</li>
                  <li><strong>Analitik Çerezler:</strong> Site kullanımını anlamak için Google Analytics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Veri Kullanımı */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              Verilerin Kullanım Amacı
            </h2>
            <p className="text-navy-900 dark:text-gold-300 mb-3">
              Topladığımız veriler yalnızca şu amaçlarla kullanılır:
            </p>
            <ul className="list-disc list-inside space-y-2 text-navy-700 dark:text-gold-400/70 text-sm">
              <li>Web sitesi işlevselliğini sağlamak</li>
              <li>Kullanıcı tercihlerini saklamak</li>
              <li>İletişim taleplerinize yanıt vermek</li>
              <li>Site performansını iyileştirmek</li>
              <li>İstatistiksel analiz yapmak</li>
            </ul>
          </div>

          {/* Google Adsense */}
          <div className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/40">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-300 mb-4 flex items-center gap-3">
              <span className="text-2xl">📢</span>
              Reklam Hizmetleri
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-sm sm:text-base leading-relaxed">
              Web sitemizde Google AdSense reklamları görüntülenmektedir. Google, reklam gösterimi için 
              çerezler kullanabilir ve kullanıcı verilerini kendi gizlilik politikasına uygun olarak 
              işleyebilir. Google&apos;ın gizlilik politikası hakkında daha fazla bilgi için{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gold-600 dark:text-gold-400 underline hover:text-gold-700 dark:hover:text-gold-300"
              >
                buraya tıklayın
              </a>.
            </p>
          </div>

          {/* Veri Güvenliği */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              Veri Güvenliği
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-sm sm:text-base leading-relaxed">
              Kişisel bilgilerinizin güvenliğini sağlamak için uygun teknik ve idari önlemleri alıyoruz. 
              Web sitemiz SSL sertifikası ile korunmaktadır ve verileriniz şifreli bağlantı üzerinden iletilir.
            </p>
          </div>

          {/* Kullanıcı Hakları */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              Kullanıcı Hakları
            </h2>
            <p className="text-navy-900 dark:text-gold-300 mb-3">
              KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-navy-700 dark:text-gold-400/70 text-sm">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin düzeltilmesini veya silinmesini isteme</li>
            </ul>
          </div>

          {/* Üçüncü Taraf Bağlantılar */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              Üçüncü Taraf Bağlantılar
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-sm sm:text-base leading-relaxed">
              Web sitemiz, üçüncü taraf web sitelerine bağlantılar içerebilir. 
              Bu sitelerin gizlilik politikalarından sorumlu değiliz. Harici siteleri ziyaret ettiğinizde 
              ilgili sitenin gizlilik politikasını incelemenizi öneririz.
            </p>
          </div>

          {/* Çocukların Gizliliği */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">👶</span>
              Çocukların Gizliliği
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-sm sm:text-base leading-relaxed">
              Web sitemiz genel kitleye yönelik dinî bir bilgilendirme hizmetidir. Bilinçli olarak 
              13 yaşından küçük çocuklardan kişisel bilgi toplamıyoruz. Ebeveyn veya vasi iseniz ve 
              çocuğunuzun bize kişisel bilgi verdiğini düşünüyorsanız, lütfen bizimle iletişime geçin.
            </p>
          </div>

          {/* Politika Değişiklikleri */}
          <div className="bg-white dark:bg-navy-dark/70 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/30">
            <h2 className="text-2xl font-black text-navy-900 dark:text-gold-400 mb-4 flex items-center gap-3">
              <span className="text-2xl">📝</span>
              Politika Değişiklikleri
            </h2>
            <p className="text-navy-900 dark:text-gold-300 text-sm sm:text-base leading-relaxed">
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada 
              yayınlandığı anda yürürlüğe girer. Önemli değişiklikler olması durumunda ana sayfada 
              bir bildirim gösterilecektir.
            </p>
          </div>

          {/* İletişim */}
          <div className="bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-gold-500 dark:border-gold-500/40 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-gold-300 mb-3">
              Sorularınız mı Var?
            </h2>
            <p className="text-navy-900 dark:text-gold-300 mb-5 text-sm">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz
            </p>
            <a
              href="/iletisim"
              className="inline-block px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-navy-darkest rounded-xl font-black transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
            >
              İletişim →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
