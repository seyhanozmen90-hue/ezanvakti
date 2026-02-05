import { CalendarDay } from './calendar-types';

// Ay isimleri
export const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Gün isimleri
export const dayNames = [
  'Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'
];

// Basit Hicri tarih hesaplama (yaklaşık)
export function calculateHijriDate(gregorianDate: Date): string {
  const hijriYear = 1447 + Math.floor((gregorianDate.getMonth() + 1) / 12);
  const hijriMonthNames = [
    'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir', 'Cemâziyelevvel', 'Cemâziyelâhir',
    'Recep', 'Şaban', 'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
  ];
  
  // Basit hesaplama - gerçekte daha karmaşık
  const hijriMonth = gregorianDate.getMonth();
  const hijriDay = gregorianDate.getDate();
  
  return `${hijriDay} ${hijriMonthNames[hijriMonth]} ${hijriYear}`;
}

// Namaz vakitlerini basit formülle hesapla (İstanbul için)
export function calculatePrayerTimes(date: Date): {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
} {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  
  // Basit formül - gerçekte astronomik hesaplamalar gerekir
  // Kış ortası (1 Ocak): Güneş 08:00, Yaz ortası (1 Temmuz): Güneş 05:30
  const summerOffset = Math.sin((dayOfYear / 365) * Math.PI) * 150; // ±2.5 saat değişim
  
  const gunesBase = 480 - summerOffset; // Dakika cinsinden
  const imsakBase = gunesBase - 90;
  const ogleBase = 780; // 13:00 sabit
  const ikindiBase = ogleBase + 180;
  const aksamBase = gunesBase + 600 + summerOffset;
  const yatsiBase = aksamBase + 90;
  
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  
  return {
    imsak: formatTime(imsakBase),
    gunes: formatTime(gunesBase),
    ogle: formatTime(ogleBase),
    ikindi: formatTime(ikindiBase),
    aksam: formatTime(aksamBase),
    yatsi: formatTime(yatsiBase)
  };
}

