import { Coordinates } from '../providers/types';

interface LocationCoords {
  city_slug: string;
  district_slug?: string;
  coords: Coordinates;
}

/**
 * Turkey city and district coordinates
 * 
 * This is a static mapping for now. In production, this could be:
 * - Loaded from a JSON file
 * - Stored in database
 * - Fetched from a geocoding service
 */
const TURKEY_COORDINATES: LocationCoords[] = [
  // İzmir (city)
  {
    city_slug: 'izmir',
    coords: { lat: 38.4237, lng: 27.1428 },
  },
  // İzmir districts
  {
    city_slug: 'izmir',
    district_slug: 'bornova',
    coords: { lat: 38.4696, lng: 27.2147 },
  },
  {
    city_slug: 'izmir',
    district_slug: 'karsiyaka',
    coords: { lat: 38.4599, lng: 27.0910 },
  },
  {
    city_slug: 'izmir',
    district_slug: 'konak',
    coords: { lat: 38.4189, lng: 27.1287 },
  },
  {
    city_slug: 'izmir',
    district_slug: 'buca',
    coords: { lat: 38.3913, lng: 27.1838 },
  },
  
  // Istanbul (city)
  {
    city_slug: 'istanbul',
    coords: { lat: 41.0082, lng: 28.9784 },
  },
  
  // Ankara (city)
  {
    city_slug: 'ankara',
    coords: { lat: 39.9334, lng: 32.8597 },
  },
  
  // Add more cities/districts as needed
];

/**
 * Get coordinates for a city or district
 * 
 * @param city_slug - City slug (e.g., 'izmir', 'istanbul')
 * @param district_slug - Optional district slug (e.g., 'bornova', 'karsiyaka')
 * @returns Coordinates or null if not found
 * @throws Error with clear message if location not found
 */
export function getCoords(
  city_slug: string,
  district_slug?: string
): Coordinates {
  const normalized_city = city_slug.toLowerCase();
  const normalized_district = district_slug?.toLowerCase();

  // Try to find district first if provided
  if (normalized_district) {
    const district = TURKEY_COORDINATES.find(
      (loc) =>
        loc.city_slug === normalized_city &&
        loc.district_slug === normalized_district
    );

    if (district) {
      return district.coords;
    }

    throw new Error(
      `Coordinates not found for district: ${city_slug}/${district_slug}. ` +
      `Please add coordinates to lib/geo/tr.ts`
    );
  }

  // Find city
  const city = TURKEY_COORDINATES.find(
    (loc) => loc.city_slug === normalized_city && !loc.district_slug
  );

  if (city) {
    return city.coords;
  }

  throw new Error(
    `Coordinates not found for city: ${city_slug}. ` +
    `Please add coordinates to lib/geo/tr.ts`
  );
}

/**
 * Check if coordinates exist for a location
 */
export function hasCoordsExist(city_slug: string, district_slug?: string): boolean {
  try {
    getCoords(city_slug, district_slug);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all available cities
 */
export function getAvailableCities(): string[] {
  return Array.from(
    new Set(
      TURKEY_COORDINATES.filter((loc) => !loc.district_slug).map(
        (loc) => loc.city_slug
      )
    )
  );
}

/**
 * Get all available districts for a city
 */
export function getAvailableDistricts(city_slug: string): string[] {
  return TURKEY_COORDINATES.filter(
    (loc) => loc.city_slug === city_slug.toLowerCase() && loc.district_slug
  ).map((loc) => loc.district_slug!);
}
