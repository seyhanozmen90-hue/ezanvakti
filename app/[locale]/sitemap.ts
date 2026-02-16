import { MetadataRoute } from 'next';
import { getAllCityDistrictCombinations } from '@/lib/cities-helper';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ezanvakti.site';
  const combinations = getAllCityDistrictCombinations();

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ];

  // ŞU AN: Sadece Türkçe URL'ler
  // GELECEK: Yeni dil eklendiğinde buraya eklenir
  // Örnek: /en/istanbul, /ar/ankara vb.
  
  combinations.forEach(({ city, district }) => {
    if (!district) {
      // Şehir ana sayfası
      routes.push({
        url: `${baseUrl}/tr/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    } else {
      // İlçe sayfası
      routes.push({
        url: `${baseUrl}/tr/${city.slug}/${district.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }
  });

  return routes;
}
