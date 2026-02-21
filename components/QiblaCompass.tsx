'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// QiblaMap'i dinamik olarak yükle (SSR sorununu önlemek için)
const QiblaMap = dynamic(() => import("@/components/QiblaMap"), { ssr: false });

interface QiblaCompassProps {
  userLat?: number;
  userLon?: number;
}

export default function QiblaCompass({ userLat, userLon }: QiblaCompassProps) {
  const [view, setView] = useState<"pusula" | "harita">("pusula");
  const [rawHeading, setRawHeading] = useState<number | null>(null);
  const [dialAngle, setDialAngle] = useState<number>(0);
  const [kaabaAngle, setKaabaAngle] = useState<number>(0);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [compassSupported, setCompassSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isAligned, setIsAligned] = useState<boolean>(false);

  const stableTimerRef = useRef<number | null>(null);
  const hasVibratedRef = useRef<boolean>(false);
  const isAlignedRef = useRef<boolean>(false);
  const smoothRef = useRef<number>(0);
  const prevKaabaAngleRef = useRef<number>(0);

  // Kabe koordinatları (Mekke)
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;
  const ENTER_THRESHOLD = 8;   // ±8° içinde hizalanma başlar
  const EXIT_THRESHOLD = 18;   // ±18° dışına çıkınca hizalama biter
  const STABLE_MS = 1200;      // bu kadar sabit kalmalı
  const COMPASS_R = 130;       // kadran yarıçapı px

  // Başlıca şehir koordinatları (Fallback) — qibla açısı her zaman hesaplanacak
  const cityCoordinates: Record<string, { lat: number; lon: number }> = {
    'İstanbul': { lat: 41.0082, lon: 28.9784 },
    'Ankara': { lat: 39.9334, lon: 32.8597 },
    'İzmir': { lat: 38.4237, lon: 27.1428 },
    'Bursa': { lat: 40.1826, lon: 29.0665 },
    'Antalya': { lat: 36.8969, lon: 30.7133 },
    'Adana': { lat: 37.0000, lon: 35.3213 },
    'Konya': { lat: 37.8667, lon: 32.4833 },
    'Gaziantep': { lat: 37.0662, lon: 37.3833 },
    'Diyarbakır': { lat: 37.9144, lon: 40.2306 },
    'Trabzon': { lat: 41.0015, lon: 39.7178 },
  };

  // Açı farkını -180/+180 arasında normalize et (359°→1° sıçrama olmaz)
  function normalizeDiff(a: number): number {
    let d = a % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  }

  // Great Circle — Kıble açısı (Kuzeyden saat yönünde derece)
  const calculateQiblaAngle = useCallback((lat: number, lon: number): number => {
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (KAABA_LAT * Math.PI) / 180;
    const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }, []);

  // SVG arc: merkez (cx,cy), yarıçap r, başlangıç ve bitiş açıları (derece, 0=üst, saat yönü)
  const describeArc = useCallback((cx: number, cy: number, r: number, startAngle: number, endAngle: number): string => {
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.sin(rad(startAngle));
    const y1 = cy - r * Math.cos(rad(startAngle));
    const x2 = cx + r * Math.sin(rad(endAngle));
    const y2 = cy - r * Math.cos(rad(endAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }, []);

  // iOS motion/orientation permission (call before adding orientation listener)
  const requestMotionPermission = async (): Promise<boolean> => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setNeedsPermission(false);
          setPermission('granted');
          return true;
        }
        setErrorMessage('Pusula izni verilmedi');
        return false;
      } catch {
        setErrorMessage('Pusula izni alınamadı');
        return false;
      }
    }
    return true;
  };

  const watchIdRef = useRef<number | null>(null);

  // Konum al — watchPosition ile güncellemelerde kıble yeniden hesaplanır
  const getLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage('Tarayıcınız konum özelliğini desteklemiyor');
      return;
    }

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      setNeedsPermission(true);
      const granted = await requestMotionPermission();
      if (!granted) return;
    }

    setErrorMessage('');
    isAlignedRef.current = false;
    setIsAligned(false);

    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });
        const angle = calculateQiblaAngle(lat, lon);
        setQiblaAngle(angle);
        setPermission('granted');
      },
      (error) => {
        setPermission('denied');
        setErrorMessage('Konum izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.');
      }
    );
  };

  // Device orientation — iOS webkitCompassHeading, Android 360-alpha
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: DeviceOrientationEvent) => {
      let h: number | null = null;
      if (typeof (e as any).webkitCompassHeading === 'number' && Number.isFinite((e as any).webkitCompassHeading)) {
        h = (e as any).webkitCompassHeading;
      } else if (e.alpha != null && Number.isFinite(e.alpha)) {
        h = (360 - e.alpha) % 360;
      }
      if (h !== null && Number.isFinite(h)) setRawHeading(h);
    };

    if (!('DeviceOrientationEvent' in window)) {
      setCompassSupported(false);
      setErrorMessage('Cihazınız pusula özelliğini desteklemiyor');
      return;
    }
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handler, true);
    }
    window.addEventListener('deviceorientation', handler, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Prop'tan gelen konum varsa kullan
  useEffect(() => {
    if (userLat && userLon) {
      setLocation({ lat: userLat, lon: userLon });
      const angle = calculateQiblaAngle(userLat, userLon);
      setQiblaAngle(angle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLon]);

  // Smoothing — titreme önler; 360° sıçrama önler (referans formül)
  useEffect(() => {
    if (typeof qiblaAngle !== 'number' || rawHeading === null || !Number.isFinite(qiblaAngle) || !Number.isFinite(rawHeading)) return;
    const raw = normalizeDiff(qiblaAngle - rawHeading);
    if (!Number.isFinite(raw)) return;

    let diff = raw - prevKaabaAngleRef.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    smoothRef.current = prevKaabaAngleRef.current + diff * 0.25;
    prevKaabaAngleRef.current = smoothRef.current;

    setKaabaAngle(smoothRef.current);
    setDialAngle(-rawHeading);
  }, [rawHeading, qiblaAngle]);

  // Hizalama state — kaabaAngle üzerinden; EXIT 18° aşılınca kesin söner
  useEffect(() => {
    if (!Number.isFinite(kaabaAngle)) return;
    const abs = Math.abs(kaabaAngle);

    if (abs > EXIT_THRESHOLD) {
      if (stableTimerRef.current) {
        clearTimeout(stableTimerRef.current);
        stableTimerRef.current = null;
      }
      if (isAlignedRef.current) {
        isAlignedRef.current = false;
        setIsAligned(false);
      }
      if (abs > 30) hasVibratedRef.current = false;
      return;
    }

    if (abs <= ENTER_THRESHOLD && !isAlignedRef.current && !stableTimerRef.current) {
      stableTimerRef.current = window.setTimeout(() => {
        stableTimerRef.current = null;
        if (Math.abs(smoothRef.current) <= ENTER_THRESHOLD) {
          isAlignedRef.current = true;
          setIsAligned(true);
          if (!hasVibratedRef.current) {
            navigator.vibrate?.([100, 60, 250]);
            hasVibratedRef.current = true;
          }
        }
      }, STABLE_MS);
    }
  }, [kaabaAngle]);

  useEffect(() => () => {
    if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
  }, []);

  const isHeadingReady = rawHeading !== null;

  // Mesafe km (Haversine yaklaşık)
  const distanceKm = useMemo(() => {
    if (!location) return null;
    const R = 6371;
    const dLat = ((KAABA_LAT - location.lat) * Math.PI) / 180;
    const dLon = ((KAABA_LON - location.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((location.lat * Math.PI) / 180) * Math.cos((KAABA_LAT * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [location]);

  const cityLabel = selectedCity || (location ? 'Konum' : '');
  const safeDialAngle = Number.isFinite(dialAngle) ? dialAngle : 0;
  const safeKaabaAngle = Number.isFinite(kaabaAngle) ? kaabaAngle : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">🕋 KIBLE</h2>
      </div>

      {/* Konum İzni Chip */}
      {!location ? (
        <div className="qiblaChip">
          <div className="qiblaChipText">
            <div className="qiblaChipTitle">📍 Konum izni gerekli</div>
            <div className="qiblaChipSub">Kıble açısı için konum izni ver.</div>
          </div>

          <button className="qiblaChipBtn" onClick={getLocation}>
            İzin ver
          </button>
        </div>
      ) : (
        <>
          {/* Görünüm Değiştirici */}
          <div className="qiblaModeToggle">
            <button
              onClick={() => setView("pusula")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${
                view === "pusula" ? "bg-emerald-500 text-black" : "text-white/80"
              }`}
            >
              PUSULA
            </button>
            <button
              onClick={() => setView("harita")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${
                view === "harita" ? "bg-emerald-500 text-black" : "text-white/80"
              }`}
            >
              HARİTA
            </button>
          </div>

          {/* Koşullu Görünüm */}
          {view === "pusula" ? (
      <div
        className="qiblaCompassWrap rounded-2xl p-5 transition-colors duration-500"
        style={{
          background: isAligned ? '#22c55e' : 'var(--compass-bg, #1a1a2e)',
        }}
      >
        {/* Üst bilgi bandı — DURUM + PUSULA */}
        <div className="flex justify-between mb-3">
          <div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">DURUM</div>
            <div className={`font-bold text-[15px] ${isAligned ? 'text-white' : 'text-gray-200 dark:text-gray-300'}`}>
              {isAligned ? 'HİZALANDI' : 'HİZALAYIN'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">PUSULA</div>
            <div className="font-bold text-[15px] text-gray-200 dark:text-gray-300">
              {rawHeading != null ? `${Math.round(rawHeading)}°` : '—'}
            </div>
          </div>
        </div>

        {/* Yön talimatı — tek mesaj */}
        <div
          className="text-center font-semibold mb-3 min-h-[24px] text-[15px]"
          style={{ color: isAligned ? '#fff' : '#22c55e' }}
        >
          {isAligned ? '✅ Kıble yönündesiniz!' : (
            isHeadingReady
              ? (safeKaabaAngle > 0
                  ? `▶ SAĞA — ${Math.abs(safeKaabaAngle).toFixed(1)}°`
                  : `◀ SOLA — ${Math.abs(safeKaabaAngle).toFixed(1)}°`)
              : 'Pusula yükleniyor…'
          )}
        </div>

        {/* Pusula container — 4 katman */}
        <div className="relative mx-auto touch-none select-none" style={{ width: COMPASS_R * 2 + 40, height: COMPASS_R * 2 + 40 }}>
          {/* KATMAN 1: Kadran halkası — -deviceHeading döner */}
          <div
            className="absolute inset-0 rounded-full border-[3px] transition-[border-color,background] duration-400"
            style={{
              borderColor: isAligned ? 'rgba(255,255,255,0.5)' : '#2d2d4e',
              background: isAligned ? 'rgba(255,255,255,0.1)' : '#0f0f23',
              transform: `rotate(${safeDialAngle}deg)`,
              transition: 'transform 0.25s linear',
            }}
          >
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 text-sm font-bold">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs">S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">W</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">E</span>
          </div>

          {/* KATMAN 2: Kabe üçgeni — kaabaAngle döner, translateY(-R) ile üste */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transform: `rotate(${safeKaabaAngle}deg) translateY(-${COMPASS_R * 0.72}px)`,
              transformOrigin: 'center center',
              transition: 'transform 0.25s linear',
              zIndex: 10,
            }}
          >
            <div
              className="absolute left-0 top-0"
              style={{
                width: 0,
                height: 0,
                borderLeft: '14px solid transparent',
                borderRight: '14px solid transparent',
                borderBottom: `24px solid ${isAligned ? '#fff' : '#22c55e'}`,
                marginLeft: -14,
                marginTop: -24,
              }}
            />
            <div
              className="absolute left-0 top-0 text-center text-[10px] font-bold whitespace-nowrap"
              style={{
                color: isAligned ? '#fff' : '#22c55e',
                marginLeft: -14,
                marginTop: 2,
              }}
            >
              KABE
            </div>
          </div>

          {/* KATMAN 3: Merkez nokta */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 z-[15]"
            style={{
              width: 10,
              height: 10,
              background: isAligned ? '#fff' : '#6b7280',
            }}
          />

          {/* KATMAN 4: Sabit referans çubuğu — 12 o'clock, hareket etmez */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded z-[20]"
            style={{
              top: 6,
              width: 4,
              height: 18,
              background: isAligned ? '#fff' : '#9ca3af',
            }}
          />
        </div>

        {/* Alt bilgi şeridi */}
        {location && qiblaAngle != null && (
          <div className="flex justify-between items-center mt-4 px-4 py-3 rounded-xl bg-black/30">
            <span className="text-emerald-400 text-[13px] font-semibold">📍 {cityLabel}</span>
            <span className="text-white text-[13px] font-bold">KIBLE {Math.round(qiblaAngle)}°</span>
            {distanceKm != null && <span className="text-gray-400 text-[13px]">🌐 {distanceKm} KM</span>}
          </div>
        )}


      {/* Hata Mesajı + Fallback Şehir Seçimi */}
      {errorMessage && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
          </div>
          
          {/* Fallback: Şehir Seçimi */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
              📍 Şehir Seçerek Yaklaşık Kıble Yönü
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
              Konum izni vermek istemiyorsanız, şehrinizi seçerek yaklaşık kıble yönünü öğrenebilirsiniz.
            </p>
            <select
              value={selectedCity}
              onChange={(e) => {
                const city = e.target.value;
                setSelectedCity(city);
                if (city && cityCoordinates[city]) {
                  const coords = cityCoordinates[city];
                  setLocation({ lat: coords.lat, lon: coords.lon });
                  setQiblaAngle(calculateQiblaAngle(coords.lat, coords.lon));
                  setErrorMessage('');
                }
              }}
              className="w-full px-4 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Şehir Seçiniz</option>
              {Object.keys(cityCoordinates).map((city) => {
                const coords = cityCoordinates[city];
                const qibla = calculateQiblaAngle(coords.lat, coords.lon);
                return (
                  <option key={city} value={city}>
                    {city} (Kıble: {qibla.toFixed(1)}°)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Pusula Sensörü Uyarısı */}
      {location && qiblaAngle !== null && !isHeadingReady && compassSupported && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center font-semibold">
            ⚠️ Pusula için hareket sensörü/konum izni gerekli
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-500 text-center mt-1">
            Cihazınızı hareket ettirin veya pusula iznini etkinleştirin. Şu an sadece Kıble açısı gösteriliyor.
          </p>
        </div>
      )}

      {/* Pusula Desteği Yok */}
      {!compassSupported && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
            ⚠️ Cihazınız pusula özelliğini desteklemiyor. Sadece Kıble açısı gösteriliyor.
          </p>
        </div>
      )}
      </div>
      ) : (
        <div className="mt-3">
          {typeof window !== 'undefined' && (
            <QiblaMap
              userLat={location.lat}
              userLng={location.lon}
              kaabaLat={KAABA_LAT}
              kaabaLng={KAABA_LON}
            />
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
