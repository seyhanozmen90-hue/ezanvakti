import { ProviderTimings } from './types';

const ALADHAN_CALENDAR_API = 'https://api.aladhan.com/v1/calendarByCity';
const REQUEST_TIMEOUT = 10000; // 10 seconds for monthly data

/**
 * City name mapping for Aladhan API
 * Aladhan doesn't accept Turkish characters, so we map slug to English name
 */
const CITY_NAME_MAP: Record<string, string> = {
  'istanbul': 'Istanbul',
  'ankara': 'Ankara',
  'izmir': 'Izmir',
  'bursa': 'Bursa',
  'antalya': 'Antalya',
  'adana': 'Adana',
  'konya': 'Konya',
  'gaziantep': 'Gaziantep',
  'sanliurfa': 'Sanliurfa',
  'mersin': 'Mersin',
  'diyarbakir': 'Diyarbakir',
  'kayseri': 'Kayseri',
  'eskisehir': 'Eskisehir',
  'samsun': 'Samsun',
  'denizli': 'Denizli',
  'malatya': 'Malatya',
  'kahramanmaras': 'Kahramanmaras',
  'erzurum': 'Erzurum',
  'van': 'Van',
  'batman': 'Batman',
  'elazig': 'Elazig',
  'erzincan': 'Erzincan',
  'sivas': 'Sivas',
  'manisa': 'Manisa',
  'tokat': 'Tokat',
  'corum': 'Corum',
  'kocaeli': 'Kocaeli',
  'sakarya': 'Sakarya',
  'tekirdag': 'Tekirdag',
  'balikes': 'Balikesir',
  'edirne': 'Edirne',
  'kirklareli': 'Kirklareli',
  'canakkale': 'Canakkale',
  'yalova': 'Yalova',
  'aydin': 'Aydin',
  'mugla': 'Mugla',
  'usak': 'Usak',
  'afyonkarahisar': 'Afyonkarahisar',
  'kutahya': 'Kutahya',
  'bilecik': 'Bilecik',
  'isparta': 'Isparta',
  'burdur': 'Burdur',
  'hatay': 'Hatay',
  'osmaniye': 'Osmaniye',
  'adiyaman': 'Adiyaman',
  'mardin': 'Mardin',
  'sirnak': 'Sirnak',
  'siirt': 'Siirt',
  'kilis': 'Kilis',
  'trabzon': 'Trabzon',
  'ordu': 'Ordu',
  'rize': 'Rize',
  'giresun': 'Giresun',
  'zonguldak': 'Zonguldak',
  'karaman': 'Karaman',
  'kastamonu': 'Kastamonu',
  'sinop': 'Sinop',
  'amasya': 'Amasya',
  'bolu': 'Bolu',
  'duzce': 'Duzce',
  'bartin': 'Bartin',
  'karabuk': 'Karabuk',
  'artvin': 'Artvin',
  'gumushane': 'Gumushane',
  'bayburt': 'Bayburt',
  'yozgat': 'Yozgat',
  'kirsehir': 'Kirsehir',
  'nevsehir': 'Nevsehir',
  'nigde': 'Nigde',
  'aksaray': 'Aksaray',
  'kirikkale': 'Kirikkale',
  'cankiri': 'Cankiri',
  'agri': 'Agri',
  'kars': 'Kars',
  'igdir': 'Igdir',
  'ardahan': 'Ardahan',
  'mus': 'Mus',
  'bitlis': 'Bitlis',
  'hakkari': 'Hakkari',
  'bingol': 'Bingol',
  'tunceli': 'Tunceli',
};

/**
 * Convert city slug to Aladhan city name
 */
function toAladhanCityName(slug: string): string {
  const mapped = CITY_NAME_MAP[slug.toLowerCase()];
  if (mapped) return mapped;
  
  // Fallback: capitalize first letter
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

/**
 * Strip timezone suffix from time string
 * Example: "06:15 (+03)" → "06:15"
 */
function stripTimezone(time: string): string {
  return time.replace(/\s*\([^)]+\)/, '').trim();
}

