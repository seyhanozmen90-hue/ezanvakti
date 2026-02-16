import { NextRequest, NextResponse } from 'next/server';
import { fetchMonthlyPrayerTimes } from '@/lib/providers/aladhan-monthly';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

/**
 * Monthly prayer times API endpoint with Supabase caching
 * 
 * Returns a full month of prayer times using calendarByCity endpoint
 * with Supabase cache for faster responses
 * 
 * Query params:
 * - city: City slug (required, e.g., 'izmir', 'istanbul')
 * - district: District slug (optional - NOT SUPPORTED for monthly, city-level only)
 * - month: Month in YYYY-MM format (optional, defaults to current month in Europe/Istanbul)
 * 
 * Response:
 * {
 *   city: string,
 *   month: string,
 *   timezone: string,
 *   source: 'cache' | 'aladhan',
 *   days: Array<{
 *     date: string,
 *     timings: { fajr, sunrise, dhuhr, asr, maghrib, isha },
 *     hijri_date_short: string,
 *     hijri_date_long: string
 *   }>
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const monthParam = searchParams.get('month');

    // Validation
    if (!city) {
      return NextResponse.json(
        { error: 'city parameter is required' },
        { status: 400 }
      );
    }

    // District not supported for monthly (city-level only)
    if (district) {
      return NextResponse.json(
        { error: 'district parameter not supported for monthly endpoint (city-level only)' },
        { status: 400 }
      );
    }

    // Default to current month in Europe/Istanbul timezone
    const month = monthParam || getCurrentMonthInIstanbul();

    // Validate month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { error: 'month must be in YYYY-MM format' },
        { status: 400 }
      );
    }

    // Parse month
    const [year, monthNum] = month.split('-').map(Number);
    
    // Validate month number
    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'month must be between 01 and 12' },
        { status: 400 }
      );
    }

    // Calculate start and end dates
    const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${new Date(year, monthNum, 0).getDate()}`;

    let days: Array<{
      date: string;
      timings: {
        fajr: string;
        sunrise: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
      };
      hijri_date_short: string;
      hijri_date_long: string;
    }> = [];
    let source: 'aladhan' | 'cache' | 'aladhan-fallback' = 'aladhan';

    // STEP 1: Try Supabase cache first
    try {
      const supabase = getSupabaseServerClient();
      
      const { data: cachedData, error } = await supabase
        .from('prayer_times')
        .select('*')
        .eq('city_slug', city)
        .is('district_slug', null) // City-level only
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        console.warn('Supabase query error:', error);
      } else if (cachedData && cachedData.length >= 25) {
        // Cache hit! Return cached data
        console.log(`✅ Supabase cache HIT for ${city} ${month}: ${cachedData.length} days`);
        
        days = cachedData.map(row => ({
          date: row.date,
          timings: {
            fajr: row.fajr,
            sunrise: row.sunrise,
            dhuhr: row.dhuhr,
            asr: row.asr,
            maghrib: row.maghrib,
            isha: row.isha,
          },
          hijri_date_short: row.hijri_date_short || '',
          hijri_date_long: row.hijri_date_long || '',
        }));
        
        source = 'cache';
      } else {
        console.log(`🔍 Supabase cache MISS for ${city} ${month}: only ${cachedData?.length || 0} days, fetching from Aladhan`);
      }
    } catch (cacheError) {
      console.warn('Supabase cache check failed:', cacheError);
    }

    // STEP 2: If cache miss, fetch from Aladhan
    if (source !== 'cache') {
      const monthlyData = await fetchMonthlyPrayerTimes(city, year, monthNum);
      
      days = monthlyData.map(day => ({
        date: day.date,
        timings: day.timings,
        hijri_date_short: day.hijri_date_short || '',
        hijri_date_long: day.hijri_date_long || '',
      }));

      // STEP 3: Save to Supabase for future requests
      try {
        const supabase = getSupabaseServerClient();
        
        const rowsToInsert = monthlyData.map(day => ({
          city_slug: city,
          district_slug: null,
          date: day.date,
          fajr: day.timings.fajr,
          sunrise: day.timings.sunrise,
          dhuhr: day.timings.dhuhr,
          asr: day.timings.asr,
          maghrib: day.timings.maghrib,
          isha: day.timings.isha,
          hijri_date_short: day.hijri_date_short,
          hijri_date_long: day.hijri_date_long,
          timezone: 'Europe/Istanbul',
          source: 'aladhan',
        }));

        const { error: upsertError } = await supabase
          .from('prayer_times')
          .upsert(rowsToInsert, {
            onConflict: 'city_slug,district_slug,date',
          });

        if (upsertError) {
          console.error('Supabase upsert error:', upsertError);
          // Don't fail the request, just log the error
        } else {
          console.log(`💾 Saved ${rowsToInsert.length} days to Supabase for ${city} ${month}`);
        }
      } catch (saveError) {
        console.error('Supabase save failed:', saveError);
        // Don't fail the request
      }
    }

    // Return with cache headers
    const response = NextResponse.json({
      city,
      month,
      timezone: 'Europe/Istanbul',
      source,
      days,
    });

    // Cache for 24 hours if from cache, 1 hour if from Aladhan
    const maxAge = source === 'cache' ? 86400 : 3600;
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
    );

    return response;
  } catch (error) {
    console.error('Monthly prayer times API error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // On total failure, try to return from Aladhan directly (bypass Supabase)
    try {
      const searchParams = request.nextUrl.searchParams;
      const city = searchParams.get('city') || 'istanbul';
      const monthParam = searchParams.get('month');
      const month = monthParam || getCurrentMonthInIstanbul();
      const [year, monthNum] = month.split('-').map(Number);

      console.log('🚨 Attempting direct Aladhan fallback...');
      const monthlyData = await fetchMonthlyPrayerTimes(city, year, monthNum);
      
      const days = monthlyData.map(day => ({
        date: day.date,
        timings: day.timings,
        hijri_date_short: day.hijri_date_short || '',
        hijri_date_long: day.hijri_date_long || '',
      }));

      return NextResponse.json({
        city,
        month,
        timezone: 'Europe/Istanbul',
        source: 'aladhan-fallback',
        days,
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: 'Failed to fetch monthly prayer times',
          details: message,
        },
        { status: 500 }
      );
    }
  }
}

/**
 * Get current month in Europe/Istanbul timezone
 * Returns YYYY-MM format
 * 
 * Uses Intl.DateTimeFormat for reliable timezone conversion
 */
function getCurrentMonthInIstanbul(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;

  return `${year}-${month}`;
}
