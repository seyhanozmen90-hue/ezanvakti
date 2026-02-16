#!/usr/bin/env tsx
/**
 * Test Aladhan Monthly API
 * 
 * This script tests the new calendarByCity endpoint
 * to ensure it works for all major cities
 */

import { fetchMonthlyPrayerTimes } from '../lib/providers/aladhan-monthly';

const TEST_CITIES = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana'];

async function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  📅 ALADHAN MONTHLY API TEST');
  console.log('═══════════════════════════════════════════\n');
  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  
  console.log(`Testing for: ${year}-${month.toString().padStart(2, '0')}\n`);
  
  let allPassed = true;
  
  for (const city of TEST_CITIES) {
    console.log(`─────────────────────────────────────────────`);
    console.log(`Testing: ${city}`);
    console.log(`─────────────────────────────────────────────`);
    
    try {
      const start = Date.now();
      const data = await fetchMonthlyPrayerTimes(city, year, month);
      const elapsed = Date.now() - start;
      
      if (data.length === 0) {
        console.log(`❌ FAIL: No data returned`);
        allPassed = false;
        continue;
      }
      
      console.log(`✅ PASS: Received ${data.length} days in ${elapsed}ms`);
      
      // Show first day as sample
      const firstDay = data[0];
      console.log(`   Sample (${firstDay.date}):`);
      console.log(`   - Fajr: ${firstDay.timings.fajr}`);
      console.log(`   - Dhuhr: ${firstDay.timings.dhuhr}`);
      console.log(`   - Maghrib: ${firstDay.timings.maghrib}`);
      
      // Verify times are varying (not all the same)
      const uniqueFajrTimes = new Set(data.map(d => d.timings.fajr));
      if (uniqueFajrTimes.size === 1) {
        console.log(`   ⚠️  WARNING: All Fajr times are identical (${Array.from(uniqueFajrTimes)[0]})`);
      } else {
        console.log(`   ✓ Times vary across days (${uniqueFajrTimes.size} unique Fajr times)`);
      }
      
    } catch (error) {
      console.log(`❌ FAIL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      allPassed = false;
    }
    
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════');
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

main().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});
