import { CalendarDay } from '@/lib/calendar-types';
import { generateOfficial2026Calendar, monthNames, dayNames } from '@/lib/official-calendar-2026';

// 2026 yılının resmi Diyanet verilerine göre takvim
export const calendar2026: CalendarDay[] = generateOfficial2026Calendar();

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
  // Gerçek tarih kontrolü
  const today = new Date().toISOString().split('T')[0];
  const todayData = getCalendarDay(today);
  
  // 2026 dışındaki tarihler için 2 Şubat 2026 (Berat Kandili) göster
  if (!todayData && calendar2026.length > 0) {
    return getCalendarDay('2026-02-02') || calendar2026[32]; // 2 Şubat - Berat Kandili
  }
  
  return todayData;
}

export { monthNames, dayNames };
