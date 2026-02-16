import { MetadataRoute } from 'next';
import { getAllCityDistrictCombinations } from '@/lib/cities-helper';

/**
 * Sitemap for ezanvakti.site
 * Accessible at: https://www.ezanvakti.site/sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const combinations = getAllCityDistrictCombinations();
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    // Static pages
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
    {
      url: `${baseUrl}/tr/kible`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ];

  // City and district pages
  combinations.forEach(({ city, district }) => {
    if (!district) {
      // City main page
      routes.push({
        url: `${baseUrl}/tr/${city.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      });
    } else {
      // District page
      routes.push({
        url: `${baseUrl}/tr/${city.slug}/${district.slug}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  });

  return routes;
}