// Özel günler ve tatiller
export const specialDays2026: { [key: string]: Partial<CalendarDay> } = {
  '2026-01-01': {
    religiousDays: [{ name: 'Yılbaşı', type: 'ozel', description: 'Miladi takvimin ilk günü' }],
    isHoliday: true,
    holidayName: 'Yılbaşı',
    quote: { text: 'Yeni bir gün, yeni bir başlangıç, yeni umutlar demektir.', author: 'Anonim' }
  },
  '2026-02-13': {
    religiousDays: [{ name: 'Regaib Kandili', type: 'kandil', description: 'Recep ayının ilk cuma gecesi, mukaddes üç ayların başlangıcı.' }],
    quote: { text: 'Üç aylar, maneviyatın zirvesidir. Bu günleri ibadet ve dua ile ihya ediniz.', source: 'İslami Kaynaklar' },
    specialNotes: ['Regaib Kandili', 'Üç aylar başlıyor']
  },
  '2026-03-14': {
    religiousDays: [{ name: 'Berat Kandili', type: 'kandil', description: 'Şaban ayının on beşinci gecesi, bağışlanma ve rahmet gecesidir.' }],
    quote: { text: 'Bu gece, dua ve istiğfar gecesidir. Günahlardan arınma zamanıdır.', source: 'Hadis-i Şerif' },
    specialNotes: ['Berat Kandili', 'Ramazan ayına hazırlık']
  },
  '2026-03-20': {
    religiousDays: [{ name: 'Ramazan Başlangıcı', type: 'ramazan', description: 'Mübarek Ramazan ayının ilk günü, oruç ibadetinin başlangıcı.' }],
    seasonalInfo: { name: 'İlkbahar Ekinoksu', type: 'eksinoks', description: 'Gece ve gündüzün eşitlendiği ilkbaharın ilk günü.' },
    isHoliday: true,
    holidayName: 'Ramazan Başlangıcı',
    quote: { text: 'Ramazan ayı, Kuran\'ın indirildiği mübarek aydır.', source: 'Bakara Suresi' }
  },
  '2026-04-19': {
    religiousDays: [{ name: 'Ramazan Bayramı 1. Gün', type: 'bayram', description: 'Ramazan orucunun sona ermesiyle kutlanan üç günlük bayram.' }],
    isHoliday: true,
    holidayName: 'Ramazan Bayramı',
    quote: { text: 'İyiliğiniz kabul, duanız müstecap olsun. Hayırlı bayramlar!', source: 'Bayram Tebriği' }
  },
  '2026-04-20': {
    religiousDays: [{ name: 'Ramazan Bayramı 2. Gün', type: 'bayram' }],
    isHoliday: true,
    holidayName: 'Ramazan Bayramı'
  },
  '2026-04-21': {
    religiousDays: [{ name: 'Ramazan Bayramı 3. Gün', type: 'bayram' }],
    isHoliday: true,
    holidayName: 'Ramazan Bayramı'
  },
  '2026-04-23': {
    isHoliday: true,
    holidayName: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
    historyToday: [{ title: '23 Nisan 1920', description: 'Türkiye Büyük Millet Meclisi açıldı.', year: 1920 }],
    quote: { text: 'Cumhuriyet, milletin bağımsızlık ve egemenlik simgesidir.', author: 'Mustafa Kemal Atatürk' }
  },
  '2026-05-01': {
    isHoliday: true,
    holidayName: 'Emek ve Dayanışma Günü',
    quote: { text: 'Çalışmak ibadettir, helal rızık kazanmak en güzel ameldir.', source: 'İslami Kaynak' }
  },
  '2026-05-19': {
    isHoliday: true,
    holidayName: '19 Mayıs',
    historyToday: [{ title: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', description: 'Mustafa Kemal Atatürk\'ün Samsun\'a çıkışı ve Kurtuluş Savaşı\'nın başlangıcı.', year: 1919 }],
    quote: { text: 'Gençliğe hitap: Ey Türk Gençliği! Birinci vazifen, Türk istiklalini, Türk Cumhuriyetini, ilelebet muhafaza ve müdafaa etmektir.', author: 'Mustafa Kemal Atatürk' }
  },
  '2026-06-27': {
    religiousDays: [{ name: 'Kurban Bayramı - Arefe Günü', type: 'bayram', description: 'Kurban Bayramı\'nın öncesi, hacıların Arafat\'ta durduğu gün.' }],
    quote: { text: 'Arefe günü orucu, geçmiş ve gelecek bir yılın günahlarına kefarettir.', source: 'Hadis-i Şerif' },
    specialNotes: ['Arefe günü', 'Kurban Bayramı yarın']
  },
  '2026-06-28': {
    religiousDays: [{ name: 'Kurban Bayramı 1. Gün', type: 'bayram', description: 'Hz. İbrahim\'in kurban etme emrini yerine getirmesinin hatırası.' }],
    isHoliday: true,
    holidayName: 'Kurban Bayramı',
    quote: { text: 'Kurbanınız kabul, dualarınız müstecap olsun. Hayırlı bayramlar!', source: 'Bayram Tebriği' }
  },
  '2026-06-29': {
    religiousDays: [{ name: 'Kurban Bayramı 2. Gün', type: 'bayram' }],
    isHoliday: true,
    holidayName: 'Kurban Bayramı'
  },
  '2026-06-30': {
    religiousDays: [{ name: 'Kurban Bayramı 3. Gün', type: 'bayram' }],
    isHoliday: true,
    holidayName: 'Kurban Bayramı'
  },
  '2026-07-01': {
    religiousDays: [{ name: 'Kurban Bayramı 4. Gün', type: 'bayram' }],
    isHoliday: true,
    holidayName: 'Kurban Bayramı'
  },
  '2026-07-15': {
    isHoliday: true,
    holidayName: '15 Temmuz Demokrasi ve Milli Birlik Günü',
    historyToday: [{ title: '15 Temmuz', description: 'Türkiye\'nin demokrasisini savunmak için verdiği mücadelenin günü.', year: 2016 }],
    quote: { text: 'Demokrasi ve özgürlük, uğruna bedel ödenen en değerli mirastır.', source: 'Türk Milleti' }
  },
  '2026-08-30': {
    isHoliday: true,
    holidayName: 'Zafer Bayramı',
    historyToday: [{ title: 'Zafer Bayramı', description: 'Türk Ordusu\'nun Büyük Taarruz\'la düşmanı yendiği tarihi zafer günü.', year: 1922 }],
    quote: { text: 'Ordular! İlk hedefiniz Akdeniz\'dir. İleri!', author: 'Mustafa Kemal Atatürk' }
  },
  '2026-10-04': {
    religiousDays: [{ name: 'Mevlid Kandili', type: 'kandil', description: 'Hz. Muhammed\'in doğum günü, mübarek gecedir.' }],
    historyToday: [{ title: 'Peygamber Efendimizin Doğumu', description: 'Hz. Muhammed (s.a.v.) Mekke\'de dünyaya geldi.', year: 571 }],
    quote: { text: 'Allah\'ım, Muhammed\'e ve onun ehline salât et.', source: 'Salavat-ı Şerife' }
  },
  '2026-10-29': {
    isHoliday: true,
    holidayName: 'Cumhuriyet Bayramı',
    historyToday: [{ title: 'Cumhuriyet Bayramı', description: 'Türkiye Cumhuriyeti\'nin ilan edildiği tarihi gün.', year: 1923 }],
    quote: { text: 'Egemenlik kayıtsız şartsız milletindir.', author: 'Mustafa Kemal Atatürk' }
  },
  '2026-12-21': {
    seasonalInfo: { name: 'Kış Gündönümü', type: 'gundonumu', description: 'Yılın en kısa günü. Artık günler uzamaya başlayacak.' },
    quote: { text: 'Her mevsimin bir güzelliği vardır. Kış, sabrın ve tefekkürün mevsimidir.', source: 'Bilge Söz' }
  }
};

