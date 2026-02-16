/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}

// PWA Configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Dev'de kapatıyoruz
  runtimeCaching: [
    {
      // Aladhan API isteklerini cache'le
      urlPattern: /^https:\/\/api\.aladhan\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'aladhan-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 saat
        },
      },
    },
    {
      // Kendi API route'larını cache'le
      urlPattern: /\/api\/prayer-times.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'prayer-times-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      // Statik dosyalar
      urlPattern: /\.(png|jpg|jpeg|svg|gif|ico|css|js|woff2?)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 gün
        },
      },
    },
    {
      // Sayfa ziyaretlerini cache'le (offline için)
      urlPattern: /^https?:\/\/(www\.)?ezanvakti\.site\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

// next-intl için plugin ekle
const withNextIntl = require('next-intl/plugin')(
  // i18n.ts dosyasının yolu
  './i18n.ts'
);

// Plugin'leri zincirleme
module.exports = withPWA(withNextIntl(nextConfig));
