import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // Desteklenen tüm diller
  locales,
  
  // Varsayılan dil (prefix olmadan çalışır)
  defaultLocale,
  
  // Varsayılan dil için prefix KULLANMA
  // Türkçe: / (prefix yok)
  // Gelecekte İngilizce: /en
  // Gelecekte Arapça: /ar
  localePrefix: 'as-needed',
  
  // Otomatik dil algılama (şimdilik kapalı, sadece Türkçe)
  localeDetection: false,
});

export const config = {
  // Sadece pathname'lere uygulan (public files, api routes hariç)
  matcher: [
    // Tüm pathname'ler
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Özellikle root ve dinamik rotalar
    '/',
    '/(tr|en|ar)/:path*', // Gelecekteki diller için hazır
  ],
};
