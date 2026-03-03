import { getPrayerTimesFromDb, getLastKnownPrayerTimes, upsertPrayerTimes } from '../db/prayerTimesDb';
import { PrayerTimeRecord } from '../db/types';
import { getActiveProvider, aladhanProvider, diyanetProvider } from '../providers';
import { getCoords, hasCoordsExist } from '../geo/tr';
import { getDiyanetDistrictId } from '../cities-helper';
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

  // Step 3: Fetch from provider — Diyanet önce, başarısızsa Aladhan (koordinat varsa), son çare fallback
  try {
    const diyanetId = getDiyanetDistrictId(city_slug, district_slug ?? undefined);
    const hasCoords = hasCoordsExist(city_slug, district_slug);
    let providerResult: Awaited<ReturnType<typeof diyanetProvider.fetchTimings>> | null = null;
    let source: 'aladhan' | 'diyanet' = 'aladhan';

    if (diyanetId) {
      const diyanetParams = { date, timezone: 'Europe/Istanbul' as const, diyanetDistrictId: diyanetId };
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          providerResult = await diyanetProvider.fetchTimings(diyanetParams);
          source = 'diyanet';
          break;
        } catch (diyanetError) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1500 * attempt));
          } else {
            console.warn('Diyanet failed after 3 attempts, trying Aladhan:', diyanetError instanceof Error ? diyanetError.message : diyanetError);
          }
        }
      }
    }

    if (!providerResult && hasCoords) {
      try {
        providerResult = await aladhanProvider.fetchTimings({
          coords: getCoords(city_slug, district_slug),
          date,
          timezone: 'Europe/Istanbul',
        });
        source = 'aladhan';
      } catch (aladhanError) {
        console.warn('Aladhan failed:', aladhanError instanceof Error ? aladhanError.message : aladhanError);
      }
    }

    if (providerResult) {
      const insertPayload = {
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
        source,
      };

      let record: PrayerTimeRecord;
      try {
        record = await upsertPrayerTimes(insertPayload);
      } catch (dbError) {
        record = { ...insertPayload, fetched_at: new Date().toISOString() } as PrayerTimeRecord;
      }
      return recordToResult(record, false);
    }

    return await getFallback(city_slug, district_slug, date);
  } catch (error) {
    console.error('Provider fetch failed, using fallback', error);
    return await getFallback(city_slug, district_slug, date);
  } finally {
    // Always release lock
    await lockManager.release(lockKey);
  }
}

/**
 * Get fallback data from DB (last known prayer times).
 * Sadece istenen tarih ile cache tarihi aynıysa döner; farklı tarih dönmemek için.
 */
async function getFallback(
  city_slug: string,
  district_slug: string | undefined,
  date: string
): Promise<PrayerTimesResult> {
  const lastKnown = await getLastKnownPrayerTimes(city_slug, district_slug);

  if (!lastKnown) {
    const locationStr = district_slug ? `${city_slug}/${district_slug}` : city_slug;
    throw new Error(
      `No prayer times available for ${locationStr} on ${date}. ` +
      `Provider is down and no cached data exists for this specific location.`
    );
  }

  if (lastKnown.date !== date) {
    const locationStr = district_slug ? `${city_slug}/${district_slug}` : city_slug;
    throw new Error(
      `No prayer times for ${locationStr} on ${date}. ` +
      `Cached data is for ${lastKnown.date}; providers unavailable.`
    );
  }

  console.warn(`Using stale cache for ${city_slug} (${date})`);
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
    const diyanetId = getDiyanetDistrictId(city_slug, district_slug ?? undefined);
    const provider = diyanetId ? diyanetProvider : getActiveProvider();
    const isDiyanet = !!diyanetId;

    const providerResult = isDiyanet
      ? await provider.fetchTimings({
          date,
          timezone: 'Europe/Istanbul',
          diyanetDistrictId: diyanetId!,
        })
      : await provider.fetchTimings({
          coords: getCoords(city_slug, district_slug),
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
      source: isDiyanet ? 'diyanet' : (provider.name as 'aladhan' | 'diyanet'),
    });

    return recordToResult(record, false);
  } catch (error) {
    console.error('Refresh failed', error);
    throw error;
  }
}
