import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Desteklenen diller
// ŞU AN: Sadece 'tr' aktif
// GELECEK: Yeni dil eklemek için bu listeye ekleyin (örn: 'en', 'ar')
export const locales = ['tr'] as const;

// Varsayılan dil (prefix olmadan çalışacak)
export const defaultLocale = 'tr' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Locale'i request'ten al
  let locale = await requestLocale;
  
  // Eğer locale yoksa veya geçersizse, varsayılan dili kullan
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
