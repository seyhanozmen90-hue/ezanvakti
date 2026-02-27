import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

// /tr/adapazari ve /tr/adapazari/merkez (veya herhangi ilçe) → 308 /tr/sakarya/adapazari (noindex/Soft 404 önlemi)
function redirectAdapazari(pathname: string, request: NextRequest): NextResponse | null {
  const match = pathname.match(/^\/(tr|en|ar)\/adapazari(\/|$)/);
  if (match) {
    const locale = match[1];
    return NextResponse.redirect(new URL(`/${locale}/sakarya/adapazari`, request.url), 308);
  }
  if (pathname === '/adapazari' || pathname.startsWith('/adapazari/')) {
    return NextResponse.redirect(new URL(`/${defaultLocale}/sakarya/adapazari`, request.url), 308);
  }
  return null;
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adapazariRedirect = redirectAdapazari(pathname, request);
  if (adapazariRedirect) return adapazariRedirect;
  return intlMiddleware(request);
}

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
