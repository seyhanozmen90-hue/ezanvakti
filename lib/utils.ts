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
 * Bir sonraki namaz vaktini bulur
 */
export function getNextPrayerTime(times: PrayerTime): NextPrayer | null {
  if (!times) return null;

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers: Array<{ name: PrayerName; time: string }> = [
    { name: 'imsak', time: times.imsak },
    { name: 'gunes', time: times.gunes },
    { name: 'ogle', time: times.ogle },
    { name: 'ikindi', time: times.ikindi },
    { name: 'aksam', time: times.aksam },
    { name: 'yatsi', time: times.yatsi },
  ];

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;

    if (prayerTime > currentTime) {
      return {
        name: prayer.name,
        time: prayer.time,
        displayName: getPrayerDisplayName(prayer.name),
      };
    }
  }

  // Eğer tüm vakitler geçtiyse, yarının ilk vakti (İmsak)
  return {
    name: 'imsak',
    time: times.imsak,
    displayName: getPrayerDisplayName('imsak'),
  };
}

/**
 * Kalan süreyi hesaplar
 */
export function calculateTimeRemaining(targetTime: string): TimeRemaining {
  const now = new Date();
  const [hours, minutes] = targetTime.split(':').map(Number);
  
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  // Eğer hedef saat geçmişse, yarına ayarla
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }

  const diff = target.getTime() - now.getTime();
  const totalSeconds = Math.floor(diff / 1000);
  
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return {
    hours: hrs,
    minutes: mins,
    seconds: secs,
    totalSeconds,
  };
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
 * Namaz vaktinin geçip geçmediğini kontrol eder
 */
export function isPrayerTimePassed(prayerTime: string): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [hours, minutes] = prayerTime.split(':').map(Number);
  const targetTime = hours * 60 + minutes;
  
  return targetTime < currentTime;
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
 * Slug'dan şehir/ilçe adını düzgün formata çevirir
 */
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ');
}
