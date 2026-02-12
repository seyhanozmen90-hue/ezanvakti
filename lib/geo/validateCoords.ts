/**
 * Coordinate validation helper
 * 
 * Used for testing and development only - NOT included in production bundle
 */

import type { LocationCoords } from './tr';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    total_locations: number;
    total_cities: number;
    total_districts: number;
    cities_with_districts: number;
  };
}

/**
 * Validate Turkey coordinates for errors and warnings
 * 
 * CHECKS:
 * - Duplicate entries (same city+district combination)
 * - Invalid lat/lng ranges (Turkey: lat 36-42, lng 26-45)
 * - Districts without corresponding city entry
 * - Very close coordinates (< 0.02 degrees difference) - warning
 * - Invalid slug format (non-lowercase, Turkish chars, spaces)
 * 
 * @param coords - Array of LocationCoords to validate
 * @returns ValidationResult with ok status, errors, and warnings
 */
export function validateTurkeyCoordinates(coords: LocationCoords[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Turkey coordinate boundaries (approximate)
  const TURKEY_LAT_MIN = 36.0;
  const TURKEY_LAT_MAX = 42.0;
  const TURKEY_LNG_MIN = 26.0;
  const TURKEY_LNG_MAX = 45.0;

  // Distance threshold for "too close" warning (degrees)
  const CLOSE_THRESHOLD = 0.02;

  // Track seen combinations
  const seen = new Set<string>();
  const cityMap = new Map<string, LocationCoords>();
  const districtMap = new Map<string, LocationCoords[]>();

  // Statistics
  let totalCities = 0;
  let totalDistricts = 0;

  // First pass: collect cities and check for duplicates
  for (const loc of coords) {
    const key = `${loc.city_slug}${loc.district_slug ? `/${loc.district_slug}` : ''}`;

    // Check for duplicates
    if (seen.has(key)) {
      errors.push(`Duplicate entry: ${key}`);
    }
    seen.add(key);

    // Validate slug format
    if (loc.city_slug !== loc.city_slug.toLowerCase()) {
      errors.push(`City slug not lowercase: ${loc.city_slug}`);
    }
    if (!/^[a-z0-9]+$/.test(loc.city_slug)) {
      errors.push(`City slug contains invalid characters: ${loc.city_slug} (use only a-z, 0-9)`);
    }

    if (loc.district_slug) {
      if (loc.district_slug !== loc.district_slug.toLowerCase()) {
        errors.push(`District slug not lowercase: ${loc.city_slug}/${loc.district_slug}`);
      }
      if (!/^[a-z0-9]+$/.test(loc.district_slug)) {
        errors.push(`District slug contains invalid characters: ${loc.city_slug}/${loc.district_slug}`);
      }
    }

    // Validate coordinates range
    const { lat, lng } = loc.coords;

    if (lat < TURKEY_LAT_MIN || lat > TURKEY_LAT_MAX) {
      errors.push(
        `Invalid latitude for ${key}: ${lat} (expected ${TURKEY_LAT_MIN}-${TURKEY_LAT_MAX})`
      );
    }

    if (lng < TURKEY_LNG_MIN || lng > TURKEY_LNG_MAX) {
      errors.push(
        `Invalid longitude for ${key}: ${lng} (expected ${TURKEY_LNG_MIN}-${TURKEY_LNG_MAX})`
      );
    }

    // Collect cities and districts
    if (!loc.district_slug) {
      cityMap.set(loc.city_slug, loc);
      totalCities++;
    } else {
      totalDistricts++;
      const existing = districtMap.get(loc.city_slug) || [];
      existing.push(loc);
      districtMap.set(loc.city_slug, existing);
    }
  }

  // Second pass: check for orphaned districts and proximity warnings
  for (const [citySlug, districts] of districtMap.entries()) {
    // Check if city exists
    const city = cityMap.get(citySlug);
    if (!city) {
      errors.push(`District(s) exist for city '${citySlug}' but city entry is missing`);
      continue;
    }

    // Check proximity for each district
    for (const district of districts) {
      const distance = Math.sqrt(
        Math.pow(district.coords.lat - city.coords.lat, 2) +
        Math.pow(district.coords.lng - city.coords.lng, 2)
      );

      if (distance < CLOSE_THRESHOLD) {
        warnings.push(
          `District ${citySlug}/${district.district_slug} is very close to city center ` +
          `(distance: ${distance.toFixed(4)}°). Prayer times may be identical. ` +
          `Consider if this district is needed.`
        );
      }
    }
  }

  // Check for cities without districts (info warning)
  const citiesWithDistricts = districtMap.size;
  const citiesWithoutDistricts = totalCities - citiesWithDistricts;
  
  if (citiesWithoutDistricts > totalCities * 0.5) {
    warnings.push(
      `${citiesWithoutDistricts} cities have no districts defined. ` +
      `Consider adding major districts for better coverage.`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      total_locations: coords.length,
      total_cities: totalCities,
      total_districts: totalDistricts,
      cities_with_districts: citiesWithDistricts,
    },
  };
}

/**
 * Print validation results to console
 */
export function printValidationResults(result: ValidationResult): void {
  console.log('\n📊 COORDINATE VALIDATION RESULTS\n');
  console.log('='.repeat(80));
  
  // Statistics
  console.log('\n📈 Statistics:');
  console.log(`  Total Locations: ${result.stats.total_locations}`);
  console.log(`  Cities: ${result.stats.total_cities}`);
  console.log(`  Districts: ${result.stats.total_districts}`);
  console.log(`  Cities with districts: ${result.stats.cities_with_districts}`);

  // Errors
  if (result.errors.length > 0) {
    console.log(`\n❌ Errors (${result.errors.length}):`);
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ No errors found!');
  }

  // Warnings
  if (result.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  } else {
    console.log('\n✅ No warnings!');
  }

  console.log('\n' + '='.repeat(80));

  if (result.ok) {
    console.log('✅ Validation PASSED');
  } else {
    console.log('❌ Validation FAILED');
  }
  console.log('');
}
