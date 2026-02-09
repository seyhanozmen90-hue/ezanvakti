export interface PrayerTimeRecord {
  id: number;
  city_slug: string;
  district_slug: string | null;
  date: string; // YYYY-MM-DD
  fajr: string; // HH:MM
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  timezone: string;
  source: 'aladhan' | 'diyanet';
  fetched_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PrayerTimings {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface PrayerTimeQuery {
  city_slug: string;
  district_slug?: string;
  date: string; // YYYY-MM-DD
}

export interface PrayerTimeInsert {
  city_slug: string;
  district_slug?: string | null;
  date: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  timezone?: string;
  source: 'aladhan' | 'diyanet';
}
