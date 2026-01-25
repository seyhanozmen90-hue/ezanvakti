// next-intl navigation helper
// ŞU AN: Sadece Türkçe (tr) - prefix YOK
// GELECEK: Yeni dil eklendiğinde otomatik çalışır

import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from '@/i18n';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ 
    locales, 
    defaultLocale,
    localePrefix: 'as-needed' 
  });

/**
 * KULLANIM:
 * 
 * import { Link, useRouter } from '@/lib/navigation';
 * 
 * <Link href="/istanbul">İstanbul</Link>
 * // Türkçe: /istanbul
 * // İngilizce (gelecek): /en/istanbul
 * 
 * router.push('/ankara/cankaya');
 * // Otomatik olarak doğru dil prefix'i eklenir
 */