// Klasik takvim sözleri havuzu
const calendarQuotes = [
  { text: 'Allah\'a güven, ama deveni bağla.', source: 'Hikmetli Söz' },
  { text: 'Sabır, acı olmasına rağmen, meyvesi tatlıdır.', source: 'Hz. Ali' },
  { text: 'İlim Çin\'de bile olsa git, onu al.', source: 'Hadis-i Şerif' },
  { text: 'İyilik yap denize at, balık bilmezse Halik bilir.', source: 'Atasözü' },
  { text: 'Akıllı düşmanın, akılsız dosttan hayırlıdır.', source: 'Atasözü' },
  { text: 'El elin eşeğini türkü çağırarak arar.', source: 'Atasözü' },
  { text: 'Damlaya damlaya göl olur.', source: 'Atasözü' },
  { text: 'Acele işe şeytan karışır.', source: 'Atasözü' },
  { text: 'Az kalsın kazım, çok kalsın yazım.', source: 'Atasözü' },
  { text: 'Bugünkü tavuk, yarınki kazdan iyidir.', source: 'Atasözü' }
];

// Tüm yıl için takvim oluştur
export function generate2026Calendar(): CalendarDay[] {
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
      
      // Özel gün varsa al
      const specialDay = specialDays2026[dateString];
      
      // Rastgele özlü söz seç
      const randomQuote = calendarQuotes[day % calendarQuotes.length];
      
      const calendarDay: CalendarDay = {
        date: dateString,
        dayName,
        dayNumber: day,
        monthNumber: month + 1,
        monthName,
        year,
        hijriDate,
        prayerTimes,
        quote: specialDay?.quote || randomQuote,
        ...specialDay
      };
      
      calendar.push(calendarDay);
    }
  }
  
  return calendar;
}
