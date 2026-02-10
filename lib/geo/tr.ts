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
  {
    city_slug: 'izmir',
    district_slug: 'cigli',
    coords: { lat: 38.4971, lng: 27.0538 },
  },
  {
    city_slug: 'izmir',
    district_slug: 'gaziemir',
    coords: { lat: 38.3266, lng: 27.1361 },
  },
  {
    city_slug: 'izmir',
    district_slug: 'balcova',
    coords: { lat: 38.3928, lng: 27.0460 },
  },
  
  // Istanbul (city)
  {
    city_slug: 'istanbul',
    coords: { lat: 41.0082, lng: 28.9784 },
  },
  // Istanbul districts
  {
    city_slug: 'istanbul',
    district_slug: 'kadikoy',
    coords: { lat: 40.9900, lng: 29.0266 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'besiktas',
    coords: { lat: 41.0422, lng: 29.0079 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'sisli',
    coords: { lat: 41.0602, lng: 28.9879 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'fatih',
    coords: { lat: 41.0192, lng: 28.9497 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'uskudar',
    coords: { lat: 41.0224, lng: 29.0154 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'beyoglu',
    coords: { lat: 41.0370, lng: 28.9784 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'bakirkoy',
    coords: { lat: 40.9797, lng: 28.8739 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'avcilar',
    coords: { lat: 40.9789, lng: 28.7219 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'maltepe',
    coords: { lat: 40.9362, lng: 29.1268 },
  },
  {
    city_slug: 'istanbul',
    district_slug: 'pendik',
    coords: { lat: 40.8780, lng: 29.2333 },
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
 * IMPORTANT RULES:
 * 1. city_slug is ALWAYS required
 * 2. district_slug is ALWAYS used with city_slug (never alone)
 * 3. If district_slug provided, returns ONLY district coordinates (no city fallback)
 * 4. Throws clear error if coordinates not found
 * 
 * @param city_slug - City slug (e.g., 'izmir', 'istanbul')
 * @param district_slug - Optional district slug (e.g., 'bornova', 'karsiyaka')
 * @returns Coordinates
 * @throws Error with clear message if location not found
 */
export function getCoords(
  city_slug: string,
  district_slug?: string
): Coordinates {
  // Normalize inputs
  const normalized_city = city_slug.trim().toLowerCase();
  const normalized_district = district_slug?.trim().toLowerCase();

  // If district_slug provided, find district coordinates
  if (normalized_district) {
    const district = TURKEY_COORDINATES.find(
      (loc) =>
        loc.city_slug === normalized_city &&
        loc.district_slug === normalized_district
    );

    if (district) {
      return district.coords;
    }

    // District not found - throw error (NEVER fall back to city)
    throw new Error(
      `Unknown district for city: ${city_slug}/${district_slug}. ` +
      `Please add coordinates to lib/geo/tr.ts or check spelling.`
    );
  }

  // No district_slug - find city coordinates
  const city = TURKEY_COORDINATES.find(
    (loc) => loc.city_slug === normalized_city && !loc.district_slug
  );

  if (city) {
    return city.coords;
  }

  // City not found - throw error
  throw new Error(
    `Unknown city: ${city_slug}. ` +
    `Please add coordinates to lib/geo/tr.ts or check spelling.`
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
