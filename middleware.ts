import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
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
