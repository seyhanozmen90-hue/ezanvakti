import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import NavigationTabs from '@/components/NavigationTabs';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

// Metadata'yı dinamik olarak oluştur
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'site' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${t('title')} | ${t('subtitle')}`,
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    keywords: 'ezan vakitleri, namaz vakitleri, ezan saati, İstanbul ezan vakitleri, Ankara ezan vakitleri, diyanet namaz vakitleri, 2026 namaz vakitleri',
    authors: [{ name: t('title') }],
    creator: t('title'),
    publisher: t('title'),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : locale,
      url: baseUrl,
      siteName: t('title'),
      title: `${t('title')} | ${t('subtitle')}`,
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('title')} | ${t('subtitle')}`,
      description: t('description'),
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
      { media: '(prefers-color-scheme: dark)', color: '#0c4a6e' },
    ],
    manifest: '/manifest.json',
    icons: {
      icon: '/icon.png',
      apple: '/apple-icon.png',
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Geçersiz locale kontrolü
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Çeviri mesajlarını al
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
            <NavigationTabs />
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
