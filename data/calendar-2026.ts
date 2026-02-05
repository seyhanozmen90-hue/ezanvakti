import { CalendarDay } from '@/lib/calendar-types';

// 2026 yılı takvim verileri - Örnek günler
// Gerçek uygulamada tüm yıl için veri olacak

export const calendar2026Sample: CalendarDay[] = [
  // OCAK 2026
  {
    date: '2026-01-27',
    dayName: 'Salı',
    dayNumber: 27,
    monthNumber: 1,
    monthName: 'Ocak',
    year: 2026,
    hijriDate: '7 Recep 1447',
    prayerTimes: {
      imsak: '06:45',
      gunes: '08:16',
      ogle: '13:20',
      ikindi: '15:50',
      aksam: '18:13',
      yatsi: '19:41'
    },
    historyToday: [
      {
        title: 'Soğuk Kış Günleri',
        description: 'Ocak ayının son haftası, kışın en soğuk dönemlerinden biridir.',
      }
    ],
    quote: {
      text: 'Her güne şükürle başlamak, o günün bereketini artırır.',
      source: 'Hikmetli Söz'
    },
    specialNotes: ['Kış mevsimi devam ediyor', 'Sıcak giysiler önemli']
  },
  {
    date: '2026-01-01',
    dayName: 'Perşembe',
    dayNumber: 1,
    monthNumber: 1,
    monthName: 'Ocak',
    year: 2026,
    hijriDate: '11 Cemâziyelâhir 1447',
    prayerTimes: {
      imsak: '06:50',
      gunes: '08:24',
      ogle: '13:14',
      ikindi: '15:33',
      aksam: '17:51',
      yatsi: '19:20'
    },
    religiousDays: [
      {
        name: 'Yılbaşı',
        type: 'ozel',
        description: 'Miladi takvimin ilk günü'
      }
    ],
    historyToday: [
      {
        title: 'Dünya Barış Günü',
        description: 'Yeni yıl, barış ve kardeşlik dilekleriyle başlar.',
        year: 1948
      }
    ],
    quote: {
      text: 'Yeni bir gün, yeni bir başlangıç, yeni umutlar demektir.',
      author: 'Anonim'
    },
    specialNotes: ['Yeni yıl kutlamaları', 'Kış mevsimi devam ediyor']
  },
  {
    date: '2026-01-15',
    dayName: 'Perşembe',
    dayNumber: 15,
    monthNumber: 1,
    monthName: 'Ocak',
    year: 2026,
    hijriDate: '25 Cemâziyelâhir 1447',
    prayerTimes: {
      imsak: '06:48',
      gunes: '08:20',
      ogle: '13:18',
      ikindi: '15:42',
      aksam: '18:02',
      yatsi: '19:30'
    },
    seasonalInfo: {
      name: 'Havaya Cemre',
      type: 'cemre',
      description: 'İlk cemre havaya düşer. Havanın ısınmaya başlayacağının habercisidir.'
    },
    historyToday: [
      {
        title: 'Wikipedia Günü',
        description: 'Dünyanın en büyük özgür ansiklopedisi Wikipedia\'nın kuruluş yıldönümü.',
        year: 2001
      }
    ],
    quote: {
      text: 'İlim tahsil etmek her Müslümana farzdır.',
      source: 'Hadis-i Şerif'
    },
    specialNotes: ['Cemre düşüyor - ilkbahar yaklaşıyor']
  },

  // ŞUBAT 2026
  {
    date: '2026-02-13',
    dayName: 'Cuma',
    dayNumber: 13,
    monthNumber: 2,
    monthName: 'Şubat',
    year: 2026,
    hijriDate: '25 Recep 1447',
    prayerTimes: {
      imsak: '06:28',
      gunes: '07:56',
      ogle: '13:22',
      ikindi: '16:12',
      aksam: '18:36',
      yatsi: '20:00'
    },
    religiousDays: [
      {
        name: 'Regaib Kandili',
        type: 'kandil',
        description: 'Recep ayının ilk cuma gecesi, mukaddes üç ayların başlangıcı.'
      }
    ],
    historyToday: [
      {
        title: 'Üç Aylar Başlangıcı',
        description: 'Recep, Şaban ve Ramazan aylarından oluşan mukaddes üç aylar dönemi başlar.',
      }
    ],
    quote: {
      text: 'Üç aylar, maneviyatın zirvesidir. Bu günleri ibadet ve dua ile ihya ediniz.',
      source: 'İslami Kaynaklar'
    },
    seasonalInfo: {
      name: 'Sevgililer Günü',
      type: 'diger',
      description: 'Dünya genelinde kutlanan sevgi ve dostluk günü.'
    },
    specialNotes: ['Regaib Kandili', 'Üç aylar başlıyor']
  },

  // MART 2026
  {
    date: '2026-03-14',
    dayName: 'Cumartesi',
    dayNumber: 14,
    monthNumber: 3,
    monthName: 'Mart',
    year: 2026,
    hijriDate: '24 Şaban 1447',
    prayerTimes: {
      imsak: '05:50',
      gunes: '07:14',
      ogle: '13:22',
      ikindi: '16:40',
      aksam: '19:06',
      yatsi: '20:32'
    },
    religiousDays: [
      {
        name: 'Berat Kandili',
        type: 'kandil',
        description: 'Şaban ayının on beşinci gecesi, bağışlanma ve rahmet gecesidir.'
      }
    ],
    historyToday: [
      {
        title: 'Tıp Bayramı',
        description: 'Türkiye\'de 14 Mart Tıp Bayramı olarak kutlanır.',
        year: 1827
      }
    ],
    quote: {
      text: 'Bu gece, dua ve istiğfar gecesidir. Günahlardan arınma zamanıdır.',
      source: 'Hadis-i Şerif'
    },
    specialNotes: ['Berat Kandili', 'Ramazan ayına hazırlık']
  },
  {
    date: '2026-03-20',
    dayName: 'Cuma',
    dayNumber: 20,
    monthNumber: 3,
    monthName: 'Mart',
    year: 2026,
    hijriDate: '1 Ramazan 1447',
    prayerTimes: {
      imsak: '05:42',
      gunes: '07:05',
      ogle: '13:22',
      ikindi: '16:46',
      aksam: '19:13',
      yatsi: '20:40'
    },
    religiousDays: [
      {
        name: 'Ramazan Başlangıcı',
        type: 'ramazan',
        description: 'Mübarek Ramazan ayının ilk günü, oruç ibadetinin başlangıcı.'
      }
    ],
    seasonalInfo: {
      name: 'İlkbahar Ekinoksu',
      type: 'eksinoks',
      description: 'Gece ve gündüzün eşitlendiği ilkbaharın ilk günü.'
    },
    historyToday: [
      {
        title: 'Nevruz Bayramı',
        description: 'İran ve Türk halklarının yeni yıl kutlaması, baharın gelişi.',
      }
    ],
    quote: {
      text: 'Ramazan ayı, Kuran\'ın indirildiği mübarek aydır.',
      source: 'Bakara Suresi'
    },
    specialNotes: ['Ramazan başlıyor', 'İlkbahar geldi', 'Nevruz'],
    isHoliday: true,
    holidayName: 'Ramazan Başlangıcı'
  },

  // NİSAN 2026 - RAMAZAN BAYRAMI
  {
    date: '2026-04-19',
    dayName: 'Pazar',
    dayNumber: 19,
    monthNumber: 4,
    monthName: 'Nisan',
    year: 2026,
    hijriDate: '1 Şevval 1447',
    prayerTimes: {
      imsak: '04:58',
      gunes: '06:25',
      ogle: '13:22',
      ikindi: '17:09',
      aksam: '19:47',
      yatsi: '21:20'
    },
    religiousDays: [
      {
        name: 'Ramazan Bayramı 1. Gün',
        type: 'bayram',
        description: 'Ramazan orucunun sona ermesiyle kutlanan üç günlük bayram.'
      }
    ],
    historyToday: [
      {
        title: 'Ramazan Bayramı',
        description: 'Bir ay süren oruç ibadetinden sonra müminlerin bayramı.',
      }
    ],
    quote: {
      text: 'İyiliğiniz kabul, duanız müstecap olsun. Hayırlı bayramlar!',
      source: 'Bayram Tebriği'
    },
    specialNotes: ['Ramazan Bayramı', 'Resmi Tatil'],
    isHoliday: true,
    holidayName: 'Ramazan Bayramı'
  },

  // MAYIS 2026
  {
    date: '2026-05-01',
    dayName: 'Cuma',
    dayNumber: 1,
    monthNumber: 5,
    monthName: 'Mayıs',
    year: 2026,
    hijriDate: '13 Şevval 1447',
    prayerTimes: {
      imsak: '04:34',
      gunes: '06:04',
      ogle: '13:22',
      ikindi: '17:18',
      aksam: '20:03',
      yatsi: '21:40'
    },
    historyToday: [
      {
        title: 'Emek ve Dayanışma Günü',
        description: 'İşçilerin haklarını savunmak için kutlanan uluslararası gün.',
        year: 1886
      }
    ],
    quote: {
      text: 'Çalışmak ibadettir, helal rızık kazanmak en güzel ameldir.',
      source: 'İslami Kaynak'
    },
    specialNotes: ['1 Mayıs İşçi Bayramı'],
    isHoliday: true,
    holidayName: 'Emek ve Dayanışma Günü'
  },
  {
    date: '2026-05-19',
    dayName: 'Salı',
    dayNumber: 19,
    monthNumber: 5,
    monthName: 'Mayıs',
    year: 2026,
    hijriDate: '1 Zilhicce 1447',
    prayerTimes: {
      imsak: '04:12',
      gunes: '05:46',
      ogle: '13:23',
      ikindi: '17:26',
      aksam: '20:20',
      yatsi: '22:03'
    },
    historyToday: [
      {
        title: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
        description: 'Mustafa Kemal Atatürk\'ün Samsun\'a çıkışı ve Kurtuluş Savaşı\'nın başlangıcı.',
        year: 1919
      }
    ],
    quote: {
      text: 'Gençliğe hitap: Ey Türk Gençliği! Birinci vazifen, Türk istiklalini, Türk Cumhuriyetini, ilelebet muhafaza ve müdafaa etmektir.',
      author: 'Mustafa Kemal Atatürk'
    },
    specialNotes: ['19 Mayıs Atatürk\'ü Anma ve Gençlik Bayramı'],
    isHoliday: true,
    holidayName: '19 Mayıs'
  },

  // HAZİRAN 2026 - KURBAN BAYRAMI
  {
    date: '2026-06-27',
    dayName: 'Cumartesi',
    dayNumber: 27,
    monthNumber: 6,
    monthName: 'Haziran',
    year: 2026,
    hijriDate: '10 Zilhicce 1447',
    prayerTimes: {
      imsak: '03:45',
      gunes: '05:27',
      ogle: '13:28',
      ikindi: '17:36',
      aksam: '20:44',
      yatsi: '22:36'
    },
    religiousDays: [
      {
        name: 'Kurban Bayramı - Arefe Günü',
        type: 'bayram',
        description: 'Kurban Bayramı\'nın öncesi, hacıların Arafat\'ta durduğu gün.'
      }
    ],
    historyToday: [
      {
        title: 'Arefe Günü',
        description: 'Kurban Bayramı\'ndan bir gün önce, oruç tutulan mübarek gün.',
      }
    ],
    quote: {
      text: 'Arefe günü orucu, geçmiş ve gelecek bir yılın günahlarına kefarettir.',
      source: 'Hadis-i Şerif'
    },
    specialNotes: ['Arefe günü', 'Kurban Bayramı yarın'],
    isHoliday: false
  },
  {
    date: '2026-06-28',
    dayName: 'Pazar',
    dayNumber: 28,
    monthNumber: 6,
    monthName: 'Haziran',
    year: 2026,
    hijriDate: '11 Zilhicce 1447',
    prayerTimes: {
      imsak: '03:46',
      gunes: '05:28',
      ogle: '13:28',
      ikindi: '17:36',
      aksam: '20:44',
      yatsi: '22:35'
    },
    religiousDays: [
      {
        name: 'Kurban Bayramı 1. Gün',
        type: 'bayram',
        description: 'Hz. İbrahim\'in kurban etme emrini yerine getirmesinin hatırası.'
      }
    ],
    historyToday: [
      {
        title: 'Kurban Bayramı',
        description: 'Dört günlük mübarek bayram, kurbanların kesildiği gün.',
      }
    ],
    quote: {
      text: 'Kurbanınız kabul, dualarınız müstecap olsun. Hayırlı bayramlar!',
      source: 'Bayram Tebriği'
    },
    specialNotes: ['Kurban Bayramı', 'Resmi Tatil'],
    isHoliday: true,
    holidayName: 'Kurban Bayramı'
  },

  // TEMMUZ 2026
  {
    date: '2026-07-15',
    dayName: 'Çarşamba',
    dayNumber: 15,
    monthNumber: 7,
    monthName: 'Temmuz',
    year: 2026,
    hijriDate: '28 Zilhicce 1447',
    prayerTimes: {
      imsak: '04:01',
      gunes: '05:45',
      ogle: '13:30',
      ikindi: '17:35',
      aksam: '20:38',
      yatsi: '22:23'
    },
    historyToday: [
      {
        title: '15 Temmuz Demokrasi ve Milli Birlik Günü',
        description: 'Türkiye\'nin demokrasisini savunmak için verdiği mücadelenin günü.',
        year: 2016
      }
    ],
    quote: {
      text: 'Demokrasi ve özgürlük, uğruna bedel ödenen en değerli mirastır.',
      source: 'Türk Milleti'
    },
    specialNotes: ['15 Temmuz Şehitlerini Anma Günü'],
    isHoliday: true,
    holidayName: '15 Temmuz Demokrasi ve Milli Birlik Günü'
  },

  // AĞUSTOS 2026
  {
    date: '2026-08-26',
    dayName: 'Çarşamba',
    dayNumber: 26,
    monthNumber: 8,
    monthName: 'Ağustos',
    year: 2026,
    hijriDate: '11 Safer 1448',
    prayerTimes: {
      imsak: '04:42',
      gunes: '06:19',
      ogle: '13:28',
      ikindi: '17:14',
      aksam: '20:07',
      yatsi: '21:38'
    },
    religiousDays: [
      {
        name: 'Muharrem Ayı Başlangıcı',
        type: 'hicri',
        description: 'Hicri takvimin ilk ayı olan Muharrem ayı başlıyor.'
      }
    ],
    historyToday: [
      {
        title: 'Zafer Bayramı Hazırlıkları',
        description: 'Yarın 30 Ağustos Zafer Bayramı kutlanacak.',
      }
    ],
    quote: {
      text: 'Zafer, iman edenlerindir!',
      source: 'Kuran-ı Kerim'
    },
    specialNotes: ['Muharrem ayı başlıyor']
  },
  {
    date: '2026-08-30',
    dayName: 'Pazar',
    dayNumber: 30,
    monthNumber: 8,
    monthName: 'Ağustos',
    year: 2026,
    hijriDate: '15 Safer 1448',
    prayerTimes: {
      imsak: '04:48',
      gunes: '06:24',
      ogle: '13:26',
      ikindi: '17:10',
      aksam: '20:00',
      yatsi: '21:30'
    },
    historyToday: [
      {
        title: 'Zafer Bayramı',
        description: 'Türk Ordusu\'nun Büyük Taarruz\'la düşmanı yendiği tarihi zafer günü.',
        year: 1922
      }
    ],
    quote: {
      text: 'Ordular! İlk hedefiniz Akdeniz\'dir. İleri!',
      author: 'Mustafa Kemal Atatürk'
    },
    specialNotes: ['30 Ağustos Zafer Bayramı'],
    isHoliday: true,
    holidayName: 'Zafer Bayramı'
  },

  // EKİM 2026
  {
    date: '2026-10-04',
    dayName: 'Pazar',
    dayNumber: 4,
    monthNumber: 10,
    monthName: 'Ekim',
    year: 2026,
    hijriDate: '22 Rebiülevvel 1448',
    prayerTimes: {
      imsak: '05:42',
      gunes: '07:10',
      ogle: '13:10',
      ikindi: '16:15',
      aksam: '18:43',
      yatsi: '20:08'
    },
    religiousDays: [
      {
        name: 'Mevlid Kandili',
        type: 'kandil',
        description: 'Hz. Muhammed\'in doğum günü, mübarek gecedir.'
      }
    ],
    historyToday: [
      {
        title: 'Peygamber Efendimizin Doğumu',
        description: 'Hz. Muhammed (s.a.v.) Mekke\'de dünyaya geldi.',
        year: 571
      }
    ],
    quote: {
      text: 'Allah\'ım, Muhammed\'e ve onun ehline salât et.',
      source: 'Salavat-ı Şerife'
    },
    specialNotes: ['Mevlid Kandili']
  },
  {
    date: '2026-10-29',
    dayName: 'Perşembe',
    dayNumber: 29,
    monthNumber: 10,
    monthName: 'Ekim',
    year: 2026,
    hijriDate: '17 Rebiülahir 1448',
    prayerTimes: {
      imsak: '06:08',
      gunes: '07:39',
      ogle: '13:07',
      ikindi: '15:50',
      aksam: '18:15',
      yatsi: '19:44'
    },
    historyToday: [
      {
        title: 'Cumhuriyet Bayramı',
        description: 'Türkiye Cumhuriyeti\'nin ilan edildiği tarihi gün.',
        year: 1923
      }
    ],
    quote: {
      text: 'Egemenlik kayıtsız şartsız milletindir.',
      author: 'Mustafa Kemal Atatürk'
    },
    specialNotes: ['29 Ekim Cumhuriyet Bayramı'],
    isHoliday: true,
    holidayName: 'Cumhuriyet Bayramı'
  },

  // ARALIK 2026
  {
    date: '2026-12-21',
    dayName: 'Pazartesi',
    dayNumber: 21,
    monthNumber: 12,
    monthName: 'Aralık',
    year: 2026,
    hijriDate: '1 Recep 1448',
    prayerTimes: {
      imsak: '06:48',
      gunes: '08:22',
      ogle: '13:14',
      ikindi: '15:31',
      aksam: '17:49',
      yatsi: '19:18'
    },
    seasonalInfo: {
      name: 'Kış Gündönümü',
      type: 'gundonumu',
      description: 'Yılın en kısa günü. Artık günler uzamaya başlayacak.'
    },
    historyToday: [
      {
        title: 'Kış Başlangıcı',
        description: 'Astronomi takviminde kış mevsiminin ilk günü.',
      }
    ],
    quote: {
      text: 'Her mevsimin bir güzelliği vardır. Kış, sabrın ve tefekkürün mevsimidir.',
      source: 'Bilge Söz'
    },
    specialNotes: ['Kış başlıyor', 'Yılın en kısa günü']
  },
  {
    date: '2026-12-31',
    dayName: 'Perşembe',
    dayNumber: 31,
    monthNumber: 12,
    monthName: 'Aralık',
    year: 2026,
    hijriDate: '11 Recep 1448',
    prayerTimes: {
      imsak: '06:50',
      gunes: '08:24',
      ogle: '13:17',
      ikindi: '15:35',
      aksam: '17:53',
      yatsi: '19:22'
    },
    historyToday: [
      {
        title: 'Yılın Son Günü',
        description: '2026 yılının son günü, yeni yıla hazırlık.',
      }
    ],
    quote: {
      text: 'Her yeni gün, Allah\'ın bir lütfudur. Şükürle karşılayınız.',
      source: 'Dini Kaynak'
    },
    specialNotes: ['Yılbaşı arifesi', '2027 yılına hazırlık']
  }
];

// Ay isimleri
export const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Gün isimleri
export const dayNames = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

// Belirli bir tarih için takvim bilgisi al
export function getCalendarDay(date: string): CalendarDay | undefined {
  return calendar2026Sample.find(day => day.date === date);
}

// Belirli bir ay için tüm günleri al
export function getMonthDays(month: number, year: number = 2026): CalendarDay[] {
  return calendar2026Sample.filter(day => day.monthNumber === month && day.year === year);
}

// Bugünün tarihini al
export function getTodayCalendar(): CalendarDay | undefined {
  const today = new Date().toISOString().split('T')[0];
  const todayData = getCalendarDay(today);
  
  // Eğer bugün için veri yoksa, ilk örnek günü döndür (demo için)
  if (!todayData && calendar2026Sample.length > 0) {
    return calendar2026Sample[0];
  }
  
  return todayData;
}
