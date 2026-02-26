/**
 * Server-rendered SEO content section for city pages.
 * 250–400 words, unique per city, keywords: namaz vakitleri, imsak vakti, ezan saatleri.
 * No 'use client' — SSR only.
 */

interface CitySEOContentProps {
  cityName: string;
  citySlug: string;
}

export default function CitySEOContent({ cityName, citySlug }: CitySEOContentProps) {
  return (
    <section
      className="mt-8 rounded-xl bg-white dark:bg-navy-dark/60 border border-gold-500/20 dark:border-gold-500/20 p-5 sm:p-6 text-navy-800 dark:text-gold-300/90 text-sm sm:text-base leading-relaxed"
      aria-label={`${cityName} namaz vakitleri ve ezan saatleri`}
    >
      <h2 className="text-lg font-bold text-navy-900 dark:text-white mb-4">
        {cityName} Namaz Vakitleri ve Ezan Saatleri
      </h2>

      <p className="mb-4">
        {cityName} namaz vakitleri, konumunuza göre günlük ve aylık olarak bu sayfada sunulmaktadır. İmsak vakti ile başlayan beş vakit namaz saatleri, güneşin konumu ve astronomik hesaplamalarla belirlenir. {cityName} için ezan saatleri Türkiye saati (Europe/Istanbul) ile gösterilir; imsak, öğle, ikindi, akşam ve yatsı vakitlerini tek bakışta görebilirsiniz.
      </p>

      <p className="mb-4">
        {cityName} ezan saatleri sayfamızda hem bugünün namaz vakitleri hem de ay boyunca imsak vakti ve iftar saatlerini içeren aylık tablo yer alır. Namaz vakitleri her gün güncellenir; bir sonraki vakte kalan süreyi takip ederek ibadetinizi vaktinde yapabilirsiniz. Özellikle Ramazan ayında {cityName} imsak vakti ve iftar saati bilgisi sahur ve iftar planlamanız için önem taşır.
      </p>

      <p className="mb-4">
        Türkiye&apos;nin 81 ili arasında {cityName} için namaz vakitleri, enlem ve boylam bilgisine göre hesaplanır. Bu nedenle {cityName} ezan saatleri, diğer illerden birkaç dakika farklılık gösterebilir. Sitemizde {cityName} namaz vakitleri günlük ve aylık cetvel olarak sunulduğu için hem tek gün hem de ay boyunca imsak vakti ve diğer vakitleri kolayca inceleyebilirsiniz.
      </p>

      <p className="mb-4">
        {cityName} için ezan saatleri ve namaz vakitleri sayfamız mobil uyumludur; telefon veya tabletinizden de rahatça kullanabilirsiniz. İmsak vakti sabah namazından önceki yeme-içme sınırını, akşam vakti ise iftar zamanını gösterir. {cityName} namaz vakitleri sayfasında ayrıca kıble yönü, duvar takvimi ve imsakiye gibi ek sayfalara bağlantılar bulunur.
      </p>

      <p>
        {cityName} ezan saatleri ve namaz vakitleri düzenli olarak güncellenir. İmsak vakti, öğle, ikindi, akşam ve yatsı vakitlerini bu sayfadan takip edebilir; aylık tablo ile ileri tarihli namaz vakitlerini önceden planlayabilirsiniz. Tüm {cityName} namaz vakitleri bilgisi ücretsiz ve reklamsız sunulmaktadır.
      </p>
    </section>
  );
}
