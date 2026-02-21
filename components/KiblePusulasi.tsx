'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Büyük Daire Formülü ile Kıble açısı hesaplama
function kiblaAcisiHesapla(lat: number, lng: number): number {
  const KABE_LAT = 21.4225 * (Math.PI / 180);
  const KABE_LNG = 39.8262 * (Math.PI / 180);
  const kullaniciLat = lat * (Math.PI / 180);
  const kullaniciLng = lng * (Math.PI / 180);

  const dLng = KABE_LNG - kullaniciLng;

  const y = Math.sin(dLng) * Math.cos(KABE_LAT);
  const x =
    Math.cos(kullaniciLat) * Math.sin(KABE_LAT) -
    Math.sin(kullaniciLat) * Math.cos(KABE_LAT) * Math.cos(dLng);

  const aci = Math.atan2(y, x) * (180 / Math.PI);
  return (aci + 360) % 360;
}

// Mesafe hesaplama (km)
function mesafeHesapla(lat: number, lng: number): number {
  const KABE_LAT = 21.4225;
  const KABE_LNG = 39.8262;
  const R = 6371;
  const dLat = (KABE_LAT - lat) * (Math.PI / 180);
  const dLon = (KABE_LNG - lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat * (Math.PI / 180)) *
      Math.cos(KABE_LAT * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

type Durum = 'bekliyor' | 'yukleniyor' | 'aktif' | 'hata';

export default function KiblePusulasi() {
  const [durum, setDurum] = useState<Durum>('bekliyor');
  const [konum, setKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [kiblaAcisi, setKiblaAcisi] = useState<number | null>(null);
  const [cihazAcisi, setCihazAcisi] = useState(0);
  const [dogruYon, setDogruYon] = useState(false);
  const [mesafe, setMesafe] = useState<number | null>(null);
  const [hataMetni, setHataMetni] = useState('');
  const [sensorDestegi, setSensorDestegi] = useState(true);
  const ibraRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const mevcutAciRef = useRef(0);
  const removeHandlerRef = useRef<(() => void) | null>(null);

  // Smooth ibre animasyonu
  const ibraGuncelle = useCallback(
    (hedefAci: number) => {
      if (animRef.current) cancelAnimationFrame(animRef.current);

      const animate = () => {
        const fark = ((hedefAci - mevcutAciRef.current + 540) % 360) - 180;
        if (Math.abs(fark) < 0.3) {
          mevcutAciRef.current = hedefAci;
        } else {
          mevcutAciRef.current += fark * 0.12;
        }
        if (ibraRef.current) {
          ibraRef.current.style.transform = `rotate(${mevcutAciRef.current}deg)`;
        }
        if (kiblaAcisi !== null) {
          const aralik = Math.abs(
            ((mevcutAciRef.current - kiblaAcisi + 540) % 360) - 180
          );
          setDogruYon(aralik < 5);
        }
        if (Math.abs(fark) > 0.3) {
          animRef.current = requestAnimationFrame(animate);
        }
      };
      animRef.current = requestAnimationFrame(animate);
    },
    [kiblaAcisi]
  );

  // Sensör izni ve dinleme
  const sensorBaslat = useCallback(
    async () => {
      const handler = (e: DeviceOrientationEvent) => {
        const aci =
          (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading ??
          (e.alpha != null ? 360 - e.alpha : 0);
        setCihazAcisi(aci);
        if (kiblaAcisi !== null) {
          const ibraAcisi = (kiblaAcisi - aci + 360) % 360;
          ibraGuncelle(ibraAcisi);
        }
      };

      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
      ) {
        try {
          const izin = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
          if (izin === 'granted') {
            window.addEventListener('deviceorientation', handler, true);
            removeHandlerRef.current = () =>
              window.removeEventListener('deviceorientation', handler, true);
          } else {
            setSensorDestegi(false);
          }
        } catch {
          setSensorDestegi(false);
        }
      } else if (typeof DeviceOrientationEvent !== 'undefined') {
        window.addEventListener('deviceorientation', handler, true);
        removeHandlerRef.current = () =>
          window.removeEventListener('deviceorientation', handler, true);
      } else {
        setSensorDestegi(false);
      }
    },
    [kiblaAcisi, ibraGuncelle]
  );

  useEffect(() => {
    return () => {
      removeHandlerRef.current?.();
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Konum al
  const konumAl = useCallback(() => {
    setDurum('yukleniyor');
    if (!navigator.geolocation) {
      setHataMetni('Tarayıcınız konum özelliğini desteklemiyor.');
      setDurum('hata');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setKonum({ lat: latitude, lng: longitude });
        const aci = kiblaAcisiHesapla(latitude, longitude);
        setKiblaAcisi(aci);
        setMesafe(mesafeHesapla(latitude, longitude));
        setDurum('aktif');
        sensorBaslat();
      },
      (err) => {
        const mesajlar: Record<number, string> = {
          1: 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.',
          2: 'Konum bilgisi alınamadı. GPS sinyali kontrol edin.',
          3: 'Konum isteği zaman aşımına uğradı.',
        };
        setHataMetni(mesajlar[err.code] ?? 'Bilinmeyen bir hata oluştu.');
        setDurum('hata');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [sensorBaslat]);

  // Sensör yoksa kibla açısını manuel olarak göster
  useEffect(() => {
    if (durum === 'aktif' && !sensorDestegi && kiblaAcisi !== null) {
      ibraGuncelle(kiblaAcisi);
    }
  }, [durum, sensorDestegi, kiblaAcisi, ibraGuncelle]);

  const yonIsmi = (aci: number) => {
    const yonler = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
    return yonler[Math.round(aci / 45) % 8];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Başlık */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          <span className="text-3xl">🕋</span>
          <h1 className="text-3xl font-bold text-white tracking-wide">
            Kıble Pusulası
          </h1>
          <span className="text-3xl">🧭</span>
        </div>
        <p className="text-emerald-400 text-sm">GPS ile Kabe yönünü bulun</p>
      </div>

      {/* Ana Kart */}
      <div className="w-full max-w-sm">
        {/* BEKLIYOR */}
        {durum === 'bekliyor' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
              <span className="text-4xl">📍</span>
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">
              Konuma İzin Gerekli
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Kıble yönünü hesaplamak için konumunuza erişim gereklidir.
            </p>
            <button
              onClick={konumAl}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25"
            >
              Konumu Etkinleştir
            </button>
          </div>
        )}

        {/* YÜKLENIYOR */}
        {durum === 'yukleniyor' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">
                🛰️
              </span>
            </div>
            <p className="text-white font-medium">GPS Sinyal Alınıyor...</p>
            <p className="text-slate-400 text-sm mt-1">Lütfen bekleyin</p>
          </div>
        )}

        {/* HATA */}
        {durum === 'hata' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <p className="text-white font-medium mb-2">Hata Oluştu</p>
            <p className="text-red-300 text-sm mb-6">{hataMetni}</p>
            <button
              onClick={() => setDurum('bekliyor')}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-3 rounded-2xl border border-red-500/30 transition-all"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* AKTİF - Pusula */}
        {durum === 'aktif' && (
          <div className="space-y-4">
            {/* Pusula */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
              {/* Doğru Yön Göstergesi */}
              <div
                className={`text-center mb-4 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                  dogruYon
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                {dogruYon
                  ? '✅ Doğru Yöndesiniz! Kıble Bu Yön'
                  : 'Kıble Yönünü Bulun'}
              </div>

              {/* Pusula Dairesi */}
              <div className="relative w-64 h-64 mx-auto">
                {/* Dış Halka */}
                <div className="absolute inset-0 rounded-full border-2 border-white/10 bg-gradient-to-b from-white/5 to-transparent" />

                {/* Yön İşaretleri */}
                {[
                  { label: 'K', deg: 0 },
                  { label: 'D', deg: 90 },
                  { label: 'G', deg: 180 },
                  { label: 'B', deg: 270 },
                ].map(({ label, deg }) => (
                  <div
                    key={label}
                    className="absolute inset-0 flex items-start justify-center"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <span
                      className={`text-xs font-bold mt-2 ${
                        label === 'K' ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}

                {/* İç Çember */}
                <div className="absolute inset-6 rounded-full border border-white/5 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center">
                  {/* İbre (Kıble oku) */}
                  <div
                    ref={ibraRef}
                    className="absolute w-full h-full flex flex-col items-center justify-start pt-4"
                    style={{ transformOrigin: 'center center' }}
                  >
                    <div className="flex flex-col items-center">
                      {/* Üst (Kıble yönü - Kabe) */}
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[20px] border-l-transparent border-r-transparent border-b-emerald-400 drop-shadow-lg" />
                      <div className="w-2 h-12 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-b" />
                      {/* Merkez nokta */}
                      <div className="w-4 h-4 rounded-full bg-white/20 border-2 border-white/40 -my-1" />
                      {/* Alt */}
                      <div className="w-2 h-12 bg-gradient-to-b from-slate-500 to-slate-600 rounded-t" />
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[20px] border-l-transparent border-r-transparent border-t-slate-500" />
                    </div>
                  </div>

                  {/* Kabe ikonu ortada */}
                  <span className="text-2xl z-10 pointer-events-none select-none opacity-60">
                    🕋
                  </span>
                </div>
              </div>

              {/* Açı Bilgisi */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {kiblaAcisi != null ? Math.round(kiblaAcisi) : '—'}°
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Kıble Açısı</div>
                </div>
                {sensorDestegi && (
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-slate-300">
                      {Math.round(cihazAcisi)}°{' '}
                      <span className="text-base">{yonIsmi(cihazAcisi)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Cihaz Yönü</div>
                  </div>
                )}
              </div>
            </div>

            {/* Bilgi Kartları */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-emerald-400 text-xl font-bold">
                  {mesafe?.toLocaleString('tr-TR') ?? '—'} km
                </div>
                <div className="text-slate-500 text-xs mt-1">Kabe&apos;ye Mesafe</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <div className="text-slate-300 text-sm font-mono">
                  {konum?.lat.toFixed(4)}°K
                </div>
                <div className="text-slate-300 text-sm font-mono">
                  {konum?.lng.toFixed(4)}°D
                </div>
                <div className="text-slate-500 text-xs mt-1">Konumunuz</div>
              </div>
            </div>

            {/* Sensör Uyarısı */}
            {!sensorDestegi && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <p className="text-amber-400 text-sm">
                  ⚠️ Sensör desteklenmiyor. Pusula ok, hesaplanan kıble yönünü
                  gösteriyor. Cihazınızı döndürerek yönü bulun.
                </p>
              </div>
            )}

            {/* Yenile Butonu */}
            <button
              onClick={() => {
                removeHandlerRef.current?.();
                setDurum('bekliyor');
                setKonum(null);
                setKiblaAcisi(null);
                setCihazAcisi(0);
                setDogruYon(false);
              }}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-sm py-3 rounded-2xl transition-all"
            >
              Konumu Yenile
            </button>
          </div>
        )}
      </div>

      {/* Alt Bilgi */}
      <p className="text-slate-600 text-xs text-center mt-8 max-w-xs">
        Kabe koordinatları: 21.4225°K, 39.8262°D · Büyük Daire Formülü
      </p>
    </div>
  );
}
