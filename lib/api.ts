import { PrayerTime } from './types';
import { getMockPrayerTimes, getMockTodayPrayerTimes } from './mock-data';
import { turkishizeHijriDate } from './utils';

const API_BASE_URL = 'https://api.diyanet.gov.tr/api/PrayerTime';
/** Mock sadece son fallback için; önce Diyanet, sonra Aladhan denenecek */
const USE_MOCK_DATA = false;

export interface DiyanetApiResponse {
  data: Array<{
    MiladiTarihKisa: string;
    HicriTarihKisa?: string;
    Imsak: string;
    Gunes: string;
    Ogle: string;
    Ikindi: string;
    Aksam: string;
    Yatsi: string;
  }>;
}

/**
 * Sadece Diyanet API dener; hata/başarısızlıkta null döner (mock yok).
 * Öncelik sırasında primary kaynak olarak kullanılır.
 */
export async function tryFetchPrayerTimesFromDiyanet(
  cityId: string,
  districtId?: string
): Promise<PrayerTime[] | null> {
  try {
    const targetId = districtId || cityId;
    const url = `${API_BASE_URL}/GetPrayerTimes?districtID=${targetId}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const data: DiyanetApiResponse = await response.json();
    if (!data.data || data.data.length === 0) return null;
    return data.data.map((item) => ({
      date: item.MiladiTarihKisa,
      hijriDate: turkishizeHijriDate(item.HicriTarihKisa),
      imsak: item.Imsak,
      gunes: item.Gunes,
      ogle: item.Ogle,
      ikindi: item.Ikindi,
      aksam: item.Aksam,
      yatsi: item.Yatsi,
    }));
  } catch {
    return null;
  }
}

/**
 * Diyanet API'den namaz vakitlerini çeker (hata durumunda mock fallback)
 * @param cityId - İl ID'si (Diyanet API'den)
 * @param districtId - İlçe ID'si (Diyanet API'den) - opsiyonel
 * @returns Namaz vakitleri dizisi
 */
export async function fetchPrayerTimes(
  cityId: string,
  districtId?: string
): Promise<PrayerTime[]> {
  // Mock data kullanıyorsak direkt döndür
  if (USE_MOCK_DATA) {
    console.log('🔧 Mock data kullanılıyor (API erişilebilir değil)');
    return getMockPrayerTimes();
  }

  try {
    const targetId = districtId || cityId;
    const url = `${API_BASE_URL}/GetPrayerTimes?districtID=${targetId}`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1 saat cache
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: DiyanetApiResponse = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No prayer times data received');
    }

    return data.data.map(item => ({
      date: item.MiladiTarihKisa,
      hijriDate: turkishizeHijriDate(item.HicriTarihKisa),
      imsak: item.Imsak,
      gunes: item.Gunes,
      ogle: item.Ogle,
      ikindi: item.Ikindi,
      aksam: item.Aksam,
      yatsi: item.Yatsi,
    }));
  } catch (error) {
    console.error('Error fetching prayer times, using mock data:', error);
    // API hatası olursa mock data kullan
    return getMockPrayerTimes();
  }
}

/**
 * Belirli bir tarih için namaz vakitlerini getirir
 */
export async function getTodayPrayerTimes(
  cityId: string,
  districtId?: string
): Promise<PrayerTime | null> {
  // Mock data kullanıyorsak direkt döndür
  if (USE_MOCK_DATA) {
    return getMockTodayPrayerTimes();
  }

  try {
    const times = await fetchPrayerTimes(cityId, districtId);
    const today = new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return times.find(t => t.date === today) || times[0] || null;
  } catch (error) {
    console.error('Error getting today prayer times, using mock data:', error);
    return getMockTodayPrayerTimes();
  }
}

/**
 * Aylık namaz vakitlerini getirir
 */
export async function getMonthlyPrayerTimes(
  cityId: string,
  districtId?: string
): Promise<PrayerTime[]> {
  try {
    return await fetchPrayerTimes(cityId, districtId);
  } catch (error) {
    console.error('Error getting monthly prayer times:', error);
    return [];
  }
}
