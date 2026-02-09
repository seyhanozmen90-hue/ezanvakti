import { getPrayerTimesFromDb, getLastKnownPrayerTimes, upsertPrayerTimes } from '../db/prayerTimesDb';
import { PrayerTimeRecord } from '../db/types';
import { getActiveProvider } from '../providers';
import { getCoords } from '../geo/tr';
import { lockManager } from './lockManager';

export interface PrayerTimesResult {
  city_slug: string;
  district_slug: string | null;
  date: string;
  timezone: string;
  source: 'aladhan' | 'diyanet';
  is_stale: boolean;
  timings: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

export interface GetPrayerTimesParams {
  city_slug: string;
  district_slug?: string;
  date: string; // YYYY-MM-DD
}

/**
 * Get prayer times with DB caching and provider fallback
 * 
 * Flow:
 * 1. Try to get from DB
 * 2. If not found, acquire lock
 * 3. Fetch from provider and upsert to DB
 * 4. If provider fails, return last known data from DB (stale)
 * 5. If no data at all, throw error
 */
export async function getPrayerTimes(
  params: GetPrayerTimesParams
): Promise<PrayerTimesResult> {
  const { city_slug, district_slug, date } = params;

  // Step 1: Try DB first
  const cached = await getPrayerTimesFromDb({
    city_slug,
    district_slug,
    date,
  });

  if (cached) {
    return recordToResult(cached, false);
  }

  // Step 2: Not in DB, need to fetch from provider
  // Acquire lock to prevent stampede
  const lockKey = `prayer-times:${city_slug}:${district_slug || 'city'}:${date}`;
  const lockAcquired = await lockManager.tryAcquire(lockKey, 10000);

  if (!lockAcquired) {
    // Another request is fetching, wait for it
    try {
      await lockManager.waitForRelease(lockKey, 8000);
      
      // Check DB again after lock released
      const afterWait = await getPrayerTimesFromDb({
        city_slug,
        district_slug,
        date,
      });

      if (afterWait) {
        return recordToResult(afterWait, false);
      }
    } catch (error) {
      console.warn('Lock wait timeout, continuing with fallback', error);
    }

    // Lock wait failed or still no data, try fallback
    return await getFallback(city_slug, district_slug, date);
  }

  // Step 3: We have the lock, fetch from provider
  try {
    const provider = getActiveProvider();
    
    // Get coordinates
    const coords = getCoords(city_slug, district_slug);

    // Fetch from provider
    const providerResult = await provider.fetchTimings({
      coords,
      date,
      timezone: 'Europe/Istanbul',
    });

    // Upsert to DB
    const record = await upsertPrayerTimes({
      city_slug,
      district_slug: district_slug || null,
      date,
      fajr: providerResult.timings.fajr,
      sunrise: providerResult.timings.sunrise,
      dhuhr: providerResult.timings.dhuhr,
      asr: providerResult.timings.asr,
      maghrib: providerResult.timings.maghrib,
      isha: providerResult.timings.isha,
      timezone: providerResult.timezone,
      source: provider.name as 'aladhan' | 'diyanet',
    });

    return recordToResult(record, false);
  } catch (error) {
    console.error('Provider fetch failed, using fallback', error);
    
    // Step 4: Provider failed, try fallback
    return await getFallback(city_slug, district_slug, date);
  } finally {
    // Always release lock
    await lockManager.release(lockKey);
  }
}

/**
 * Get fallback data from DB (last known prayer times)
 */
async function getFallback(
  city_slug: string,
  district_slug: string | undefined,
  date: string
): Promise<PrayerTimesResult> {
  const lastKnown = await getLastKnownPrayerTimes(city_slug, district_slug);

  if (!lastKnown) {
    throw new Error(
      `No prayer times available for ${city_slug}${district_slug ? `/${district_slug}` : ''} on ${date}. ` +
      `Provider is down and no cached data exists.`
    );
  }

  console.warn(
    `Using stale data for ${city_slug}${district_slug ? `/${district_slug}` : ''} ` +
    `(requested: ${date}, using: ${lastKnown.date})`
  );

  return recordToResult(lastKnown, true);
}

/**
 * Convert DB record to result format
 */
function recordToResult(
  record: PrayerTimeRecord,
  is_stale: boolean
): PrayerTimesResult {
  return {
    city_slug: record.city_slug,
    district_slug: record.district_slug,
    date: record.date,
    timezone: record.timezone,
    source: record.source,
    is_stale,
    timings: {
      fajr: record.fajr,
      sunrise: record.sunrise,
      dhuhr: record.dhuhr,
      asr: record.asr,
      maghrib: record.maghrib,
      isha: record.isha,
    },
  };
}

/**
 * Refresh prayer times for a specific location and date
 * Forces a fetch from provider even if data exists in DB
 * Used by cron jobs
 */
export async function refreshPrayerTimes(
  params: GetPrayerTimesParams
): Promise<PrayerTimesResult> {
  const { city_slug, district_slug, date } = params;

  try {
    const provider = getActiveProvider();
    const coords = getCoords(city_slug, district_slug);

    const providerResult = await provider.fetchTimings({
      coords,
      date,
      timezone: 'Europe/Istanbul',
    });

    const record = await upsertPrayerTimes({
      city_slug,
      district_slug: district_slug || null,
      date,
      fajr: providerResult.timings.fajr,
      sunrise: providerResult.timings.sunrise,
      dhuhr: providerResult.timings.dhuhr,
      asr: providerResult.timings.asr,
      maghrib: providerResult.timings.maghrib,
      isha: providerResult.timings.isha,
      timezone: providerResult.timezone,
      source: provider.name as 'aladhan' | 'diyanet',
    });

    return recordToResult(record, false);
  } catch (error) {
    console.error('Refresh failed', error);
    throw error;
  }
}
