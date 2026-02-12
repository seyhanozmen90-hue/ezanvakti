import { Coordinates } from '../providers/types';

export interface LocationCoords {
  city_slug: string;
  district_slug?: string;
  coords: Coordinates;
}

/**
 * Turkey city and district coordinates for prayer times calculation
 * 
 * RULES:
 * - All slugs are lowercase ASCII (no Turkish characters: ş→s, ğ→g, ı→i, ö→o, ü→u, ç→c)
 * - Each city has ONE entry without district_slug
 * - Districts are official administrative districts only
 * - Coordinates are accurate GPS locations (WGS84)
 * 
 * TOTAL: 30 cities + ~120 districts = ~150 locations
 */
const TURKEY_COORDINATES: LocationCoords[] = [
  // ============================================================================
  // 1. ISTANBUL - Turkey's largest city
  // ============================================================================
  { city_slug: 'istanbul', coords: { lat: 41.0082, lng: 28.9784 } },
  { city_slug: 'istanbul', district_slug: 'kadikoy', coords: { lat: 40.9900, lng: 29.0266 } },
  { city_slug: 'istanbul', district_slug: 'besiktas', coords: { lat: 41.0422, lng: 29.0079 } },
  { city_slug: 'istanbul', district_slug: 'sisli', coords: { lat: 41.0602, lng: 28.9879 } },
  { city_slug: 'istanbul', district_slug: 'fatih', coords: { lat: 41.0192, lng: 28.9497 } },
  { city_slug: 'istanbul', district_slug: 'uskudar', coords: { lat: 41.0224, lng: 29.0154 } },
  { city_slug: 'istanbul', district_slug: 'beyoglu', coords: { lat: 41.0370, lng: 28.9784 } },
  { city_slug: 'istanbul', district_slug: 'bakirkoy', coords: { lat: 40.9797, lng: 28.8739 } },
  { city_slug: 'istanbul', district_slug: 'avcilar', coords: { lat: 40.9789, lng: 28.7219 } },
  { city_slug: 'istanbul', district_slug: 'maltepe', coords: { lat: 40.9362, lng: 29.1268 } },
  { city_slug: 'istanbul', district_slug: 'pendik', coords: { lat: 40.8780, lng: 29.2333 } },
  { city_slug: 'istanbul', district_slug: 'umraniye', coords: { lat: 41.0166, lng: 29.1246 } },
  { city_slug: 'istanbul', district_slug: 'kartal', coords: { lat: 40.9000, lng: 29.1833 } },
  { city_slug: 'istanbul', district_slug: 'sariyer', coords: { lat: 41.1700, lng: 29.0500 } },
  { city_slug: 'istanbul', district_slug: 'bahcelievler', coords: { lat: 41.0022, lng: 28.8538 } },

  // ============================================================================
  // 2. ANKARA - Capital city
  // ============================================================================
  { city_slug: 'ankara', coords: { lat: 39.9334, lng: 32.8597 } },
  { city_slug: 'ankara', district_slug: 'cankaya', coords: { lat: 39.9180, lng: 32.8618 } },
  { city_slug: 'ankara', district_slug: 'kecioren', coords: { lat: 39.9686, lng: 32.8540 } },
  { city_slug: 'ankara', district_slug: 'yenimahalle', coords: { lat: 39.9775, lng: 32.7275 } },
  { city_slug: 'ankara', district_slug: 'mamak', coords: { lat: 39.9200, lng: 32.9220 } },
  { city_slug: 'ankara', district_slug: 'etimesgut', coords: { lat: 39.9478, lng: 32.6758 } },
  { city_slug: 'ankara', district_slug: 'sincan', coords: { lat: 39.9712, lng: 32.5851 } },

  // ============================================================================
  // 3. IZMIR - Aegean coast
  // ============================================================================
  { city_slug: 'izmir', coords: { lat: 38.4237, lng: 27.1428 } },
  { city_slug: 'izmir', district_slug: 'konak', coords: { lat: 38.4189, lng: 27.1287 } },
  { city_slug: 'izmir', district_slug: 'bornova', coords: { lat: 38.4696, lng: 27.2147 } },
  { city_slug: 'izmir', district_slug: 'karsiyaka', coords: { lat: 38.4599, lng: 27.0910 } },
  { city_slug: 'izmir', district_slug: 'buca', coords: { lat: 38.3913, lng: 27.1838 } },
  { city_slug: 'izmir', district_slug: 'cigli', coords: { lat: 38.4971, lng: 27.0538 } },
  { city_slug: 'izmir', district_slug: 'gaziemir', coords: { lat: 38.3266, lng: 27.1361 } },
  { city_slug: 'izmir', district_slug: 'balcova', coords: { lat: 38.3928, lng: 27.0460 } },
  { city_slug: 'izmir', district_slug: 'bayrakli', coords: { lat: 38.4639, lng: 27.1611 } },

  // ============================================================================
  // 4. BURSA - Industrial city
  // ============================================================================
  { city_slug: 'bursa', coords: { lat: 40.1826, lng: 29.0665 } },
  { city_slug: 'bursa', district_slug: 'osmangazi', coords: { lat: 40.1900, lng: 29.0600 } },
  { city_slug: 'bursa', district_slug: 'nilufer', coords: { lat: 40.2304, lng: 28.9870 } },
  { city_slug: 'bursa', district_slug: 'yildirim', coords: { lat: 40.1833, lng: 29.1167 } },
  { city_slug: 'bursa', district_slug: 'mudanya', coords: { lat: 40.3761, lng: 28.8836 } },
  { city_slug: 'bursa', district_slug: 'gemlik', coords: { lat: 40.4306, lng: 29.1561 } },

  // ============================================================================
  // 5. ANTALYA - Mediterranean coast
  // ============================================================================
  { city_slug: 'antalya', coords: { lat: 36.8841, lng: 30.7056 } },
  { city_slug: 'antalya', district_slug: 'kepez', coords: { lat: 36.9178, lng: 30.7278 } },
  { city_slug: 'antalya', district_slug: 'muratpasa', coords: { lat: 36.8778, lng: 30.7389 } },
  { city_slug: 'antalya', district_slug: 'konyaalti', coords: { lat: 36.8947, lng: 30.6394 } },
  { city_slug: 'antalya', district_slug: 'alanya', coords: { lat: 36.5444, lng: 31.9956 } },
  { city_slug: 'antalya', district_slug: 'manavgat', coords: { lat: 36.7875, lng: 31.4450 } },

  // ============================================================================
  // 6. ADANA - Southern Turkey
  // ============================================================================
  { city_slug: 'adana', coords: { lat: 37.0000, lng: 35.3213 } },
  { city_slug: 'adana', district_slug: 'seyhan', coords: { lat: 37.0000, lng: 35.3250 } },
  { city_slug: 'adana', district_slug: 'yuregir', coords: { lat: 36.8500, lng: 35.3833 } },
  { city_slug: 'adana', district_slug: 'cukurova', coords: { lat: 37.0167, lng: 35.3167 } },
  { city_slug: 'adana', district_slug: 'saricam', coords: { lat: 37.0833, lng: 35.4167 } },

  // ============================================================================
  // 7. KONYA - Central Anatolia
  // ============================================================================
  { city_slug: 'konya', coords: { lat: 37.8746, lng: 32.4932 } },
  { city_slug: 'konya', district_slug: 'meram', coords: { lat: 37.8667, lng: 32.4833 } },
  { city_slug: 'konya', district_slug: 'selcuklu', coords: { lat: 37.9000, lng: 32.5167 } },
  { city_slug: 'konya', district_slug: 'karatay', coords: { lat: 37.8833, lng: 32.5000 } },

  // ============================================================================
  // 8. GAZIANTEP - Southeast
  // ============================================================================
  { city_slug: 'gaziantep', coords: { lat: 37.0662, lng: 37.3833 } },
  { city_slug: 'gaziantep', district_slug: 'sahinbey', coords: { lat: 37.0667, lng: 37.3833 } },
  { city_slug: 'gaziantep', district_slug: 'sehitkamil', coords: { lat: 37.0500, lng: 37.3667 } },

  // ============================================================================
  // 9. SANLIURFA - Southeast (merged, no duplicates)
  // ============================================================================
  { city_slug: 'sanliurfa', coords: { lat: 37.1591, lng: 38.7969 } },
  { city_slug: 'sanliurfa', district_slug: 'haliliye', coords: { lat: 37.1500, lng: 38.8000 } },
  { city_slug: 'sanliurfa', district_slug: 'eyyubiye', coords: { lat: 37.1667, lng: 38.7833 } },
  { city_slug: 'sanliurfa', district_slug: 'karakopru', coords: { lat: 37.1667, lng: 38.7667 } },

  // ============================================================================
  // 10. KOCAELI - Marmara region
  // ============================================================================
  { city_slug: 'kocaeli', coords: { lat: 40.8533, lng: 29.8815 } },
  { city_slug: 'kocaeli', district_slug: 'izmit', coords: { lat: 40.7654, lng: 29.9404 } },
  { city_slug: 'kocaeli', district_slug: 'gebze', coords: { lat: 40.8027, lng: 29.4308 } },
  { city_slug: 'kocaeli', district_slug: 'derince', coords: { lat: 40.7667, lng: 29.8333 } },

  // ============================================================================
  // 11. MERSIN - Mediterranean coast
  // ============================================================================
  { city_slug: 'mersin', coords: { lat: 36.8121, lng: 34.6415 } },
  { city_slug: 'mersin', district_slug: 'akdeniz', coords: { lat: 36.8000, lng: 34.6333 } },
  { city_slug: 'mersin', district_slug: 'toroslar', coords: { lat: 36.8167, lng: 34.6167 } },
  { city_slug: 'mersin', district_slug: 'mezitli', coords: { lat: 36.7833, lng: 34.5167 } },
  { city_slug: 'mersin', district_slug: 'yenisehir', coords: { lat: 36.8333, lng: 34.6667 } },

  // ============================================================================
  // 12. DIYARBAKIR - Southeast
  // ============================================================================
  { city_slug: 'diyarbakir', coords: { lat: 37.9144, lng: 40.2306 } },
  { city_slug: 'diyarbakir', district_slug: 'baglar', coords: { lat: 37.9167, lng: 40.2333 } },
  { city_slug: 'diyarbakir', district_slug: 'yenisehir', coords: { lat: 37.9000, lng: 40.2500 } },
  { city_slug: 'diyarbakir', district_slug: 'kayapinar', coords: { lat: 37.9333, lng: 40.2167 } },

  // ============================================================================
  // 13. HATAY - Syrian border
  // ============================================================================
  { city_slug: 'hatay', coords: { lat: 36.4018, lng: 36.3498 } },
  { city_slug: 'hatay', district_slug: 'antakya', coords: { lat: 36.2067, lng: 36.1611 } },
  { city_slug: 'hatay', district_slug: 'iskenderun', coords: { lat: 36.5875, lng: 36.1744 } },

  // ============================================================================
  // 14. MANISA - Aegean region
  // ============================================================================
  { city_slug: 'manisa', coords: { lat: 38.6191, lng: 27.4289 } },
  { city_slug: 'manisa', district_slug: 'yunusemre', coords: { lat: 38.6167, lng: 27.4333 } },
  { city_slug: 'manisa', district_slug: 'sehzadeler', coords: { lat: 38.6333, lng: 27.4167 } },

  // ============================================================================
  // 15. KAHRAMANMARAS - Southeast
  // ============================================================================
  { city_slug: 'kahramanmaras', coords: { lat: 37.5858, lng: 36.9371 } },
  { city_slug: 'kahramanmaras', district_slug: 'dulkadiroglu', coords: { lat: 37.5833, lng: 36.9333 } },
  { city_slug: 'kahramanmaras', district_slug: 'onikisubat', coords: { lat: 37.6000, lng: 36.9500 } },

  // ============================================================================
  // 16. SAMSUN - Black Sea coast
  // ============================================================================
  { city_slug: 'samsun', coords: { lat: 41.2867, lng: 36.3300 } },
  { city_slug: 'samsun', district_slug: 'ilkadim', coords: { lat: 41.2833, lng: 36.3333 } },
  { city_slug: 'samsun', district_slug: 'atakum', coords: { lat: 41.3333, lng: 36.2333 } },
  { city_slug: 'samsun', district_slug: 'canik', coords: { lat: 41.2667, lng: 36.3667 } },

  // ============================================================================
  // 17. BALIKESIR - Marmara/Aegean
  // ============================================================================
  { city_slug: 'balikesir', coords: { lat: 39.6484, lng: 27.8826 } },
  { city_slug: 'balikesir', district_slug: 'karesi', coords: { lat: 39.6500, lng: 27.8833 } },
  { city_slug: 'balikesir', district_slug: 'altieylul', coords: { lat: 39.6333, lng: 27.9000 } },
  { city_slug: 'balikesir', district_slug: 'bandirma', coords: { lat: 40.3522, lng: 27.9772 } },

  // ============================================================================
  // 18. VAN - Eastern Turkey
  // ============================================================================
  { city_slug: 'van', coords: { lat: 38.4941, lng: 43.3800 } },
  { city_slug: 'van', district_slug: 'ipekyolu', coords: { lat: 38.4833, lng: 43.3833 } },
  { city_slug: 'van', district_slug: 'tusba', coords: { lat: 38.5000, lng: 43.4000 } },

  // ============================================================================
  // 19. AYDIN - Aegean region
  // ============================================================================
  { city_slug: 'aydin', coords: { lat: 37.8444, lng: 27.8458 } },
  { city_slug: 'aydin', district_slug: 'efeler', coords: { lat: 37.8500, lng: 27.8500 } },
  { city_slug: 'aydin', district_slug: 'kusadasi', coords: { lat: 37.8625, lng: 27.2594 } },
  { city_slug: 'aydin', district_slug: 'nazilli', coords: { lat: 37.9139, lng: 28.3208 } },

  // ============================================================================
  // 20. DENIZLI - Southwest
  // ============================================================================
  { city_slug: 'denizli', coords: { lat: 37.7765, lng: 29.0864 } },
  { city_slug: 'denizli', district_slug: 'pamukkale', coords: { lat: 37.7833, lng: 29.0833 } },
  { city_slug: 'denizli', district_slug: 'merkezefendi', coords: { lat: 37.7667, lng: 29.1000 } },

  // ============================================================================
  // 21. MALATYA - Eastern Anatolia
  // ============================================================================
  { city_slug: 'malatya', coords: { lat: 38.3552, lng: 38.3095 } },
  { city_slug: 'malatya', district_slug: 'battalgazi', coords: { lat: 38.3667, lng: 38.3167 } },
  { city_slug: 'malatya', district_slug: 'yesilyurt', coords: { lat: 38.3500, lng: 38.2833 } },

  // ============================================================================
  // 22. TRABZON - Black Sea coast
  // ============================================================================
  { city_slug: 'trabzon', coords: { lat: 41.0015, lng: 39.7178 } },
  { city_slug: 'trabzon', district_slug: 'ortahisar', coords: { lat: 41.0000, lng: 39.7167 } },

  // ============================================================================
  // 23. ERZURUM - Eastern Anatolia
  // ============================================================================
  { city_slug: 'erzurum', coords: { lat: 39.9000, lng: 41.2700 } },
  { city_slug: 'erzurum', district_slug: 'yakutiye', coords: { lat: 39.9000, lng: 41.2833 } },
  { city_slug: 'erzurum', district_slug: 'palandoken', coords: { lat: 39.9167, lng: 41.2667 } },

  // ============================================================================
  // 24. ELAZIG - Eastern Anatolia
  // ============================================================================
  { city_slug: 'elazig', coords: { lat: 38.6810, lng: 39.2264 } },

  // ============================================================================
  // 25. BATMAN - Southeast
  // ============================================================================
  { city_slug: 'batman', coords: { lat: 37.8812, lng: 41.1351 } },

  // ============================================================================
  // 26. SIVAS - Central Anatolia
  // ============================================================================
  { city_slug: 'sivas', coords: { lat: 39.7477, lng: 37.0179 } },

  // ============================================================================
  // 27. TEKIRDAG - Marmara/Thrace
  // ============================================================================
  { city_slug: 'tekirdag', coords: { lat: 40.9780, lng: 27.5117 } },
  { city_slug: 'tekirdag', district_slug: 'suleymanpasa', coords: { lat: 40.9833, lng: 27.5167 } },
  { city_slug: 'tekirdag', district_slug: 'corlu', coords: { lat: 41.1594, lng: 27.8000 } },

  // ============================================================================
  // 28. SAKARYA - Marmara region
  // ============================================================================
  { city_slug: 'sakarya', coords: { lat: 40.7569, lng: 30.3781 } },
  { city_slug: 'sakarya', district_slug: 'adapazari', coords: { lat: 40.7806, lng: 30.4036 } },
  { city_slug: 'sakarya', district_slug: 'serdivan', coords: { lat: 40.7667, lng: 30.3667 } },

  // ============================================================================
  // 29. KAYSERI - Central Anatolia
  // ============================================================================
  { city_slug: 'kayseri', coords: { lat: 38.7312, lng: 35.4787 } },
  { city_slug: 'kayseri', district_slug: 'kocasinan', coords: { lat: 38.7333, lng: 35.4833 } },
  { city_slug: 'kayseri', district_slug: 'melikgazi', coords: { lat: 38.7167, lng: 35.4667 } },

  // ============================================================================
  // 30. ESKISEHIR - Central Anatolia
  // ============================================================================
  { city_slug: 'eskisehir', coords: { lat: 39.7767, lng: 30.5206 } },
  { city_slug: 'eskisehir', district_slug: 'odunpazari', coords: { lat: 39.7833, lng: 30.5167 } },
  { city_slug: 'eskisehir', district_slug: 'tepebasi', coords: { lat: 39.7667, lng: 30.5333 } },
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

/**
 * Export coordinates for testing/validation
 * @internal
 */
export function __getCoordinatesForTesting(): LocationCoords[] {
  return TURKEY_COORDINATES;
}
