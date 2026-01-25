export interface City {
  id: string;
  name: string;
  slug: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  slug: string;
}

export interface PrayerTime {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  date: string;
  hijriDate?: string;
}

export interface DailyPrayerTimes {
  times: PrayerTime;
  city: string;
  district?: string;
}

export interface MonthlyPrayerTimes {
  times: PrayerTime[];
  city: string;
  district?: string;
}

export type PrayerName = 'imsak' | 'gunes' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi';
