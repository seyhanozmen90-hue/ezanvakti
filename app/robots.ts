import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: ['/', '/ads.txt'], disallow: ['/api/'] }],
    sitemap: 'https://www.ezanvakti.site/sitemap.xml',
  };
}
