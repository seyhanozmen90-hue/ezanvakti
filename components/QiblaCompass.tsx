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
  const [headingSmooth, setHeadingSmooth] = useState<number>(0);
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
  const headingSmoothRef = useRef<number>(0);
  const lastRawRef = useRef<number | null>(null);
  const angularErrorRef = useRef<number | null>(null);

  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;
  const ENTER_THRESHOLD = 5;   // ±5° hizalı say (instruction ile uyumlu)
  const EXIT_THRESHOLD = 18;
  const STABLE_MS = 1200;
  const COMPASS_R = 130;
  const SMOOTH_K = 0.10;       // slow motion like reference (increase to 0.15 if too laggy)
  const THROTTLE_MS = 50;      // ~20 FPS
  const DIAL_TRANSITION_MS = 220;
  // If facing SOUTH still shows N at top: set true to flip heading (raw = alpha+screenAngle)
  const FLIP_HEADING_SIGN = false;

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

  const normalize360 = useCallback((a: number) => ((a % 360) + 360) % 360, []);

  // En kısa açı farkı -180..+180 (smoothing ve instruction için)
  const shortestDiff = useCallback((target: number, current: number) => {
    let d = normalize360(target - current);
    if (d > 180) d -= 360;
    return d;
  }, [normalize360]);

  // Great Circle — Kıble açısı 0..360 (Kuzeyden saat yönünde)
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

  // iOS: call on user gesture (button click) before subscribing to orientation
  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
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
  }, []);

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

  // Device heading: webkitCompassHeading (iOS) veya alpha + screen orientation (Android)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: DeviceOrientationEvent) => {
      let raw: number | null = null;
      if (typeof (e as any).webkitCompassHeading === 'number' && Number.isFinite((e as any).webkitCompassHeading)) {
        raw = normalize360((e as any).webkitCompassHeading);
      } else if (e.alpha != null && Number.isFinite(e.alpha)) {
        const screenAngle = (screen as any).orientation?.angle ?? (window as any).orientation ?? 0;
        const alpha = e.alpha ?? 0;
        raw = FLIP_HEADING_SIGN
          ? normalize360(alpha + screenAngle)
          : normalize360(360 - (alpha + screenAngle));
      }
      if (raw !== null && Number.isFinite(raw)) {
        lastRawRef.current = raw;
        setRawHeading(raw);
      }
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
  }, [normalize360]);

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

  // İlk ham değer geldiğinde smooth'u başlat
  useEffect(() => {
    if (rawHeading !== null && Number.isFinite(rawHeading)) {
      headingSmoothRef.current = rawHeading;
      setHeadingSmooth(rawHeading);
    }
  }, [rawHeading]);

  // Smoothing: tek interval ~20 FPS, low-pass K (needle yavaş ve stabil)
  useEffect(() => {
    const id = window.setInterval(() => {
      const raw = lastRawRef.current;
      if (raw == null) return;
      const next = normalize360(
        headingSmoothRef.current + SMOOTH_K * shortestDiff(raw, headingSmoothRef.current)
      );
      if (!Number.isFinite(next)) return;
      headingSmoothRef.current = next;
      setHeadingSmooth(next);
    }, THROTTLE_MS);
    return () => clearInterval(id);
  }, [normalize360, shortestDiff]);

  // angularError = shortestDiff(qiblaBearing, headingSmooth) — instruction ve hizalama
  const angularError = useMemo(() => {
    if (qiblaAngle == null || !Number.isFinite(headingSmooth)) return null;
    return shortestDiff(qiblaAngle, headingSmooth);
  }, [qiblaAngle, headingSmooth, shortestDiff]);

  useEffect(() => {
    angularErrorRef.current = angularError;
  }, [angularError]);

  // Hizalama state — angularError üzerinden
  useEffect(() => {
    if (angularError == null) return;
    const abs = Math.abs(angularError);

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
        if (angularErrorRef.current != null && Math.abs(angularErrorRef.current) <= ENTER_THRESHOLD) {
          isAlignedRef.current = true;
          setIsAligned(true);
          if (!hasVibratedRef.current) {
            navigator.vibrate?.([100, 60, 250]);
            hasVibratedRef.current = true;
          }
        }
      }, STABLE_MS);
    }
  }, [angularError]);

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
  const qiblaBearing = qiblaAngle != null && Number.isFinite(qiblaAngle) ? qiblaAngle : 0;
  // Dial rotates so N is at real north on screen; user direction = top of screen
  const dialRotationDeg = Number.isFinite(headingSmooth) ? -headingSmooth : 0;

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
              {rawHeading != null ? `${Math.round(headingSmooth)}°` : '—'}
            </div>
          </div>
        </div>

        {/* Yön talimatı — angularError ile görsele uyumlu */}
        <div
          className="text-center font-semibold mb-3 min-h-[24px] text-[15px]"
          style={{ color: isAligned ? '#fff' : '#22c55e' }}
        >
          {isAligned ? '✅ Kıbleye baktınız' : (
            isHeadingReady && angularError !== null
              ? (Math.abs(angularError) <= ENTER_THRESHOLD
                  ? 'Hizalı'
                  : angularError > 0
                    ? `Sağa dönün — ${Math.abs(angularError).toFixed(1)}°`
                    : `Sola dönün — ${Math.abs(angularError).toFixed(1)}°`)
              : 'Pusula yükleniyor…'
          )}
        </div>

        {/* Gerçek pusula: kadran heading ile döner (N gerçek kuzeyde), Kabe kadran içinde qiblaBearing'de */}
        <div
          className="relative mx-auto touch-none select-none aspect-square w-full max-w-[300px] rounded-full overflow-hidden"
          style={{ width: COMPASS_R * 2 + 48, height: COMPASS_R * 2 + 48 }}
        >
          {/* KATMAN 1: Dönen kadran (N/E/S/W + Kabe) — dialRotationDeg = -headingSmooth → N gerçek kuzeyde */}
          <div
            className="absolute inset-0 rounded-full border-[3px] transition-[border-color,background] duration-400"
            style={{
              borderColor: isAligned ? 'rgba(255,255,255,0.5)' : '#2d2d4e',
              background: isAligned ? 'rgba(255,255,255,0.1)' : '#0f0f23',
              transform: `rotate(${dialRotationDeg}deg)`,
              transition: `transform ${DIAL_TRANSITION_MS}ms linear`,
              transformOrigin: 'center center',
            }}
          >
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-red-500 text-sm font-bold">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs">S</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">W</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">E</span>

            {/* Kabe işareti — kadranın içinde, qiblaBearing konumunda (kadranla birlikte döner) */}
            {qiblaAngle != null && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 0,
                  height: 0,
                  transform: `rotate(${qiblaBearing}deg) translateY(-${COMPASS_R}px) rotate(-${qiblaBearing}deg)`,
                  transformOrigin: 'center center',
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
                <span
                  className="absolute left-0 top-0 text-[10px] font-bold whitespace-nowrap block text-center"
                  style={{
                    color: isAligned ? '#fff' : '#22c55e',
                    marginLeft: -14,
                    marginTop: 2,
                  }}
                >
                  KABE
                </span>
              </div>
            )}
          </div>

          {/* KATMAN 2: Merkez nokta (sabit) */}
          <div
            className="absolute top-1/2 left-1/2 rounded-full -translate-x-1/2 -translate-y-1/2 z-[15]"
            style={{
              width: 10,
              height: 10,
              background: isAligned ? '#fff' : '#6b7280',
            }}
          />

          {/* KATMAN 3: Sabit "baktığın yön" pointer — üst orta, dönmez; Kabe bunun altına gelince hizalı */}
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none z-[20]"
            style={{
              width: 6,
              height: 22,
              borderRadius: 3,
              background: isAligned ? '#fff' : '#ef4444',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
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
