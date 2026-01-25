'use client';

import { formatTurkishDate, formatHijri } from '@/lib/calendar';

interface CalendarLeafProps {
  date: Date;
  cityLabel?: string;
  times?: {
    imsak: string;
    gunes: string;
    ogle: string;
    ikindi: string;
    aksam: string;
    yatsi: string;
  };
}

export default function CalendarLeaf({ 
  date, 
  cityLabel = 'İstanbul',
  times 
}: CalendarLeafProps) {
  const hijriDate = formatHijri(date);
  
  const day = date.getDate();
  const months = [
    'OCAK', 'ŞUBAT', 'MART', 'NİSAN', 'MAYIS', 'HAZİRAN',
    'TEMMUZ', 'AĞUSTOS', 'EYLÜL', 'EKİM', 'KASIM', 'ARALIK'
  ];
  const monthName = months[date.getMonth()];
  const monthNameShort = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][date.getMonth()];
  const year = date.getFullYear();
  const dayNames = ['PAZAR', 'PAZARTESİ', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESİ'];
  const dayName = dayNames[date.getDay()];

  // Mock vakitler - İstanbul için sabit
  const istanbulTimes = {
    imsak: '05:45',
    gunes: '07:15',
    ogle: '12:45',
    ikindi: '15:30',
    aksam: '18:00',
    yatsi: '19:30',
  };

  // Seçilen şehir için vakitler (API'den gelirse kullan, yoksa mock)
  const selectedCityTimes = times || {
    imsak: '05:45',
    gunes: '07:15',
    ogle: '12:45',
    ikindi: '15:30',
    aksam: '18:00',
    yatsi: '19:30',
  };

  // Hicri tarihi parse et
  const hijriParts = hijriDate?.split(' ') || [];
  const hijriDay = hijriParts[0] || '';
  const hijriMonth = hijriParts[1] || '';
  const hijriYear = hijriParts[2] || '';

  // Gün numarasını ay adına çevir
  const monthNumber = date.getMonth() + 1;
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Kağıt Gölge Efekti */}
      <div className="absolute inset-0 bg-gray-300 dark:bg-gray-900 transform rotate-0.5 scale-[0.99] opacity-30" />
      
      {/* Ana Takvim Yaprağı - SİYAH BEYAZ */}
      <div className="relative bg-white dark:bg-gray-900 shadow-2xl border-[3px] border-black dark:border-gray-300">
        {/* Yıldız Bordür (Üst) */}
        <div className="border-b-[2px] border-black dark:border-gray-300 py-0.5">
          <div className="flex justify-center text-[9px] leading-none">
            <span className="tracking-[0.3px] text-black dark:text-gray-300">★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★</span>
          </div>
        </div>

        {/* Üst Bilgi: Hicri / Günün kısalması / Rumi */}
        <div className="flex justify-between items-center px-4 py-2.5 text-[11px] border-b-[2px] border-black dark:border-gray-300">
          <div className="text-left leading-[1.1]">
            <div className="font-black text-black dark:text-white">{hijriYear} Hicri</div>
            <div className="font-black uppercase text-[14px] text-black dark:text-white">{hijriMonth}</div>
            <div className="font-black text-[17px] text-black dark:text-white">{hijriDay}</div>
          </div>
          <div className="text-center leading-[1.2]">
            <div className="font-black text-[10px] text-black dark:text-white">Günün</div>
            <div className="font-black text-[10px] text-black dark:text-white">kısalması</div>
            <div className="font-black text-[11px] text-black dark:text-white">2 dakika</div>
          </div>
          <div className="text-right leading-[1.1]">
            <div className="font-black text-black dark:text-white">{year} Rumi</div>
            <div className="font-black uppercase text-[14px] text-black dark:text-white">{monthName}</div>
            <div className="font-black text-[17px] text-black dark:text-white">{day}</div>
          </div>
        </div>

        {/* Yıl, Ay, Gün, Kasım Bilgisi */}
        <div className="text-center py-1.5 border-b-[2px] border-black dark:border-gray-300">
          <div className="text-[12px] leading-tight text-black dark:text-white">
            <span className="font-black">Yıl: {year},</span>{' '}
            <span className="font-black">Ay: {monthNumber},</span>{' '}
            <span className="font-black">Gün: {dayOfYear},</span>{' '}
            <span className="font-black">Kasım: {Math.floor(dayOfYear / 7) + 1}</span>
          </div>
        </div>

        {/* Ana İçerik: Ay Adı + Saatler + Gün + Vakitler */}
        <div className="py-3 px-4">
          {/* Ay Adı */}
          <div className="text-center mb-3">
            <h2 className="text-[48px] font-black tracking-[0.25em] leading-none text-black dark:text-white">{monthName}</h2>
          </div>

          {/* Grid: Sol Saat + Ortada Gün + Sağ Saat */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
            {/* Sol Bölüm: Saat + İstanbul Vakitleri */}
            <div className="flex flex-col items-center">
              {/* Sol Saat */}
              <div className="w-[90px] h-[90px] rounded-full border-[3px] border-black dark:border-white relative bg-white dark:bg-gray-900 mb-1">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black dark:text-white" />
                  <text x="50" y="16" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">12</text>
                  <text x="84" y="54" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">3</text>
                  <text x="50" y="92" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">6</text>
                  <text x="16" y="54" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">9</text>
                  <line x1="50" y1="50" x2="50" y2="18" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white" />
                  <line x1="50" y1="50" x2="72" y2="32" stroke="currentColor" strokeWidth="3" className="text-black dark:text-white" />
                  <circle cx="50" cy="50" r="3" className="fill-black dark:fill-white" />
                </svg>
              </div>
              <div className="text-[12px] font-black mb-2 text-black dark:text-white">İstanbul</div>

              {/* İstanbul Vakitleri Tablosu - SABİT */}
              <div className="border-[3px] border-black dark:border-white bg-white dark:bg-gray-900 w-full">
                <table className="w-full text-[13px]">
                  <tbody>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Güneş</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{istanbulTimes.gunes}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Öğle</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{istanbulTimes.ogle}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">İkindi</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{istanbulTimes.ikindi}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Akşam</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{istanbulTimes.aksam}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Yatsı</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{istanbulTimes.yatsi}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">İmsak</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{istanbulTimes.imsak}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ortada: DEV GÜN NUMARASI */}
            <div className="flex items-center justify-center px-6">
              <div className="text-[180px] font-black leading-none text-black dark:text-white" style={{ letterSpacing: '-0.05em' }}>
                {day}
              </div>
            </div>

            {/* Sağ Bölüm: Saat + Seçilen Şehir Vakitleri */}
            <div className="flex flex-col items-center">
              {/* Sağ Saat */}
              <div className="w-[90px] h-[90px] rounded-full border-[3px] border-black dark:border-white relative bg-white dark:bg-gray-900 mb-1">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black dark:text-white" />
                  <text x="50" y="16" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">12</text>
                  <text x="84" y="54" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">3</text>
                  <text x="50" y="92" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">6</text>
                  <text x="16" y="54" textAnchor="middle" className="text-[11px] font-black fill-black dark:fill-white">9</text>
                  <line x1="50" y1="50" x2="68" y2="50" stroke="currentColor" strokeWidth="2" className="text-black dark:text-white" />
                  <line x1="50" y1="50" x2="62" y2="38" stroke="currentColor" strokeWidth="3" className="text-black dark:text-white" />
                  <circle cx="50" cy="50" r="3" className="fill-black dark:fill-white" />
                </svg>
              </div>
              <div className="text-[12px] font-black mb-2 text-black dark:text-white">{cityLabel}</div>

              {/* Seçilen Şehir Vakitleri Tablosu - DİNAMİK */}
              <div className="border-[3px] border-black dark:border-white bg-white dark:bg-gray-900 w-full">
                <table className="w-full text-[13px]">
                  <tbody>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Güneş</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{selectedCityTimes.gunes}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Öğle</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{selectedCityTimes.ogle}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">İkindi</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{selectedCityTimes.ikindi}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Akşam</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{selectedCityTimes.aksam}</td>
                    </tr>
                    <tr className="border-b-[2px] border-black dark:border-white">
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">Yatsı</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{selectedCityTimes.yatsi}</td>
                    </tr>
                    <tr>
                      <td className="py-1 px-2 font-black text-left text-black dark:text-white">İmsak</td>
                      <td className="py-1 px-2 font-black text-right tabular-nums text-black dark:text-white">{selectedCityTimes.imsak}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Gün/Gece Bilgisi */}
        <div className="text-center py-2 border-t-[2px] border-b-[2px] border-black dark:border-gray-300">
          <div className="text-[11px] leading-tight text-black dark:text-white">
            <span className="font-black">Günün devamı: 10 S. 09 D.</span> — <span className="font-black">Gecenin devamı: 13 S. 51 D.</span>
          </div>
        </div>

        {/* CUMARTESİ - BÜYÜK */}
        <div className="text-center py-4 border-b-[3px] border-black dark:border-gray-300">
          <h3 className="text-[60px] font-black tracking-[0.18em] leading-none text-black dark:text-white">{dayName}</h3>
        </div>

        {/* Alt Bilgi - Haşarın gizlenmesi */}
        <div className="text-center py-2.5 border-b-[2px] border-black dark:border-gray-300">
          <div className="text-[10px] px-4 leading-snug text-black dark:text-white">
            <span className="font-black italic">(Haşaratın gizlenmesi)</span>
          </div>
        </div>

        {/* Şiir/Söz Bölümü */}
        <div className="text-center py-3 border-b-[2px] border-black dark:border-gray-300">
          <div className="text-[11px] px-6 leading-snug text-black dark:text-white">
            <p className="font-normal italic">
              Kullahın sat yine lâkin boğuncul olman nâmerde<br />
              Cihanda kelle sağ olsun, külah eksik değil merde
            </p>
            <div className="text-[10px] mt-2 font-black">ÜÇÜNCÜ SELİM</div>
          </div>
        </div>

        {/* Alt Başlık */}
        <div className="text-center py-2">
          <h4 className="text-[13px] font-black tracking-wide text-black dark:text-white">
            Büyük Saatli Maarif Takvimi
          </h4>
        </div>

        {/* Yıldız Bordür (Alt) */}
        <div className="border-t-[2px] border-black dark:border-gray-300 py-0.5">
          <div className="flex justify-center text-[9px] leading-none">
            <span className="tracking-[0.3px] text-black dark:text-gray-300">★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
