import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import NavigationTabs from '@/components/NavigationTabs';
import InstallPWA from '@/components/InstallPWA';
import JsonLd from '@/components/JsonLd';
import '../globals.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'EzanVakti.site',
      description: "Türkiye geneli ezan ve namaz vakitleri",
      inLanguage: 'tr-TR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/namaz-vakitleri/{search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}/#webapp`,
      name: 'EzanVakti - Namaz Vakitleri',
      url: baseUrl,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web, iOS, Android',
      inLanguage: 'tr-TR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
      },
    },
  ],
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
      default: 'Ezan Vakitleri 2026 | Günlük Namaz Saatleri',
      template: '%s | EzanVakti.site',
    },
    description:
      "Türkiye'nin tüm illerinde günlük ezan ve namaz vakitleri. İmsakiye, kıble yönü ve daha fazlası.",
    keywords: [
      'ezan vakitleri',
      'namaz vakitleri',
      'imsak',
      'iftar',
      'sahur',
      'kıble',
      '2026 imsakiye',
    ],
    authors: [{ name: 'EzanVakti' }],
    creator: 'EzanVakti',
    publisher: t('title'),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : locale,
      url: baseUrl,
      siteName: 'EzanVakti.site',
      title: 'Ezan Vakitleri 2026 | Günlük Namaz Saatleri',
      description:
        "Türkiye'nin tüm şehirlerinde günlük ezan vakitleri, imsakiye ve kıble pusulası.",
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'EzanVakti.site - Namaz Vakitleri',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ezan Vakitleri 2026',
      description: 'Günlük namaz vakitleri ve imsakiye',
      images: ['/og-image.png'],
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'EzanVakti',
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: '/icon.png',
      apple: '/icon.png',
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a5f' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

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
        <JsonLd data={websiteSchema} />
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
            <NavigationTabs />
            {children}
            <InstallPWA />
          </div>
        </NextIntlClientProvider>
        {/* Google Analytics - Only in production */}
        {process.env.NODE_ENV === 'production' && (
          <GoogleAnalytics gaId="G-VK3ZVGZYJS" />
        )}
      </body>
    </html>
  );
}
