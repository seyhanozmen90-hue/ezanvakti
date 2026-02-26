import { MetadataRoute } from 'next';
import { getAllCities, getAllCityDistrictCombinations } from '@/lib/cities-helper';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const now = new Date();
  const cities = getAllCities();
  const combinations = getAllCityDistrictCombinations();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tr/kible`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tr/hakkimizda`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tr/iletisim`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/tr/gizlilik-politikasi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${baseUrl}/tr/${city.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const districtPages: MetadataRoute.Sitemap = combinations
    .filter((c) => c.district)
    .map(({ city, district }) => ({
      url: `${baseUrl}/tr/${city.slug}/${district!.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }));

  return [...staticPages, ...cityPages, ...districtPages];
}
