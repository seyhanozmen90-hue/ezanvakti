import { CalendarDay } from './calendar-types';
import { officialData2026 } from '@/data/official-data-2026';

// Ay isimleri
export const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Gün isimleri
export const dayNames = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

// Basit Hicri tarih hesaplama (2026 için Diyanet verilerine göre)
function calculateHijriDate(gregorianDate: Date): string {
  // 2026-01-01 = 1 Recep 1447 (yaklaşık)
  const baseDate = new Date('2026-01-01');
  const baseDaysDiff = Math.floor((gregorianDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const hijriMonthNames = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 
    'Cemâziyelevvel', 'Cemâziyelâhir',
    'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];
  
  // Basitleştirilmiş hesaplama
  const hijriDayOfYear = (baseDaysDiff + 1) % 354;
  const hijriMonth = Math.floor(hijriDayOfYear / 29.5) % 12;
  const hijriDay = (hijriDayOfYear % 29) + 1;
  const hijriYear = 1447 + Math.floor((baseDaysDiff + 1) / 354);
  
  return `${Math.floor(hijriDay)} ${hijriMonthNames[hijriMonth]} ${hijriYear}`;
}

// Namaz vakitlerini hesapla (İstanbul için basit formül)
function calculatePrayerTimes(date: Date): {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
} {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Güneşin yıllık hareketi
  const sunAngle = (dayOfYear / 365.25) * 2 * Math.PI;
  const sunriseDelta = Math.sin(sunAngle) * 150; // ±2.5 saat
  
  // Vakitler (dakika cinsinden gece yarısından itibaren)
  const sunriseBase = 420 - sunriseDelta; // 07:00 ± değişim
  const imsakTime = sunriseBase - 90;
  const noonTime = 780; // 13:00 sabit
  const afternoonTime = noonTime + 195;
  const sunsetTime = sunriseBase + 660 + sunriseDelta;
  const nightTime = sunsetTime + 90;
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  
  return {
    imsak: formatTime(imsakTime),
    gunes: formatTime(sunriseBase),
    ogle: formatTime(noonTime),
    ikindi: formatTime(afternoonTime),
    aksam: formatTime(sunsetTime),
    yatsi: formatTime(nightTime)
  };
}

// ISO hafta numarasını hesapla
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

// Mevsim bilgisi
function getSeason(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'İlkbahar';
  if (month >= 5 && month <= 7) return 'Yaz';
  if (month >= 8 && month <= 10) return 'Sonbahar';
  return 'Kış';
}

// 2026 tam takvimini oluştur
export function generateOfficial2026Calendar(): CalendarDay[] {
  const calendar: CalendarDay[] = [];
  const year = 2026;
  
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const prayerTimes = calculatePrayerTimes(date);
      const hijriDate = calculateHijriDate(date);
      const dayName = dayNames[date.getDay()];
      const monthName = monthNames[month];
      const weekNumber = getISOWeek(date);
      const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const season = getSeason(date);
      
      // Resmi verilerden özel günleri al
      const religiousDay = (officialData2026.religiousDays as any)[dateString];
      const officialHoliday = (officialData2026.officialHolidays as any)[dateString];
      const astronomicalEvent = (officialData2026.astronomicalEvents as any)[dateString];
      const traditionalEvent = (officialData2026.traditionalEvents as any)[dateString];
      
      const calendarDay: CalendarDay = {
        date: dateString,
        dayName,
        dayNumber: day,
        monthNumber: month + 1,
        monthName,
        year,
        hijriDate,
        prayerTimes,
        ...(religiousDay && {
          religiousDays: [{
            name: religiousDay.name,
            type: religiousDay.type,
            description: religiousDay.description
          }]
        }),
        ...(officialHoliday && {
          isHoliday: true,
          holidayName: officialHoliday.name,
          historyToday: officialHoliday.description ? [{
            title: officialHoliday.name,
            description: officialHoliday.description
          }] : undefined
        }),
        ...(religiousDay?.isOfficialHoliday && {
          isHoliday: true,
          holidayName: religiousDay.name
        }),
        ...(astronomicalEvent && {
          seasonalInfo: {
            name: astronomicalEvent.name,
            type: astronomicalEvent.type,
            description: astronomicalEvent.description
          }
        }),
        ...(traditionalEvent && {
          seasonalInfo: {
            name: traditionalEvent.name,
            type: traditionalEvent.type,
            description: traditionalEvent.description
          }
        }),
        specialNotes: [
          `Hafta: ${weekNumber}`,
          `Yılın ${dayOfYear}. günü`,
          `Mevsim: ${season}`,
          `Kalan gün: ${365 - dayOfYear}`
        ]
      };
      
      calendar.push(calendarDay);
    }
  }
  
  return calendar;
}
