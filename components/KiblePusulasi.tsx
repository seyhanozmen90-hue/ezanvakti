'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* iOS: requestPermission constructor'da static */
type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};
/* iOS: webkitCompassHeading event instance'da (standart değil) */
type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

/* ─────────────────────────────────────────────
   YARDIMCI FONKSİYONLAR
───────────────────────────────────────────── */

/** Büyük Daire Formülü → Kıble açısı (0-360°, Kuzey=0) */
function kiblaHesapla(lat: number, lng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const KABE = { lat: toRad(21.4225), lng: toRad(39.8262) };
  const uLat = toRad(lat);
  const dLng = KABE.lng - toRad(lng);
  const y = Math.sin(dLng) * Math.cos(KABE.lat);
  const x =
    Math.cos(uLat) * Math.sin(KABE.lat) -
    Math.sin(uLat) * Math.cos(KABE.lat) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Haversine → Kabe'ye km */
function mesafeHesapla(lat: number, lng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(21.4225 - lat);
  const dLng = toRad(39.8262 - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(21.4225)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * En kısa açı farkı: -180 ile +180 arasında
 * + → sağa dön, - → sola dön
 */
function aciFarki(hedef: number, mevcut: number): number {
  return ((hedef - mevcut + 540) % 360) - 180;
}

type IbreRefObj = { current: number; rafId: number | null };

/** requestAnimationFrame tabanlı smooth sayı interpolasyonu */
function smoothAngle(
  ref: IbreRefObj,
  hedef: number,
  onUpdate: (v: number) => void,
  tolerance = 0.5
): void {
  if (ref.rafId) cancelAnimationFrame(ref.rafId);
  const animate = () => {
    const d = ((hedef - ref.current + 540) % 360) - 180;
    if (Math.abs(d) < tolerance) {
      ref.current = hedef % 360;
    } else {
      ref.current = (ref.current + d * 0.15 + 360) % 360;
      ref.rafId = requestAnimationFrame(animate);
    }
    onUpdate(ref.current);
  };
  ref.rafId = requestAnimationFrame(animate);
}

type Durum = 'bekliyor' | 'yukleniyor' | 'aktif' | 'hata';

/* ─────────────────────────────────────────────
   ANA BİLEŞEN
───────────────────────────────────────────── */
export default function KiblePusulasi() {
  const [durum, setDurum] = useState<Durum>('bekliyor');
  const [hata, setHata] = useState('');
  const [kiblaAcisi, setKiblaAcisi] = useState<number | null>(null);
  const [cihazYonu, setCihazYonu] = useState(0);
  const [ibreAcisi, setIbreAcisi] = useState(0);
  const [kalanAci, setKalanAci] = useState<number | null>(null);
  const [dogruYon, setDogruYon] = useState(false);
  const [mesafe, setMesafe] = useState<number | null>(null);
  const [konum, setKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [sensorVar, setSensorVar] = useState(true);
  const [titresim, setTitresim] = useState(false);

  const ibreRef = useRef<IbreRefObj>({ current: 0, rafId: null });
  const kiblaRef = useRef<number | null>(null);
  const temizleyici = useRef<(() => void) | null>(null);

  kiblaRef.current = kiblaAcisi;

  const sensorHandler = useCallback((e: DeviceOrientationEventWithCompass) => {
    let kuzey = 0;

    if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) {
      kuzey = e.webkitCompassHeading;
    } else if (e.alpha !== null && e.alpha !== undefined) {
      kuzey = (360 - e.alpha) % 360;
    }

    setCihazYonu(Math.round(kuzey));

    const kibla = kiblaRef.current;
    if (kibla === null) return;

    const hedefIbre = (kibla - kuzey + 360) % 360;

    smoothAngle(ibreRef.current, hedefIbre, (v) => {
      setIbreAcisi(v);
    });

    const fark = aciFarki(kibla, kuzey);
    setKalanAci(fark);

    const esik = 5;
    const yeniDogruYon = Math.abs(fark) <= esik;
    setDogruYon((prev) => {
      if (!prev && yeniDogruYon) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTitresim(true);
        setTimeout(() => setTitresim(false), 800);
      }
      return yeniDogruYon;
    });
  }, []);

  const sensorBaslat = useCallback(async () => {
    if (typeof DeviceOrientationEvent === 'undefined') {
      setSensorVar(false);
      return;
    }

    const baslat = () => {
      window.addEventListener('deviceorientation', sensorHandler, true);
      temizleyici.current = () =>
        window.removeEventListener('deviceorientation', sensorHandler, true);
    };

    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const izin = await DOE.requestPermission();
        if (izin === 'granted') {
          baslat();
        } else {
          setSensorVar(false);
        }
      } catch {
        setSensorVar(false);
      }
    } else {
      baslat();
    }
  }, [sensorHandler]);

  const konumAl = useCallback(() => {
    setDurum('yukleniyor');
    setHata('');

    if (!navigator.geolocation) {
      setHata('Tarayıcınız konum özelliğini desteklemiyor.');
      setDurum('hata');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const kibla = kiblaHesapla(lat, lng);
        setKonum({ lat, lng });
        setKiblaAcisi(kibla);
        setMesafe(mesafeHesapla(lat, lng));
        setDurum('aktif');
        await sensorBaslat();
      },
      (err: GeolocationPositionError) => {
        const mesajlar: Record<number, string> = {
          1: 'Konum izni reddedildi. Tarayıcı ayarlarından izin verin.',
          2: 'Konum alınamadı. GPS sinyal kontrolü yapın.',
          3: 'Konum isteği zaman aşımına uğradı.',
        };
        setHata(mesajlar[err.code] ?? 'Bilinmeyen hata.');
        setDurum('hata');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [sensorBaslat]);

  useEffect(() => {
    return () => {
      temizleyici.current?.();
      if (ibreRef.current.rafId) cancelAnimationFrame(ibreRef.current.rafId);
    };
  }, []);

  useEffect(() => {
    if (durum === 'aktif' && !sensorVar && kiblaAcisi !== null) {
      setIbreAcisi(kiblaAcisi);
      setKalanAci(null);
    }
  }, [durum, sensorVar, kiblaAcisi]);

  const yonMesaji = (): { metin: string; renk: string; ikon: string } | null => {
    if (!sensorVar)
      return { metin: 'Pusula sensörü yok — statik yön gösteriliyor', renk: 'amber', ikon: '⚠️' };
    if (kalanAci === null) return { metin: 'Sensör bekleniyor...', renk: 'slate', ikon: '🔄' };
    if (dogruYon) return { metin: 'DOĞRU YÖNDESINIZ! 🕋', renk: 'emerald', ikon: '✅' };
    const derece = Math.abs(Math.round(kalanAci));
    if (kalanAci > 0) return { metin: `SAĞA DÖN → ${derece}°`, renk: 'sky', ikon: '👉' };
    return { metin: `SOLA DÖN ← ${derece}°`, renk: 'violet', ikon: '👈' };
  };

  const yon = durum === 'aktif' ? yonMesaji() : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2137] to-[#0a1628] flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-white tracking-wider">
          KI<span className="text-emerald-400">BLE</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Kabe Yönü Pusulası</p>
      </div>

      {durum === 'bekliyor' && (
        <div className="w-full max-w-xs bg-white/5 border border-white/10 backdrop-blur rounded-3xl p-8 text-center space-y-5">
          <div className="text-6xl">🕋</div>
          <div>
            <p className="text-white font-semibold">Kıble Yönünü Bul</p>
            <p className="text-slate-400 text-sm mt-1">GPS konumunuza erişim gereklidir</p>
          </div>
          <button
            onClick={konumAl}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/30 text-lg"
          >
            📍 Başla
          </button>
        </div>
      )}

      {durum === 'yukleniyor' && (
        <div className="w-full max-w-xs text-center space-y-4">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-emerald-400 animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🛰️</span>
          </div>
          <p className="text-white font-medium">GPS alınıyor...</p>
          <p className="text-slate-400 text-xs">Cihazınızı açık havada tutun</p>
        </div>
      )}

      {durum === 'hata' && (
        <div className="w-full max-w-xs bg-red-500/10 border border-red-500/30 rounded-3xl p-7 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-300 text-sm">{hata}</p>
          <button
            onClick={() => setDurum('bekliyor')}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-medium py-3 rounded-2xl transition-all"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {durum === 'aktif' && (
        <div className="w-full max-w-sm space-y-4">
          <div
            className={`
              rounded-2xl py-4 px-5 text-center font-bold text-lg tracking-wide transition-all duration-300
              ${dogruYon
                ? `bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 ${titresim ? 'scale-105' : ''}`
                : yon?.renk === 'sky'
                  ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300'
                  : yon?.renk === 'violet'
                    ? 'bg-violet-500/15 border border-violet-500/40 text-violet-300'
                    : 'bg-slate-500/15 border border-slate-500/30 text-slate-400'
              }
            `}
          >
            <span className="mr-2 text-2xl">{yon?.ikon}</span>
            {yon?.metin}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="relative w-64 h-64 mx-auto">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 264 264">
                <circle cx="132" cy="132" r="128" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                {Array.from({ length: 72 }).map((_, i) => {
                  const a = (i * 5 * Math.PI) / 180;
                  const major = i % 9 === 0;
                  const r1 = major ? 114 : 119;
                  const r2 = 126;
                  return (
                    <line
                      key={i}
                      x1={132 + r1 * Math.sin(a)}
                      y1={132 - r1 * Math.cos(a)}
                      x2={132 + r2 * Math.sin(a)}
                      y2={132 - r2 * Math.cos(a)}
                      stroke={major ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={major ? 2 : 1}
                    />
                  );
                })}
                {[
                  { label: 'K', angle: 0, color: '#34d399' },
                  { label: 'D', angle: 90, color: '#94a3b8' },
                  { label: 'G', angle: 180, color: '#94a3b8' },
                  { label: 'B', angle: 270, color: '#94a3b8' },
                ].map(({ label, angle, color }) => {
                  const r = 100;
                  const a = (angle * Math.PI) / 180;
                  return (
                    <text
                      key={label}
                      x={132 + r * Math.sin(a)}
                      y={132 - r * Math.cos(a) + 5}
                      textAnchor="middle"
                      fill={color}
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {label}
                    </text>
                  );
                })}
              </svg>

              <div
                className="absolute inset-6 rounded-full flex items-center justify-center"
                style={{
                  transform: `rotate(${ibreAcisi}deg)`,
                  transition: 'transform 0.05s linear',
                  background:
                    'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.04), rgba(0,0,0,0.3))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <svg viewBox="0 0 80 160" className="w-16 h-32" style={{ overflow: 'visible' }}>
                  <polygon
                    points="40,4 52,72 40,64 28,72"
                    fill="url(#yesilGrad)"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                  />
                  <text x="40" y="0" textAnchor="middle" fontSize="18" dominantBaseline="auto" style={{ userSelect: 'none' }}>
                    🕋
                  </text>
                  <polygon
                    points="40,88 52,156 40,164 28,156"
                    fill="url(#grisGrad)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                  <circle cx="40" cy="80" r="7" fill="#1e293b" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <circle cx="40" cy="80" r="3" fill="rgba(255,255,255,0.5)" />
                  <defs>
                    <linearGradient id="yesilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#065f46" />
                    </linearGradient>
                    <linearGradient id="grisGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#475569" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="flex justify-center gap-8 mt-5">
              <div className="text-center">
                <div className="text-emerald-400 text-2xl font-mono font-bold">
                  {kiblaAcisi !== null ? Math.round(kiblaAcisi) : '--'}°
                </div>
                <div className="text-slate-500 text-xs mt-0.5">Kıble Açısı</div>
              </div>
              {sensorVar && (
                <div className="text-center">
                  <div className="text-slate-300 text-2xl font-mono font-bold">{cihazYonu}°</div>
                  <div className="text-slate-500 text-xs mt-0.5">Cihaz Yönü</div>
                </div>
              )}
              {kalanAci !== null && (
                <div className="text-center">
                  <div
                    className={`text-2xl font-mono font-bold ${
                      dogruYon ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {dogruYon ? '✓' : `${Math.abs(Math.round(kalanAci))}°`}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {dogruYon ? 'İsabet' : kalanAci > 0 ? 'Sağda' : 'Solda'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-emerald-400 text-xl font-bold">
                {mesafe?.toLocaleString('tr-TR')} km
              </div>
              <div className="text-slate-500 text-xs mt-1">Kabe&apos;ye Mesafe</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <div className="text-slate-300 text-xs font-mono">{konum?.lat.toFixed(4)}°K</div>
              <div className="text-slate-300 text-xs font-mono">{konum?.lng.toFixed(4)}°D</div>
              <div className="text-slate-500 text-xs mt-1">Konumunuz</div>
            </div>
          </div>

          {!sensorVar && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
              <p className="text-amber-400 text-sm text-center">
                ⚠️ Pusula sensörü desteklenmiyor.
                <br />
                Hesaplanan kıble yönü statik gösteriliyor.
              </p>
            </div>
          )}

          <button
            onClick={() => {
              temizleyici.current?.();
              setDurum('bekliyor');
              setKonum(null);
              setKiblaAcisi(null);
              setKalanAci(null);
              setDogruYon(false);
              setSensorVar(true);
              setCihazYonu(0);
              setIbreAcisi(0);
              ibreRef.current = { current: 0, rafId: null };
            }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-sm py-3 rounded-2xl transition-all"
          >
            🔄 Konumu Yenile
          </button>
        </div>
      )}

      <p className="text-slate-700 text-xs text-center mt-6">
        Kabe: 21.4225°K, 39.8262°D · Büyük Daire Formülü
      </p>
    </div>
  );
}
