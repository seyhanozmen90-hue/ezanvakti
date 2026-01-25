/**
 * Takvim ve Tarih Yardımcı Fonksiyonları
 */

/**
 * Bir ayda kaç gün var?
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Sayıyı 2 haneli string'e çevirir (01, 02, ..., 12)
 */
export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Tarih parçalarını döndürür
 */
export function toDateParts(year: number, month: number, day: number) {
  return {
    year,
    month: pad2(month),
    day: pad2(day),
    iso: `${year}-${pad2(month)}-${pad2(day)}`,
  };
}

/**
 * Türkçe tarih formatı
 * Örnek: "25 Ocak 2026 Cumartesi"
 */
export function formatTurkishDate(date: Date): string {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year} ${dayName}`;
}

/**
 * Ay numarasını Türkçe ay adına çevirir
 */
export function getMonthNameTurkish(month: number): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return months[month - 1] || '';
}

/**
 * Gün adını Türkçe olarak döndürür
 */
export function getDayNameTurkish(date: Date): string {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days[date.getDay()];
}

/**
 * Hicri tarih formatı (Intl.DateTimeFormat ile)
 * Not: Tarayıcı desteği sınırlı olabilir
 */
export function formatHijri(date: Date): string {
  try {
    const hijriFormatter = new Intl.DateTimeFormat('tr-TR', {
      calendar: 'islamic',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return hijriFormatter.format(date);
  } catch (error) {
    // Destek yoksa boş dön
    return '';
  }
}

/**
 * 2026 yılı için tüm günleri generate et
 */
export function generateAllDaysIn2026() {
  const year = 2026;
  const days: { year: string; month: string; day: string }[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const daysInThisMonth = daysInMonth(year, month);
    for (let day = 1; day <= daysInThisMonth; day++) {
      days.push({
        year: year.toString(),
        month: pad2(month),
        day: pad2(day),
      });
    }
  }
  
  return days;
}

/**
 * Bir yıl için tüm ayları generate et
 */
export function generateMonthsForYear(year: number) {
  const months: { year: string; month: string }[] = [];
  
  for (let month = 1; month <= 12; month++) {
    months.push({
      year: year.toString(),
      month: pad2(month),
    });
  }
  
  return months;
}

/**
 * Desteklenen yıllar
 */
export function getSupportedYears() {
  return [{ year: '2026' }];
}

/**
 * Bir tarihin geçerli olup olmadığını kontrol et
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
