import { NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes } from '@/lib/services/prayerTimesService';
import { getAvailableCities } from '@/lib/geo/tr';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

/**
 * Secure cron refresh endpoint
 * 
 * Authentication: Bearer token in Authorization header
 * 
 * Usage:
 * POST /api/admin/refresh
 * Headers:
 *   Authorization: Bearer YOUR_CRON_SECRET
 * 
 * Response:
 * {
 *   success: true,
 *   refreshed: 3
 * }
 * 
 * IMPORTANT: This is a server-only endpoint.
 * Never expose CRON_SECRET to client.
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication: Check Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Missing or invalid Authorization header.' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('CRON_SECRET environment variable not configured');
      return NextResponse.json(
        { 
          success: false,
          error: 'Server configuration error' 
        },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized. Invalid token.' 
        },
        { status: 401 }
      );
    }

    // Get today's date in Europe/Istanbul timezone
    const today = getTodayInIstanbul();

    // Load all available cities
    const cities = getAvailableCities();

    if (cities.length === 0) {
      return NextResponse.json({
        success: true,
        refreshed: 0,
        message: 'No cities configured in lib/geo/tr.ts',
      });
    }

    // Refresh prayer times for each city
    // Use Promise.allSettled to continue even if one fails
    const results = await Promise.allSettled(
      cities.map(async (city_slug) => {
        try {
          await getPrayerTimes({
            city_slug,
            district_slug: undefined, // City-level only for cron
            date: today,
          });
          return { city_slug, success: true };
        } catch (error) {
          console.error(`Failed to refresh ${city_slug}:`, error);
          return { city_slug, success: false, error };
        }
      })
    );

    // Count successful refreshes
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    );

    return NextResponse.json({
      success: true,
      refreshed: successful.length,
    });
  } catch (error) {
    console.error('Cron refresh error:', error);

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
