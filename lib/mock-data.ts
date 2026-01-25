import { PrayerTime } from './types';

/**
 * Mock namaz vakitleri verisi (API çalışmadığında kullanılır)
 */
export function getMockPrayerTimes(): PrayerTime[] {
  const today = new Date();
  const times: PrayerTime[] = [];
  
  // Bu ay için 30 gün veri oluştur
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i - 15); // Geçmiş ve gelecek günler
    
    const dateStr = date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    times.push({
      date: dateStr,
      hijriDate: '15 Recep 1448', // Örnek Hicri tarih (Türkçe)
      imsak: '06:15',
      gunes: '07:45',
      ogle: '13:10',
      ikindi: '15:45',
      aksam: '18:20',
      yatsi: '19:50',
    });
  }
  
  return times;
}

/**
 * Bugünkü mock veriyi döndürür
 */
export function getMockTodayPrayerTimes(): PrayerTime {
  const today = new Date();
  const dateStr = today.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return {
    date: dateStr,
    hijriDate: '15 Recep 1448', // Türkçe Hicri tarih
    imsak: '06:15',
    gunes: '07:45',
    ogle: '13:10',
    ikindi: '15:45',
    aksam: '18:20',
    yatsi: '19:50',
  };
}
