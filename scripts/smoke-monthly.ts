#!/usr/bin/env tsx
/**
 * Monthly Prayer Times Smoke Test
 * 
 * This script verifies that:
 * 1. Monthly API endpoint returns data for the full month
 * 2. Today's data in monthly matches today's daily endpoint exactly
 * 3. Times vary by date (not constant/repeated)
 * 
 * Usage:
 *   npm run smoke:monthly
 *   BASE_URL=http://localhost:3000 npm run smoke:monthly
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_CITY = 'izmir'; // City with known coordinates
const TEST_DISTRICT = 'bornova'; // District with known coordinates

interface PrayerTimings {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface DailyResponse {
  city: string;
  district?: string;
  date: string;
  timezone: string;
  source: string;
  is_stale: boolean;
  timings: PrayerTimings;
}

interface MonthlyDayResponse {
  date: string;
  timings: PrayerTimings;
  source: string;
  is_stale: boolean;
}

interface MonthlyResponse {
  city: string;
  district: string | null;
  month: string;
  timezone: string;
  source: string;
  is_stale: boolean;
  days: MonthlyDayResponse[];
}

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
 * Get current month in Europe/Istanbul timezone (YYYY-MM)
 */
function getCurrentMonthInIstanbul(): string {
  const today = getTodayInIstanbul();
  return today.substring(0, 7); // YYYY-MM
}

/**
 * Fetch daily prayer times
 */
async function fetchDaily(city: string, district?: string): Promise<DailyResponse> {
  const params = new URLSearchParams({ city });
  if (district) params.append('district', district);
  
  const url = `${BASE_URL}/api/prayer-times?${params}`;
  console.log(`🔍 Fetching daily: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Daily API failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch monthly prayer times
 */
async function fetchMonthly(city: string, district?: string, month?: string): Promise<MonthlyResponse> {
  const params = new URLSearchParams({ city });
  if (district) params.append('district', district);
  if (month) params.append('month', month);
  
  const url = `${BASE_URL}/api/prayer-times/monthly?${params}`;
  console.log(`🔍 Fetching monthly: ${url}`);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Monthly API failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Compare two timing objects
 */
function timingsMatch(a: PrayerTimings, b: PrayerTimings): boolean {
  return (
    a.fajr === b.fajr &&
    a.sunrise === b.sunrise &&
    a.dhuhr === b.dhuhr &&
    a.asr === b.asr &&
    a.maghrib === b.maghrib &&
    a.isha === b.isha
  );
}

/**
 * Check if all days have the same times (indicating mock/constant data)
 */
function hasConstantTimes(days: MonthlyDayResponse[]): boolean {
  if (days.length === 0) return false;
  
  const firstDay = days[0].timings;
  return days.every(day => timingsMatch(day.timings, firstDay));
}

/**
 * Main test function
 */
async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  📅 MONTHLY PRAYER TIMES SMOKE TEST');
  console.log('═══════════════════════════════════════════\n');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`🏙️  Test City: ${TEST_CITY}`);
  console.log(`📍 Test District: ${TEST_DISTRICT}`);
  
  const today = getTodayInIstanbul();
  const currentMonth = getCurrentMonthInIstanbul();
  console.log(`📅 Today (Istanbul): ${today}`);
  console.log(`📅 Current Month: ${currentMonth}\n`);
  
  let allPassed = true;
  
  // Test 1: City-level monthly vs daily
  console.log('─────────────────────────────────────────────');
  console.log('TEST 1: City-level (izmir)');
  console.log('─────────────────────────────────────────────');
  
  try {
    const dailyCity = await fetchDaily(TEST_CITY);
    const monthlyCity = await fetchMonthly(TEST_CITY, undefined, currentMonth);
    
    console.log(`✓ Daily API returned: ${dailyCity.source} source`);
    console.log(`✓ Monthly API returned: ${monthlyCity.days.length} days`);
    console.log(`✓ Monthly source: ${monthlyCity.source}`);
    
    // Check if monthly has constant times
    if (hasConstantTimes(monthlyCity.days)) {
      console.log('❌ FAIL: Monthly data has CONSTANT/REPEATED times (mock data detected)');
      allPassed = false;
    } else {
      console.log('✓ Monthly data has VARYING times by date');
    }
    
    // Find today in monthly data
    const todayInMonthly = monthlyCity.days.find(day => day.date === today);
    
    if (!todayInMonthly) {
      console.log(`❌ FAIL: Today (${today}) not found in monthly data`);
      allPassed = false;
    } else {
      console.log(`✓ Today found in monthly data`);
      
      // Compare timings
      if (timingsMatch(dailyCity.timings, todayInMonthly.timings)) {
        console.log('✅ PASS: Daily and monthly timings MATCH for today');
      } else {
        console.log('❌ FAIL: Daily and monthly timings DO NOT MATCH');
        console.log('Daily:', JSON.stringify(dailyCity.timings, null, 2));
        console.log('Monthly:', JSON.stringify(todayInMonthly.timings, null, 2));
        allPassed = false;
      }
    }
  } catch (error) {
    console.log('❌ FAIL: City test threw error:', error);
    allPassed = false;
  }
  
  // Test 2: District-level monthly vs daily
  console.log('\n─────────────────────────────────────────────');
  console.log('TEST 2: District-level (izmir/bornova)');
  console.log('─────────────────────────────────────────────');
  
  try {
    const dailyDistrict = await fetchDaily(TEST_CITY, TEST_DISTRICT);
    const monthlyDistrict = await fetchMonthly(TEST_CITY, TEST_DISTRICT, currentMonth);
    
    console.log(`✓ Daily API returned: ${dailyDistrict.source} source`);
    console.log(`✓ Monthly API returned: ${monthlyDistrict.days.length} days`);
    console.log(`✓ Monthly source: ${monthlyDistrict.source}`);
    
    // Check if monthly has constant times
    if (hasConstantTimes(monthlyDistrict.days)) {
      console.log('❌ FAIL: Monthly data has CONSTANT/REPEATED times (mock data detected)');
      allPassed = false;
    } else {
      console.log('✓ Monthly data has VARYING times by date');
    }
    
    // Find today in monthly data
    const todayInMonthly = monthlyDistrict.days.find(day => day.date === today);
    
    if (!todayInMonthly) {
      console.log(`❌ FAIL: Today (${today}) not found in monthly data`);
      allPassed = false;
    } else {
      console.log(`✓ Today found in monthly data`);
      
      // Compare timings
      if (timingsMatch(dailyDistrict.timings, todayInMonthly.timings)) {
        console.log('✅ PASS: Daily and monthly timings MATCH for today');
      } else {
        console.log('❌ FAIL: Daily and monthly timings DO NOT MATCH');
        console.log('Daily:', JSON.stringify(dailyDistrict.timings, null, 2));
        console.log('Monthly:', JSON.stringify(todayInMonthly.timings, null, 2));
        allPassed = false;
      }
    }
  } catch (error) {
    console.log('❌ FAIL: District test threw error:', error);
    allPassed = false;
  }
  
  // Final summary
  console.log('\n═══════════════════════════════════════════');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED');
    console.log('═══════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('═══════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
