// Takvim veri yapıları ve türleri

export interface CalendarDay {
  // Tarih Bilgileri
  date: string; // YYYY-MM-DD formatında
  dayName: string; // Pazartesi, Salı, vb.
  dayNumber: number; // 1-31
  monthNumber: number; // 1-12
  monthName: string; // Ocak, Şubat, vb.
  year: number;
  hijriDate: string; // Hicri tarih

  // Namaz Vakitleri
  prayerTimes: {
    imsak: string;
    gunes: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
  };

  // Tarihte Bugün
  historyToday?: {
    title: string;
    description: string;
    year?: number;
  }[];

  // Dini & Özel Günler
  religiousDays?: {
    name: string;
    type: 'kandil' | 'ramazan' | 'bayram' | 'ozel' | 'hicri';
    description?: string;
  }[];

  // Mevsimsel Bilgiler
  seasonalInfo?: {
    name: string;
    type: 'cemre' | 'eksinoks' | 'gundonumu' | 'mevsim' | 'diger';
    description: string;
  };

  // Özlü Söz / Vecize
  quote?: {
    text: string;
    author?: string;
    source?: string;
  };

  // Ek Bilgiler
  specialNotes?: string[];
  
  // Önemli Günler
  isHoliday?: boolean;
  holidayName?: string;
}

export interface MonthData {
  month: number;
  monthName: string;
  year: number;
  days: CalendarDay[];
}

export interface YearCalendar {
  year: number;
  months: MonthData[];
}
