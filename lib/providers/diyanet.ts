import {
  PrayerTimesProvider,
  FetchTimingsParams,
  ProviderResponse,
  ProviderTimings,
} from './types';

const DIYANET_API_BASE = 'https://api.diyanet.gov.tr/api/PrayerTime';
const REQUEST_TIMEOUT = 10000;

interface DiyanetItem {
  MiladiTarihKisa: string;
  Imsak: string;
  Gunes: string;
  Ogle: string;
  Ikindi: string;
  Aksam: string;
  Yatsi: string;
}

interface DiyanetApiResponse {
  data?: DiyanetItem[];
}

/** Diyanet tarih formatı (DD.MM.YYYY veya D.M.YYYY) → YYYY-MM-DD */
function parseDiyanetDate(miladi: string): string {
  const parts = miladi.trim().split('.');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/** Saat formatı normalize (HH:MM) */
function normalizeTime(t: string): string {
  const part = (t || '').trim().split(' ')[0];
  if (!part || !part.includes(':')) return '00:00';
  const [h, m] = part.split(':').map((x) => x.padStart(2, '0'));
  return `${h}:${m}`;
}

export class DiyanetProvider implements PrayerTimesProvider {
  readonly name = 'diyanet';

  async fetchTimings(params: FetchTimingsParams): Promise<ProviderResponse> {
    const { date, timezone = 'Europe/Istanbul', diyanetDistrictId } = params;

    if (!diyanetDistrictId) {
      throw new Error('Diyanet provider requires diyanetDistrictId');
    }

    const url = `${DIYANET_API_BASE}/GetPrayerTimes?districtID=${diyanetDistrictId}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Diyanet API error: ${response.status} ${response.statusText}`);
      }

      const json: DiyanetApiResponse = await response.json();
      if (!json.data || json.data.length === 0) {
        throw new Error('Diyanet API returned no data');
      }

      const targetDate = date; // YYYY-MM-DD
      const item = json.data.find((row) => parseDiyanetDate(row.MiladiTarihKisa) === targetDate);

      if (!item) {
        throw new Error(`Diyanet: no data for date ${date}`);
      }

      const timings: ProviderTimings = {
        fajr: normalizeTime(item.Imsak),
        sunrise: normalizeTime(item.Gunes),
        dhuhr: normalizeTime(item.Ogle),
        asr: normalizeTime(item.Ikindi),
        maghrib: normalizeTime(item.Aksam),
        isha: normalizeTime(item.Yatsi),
      };

      return {
        timings,
        date,
        timezone,
      };
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error(`Diyanet API timeout after ${REQUEST_TIMEOUT}ms`);
        }
        throw err;
      }
      throw new Error('Diyanet API unknown error');
    }
  }
}

export const diyanetProvider = new DiyanetProvider();
