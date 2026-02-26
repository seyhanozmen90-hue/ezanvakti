import {
  PrayerTimesProvider,
  FetchTimingsParams,
  ProviderResponse,
  ProviderTimings,
} from './types';

const ALADHAN_API_URL = 'https://api.aladhan.com/v1/timings';
const REQUEST_TIMEOUT = 5000; // 5 seconds

interface AladhanApiResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      readable: string;
      gregorian: {
        date: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

export class AladhanProvider implements PrayerTimesProvider {
  readonly name = 'aladhan';

  async fetchTimings(params: FetchTimingsParams): Promise<ProviderResponse> {
    const { coords, date, timezone = 'Europe/Istanbul' } = params;

    try {
      // Convert YYYY-MM-DD to timestamp for Aladhan
      const timestamp = Math.floor(new Date(`${date}T12:00:00`).getTime() / 1000);

      // Build URL with params
      // method=13 (Turkey Diyanet), school=0 (Shafi: Diyanet ikindi = gölge 1x, Hanafi=1 ise ~1 saat sonra)
      const url = new URL(`${ALADHAN_API_URL}/${timestamp}`);
      url.searchParams.set('latitude', coords.lat.toString());
      url.searchParams.set('longitude', coords.lng.toString());
      url.searchParams.set('method', '13'); // Turkey Diyanet
      url.searchParams.set('school', '0'); // Shafi / standart (Diyanet ikindi vakti buna uygun)
      url.searchParams.set('timezonestring', timezone);

      // Fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Aladhan API error: ${response.status} ${response.statusText}`);
      }

      const data: AladhanApiResponse = await response.json();

      if (data.code !== 200) {
        throw new Error(`Aladhan API returned code ${data.code}`);
      }

      // Normalize timings to HH:MM format
      const normalize = (time: string): string => {
        return time.split(' ')[0];
      };
      const addMinutes = (hhmm: string, min: number): string => {
        const [h, m] = hhmm.split(':').map(Number);
        const total = (h * 60 + m + min + 24 * 60) % (24 * 60);
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      };

      const asrRaw = normalize(data.data.timings.Asr);
      const timings: ProviderTimings = {
        fajr: normalize(data.data.timings.Fajr),
        sunrise: normalize(data.data.timings.Sunrise),
        dhuhr: normalize(data.data.timings.Dhuhr),
        asr: addMinutes(asrRaw, 3), // Diyanet uyumu: İkindi +3 dk (tune API'de uygulanmazsa yine doğru)
        maghrib: normalize(data.data.timings.Maghrib),
        isha: normalize(data.data.timings.Isha),
      };

      return {
        timings,
        date,
        timezone: data.data.meta.timezone,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Aladhan API timeout after ${REQUEST_TIMEOUT}ms`);
        }
        throw new Error(`Aladhan API error: ${error.message}`);
      }
      throw new Error('Aladhan API unknown error');
    }
  }
}

// Singleton instance
export const aladhanProvider = new AladhanProvider();