/** HH:MM formatına dakika ekle (Diyanet uyumu: İkindi +3 dk) */
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = (h * 60 + m + minutes + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

/**
 * Convert Aladhan date format to ISO format
 * Example: "01-02-2026" → "2026-02-01"
 */
function parseAladhanDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export interface MonthlyDayData {
  date: string; // ISO format: YYYY-MM-DD
  timings: ProviderTimings;
  hijri_date_short?: string;
  hijri_date_long?: string;
}

interface AladhanCalendarResponse {
  code: number;
  status: string;
  data: Array<{
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      gregorian: {
        date: string; // DD-MM-YYYY
      };
      hijri: {
        day: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
    };
  }>;
}

/**
 * Hijri month names in Turkish
 */
const HIJRI_MONTHS_TR: Record<number, string> = {
  1: 'Muharrem',
  2: 'Safer',
  3: 'Rebiülevvel',
  4: 'Rebiülahir',
  5: 'Cemaziyelevvel',
  6: 'Cemaziyelahir',
  7: 'Recep',
  8: 'Şaban',
  9: 'Ramazan',
  10: 'Şevval',
  11: 'Zilkade',
  12: 'Zilhicce',
};

/**
 * Format Hijri date to Turkish
 * Example: {day: "15", month: {number: 8}, year: "1447"} → "15 Şaban 1447"
 */
function formatHijriTurkish(hijri: any): string {
  const monthName = HIJRI_MONTHS_TR[hijri.month.number] ?? hijri.month.en;
  return `${hijri.day} ${monthName} ${hijri.year}`;
}

/**
 * Fetch monthly prayer times for a city using Aladhan calendarByCity endpoint
 * This is MUCH faster than calling timings endpoint 28-31 times!
 * 
 * @param city_slug - City slug (e.g., 'izmir', 'istanbul')
 * @param year - Year (e.g., 2026)
 * @param month - Month (1-12)
 * @returns Array of daily prayer times for the entire month
 */
export async function fetchMonthlyPrayerTimes(
  city_slug: string,
  year: number,
  month: number
): Promise<MonthlyDayData[]> {
  const cityName = toAladhanCityName(city_slug);
  
  // Build URL: method=13 (Turkey), school=0 (Shafi = Diyanet ikindi vakti)
  const url = `${ALADHAN_CALENDAR_API}/${year}/${month}?city=${encodeURIComponent(cityName)}&country=Turkey&method=13&school=0`;
  
  console.log(`📅 Fetching monthly prayer times: ${city_slug} (${cityName}) - ${year}/${month}`);
  
  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Aladhan calendar API error: ${response.status} ${response.statusText}`);
    }
    
    const json: AladhanCalendarResponse = await response.json();
    
    if (json.code !== 200 || !Array.isArray(json.data)) {
      throw new Error(`Aladhan calendar API returned code ${json.code}`);
    }
    
    console.log(`✅ Received ${json.data.length} days from Aladhan for ${cityName}`);
    
    // Map to our format with Hijri dates
    const asrOffset = 3; // Diyanet uyumu: takvim API tune desteklemiyorsa İkindi +3 dk
    return json.data.map((day) => ({
      date: parseAladhanDate(day.date.gregorian.date),
      timings: {
        fajr: stripTimezone(day.timings.Fajr),
        sunrise: stripTimezone(day.timings.Sunrise),
        dhuhr: stripTimezone(day.timings.Dhuhr),
        asr: addMinutesToTime(stripTimezone(day.timings.Asr), asrOffset),
        maghrib: stripTimezone(day.timings.Maghrib),
        isha: stripTimezone(day.timings.Isha),
      },
      hijri_date_short: `${day.date.hijri.day} ${day.date.hijri.month.number} ${day.date.hijri.year}`,
      hijri_date_long: formatHijriTurkish(day.date.hijri),
    }));
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Aladhan calendar API timeout after ${REQUEST_TIMEOUT}ms for ${cityName}`);
      }
      throw new Error(`Aladhan calendar API error for ${cityName}: ${error.message}`);
    }
    throw new Error(`Aladhan calendar API unknown error for ${cityName}`);
  }
}
