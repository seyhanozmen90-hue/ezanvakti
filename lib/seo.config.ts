/**
 * SEO Configuration for City and District Pages
 * 
 * Bu dosya hangi ilçe sayfalarının Google'da indexleneceğini kontrol eder.
 * 
 * KULLANIM:
 * - indexedDistricts içine eklenen ilçeler INDEX olur (Google'da görünür)
 * - Eklenmeyenler NOINDEX olur (sayfa çalışır ama Google'da görünmez)
 * 
 * STRATEJI:
 * 1. Başlangıçta sadece ana ilçeleri ekle
 * 2. Trafik verilerine göre yavaş yavaş genişlet
 * 3. Google'ın "thin content" cezası riskini azalt
 */

export const indexedDistricts: Record<string, string[]> = {
  // İSTANBUL - En popüler ilçeler
  istanbul: [
    'kadikoy',
    'besiktas',
    'uskudar',
    'fatih',
    'beyoglu',
    'sisli',
    'bakirkoy',
    'maltepe',
    'kartal',
    'pendik',
  ],

  // ANKARA - Merkez ilçeler
  ankara: [
    'cankaya',
    'kecioren',
    'mamak',
    'yenimahalle',
    'etimesgut',
  ],

  // İZMİR - Ana ilçeler
  izmir: [
    'konak',
    'karsiyaka',
    'bornova',
    'buca',
    'gaziemir',
  ],

  // BURSA
  bursa: [
    'osmangazi',
    'nilufer',
    'yildirim',
  ],

  // ANTALYA
  antalya: [
    'muratpasa',
    'kepez',
    'konyaalti',
  ],

  // ADANA
  adana: [
    'seyhan',
    'yuregir',
    'cukurova',
  ],

  // KOCAELİ
  kocaeli: [
    'izmit',
    'gebze',
    'derince',
  ],

  // GAZİANTEP
  gaziantep: [
    'sahinbey',
    'sehitkamil',
  ],

  // KONYA
  konya: [
    'meram',
    'selcuklu',
    'karatay',
  ],

  // DİYARBAKIR
  diyarbakir: [
    'baglar',
    'yenisehir',
    'sur',
  ],
};

/**
 * Bir ilçenin index edilip edilmeyeceğini kontrol eder
 * 
 * @param citySlug - Şehir slug'ı (örn: "istanbul")
 * @param districtSlug - İlçe slug'ı (örn: "kadikoy")
 * @returns true ise index edilir, false ise noindex
 * 
 * @example
 * isDistrictIndexed("istanbul", "kadikoy") // true
 * isDistrictIndexed("istanbul", "adalar") // false (listede yok)
 * isDistrictIndexed("unknown", "test") // false
 */
export function isDistrictIndexed(
  citySlug: string,
  districtSlug: string
): boolean {
  const city = indexedDistricts[citySlug];
  if (!city) return false;
  return city.includes(districtSlug);
}

/**
 * Bir şehrin kaç ilçesinin index edildiğini döndürür
 */
export function getIndexedDistrictCount(citySlug: string): number {
  return indexedDistricts[citySlug]?.length || 0;
}

/**
 * Bir şehrin index edilmiş ilçelerini döndürür
 */
export function getIndexedDistricts(citySlug: string): string[] {
  return indexedDistricts[citySlug] || [];
}

/**
 * Toplam kaç ilçenin index edildiğini döndürür
 */
export function getTotalIndexedDistricts(): number {
  return Object.values(indexedDistricts).reduce(
    (total, districts) => total + districts.length,
    0
  );
}
