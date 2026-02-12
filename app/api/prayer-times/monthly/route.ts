import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

/**
 * Monthly prayer times API endpoint
 * 
 * Returns a full month of prayer times using the same source as daily endpoint
 * (DB-backed with Aladhan provider, with fallback to stale data)
 * 
 * Query params:
 * - city: City slug (required, e.g., 'izmir', 'istanbul')
 * - district: District slug (optional, e.g., 'bornova', 'karsiyaka')
 * - month: Month in YYYY-MM format (optional, defaults to current month in Europe/Istanbul)
 * 
 * Response:
 * {
 *   city: string,
 *   district: string | null,
 *   month: string,
 *   timezone: string,
 *   source: 'aladhan' | 'diyanet',
 *   is_stale: boolean,
 *   days: Array<{
 *     date: string,
 *     timings: { fajr, sunrise, dhuhr, asr, maghrib, isha },
 *     source: string,
 *     is_stale: boolean
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
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of month
    const daysInMonth = endDate.getDate();

    // Fetch prayer times for each day
    const days = [];
    let overallSource = 'aladhan';
    let hasAnyStale = false;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      try {
        const result = await getPrayerTimes({
          city_slug: city,
          district_slug: district || undefined,
          date,
        });

        days.push({
          date: result.date,
          timings: result.timings,
          source: result.source,
          is_stale: result.is_stale,
        });

        // Track overall source (use first day's source)
        if (day === 1) {
          overallSource = result.source;
        }

        if (result.is_stale) {
          hasAnyStale = true;
        }
      } catch (error) {
        console.error(`Failed to fetch prayer times for ${date}:`, error);
        
        // If one day fails, we don't want to break the whole month
        // Push a placeholder or skip
        days.push({
          date,
          timings: {
            fajr: '--:--',
            sunrise: '--:--',
            dhuhr: '--:--',
            asr: '--:--',
            maghrib: '--:--',
            isha: '--:--',
          },
          source: 'error',
          is_stale: true,
        });
        hasAnyStale = true;
      }
    }

    // Return with cache headers
    const response = NextResponse.json({
      city,
      district: district || null,
      month,
      timezone: 'Europe/Istanbul',
      source: overallSource,
      is_stale: hasAnyStale,
      days,
    });

    // Cache for 1 hour if not stale, 5 minutes if stale
    const maxAge = hasAnyStale ? 300 : 3600;
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
    );

    return response;
  } catch (error) {
    console.error('Monthly prayer times API error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch monthly prayer times',
        details: message,
      },
      { status: 500 }
    );
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
