import { PrayerTime, PrayerName } from './types';

export interface NextPrayer {
  name: PrayerName;
  time: string;
  displayName: string;
}

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * Namaz vakti isimlerini Türkçe olarak döndürür
 */
export function getPrayerDisplayName(name: PrayerName): string {
  const names: Record<PrayerName, string> = {
    imsak: 'İmsak',
    gunes: 'Güneş',
    ogle: 'Öğle',
    ikindi: 'İkindi',
    aksam: 'Akşam',
    yatsi: 'Yatsı',
  };
  return names[name];
}

/**
 * Bugünün tarihini Europe/Istanbul saatine göre döndürür (sunucu timezone'dan bağımsız).
 * @returns YYYY-MM-DD formatında tarih
 */
export function getTodayInIstanbul(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

/**
 * Bugünün tarihini Europe/Istanbul'a göre ay/yıl (aylık veri için).
 * @returns { year, month } month 1-12
 */
export function getCurrentMonthInIstanbul(): { year: number; month: number } {
  const today = getTodayInIstanbul();
  const [y, m] = today.split('-').map(Number);
  return { year: y, month: m };
}

/** Namaz vakitleri Türkiye saatine göre; şu anki saati Europe/Istanbul'a göre al (client + server) */
export function getNowInTurkey(): { hours: number; minutes: number; minutesOfDay: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? '0', 10);
  const hours = get('hour');
  const minutes = get('minute');
  return { hours, minutes, minutesOfDay: hours * 60 + minutes };
}

/**
 * Bir sonraki namaz vaktini bulur (Türkiye saatine göre – sunucu timezone'dan bağımsız)
 */
export function getNextPrayerTime(times: PrayerTime): NextPrayer | null {
  if (!times) return null;

  const { minutesOfDay: nowMinutes } = getNowInTurkey();

  const prayers: Array<{ name: PrayerName; time: string }> = [
    { name: 'imsak', time: times.imsak },
    { name: 'gunes', time: times.gunes },
    { name: 'ogle', time: times.ogle },
    { name: 'ikindi', time: times.ikindi },
    { name: 'aksam', time: times.aksam },
    { name: 'yatsi', time: times.yatsi },
  ];

  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > nowMinutes) {
      return {
        name: prayer.name,
        time: prayer.time,
        displayName: getPrayerDisplayName(prayer.name),
      };
    }
  }

  // Tüm vakitler geçtiyse bir sonraki vakit yarının İmsak'ı
  return {
    name: 'imsak',
    time: times.imsak,
    displayName: getPrayerDisplayName('imsak'),
  };
}

/**
 * Kalan süreyi hesaplar — Europe/Istanbul (Türkiye) saatine göre.
 * Hedef vakit bugün Türkiye’de geçtiyse yarın aynı saate sayar (örn. gece yarısı sonrası İmsak).
 */
export function calculateTimeRemaining(targetTime: string): TimeRemaining {
  const now = Date.now();
  const [hours, minutes] = targetTime.trim().split(':').map(Number);
  const today = getTodayInIstanbul();

  // Hedef: bugün Türkiye’de (HH:mm) anı
  let target = new Date(`${today}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+03:00`);

  if (target.getTime() <= now) {
    const nextDay = new Date(`${today}T12:00:00+03:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    const tomorrowStr = nextDay.toISOString().slice(0, 10);
    target = new Date(`${tomorrowStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+03:00`);
  }

  const diff = target.getTime() - now;
  if (diff < 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return { hours: hrs, minutes: mins, seconds: secs, totalSeconds };
}

/**
 * Süreyi formatlar (örn: "2 saat 30 dakika")
 */
export function formatTimeRemaining(remaining: TimeRemaining): string {
  if (remaining.totalSeconds <= 0) return 'Vakit girdi';
  
  const parts: string[] = [];
  
  if (remaining.hours > 0) {
    parts.push(`${remaining.hours} saat`);
  }
  if (remaining.minutes > 0) {
    parts.push(`${remaining.minutes} dakika`);
  }
  if (remaining.hours === 0 && remaining.seconds > 0) {
    parts.push(`${remaining.seconds} saniye`);
  }

  return parts.join(' ') || 'Az kaldı';
}

/**
 * Hicri ay isimlerini Türkçeleştirir
 */
export function turkishizeHijriDate(hijriDate?: string): string {
  if (!hijriDate) return '';
  
  // Arapça/İngilizce ay isimleri -> Türkçe karşılıkları
  const monthReplacements = [
    { from: /Muharram|Muharrem/gi, to: 'Muharrem' },
    { from: /Safar|Safer/gi, to: 'Safer' },
    { from: /Rabiulevvel|Rabī'?\s?al-awwal|Rabi'?\s?al-awwal/gi, to: 'Rebiülevvel' },
    { from: /Rabiulahir|Rabī'?\s?al-thānī|Rabi'?\s?al-thani/gi, to: 'Rebiülahir' },
    { from: /Cemaziyelevvel|Jumādā?\s?al-ūlā|Jumada\s?al-awwal/gi, to: 'Cemaziyelevvel' },
    { from: /Cemaziyelahir|Jumādā?\s?al-ākhirah|Jumada\s?al-thani/gi, to: 'Cemaziyelahir' },
    { from: /Rajab|Recep/gi, to: 'Recep' },
    { from: /Sha'?bān|Shaban|Şaban/gi, to: 'Şaban' },
    { from: /Ramaḍān|Ramadan|Ramazan/gi, to: 'Ramazan' },
    { from: /Shawwāl|Shawwal|Şevval/gi, to: 'Şevval' },
    { from: /Dhū\s?al-Qa'dah|Dhu\s?al-Qadah|Zilkade/gi, to: 'Zilkade' },
    { from: /Dhū\s?al-Ḥijjah|Dhu\s?al-Hijjah|Zilhicce/gi, to: 'Zilhicce' },
  ];
  
  let turkishDate = hijriDate;
  
  // Her bir ay ismini Türkçe karşılığı ile değiştir
  for (const { from, to } of monthReplacements) {
    turkishDate = turkishDate.replace(from, to);
  }
  
  return turkishDate;
}

/**
 * Hicri tarihi formatlar
 */
export function formatHijriDate(hijriDate?: string): string {
  if (!hijriDate) return '';
  return turkishizeHijriDate(hijriDate);
}

/**
 * Namaz vaktinin geçip geçmediğini kontrol eder (Europe/Istanbul saati)
 */
export function isPrayerTimePassed(prayerTime: string): boolean {
  const { minutesOfDay: nowMinutes } = getNowInTurkey();
  const [h, m] = prayerTime.trim().split(':').map(Number);
  const prayerMinutes = (h ?? 0) * 60 + (m ?? 0);
  return prayerMinutes < nowMinutes;
}

/**
 * Tarihi formatlar (Türkçe)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Hicri tarihten ay ismini çıkarır
 */
export function getHijriMonthFromDate(hijriDate?: string): string | null {
  if (!hijriDate) return null;
  
  // Hicri tarih formatı: "13 Şaban 1447" veya benzeri
  const monthNames = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
    'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
    'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];
  
  for (const month of monthNames) {
    if (hijriDate.includes(month)) {
      return month;
    }
  }
  
  return null;
}

/**
 * Şu an Ramazan ayında mıyız?
 */
export function isRamadan(hijriDate?: string): boolean {
  if (!hijriDate) return false;
  
  const month = getHijriMonthFromDate(hijriDate);
  return month === 'Ramazan';
}

/**
 * Slug'dan şehir/ilçe adını düzgün formata çevirir
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}
