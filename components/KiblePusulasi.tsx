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

/**
 * Büyük Daire (Great Circle) → Kabe'ye kerteriz (bearing)
 * Sonuç: 0–360°, Kuzey=0, saat yönünde (Doğu=90°).
 * Kaynak: standart jeodezik bearing formülü.
 */
function kiblaHesapla(lat: number, lng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const KABE_LAT = toRad(21.4225);
  const KABE_LNG = toRad(39.8262);
  const uLat = toRad(lat);
  const uLng = toRad(lng);
  const dLng = KABE_LNG - uLng;
  const y = Math.sin(dLng) * Math.cos(KABE_LAT);
  const x =
    Math.cos(uLat) * Math.sin(KABE_LAT) -
    Math.sin(uLat) * Math.cos(KABE_LAT) * Math.cos(dLng);
  const bearingRad = Math.atan2(y, x);
  let derece = (bearingRad * 180) / Math.PI;
  if (derece < 0) derece += 360;
  return derece;
}

/**
 * Coğrafi kerteriz (kiblaHam) sonrası pusula gösterimi için düzeltme.
 * Manyetik sapma + cihaz/kadran uyumu: sağa kaymayı sola almak için çıkarılır.
 */
const KIBLE_PUSULA_DUZELTME = 151; // ~6° manyetik sapma + kadran uyumu (80° sola kayma düzeltmesi: 231-80)

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
  const [kadranAcisi, setKadranAcisi] = useState(0); // Kadran döner: N her zaman manyetik kuzeyde
  const [kalanAci, setKalanAci] = useState<number | null>(null);
  const [dogruYon, setDogruYon] = useState(false);
  const [mesafe, setMesafe] = useState<number | null>(null);
  const [konum, setKonum] = useState<{ lat: number; lng: number } | null>(null);
  const [sensorVar, setSensorVar] = useState(true);
  const [titresim, setTitresim] = useState(false);

  const kadranRef = useRef<IbreRefObj>({ current: 0, rafId: null });
  const kiblaRef = useRef<number | null>(null);
  const temizleyici = useRef<(() => void) | null>(null);
  const sensorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Kıble açısı sadece konum alındığında set edilir; sensör handler sadece okur, asla değiştirmez */
  kiblaRef.current = kiblaAcisi;

  /** Low-pass: 0/360 sınırında sıçramayı önlemek için en kısa farkla birleştir */
  const smoothedKuzeyRef = useRef<number | null>(null);
  const SMOOTH_K = 0.2; // 0 = sadece yeni değer, 1 = sadece eski

  const sensorHandler = useCallback((e: DeviceOrientationEventWithCompass) => {
    let kuzeyHam = 0;

    if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) {
      kuzeyHam = e.webkitCompassHeading;
    } else if (e.alpha !== null && e.alpha !== undefined) {
      kuzeyHam = (360 - e.alpha) % 360;
    }

    const kuzeyDuzeltilmis = kuzeyHam;
    const prev = smoothedKuzeyRef.current;
    let kuzey: number;
    if (prev !== null) {
      const delta = ((kuzeyDuzeltilmis - prev + 540) % 360) - 180;
      kuzey = (prev + delta * (1 - SMOOTH_K) + 360) % 360;
      smoothedKuzeyRef.current = kuzey;
    } else {
      kuzey = kuzeyDuzeltilmis;
      smoothedKuzeyRef.current = kuzey;
    }

    setCihazYonu(Math.round(kuzeyHam));

    const kibla = kiblaRef.current;
    if (kibla === null) return;

    // Gerçek pusula: kadran döner, N her zaman manyetik kuzeyi gösterir
    const hedefKadranHam = (360 - kuzey) % 360;
    const curKadran = kadranRef.current.current;
    const shortestDelta = ((hedefKadranHam - curKadran + 540) % 360) - 180;
    const hedefKadran = (curKadran + shortestDelta + 360) % 360;
    smoothAngle(kadranRef.current, hedefKadran, (v) => setKadranAcisi(v));

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

    let eventReceived = false;
    const handlerWithCheck = (e: DeviceOrientationEventWithCompass) => {
      const webkit = e?.webkitCompassHeading;
      const alpha = e?.alpha;
      const hasValue =
        (typeof webkit === 'number' && webkit >= 0) ||
        (alpha !== null && alpha !== undefined);
      if (hasValue) {
        eventReceived = true;
        if (sensorTimeoutRef.current) {
          clearTimeout(sensorTimeoutRef.current);
          sensorTimeoutRef.current = null;
        }
      }
      sensorHandler(e);
    };

    const removeListener = () =>
      window.removeEventListener('deviceorientation', handlerWithCheck, true);

    const baslat = () => {
      window.addEventListener('deviceorientation', handlerWithCheck, true);
      temizleyici.current = () => {
        if (sensorTimeoutRef.current) {
          clearTimeout(sensorTimeoutRef.current);
          sensorTimeoutRef.current = null;
        }
        removeListener();
      };
    };

    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const izin = await DOE.requestPermission();
        if (izin === 'granted') {
          baslat();
        } else {
          setSensorVar(false);
          return;
        }
      } catch {
        setSensorVar(false);
        return;
      }
    } else {
      baslat();
    }

    // Cihazdan veri gelmezse 2.5 s sonra statik moda geç (farklı telefonlarda sensör bazen çalışmıyor)
    sensorTimeoutRef.current = setTimeout(() => {
      sensorTimeoutRef.current = null;
      if (!eventReceived) setSensorVar(false);
    }, 2500);
  }, [sensorHandler]);

  const konumAl = useCallback(async () => {
    setDurum('yukleniyor');
    setHata('');

    if (!navigator.geolocation) {
      setHata('Tarayıcınız konum özelliğini desteklemiyor.');
      setDurum('hata');
      return;
    }

    // iOS: Pusula izni aynı dokunuşta istenmeli (async sonra kabul edilmiyor)
    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    if (typeof DOE?.requestPermission === 'function') {
      try {
        await DOE.requestPermission();
      } catch {
        // İzin reddedilirse de konumla devam et, statik açı gösterilir
      }
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const kiblaHam = kiblaHesapla(lat, lng);
        const kibla = (kiblaHam - KIBLE_PUSULA_DUZELTME + 360) % 360;
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
      if (sensorTimeoutRef.current) clearTimeout(sensorTimeoutRef.current);
      if (kadranRef.current.rafId) cancelAnimationFrame(kadranRef.current.rafId);
    };
  }, []);

  useEffect(() => {
    if (durum === 'aktif' && !sensorVar && kiblaAcisi !== null) {
      setKadranAcisi(0);
      setKalanAci(null);
    }
  }, [durum, sensorVar, kiblaAcisi]);

  const yonMesaji = (): { metin: string; renk: string; ikon: string } | null => {
    if (!sensorVar)
      return {
        metin: kiblaAcisi != null
          ? `Kıble açısı ${Math.round(kiblaAcisi)}° — Açıyı gerçek kuzeye göre hizalayın`
          : 'Kıble açısı hesaplandı — Yönü kuzey referansıyla hizalayın',
        renk: 'amber',
        ikon: '🧭',
      };
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
            <p className="text-slate-400 text-sm mt-2">Kıble açısı konumunuza göre hesaplanır. Konum iznini açmanız gerekir.</p>
            <p className="text-slate-500 text-xs mt-1">Butona tıklayın; tarayıcı konum izni isteyecektir. İzin verin veya cihaz ayarlarından konumu açın.</p>
          </div>
          <button
            onClick={konumAl}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/30 text-lg"
          >
            📍 Konum iznini ver ve başla
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
          <p className="text-slate-400 text-xs">Cihaz ayarlarında konum servisini açtıysanız aşağıdaki butonla tekrar izin isteyin.</p>
          <button
            onClick={konumAl}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-2xl transition-all"
          >
            📍 Konum iznini ver
          </button>
          <button
            onClick={() => setDurum('bekliyor')}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-sm py-2 rounded-2xl transition-all"
          >
            Geri dön
          </button>
        </div>
      )}

      {durum === 'aktif' && !konum && (
        <div className="w-full max-w-xs bg-amber-500/10 border border-amber-500/30 rounded-3xl p-7 text-center space-y-4">
          <div className="text-4xl">📍</div>
          <p className="text-amber-200 font-medium">Konum alınamadı</p>
          <p className="text-slate-400 text-sm">Kıble yönü konumunuza göre hesaplanır. Konum iznini verin veya cihaz ayarlarından konumu açın.</p>
          <button
            onClick={konumAl}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl transition-all"
          >
            Konum iznini ver
          </button>
        </div>
      )}

      {durum === 'aktif' && konum && (
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
              {/* Sabit üst pointer: Kıble'yi bu çizgiye getir */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-emerald-400 drop-shadow-lg" style={{ borderTopColor: 'rgb(52, 211, 153)' }} aria-hidden />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 text-emerald-400 text-xs font-bold">KIBLE</div>

              {/* Dönen kadran: N her zaman manyetik kuzeyde, Kıble işareti kadran üzerinde kiblaAcisi° */}
              <div
                className="absolute inset-0 rounded-full transition-transform duration-75 ease-out"
                style={{
                  transform: `rotate(${kadranAcisi}deg)`,
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03), transparent 70%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <svg className="w-full h-full" viewBox="0 0 264 264">
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
                  {/* N, D, G, B kadran üzerinde (0°=üst) */}
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
                  {/* Kıble işareti: kadran üzerinde kiblaAcisi° (Kuzey=0, saat yönü) */}
                  {kiblaAcisi !== null && (
                    <g transform={`rotate(${kiblaAcisi} 132 132)`}>
                      <polygon
                        points="132,8 138,44 132,38 126,44"
                        fill="url(#kibleYesil)"
                        stroke="rgba(255,255,255,0.25)"
                        strokeWidth="0.8"
                      />
                      <text x="132" y="4" textAnchor="middle" fontSize="16" dominantBaseline="auto" style={{ userSelect: 'none' }}>🕋</text>
                    </g>
                  )}
                  <defs>
                    <linearGradient id="kibleYesil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#065f46" />
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
              <div className="text-slate-300 text-xs font-mono">{konum.lat.toFixed(4)}°K</div>
              <div className="text-slate-300 text-xs font-mono">{konum.lng.toFixed(4)}°D</div>
              <div className="text-slate-500 text-xs mt-1">Konumunuz</div>
            </div>
          </div>

          {!sensorVar && kiblaAcisi != null && (
            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                <p className="text-amber-400 text-sm text-center font-medium mb-1">
                  🧭 Cihazınızda pusula sensörü yok veya erişilemiyor
                </p>
                <p className="text-amber-300/90 text-xs text-center">
                  Kıble yönünüz <strong>{Math.round(kiblaAcisi)}°</strong> (kuzeyden saat yönünde). Bu açıyı fiziksel bir pusula veya güneşin konumuyla karşılaştırarak yönü bulabilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  temizleyici.current?.();
                  setSensorVar(true);
                  await sensorBaslat();
                }}
                className="w-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-sm font-medium py-3 rounded-2xl transition-all"
              >
                🧭 Pusulayı tekrar dene
              </button>
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
              setKadranAcisi(0);
              kadranRef.current = { current: 0, rafId: null };
              smoothedKuzeyRef.current = null;
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
