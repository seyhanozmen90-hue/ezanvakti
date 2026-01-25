/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}

// next-intl için plugin ekle
const withNextIntl = require('next-intl/plugin')(
  // i18n.ts dosyasının yolu
  './i18n.ts'
);

module.exports = withNextIntl(nextConfig);
