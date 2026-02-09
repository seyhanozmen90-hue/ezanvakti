import { NextRequest, NextResponse } from 'next/server';
import { refreshPrayerTimes } from '@/lib/services/prayerTimesService';
import { getAvailableCities, getAvailableDistricts } from '@/lib/geo/tr';

/**
 * Admin endpoint to refresh prayer times
 * 
 * Protected by secret token (X-Admin-Token header or token query param)
 * 
 * Usage:
 * POST /api/admin/refresh?token=YOUR_SECRET
 * 
 * Body (optional):
 * {
 *   cities: ['izmir', 'istanbul'],  // optional, defaults to all available cities
 *   date: '2026-02-10',             // optional, defaults to today
 *   includeDistricts: true          // optional, defaults to false
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   refreshed: 5,
 *   failed: 1,
 *   results: [...]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const token =
      request.headers.get('x-admin-token') ||
      request.nextUrl.searchParams.get('token');

    const expectedToken = process.env.ADMIN_REFRESH_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        { error: 'ADMIN_REFRESH_TOKEN not configured' },
        { status: 500 }
      );
    }

    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing token.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const {
      cities = getAvailableCities(),
      date = getTodayInIstanbul(),
      includeDistricts = false,
    } = body;

    // Build location list
    const locations: Array<{ city_slug: string; district_slug?: string }> = [];

    for (const city of cities) {
      // Add city itself
      locations.push({ city_slug: city });

      // Add districts if requested
      if (includeDistricts) {
        const districts = getAvailableDistricts(city);
        for (const district of districts) {
          locations.push({ city_slug: city, district_slug: district });
        }
      }
    }

    // Refresh each location
    const results = await Promise.allSettled(
      locations.map(async (loc) => {
        const result = await refreshPrayerTimes({
          city_slug: loc.city_slug,
          district_slug: loc.district_slug,
          date,
        });

        return {
          city: loc.city_slug,
          district: loc.district_slug || null,
          date: result.date,
          source: result.source,
          success: true,
        };
      })
    );

    // Count results
    const successful = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    const response = {
      success: true,
      refreshed: successful.length,
      failed: failed.length,
      date,
      results: results.map((r, i) => {
        if (r.status === 'fulfilled') {
          return r.value;
        } else {
          return {
            city: locations[i].city_slug,
            district: locations[i].district_slug || null,
            success: false,
            error: r.reason.message,
          };
        }
      }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Admin refresh error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get today's date in Europe/Istanbul timezone
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
