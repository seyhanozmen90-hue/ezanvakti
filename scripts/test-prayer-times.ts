#!/usr/bin/env tsx

/**
 * Comprehensive Prayer Times Test Suite
 * 
 * Tests:
 * 1. Coordinate validation (structure, duplicates, ranges)
 * 2. API endpoint smoke tests (all cities + sample districts)
 * 3. Response format validation
 * 
 * Usage:
 *   npm run test:prayer
 * 
 * Environment:
 *   BASE_URL - API base URL (default: http://localhost:3000)
 */

import { __getCoordinatesForTesting, getAvailableCities, getAvailableDistricts } from '../lib/geo/tr';
import { validateTurkeyCoordinates, printValidationResults } from '../lib/geo/validateCoords';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT_MS = 10000; // 10 seconds per request
const MAX_DISTRICTS_PER_CITY = 3; // Test first 3 districts of each city

// ============================================================================
// Types
// ============================================================================

interface ApiTestResult {
  location: string; // "city" or "city/district"
  city: string;
  district: string | null;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  source?: string;
  fajr?: string;
  maghrib?: string;
  error?: string;
}

interface TestSummary {
  validation: {
    passed: boolean;
    errors: number;
    warnings: number;
  };
  api: {
    total: number;
    passed: number;
    failed: number;
  };
}

// ============================================================================
// API Testing Functions
// ============================================================================

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
 * Test a single API call
 */
async function testApiCall(city: string, district: string | null): Promise<ApiTestResult> {
  const location = district ? `${city}/${district}` : city;
  
  // Build URL
  const params = new URLSearchParams({ city });
  if (district) {
    params.set('district', district);
  }
  const url = `${BASE_URL}/api/prayer-times?${params.toString()}`;

  try {
    const response = await fetchWithTimeout(url, TIMEOUT_MS);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        location,
        city,
        district,
        status: 'FAIL',
        statusCode: response.status,
        error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
      };
    }

    const data = await response.json();

    // Validate response structure
    if (!data.timings || !data.source || !data.date) {
      return {
        location,
        city,
        district,
        status: 'FAIL',
        statusCode: 200,
        error: 'Invalid response structure',
      };
    }

    return {
      location,
      city,
      district,
      status: 'PASS',
      statusCode: 200,
      source: data.source,
      fajr: data.timings.fajr,
      maghrib: data.timings.maghrib,
    };
  } catch (error) {
    return {
      location,
      city,
      district,
      status: 'FAIL',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Main Test Suite
// ============================================================================

async function main() {
  console.log('🧪 Prayer Times Comprehensive Test Suite\n');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  const summary: TestSummary = {
    validation: { passed: false, errors: 0, warnings: 0 },
    api: { total: 0, passed: 0, failed: 0 },
  };

  // ========================================================================
  // PHASE 1: Coordinate Validation
  // ========================================================================
  console.log('=' .repeat(80));
  console.log('PHASE 1: COORDINATE VALIDATION');
  console.log('='.repeat(80));

  const coords = __getCoordinatesForTesting();
  const validationResult = validateTurkeyCoordinates(coords);
  
  printValidationResults(validationResult);

  summary.validation.passed = validationResult.ok;
  summary.validation.errors = validationResult.errors.length;
  summary.validation.warnings = validationResult.warnings.length;

  // If validation fails, exit
  if (!validationResult.ok) {
    console.error('\n❌ Coordinate validation failed. Fix errors before API testing.\n');
    process.exit(1);
  }

  // ========================================================================
  // PHASE 2: API Smoke Tests
  // ========================================================================
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 2: API SMOKE TESTS');
  console.log('='.repeat(80));
  console.log('');

  const results: ApiTestResult[] = [];
  const cities = getAvailableCities();

  // Test all cities
  console.log('🏙️  Testing cities...\n');
  for (const city of cities) {
    process.stdout.write(`  ${city.padEnd(20)}... `);
    
    const result = await testApiCall(city, null);
    results.push(result);
    summary.api.total++;

    if (result.status === 'PASS') {
      summary.api.passed++;
      console.log(`✅ ${result.source} (${result.fajr} → ${result.maghrib})`);
    } else {
      summary.api.failed++;
      console.log(`❌ ${result.error}`);
    }
  }

  // Test sample districts for each city
  console.log('\n🏘️  Testing sample districts...\n');
  for (const city of cities) {
    const districts = getAvailableDistricts(city);
    
    if (districts.length === 0) {
      continue;
    }

    // Test first N districts
    const testDistricts = districts.slice(0, MAX_DISTRICTS_PER_CITY);
    
    console.log(`  ${city} (${testDistricts.length}/${districts.length} districts):`);
    
    for (const district of testDistricts) {
      process.stdout.write(`    ${district.padEnd(18)}... `);
      
      const result = await testApiCall(city, district);
      results.push(result);
      summary.api.total++;

      if (result.status === 'PASS') {
        summary.api.passed++;
        console.log(`✅ ${result.source} (${result.fajr} → ${result.maghrib})`);
      } else {
        summary.api.failed++;
        console.log(`❌ ${result.error}`);
      }
    }
    console.log('');
  }

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  console.log('='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  // Validation summary
  console.log('🔍 Coordinate Validation:');
  console.log(`  Status: ${summary.validation.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Errors: ${summary.validation.errors}`);
  console.log(`  Warnings: ${summary.validation.warnings}`);
  console.log('');

  // API summary
  console.log('🌐 API Tests:');
  console.log(`  Total Requests: ${summary.api.total}`);
  console.log(`  Passed: ${summary.api.passed} ✅`);
  console.log(`  Failed: ${summary.api.failed} ❌`);
  console.log(`  Success Rate: ${((summary.api.passed / summary.api.total) * 100).toFixed(1)}%`);
  console.log('');

  // Detailed results table (only failures)
  if (summary.api.failed > 0) {
    console.log('❌ Failed Tests:');
    console.log('');
    
    const failures = results.filter(r => r.status === 'FAIL');
    console.table(failures.map(f => ({
      Location: f.location,
      Status: f.statusCode || '-',
      Error: (f.error || '').substring(0, 60),
    })));
    console.log('');
  }

  // Source breakdown
  const sourceBreakdown = results
    .filter(r => r.status === 'PASS' && r.source)
    .reduce((acc, r) => {
      acc[r.source!] = (acc[r.source!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  if (Object.keys(sourceBreakdown).length > 0) {
    console.log('📈 Data Sources:');
    Object.entries(sourceBreakdown).forEach(([source, count]) => {
      const percentage = ((count / summary.api.passed) * 100).toFixed(1);
      console.log(`  ${source}: ${count} (${percentage}%)`);
    });
    console.log('');
  }

  // Exit with appropriate code
  const allPassed = summary.validation.passed && summary.api.failed === 0;
  
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log(`❌ TESTS FAILED: ${summary.validation.errors} validation errors, ${summary.api.failed} API failures\n`);
    process.exit(1);
  }
}

// Run tests
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
