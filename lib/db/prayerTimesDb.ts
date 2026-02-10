import { getSupabaseServerClient } from '../supabase/server';
import { PrayerTimeRecord, PrayerTimeInsert, PrayerTimeQuery } from './types';

/**
 * Get prayer times from database
 */
export async function getPrayerTimesFromDb(
  params: PrayerTimeQuery
): Promise<PrayerTimeRecord | null> {
  try {
    const supabase = getSupabaseServerClient();

    // Build query with all filters BEFORE calling maybeSingle
    let query = supabase
      .from('prayer_times')
      .select('*')
      .eq('city_slug', params.city_slug)
      .eq('date', params.date);

    // Handle district_slug: match null if not provided, or exact match
    if (params.district_slug) {
      query = query.eq('district_slug', params.district_slug);
    } else {
      query = query.is('district_slug', null);
    }

    // Call maybeSingle at the end (returns null if no rows, no error)
    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching prayer times from DB:', error);
    throw error;
  }
}

/**
 * Get last known prayer times for fallback
 */
export async function getLastKnownPrayerTimes(
  city_slug: string,
  district_slug?: string
): Promise<PrayerTimeRecord | null> {
  try {
    const supabase = getSupabaseServerClient();

    // Build query with all filters BEFORE calling maybeSingle
    let query = supabase
      .from('prayer_times')
      .select('*')
      .eq('city_slug', city_slug)
      .order('date', { ascending: false })
      .order('fetched_at', { ascending: false })
      .limit(1);

    // Handle district_slug
    if (district_slug) {
      query = query.eq('district_slug', district_slug);
    } else {
      query = query.is('district_slug', null);
    }

    // Call maybeSingle at the end
    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching last known prayer times:', error);
    return null;
  }
}

/**
 * Upsert prayer times into database
 */
export async function upsertPrayerTimes(
  data: PrayerTimeInsert
): Promise<PrayerTimeRecord> {
  try {
    const supabase = getSupabaseServerClient();

    const insertData = {
      city_slug: data.city_slug,
      district_slug: data.district_slug || null,
      date: data.date,
      fajr: data.fajr,
      sunrise: data.sunrise,
      dhuhr: data.dhuhr,
      asr: data.asr,
      maghrib: data.maghrib,
      isha: data.isha,
      timezone: data.timezone || 'Europe/Istanbul',
      source: data.source,
      fetched_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('prayer_times')
      .upsert(insertData, {
        onConflict: 'city_slug,district_slug,date',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!result) {
      throw new Error('Upsert returned no data');
    }

    return result as PrayerTimeRecord;
  } catch (error) {
    console.error('Error upserting prayer times:', error);
    throw error;
  }
}

/**
 * Get all cities that need refresh (for cron job)
 */
export async function getCitiesNeedingRefresh(
  targetDate: string
): Promise<Array<{ city_slug: string; district_slug: string | null }>> {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('prayer_times')
      .select('city_slug, district_slug')
      .lt('date', targetDate)
      .order('city_slug')
      .order('district_slug');

    if (error) {
      throw error;
    }

    // Remove duplicates
    const unique = Array.from(
      new Set(data.map((item) => JSON.stringify(item)))
    ).map((item) => JSON.parse(item));

    return unique;
  } catch (error) {
    console.error('Error getting cities needing refresh:', error);
    return [];
  }
}
