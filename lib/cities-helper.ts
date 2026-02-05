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
 * Varsayılan şehri getirir (İstanbul)
 */
export function getDefaultCity(): City {
  return getCityBySlug('istanbul') || citiesData.cities[0];
}

/**
 * Route parametrelerinden şehir bilgisini çıkarır
 * - Eğer il parametresi varsa, o şehri döner
 * - Yoksa varsayılan şehri (İstanbul) döner
 */
export function getCityFromParams(params: { il?: string }): City {
  if (params.il) {
    const city = getCityBySlug(params.il);
    if (city) return city;
  }
  return getDefaultCity();
}

/**
 * Search params veya route params'dan şehir adını al
 * - Önce search params'a bakar (?city=istanbul)
 * - Yoksa route params'a bakar (il parametresi)
 * - Her ikisi de yoksa varsayılan şehir adını döner
 */
export function getCityNameFromParams(
  searchParams?: { city?: string },
  routeParams?: { il?: string }
): string {
  // Search params'dan city varsa onu kullan
  if (searchParams?.city) {
    const city = getCityBySlug(searchParams.city.toLowerCase());
    return city?.name || searchParams.city;
  }
  
  // Route params'dan il varsa onu kullan
  if (routeParams?.il) {
    const city = getCityBySlug(routeParams.il);
    if (city) return city.name;
  }
  
  // Varsayılan
  return getDefaultCity().name;
}
