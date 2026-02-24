import { MetadataRoute } from 'next';
import { getAllCities } from '@/lib/cities-helper';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const now = new Date();
  const cities = getAllCities();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/kible`,
      changeFrequency: 'monthly',
      priority: 0.8,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/hakkimizda`,
      changeFrequency: 'monthly',
      priority: 0.5,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/iletisim`,
      changeFrequency: 'monthly',
      priority: 0.5,
      lastModified: now,
    },
    {
      url: `${baseUrl}/tr/gizlilik-politikasi`,
      changeFrequency: 'monthly',
      priority: 0.5,
      lastModified: now,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/tr/${city.slug}`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    lastModified: now,
  }));

  return [...staticPages, ...cityPages];
}
