import { NextRequest, NextResponse } from 'next/server';

const ALADHAN_API_URL = 'http://api.aladhan.com/v1/timings';

interface AladhanResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
    };
    date: {
      readable: string;
      hijri: {
        date: string;
        day: string;
        month: {
          en: string;
          ar: string;
        };
        year: string;
      };
    };
  };
}

interface PrayerTimesResponse {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  date: string;
  hijriDate: string;
}

/**
 * Koordinat bazlı ezan vakti API route
 * 
 * Query params:
 * - lat: Enlem (zorunlu)
 * - lng: Boylam (zorunlu)
 * - date: Tarih (opsiyonel, varsayılan bugün) - format: DD-MM-YYYY
 * 
 * Method: Diyanet metodu (method=13)
 * Revalidate: 1 saat
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const date = searchParams.get('date');

  // Validasyon
  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'lat ve lng parametreleri zorunludur' },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Geçersiz koordinat değerleri' },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: 'Koordinatlar geçerli aralıkta değil' },
      { status: 400 }
    );
  }

  try {
    // Tarih parametresi (varsayılan bugün)
    const timestamp = date 
      ? Math.floor(new Date(date.split('-').reverse().join('-')).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    // Aladhan API çağrısı - method=13 (Türkiye Diyanet İşleri Başkanlığı)
    const url = `${ALADHAN_API_URL}/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=13`;
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1 saat cache
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Aladhan API error: ${response.status}`);
    }

    const data: AladhanResponse = await response.json();

    if (data.code !== 200) {
      throw new Error('API yanıt kodu başarısız');
    }

    // Türkiye formatına normalize et (HH:MM formatında döndür)
    const normalize = (time: string) => {
      // Aladhan bazen "(+03:00)" gibi timezone ekler, temizle
      return time.split(' ')[0];
    };

    const result: PrayerTimesResponse = {
      imsak: normalize(data.data.timings.Imsak),
      gunes: normalize(data.data.timings.Sunrise),
      ogle: normalize(data.data.timings.Dhuhr),
      ikindi: normalize(data.data.timings.Asr),
      aksam: normalize(data.data.timings.Maghrib),
      yatsi: normalize(data.data.timings.Isha),
      date: data.data.date.readable,
      hijriDate: `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Ezan vakti API hatası:', error);
    return NextResponse.json(
      { 
        error: 'Ezan vakitleri alınamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
