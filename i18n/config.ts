/**
 * i18n Yapılandırması
 * 
 * ÖNEMLİ: 
 * - Şu an sadece Türkçe (tr) aktif
 * - Yeni dil eklemek için:
 *   1. locales dizisine dil kodunu ekle (örn: 'en', 'ar')
 *   2. messages/{locale}.json dosyası oluştur
 *   3. Başka bir değişiklik gerekmez!
 */

export const locales = ['tr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

/**
 * Gelecekte aktif edilecek diller için hazırlık
 * Uncomment yaparak aktif edilebilir:
 * 
 * export const locales = ['tr', 'en', 'ar'] as const;
 * 
 * Dil isimleri (UI'da gösterilmek için):
 */
export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  // en: 'English',      // Gelecekte aktif edilebilir
  // ar: 'العربية',       // Gelecekte aktif edilebilir
};

/**
 * Locale prefix stratejisi
 * 'as-needed': Sadece default olmayan diller için prefix kullanır
 * Örnek:
 *   - tr: /istanbul (prefix yok)
 *   - en: /en/istanbul (prefix var)
 */
export const localePrefix = 'as-needed' as const;
