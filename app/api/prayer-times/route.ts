import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';

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
 */
function getTodayInIstanbul(): string {
  const now = new Date();
  const istanbulTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })
  );

  const year = istanbulTime.getFullYear();
  const month = String(istanbulTime.getMonth() + 1).padStart(2, '0');
  const day = String(istanbulTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
