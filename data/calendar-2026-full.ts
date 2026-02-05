import { CalendarDay } from '@/lib/calendar-types';
import { generate2026Calendar, monthNames, dayNames } from '@/lib/calendar-generator';

// 2026 yılının tüm günleri için takvim verisi
export const calendar2026: CalendarDay[] = generate2026Calendar();

// Belirli bir tarih için takvim bilgisi al
export function getCalendarDay(date: string): CalendarDay | undefined {
  return calendar2026.find(day => day.date === date);
}

// Belirli bir ay için tüm günleri al
export function getMonthDays(month: number, year: number = 2026): CalendarDay[] {
  return calendar2026.filter(day => day.monthNumber === month && day.year === year);
}

// Bugünün tarihini al
export function getTodayCalendar(): CalendarDay | undefined {
  const today = new Date().toISOString().split('T')[0];
  const todayData = getCalendarDay(today);
  
  // Eğer bugün için veri yoksa, 27 Ocak'ı döndür (demo için)
  if (!todayData && calendar2026.length > 0) {
    return getCalendarDay('2026-01-27') || calendar2026[26]; // 27 Ocak
  }
  
  return todayData;
}

export { monthNames, dayNames };
