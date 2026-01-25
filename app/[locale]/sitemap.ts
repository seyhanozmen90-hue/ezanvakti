import { MetadataRoute } from 'next';
import { getAllCityDistrictCombinations } from '@/lib/cities-helper';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ezanvakti.com';
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
        url: `${baseUrl}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      });
    } else {
      // İlçe sayfası
      routes.push({
        url: `${baseUrl}/${city.slug}/${district.slug}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
      });
    }
  });

  return routes;
}
