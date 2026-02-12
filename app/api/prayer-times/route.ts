import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { getTodayPrayerTimes } from '@/lib/api';
import { getCityBySlug, getDistrictBySlug } from '@/lib/cities-helper';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

/**
 * Public API endpoint for prayer times
 * 
 * Returns DB-backed prayer times with caching and fallback
 * 
 * Query params:
 * - city: City slug (required, e.g., 'izmir', 'istanbul')
 * - district: District slug (optional, e.g., 'bornova', 'karsiyaka')
 * - date: Date in YYYY-MM-DD format (optional, defaults to today in Europe/Istanbul)
 * 
 * Response:
 * {
 *   city: string,
 *   district: string | null,
 *   date: string,
 *   timezone: string,
 *   source: 'aladhan' | 'diyanet',
 *   is_stale: boolean,
 *   timings: {
 *     fajr: string,
 *     sunrise: string,
 *     dhuhr: string,
 *     asr: string,
 *     maghrib: string,
 *     isha: string
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const district = searchParams.get('district');
    const dateParam = searchParams.get('date');

    // Validation
    if (!city) {
      return NextResponse.json(
        { error: 'city parameter is required' },
        { status: 400 }
      );
    }

    // Default to today in Europe/Istanbul timezone
    const date = dateParam || getTodayInIstanbul();

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Get prayer times from service (DB-backed with provider fallback)
    const result = await getPrayerTimes({
      city_slug: city,
      district_slug: district || undefined,
      date,
    });

    // Return with cache headers
    const response = NextResponse.json({
      city: result.city_slug,
      district: result.district_slug,
      date: result.date,
      timezone: result.timezone,
      source: result.source,
      is_stale: result.is_stale,
      timings: result.timings,
    });

    // Cache for 1 hour if not stale, 5 minutes if stale
    const maxAge = result.is_stale ? 300 : 3600;
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
    );

    return response;
  } catch (error) {
    console.error('Prayer times API error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    // Check if error is due to missing coordinates
    const isMissingCoords = 
      message.includes('Unknown city') || 
      message.includes('Unknown district') || 
      message.includes('Coordinates not found') ||
      message.includes('No prayer times available');

    if (isMissingCoords) {
      // Fallback to legacy Diyanet API
      try {
        console.log('⚠️ Coordinates missing, falling back to Diyanet API');
        
        const searchParams = request.nextUrl.searchParams;
        const citySlug = searchParams.get('city')!;
        const districtSlug = searchParams.get('district');
        const dateParam = searchParams.get('date');
        const date = dateParam || getTodayInIstanbul();

        // Get city and district info
        let cityId: string | undefined;
        let districtId: string | undefined;

        if (districtSlug) {
          const result = getDistrictBySlug(citySlug, districtSlug);
          if (result) {
            cityId = result.city.id;
            districtId = result.district.id;
          }
        } else {
          const city = getCityBySlug(citySlug);
          if (city) {
            cityId = city.id;
          }
        }

        if (!cityId) {
          throw new Error('City not found in cities database');
        }

        // Fetch from legacy Diyanet API
        const legacyTimes = await getTodayPrayerTimes(cityId, districtId);

        if (!legacyTimes) {
          throw new Error('No data from legacy Diyanet API');
        }

        // Return in standardized format
        const response = NextResponse.json({
          city: citySlug,
          district: districtSlug || null,
          date: date,
          timezone: 'Europe/Istanbul',
          source: 'diyanet',
          is_stale: false,
          timings: {
            fajr: legacyTimes.imsak,
            sunrise: legacyTimes.gunes,
            dhuhr: legacyTimes.ogle,
            asr: legacyTimes.ikindi,
            maghrib: legacyTimes.aksam,
            isha: legacyTimes.yatsi,
          },
        });

        // Cache for 1 hour
        response.headers.set(
          'Cache-Control',
          'public, s-maxage=3600, stale-while-revalidate=7200'
        );

        return response;
      } catch (fallbackError) {
        console.error('Legacy Diyanet API fallback failed:', fallbackError);
        
        return NextResponse.json(
          {
            error: 'Failed to fetch prayer times',
            details: 'Both modern and legacy systems failed',
          },
          { status: 500 }
        );
      }
    }

    // For other errors, return 500
    return NextResponse.json(
      {
        error: 'Failed to fetch prayer times',
        details: message,
      },
      { status: 500 }
    );
  }
}

/**
 * Get today's date in Europe/Istanbul timezone
 * Returns YYYY-MM-DD format
 * 
 * Uses Intl.DateTimeFormat for reliable timezone conversion
 */
function getTodayInIstanbul(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // en-CA locale gives YYYY-MM-DD format directly
  return formatter.format(new Date());
}
