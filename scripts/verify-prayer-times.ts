#!/usr/bin/env tsx

/**
 * Prayer Times Smoke Test
 * 
 * Tests /api/prayer-times endpoint for all cities and districts in lib/geo/tr.ts
 * 
 * Usage:
 *   npm run verify:prayer
 * 
 * Environment:
 *   BASE_URL - API base URL (default: http://localhost:3000)
 */

import { getAvailableCities, getAvailableDistricts, getCoords } from '../lib/geo/tr';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT_MS = 10000; // 10 seconds per request

// ============================================================================
// Types
// ============================================================================

interface TestResult {
  city: string;
  district: string | null;
  date: string;
  lat: number;
  lng: number;
  source?: string;
  fajr?: string;
  sunrise?: string;
  dhuhr?: string;
  asr?: string;
  maghrib?: string;
  isha?: string;
  error?: string;
  status?: number;
}

interface ApiResponse {
  city: string;
  district?: string | null;
  date: string;
  timezone: string;
  source: string;
  is_stale?: boolean;
  timings: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Get today's date in Europe/Istanbul timezone (YYYY-MM-DD)
 */
function getTodayInIstanbul(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Test a single city or district
 */
async function testLocation(
  city: string,
  district: string | null,
  date: string
): Promise<TestResult> {
  const coords = getCoords(city, district || undefined);
  
  // Build URL
  const params = new URLSearchParams({
    city,
    date,
  });
  if (district) {
    params.set('district', district);
  }
  const url = `${BASE_URL}/api/prayer-times?${params.toString()}`;

  const result: TestResult = {
    city,
    district,
    date,
    lat: coords.lat,
    lng: coords.lng,
  };

  try {
    const response = await fetchWithTimeout(url, TIMEOUT_MS);
    result.status = response.status;

    if (!response.ok) {
      const errorText = await response.text();
      result.error = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
      return result;
    }

    const data: ApiResponse = await response.json();
    
    // Extract timings
    result.source = data.source;
    result.fajr = data.timings.fajr;
    result.sunrise = data.timings.sunrise;
    result.dhuhr = data.timings.dhuhr;
    result.asr = data.timings.asr;
    result.maghrib = data.timings.maghrib;
    result.isha = data.timings.isha;

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    return result;
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🕌 Prayer Times Smoke Test\n');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📅 Date: ${getTodayInIstanbul()} (Europe/Istanbul)\n`);

  const today = getTodayInIstanbul();
  const results: TestResult[] = [];
  
  // Get all cities and districts
  const cities = getAvailableCities();
  
  let totalRequests = 0;
  let errorCount = 0;

  // Test all cities (without district)
  console.log('🏙️  Testing cities...');
  for (const city of cities) {
    totalRequests++;
    process.stdout.write(`  ${city}... `);
    
    const result = await testLocation(city, null, today);
    results.push(result);
    
    if (result.error) {
      errorCount++;
      console.log(`❌ ${result.error}`);
    } else {
      console.log(`✅ ${result.source} (${result.fajr} - ${result.isha})`);
    }
  }

  console.log('');

  // Test all districts for each city
  console.log('🏘️  Testing districts...');
  for (const city of cities) {
    const districts = getAvailableDistricts(city);
    
    if (districts.length === 0) {
      continue;
    }

    console.log(`\n  ${city} (${districts.length} districts):`);
    
    for (const district of districts) {
      totalRequests++;
      process.stdout.write(`    ${district}... `);
      
      const result = await testLocation(city, district, today);
      results.push(result);
      
      if (result.error) {
        errorCount++;
        console.log(`❌ ${result.error}`);
      } else {
        console.log(`✅ ${result.source} (${result.fajr} - ${result.isha})`);
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`Successful: ${totalRequests - errorCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('');

  // Print detailed results table
  console.log('📋 DETAILED RESULTS\n');
  
  // Prepare table data
  const tableData = results.map(r => ({
    City: r.city,
    District: r.district || '-',
    Date: r.date,
    Coords: `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`,
    Source: r.source || '-',
    Fajr: r.fajr || '-',
    Sunrise: r.sunrise || '-',
    Dhuhr: r.dhuhr || '-',
    Asr: r.asr || '-',
    Maghrib: r.maghrib || '-',
    Isha: r.isha || '-',
    Error: r.error ? r.error.substring(0, 50) : '-',
  }));

  console.table(tableData);

  // Exit with error code if there were failures
  if (errorCount > 0) {
    console.error(`\n❌ ${errorCount} test(s) failed`);
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
