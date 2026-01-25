import citiesData from './cities.json';
import { City, District } from './types';

/**
 * Tüm şehirleri getirir
 */
export function getAllCities(): City[] {
  return citiesData.cities;
}

/**
 * Slug'a göre şehir bulur
 */
export function getCityBySlug(slug: string): City | undefined {
  return citiesData.cities.find(city => city.slug === slug);
}

/**
 * Şehir ID'sine göre şehir bulur
 */
export function getCityById(id: string): City | undefined {
  return citiesData.cities.find(city => city.id === id);
}

/**
 * Şehir ve ilçe slug'ına göre ilçe bulur
 */
export function getDistrictBySlug(
  citySlug: string,
  districtSlug: string
): { city: City; district: District } | undefined {
  const city = getCityBySlug(citySlug);
  if (!city) return undefined;

  const district = city.districts.find(d => d.slug === districtSlug);
  if (!district) return undefined;

  return { city, district };
}

/**
 * Tüm şehir ve ilçe kombinasyonlarını getirir (sitemap için)
 */
export function getAllCityDistrictCombinations(): Array<{
  city: City;
  district?: District;
}> {
  const combinations: Array<{ city: City; district?: District }> = [];

  citiesData.cities.forEach(city => {
    // Şehir merkezi
    combinations.push({ city });

    // Tüm ilçeler
    city.districts.forEach(district => {
      combinations.push({ city, district });
    });
  });

  return combinations;
}

/**
 * İstanbul'u getirir (varsayılan şehir)
 */
export function getDefaultCity(): City {
  return getCityBySlug('istanbul') || citiesData.cities[0];
}
