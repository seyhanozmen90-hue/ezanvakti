import { getPrayerTimesFromDb, getLastKnownPrayerTimes, upsertPrayerTimes } from '../db/prayerTimesDb';
import { PrayerTimeRecord } from '../db/types';
import { getActiveProvider } from '../providers';
import { getCoords } from '../geo/tr';
import { lockManager } from './lockManager';

/**
 * Prayer Times Service
 * 
 * IMPORTANT RULES:
 * 1. district_slug is ALWAYS used together with city_slug (never alone)
 * 2. Cache key format: prayer:${city_slug}:${district_slug ?? 'city'}:${date}
 * 3. District queries NEVER fall back to city-level data
 * 4. Each city/district combination has its own coordinates and cache
 */

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
  /** true ise DB atlanır, doğrudan provider'dan çekilir (örn. İkindi Shafi düzeltmesi sonrası eski cache bypass) */
  skipCache?: boolean;
}

/**
 * Get prayer times with DB caching and provider fallback
 * 
 * Params:
 * - city_slug: Always required (e.g., 'izmir', 'istanbul')
 * - district_slug: Optional, but when provided, queries city+district combination
 * - date: Required in YYYY-MM-DD format
 * 
 * Flow:
 * 1. Try to get from DB (exact city+district match)
 * 2. If not found, acquire lock (key: prayer:city:district:date)
 * 3. Fetch from provider using coordinates (city+district combo)
 * 4. Upsert to DB with exact city+district
 * 5. If provider fails, return last known data (NO fallback to city if district requested)
 * 6. If no data at all, throw error
 */
export async function getPrayerTimes(
  params: GetPrayerTimesParams
): Promise<PrayerTimesResult> {
  const { city_slug, district_slug, date, skipCache } = params;

  // Validation: district_slug must always be used with city_slug
  if (district_slug && !city_slug) {
    throw new Error('district_slug cannot be used without city_slug');
  }

  // Step 1: Try DB first (skipCache ile şehir sayfası her zaman güncel İkindi/Shafi alır)
  if (!skipCache) {
    const cached = await getPrayerTimesFromDb({
      city_slug,
      district_slug,
      date,
    });
    if (cached) {
      return recordToResult(cached, false);
    }
  }

  // Step 2: Not in DB, need to fetch from provider
  // Acquire lock to prevent stampede
  // Lock key format: prayer:city_slug:district_slug_or_city:date
  const lockKey = `prayer:${city_slug}:${district_slug ?? 'city'}:${date}`;
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
 * 
 * IMPORTANT: If district_slug is provided, ONLY returns district-level data.
 * Never falls back to city-level data when district is specified.
 */
async function getFallback(
  city_slug: string,
  district_slug: string | undefined,
  date: string
): Promise<PrayerTimesResult> {
  // Query with exact city_slug + district_slug combination
  // This ensures district queries don't fall back to city data
  const lastKnown = await getLastKnownPrayerTimes(city_slug, district_slug);

  if (!lastKnown) {
    const locationStr = district_slug 
      ? `${city_slug}/${district_slug}` 
      : city_slug;
    
    throw new Error(
      `No prayer times available for ${locationStr} on ${date}. ` +
      `Provider is down and no cached data exists for this specific location.`
    );
  }

  const locationStr = district_slug 
    ? `${city_slug}/${district_slug}` 
    : city_slug;

  console.warn(
    `Using stale data for ${locationStr} ` +
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
