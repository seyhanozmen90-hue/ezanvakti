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
  const [heading, setHeading] = useState<number | null>(null);
  const [smoothHeading, setSmoothHeading] = useState<number>(0);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [compassSupported, setCompassSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [locked, setLocked] = useState<boolean>(false);
  const [isAlignedStable, setIsAlignedStable] = useState<boolean>(false);

  const inRangeSinceRef = useRef<number | null>(null);
  const stableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHeadingRef = useRef<number>(0);
  const hasVibratedRef = useRef<boolean>(false);  // titreşim kilidi — bir kez titredi mi
  const smoothedDeviationRef = useRef<number>(0);

  // Kabe koordinatları (Mekke) — Great Circle hesaplama için
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;
  const ENTER_THRESHOLD = 8;   // ±8° içinde hizalandı say
  const EXIT_THRESHOLD = 12;   // ±12° dışında hizalamayı boz
  const UNLOCK_THRESHOLD = 20; // >20° uzaklaşınca titreşim kilidi açılsın
  const STABLE_MS = 1200;      // 1.2 saniye kararlı kalmalı
  const THRESHOLD_DEG = ENTER_THRESHOLD;
  const HOLD_MS = 1200;

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

  // Normalize angle to 0..360
  function normalizeAngle(angle: number): number {
    return (angle + 360) % 360;
  }

  // Shortest rotation in [-180, 180] (prevents compass jump)
  function shortestRotation(angle: number): number {
    if (angle > 180) return angle - 360;
    if (angle < -180) return angle + 360;
    return angle;
  }

  // Shortest angle difference (for alignment check)
  const shortestAngleDiff = (target: number, current: number): number => {
    return shortestRotation(normalizeAngle(target - current));
  };

  // Linear interpolation for smooth heading
  const lerp = (start: number, end: number, t: number): number => {
    let diff = shortestRotation(normalizeAngle(end - start));
    return normalizeAngle(start + diff * t);
  };

  // Great Circle — Kıble açısı (Kuzeyden saat yönünde derece)
  const calculateQiblaAngle = useCallback((lat: number, lon: number): number => {
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (KAABA_LAT * Math.PI) / 180;
    const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
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
    setLocked(false);
    inRangeSinceRef.current = null;

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

  // True north: prefer webkitCompassHeading (iOS), else 360 - alpha (Android); always normalize
  const getCompassHeading = useCallback((event: DeviceOrientationEvent): number | null => {
    const raw =
      (event as any).webkitCompassHeading != null
        ? (event as any).webkitCompassHeading
        : event.alpha != null
          ? 360 - event.alpha
          : null;
    if (raw == null) return null;
    return normalizeAngle(raw);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const h = getCompassHeading(event);
      if (h != null) {
        setHeading(h);
        lastHeadingRef.current = h;
      }
    };

    if (!('DeviceOrientationEvent' in window)) {
      setCompassSupported(false);
      setErrorMessage('Cihazınız pusula özelliğini desteklemiyor');
      return;
    }
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [getCompassHeading]);

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

  // Smooth heading with lerp
  useEffect(() => {
    if (heading === null) return;
    
    const interval = setInterval(() => {
      setSmoothHeading(prev => lerp(prev, heading, 0.15));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [heading, lerp]);

  // Yön değiştiğinde kilidi otomatik aç
  useEffect(() => {
    if (!locked || heading === null) return;
    
    const headingDiff = Math.abs(normalizeAngle(heading - lastHeadingRef.current));
    
    // Eğer yön 10 dereceden fazla değiştiyse kilidi aç
    if (headingDiff > 10) {
      setLocked(false);
      inRangeSinceRef.current = null;
    }
  }, [heading, locked]);

  // Sapma: -180..+180 (pozitif = Kıble sağda → sağa dön, negatif = sola dön)
  const deviation = useMemo(() => {
    if (typeof qiblaAngle !== 'number' || typeof heading !== 'number') return null;
    return shortestRotation(normalizeAngle(qiblaAngle - heading));
  }, [qiblaAngle, heading]);

  const error = useMemo(() => (deviation != null ? Math.abs(deviation) : null), [deviation]);

  // Qibla rotation: shortest path, no jump; compass (Kabe) uses this
  const rotation = useMemo(() => {
    if (qiblaAngle == null || smoothHeading == null) return 0;
    return shortestRotation(normalizeAngle(qiblaAngle - smoothHeading));
  }, [qiblaAngle, smoothHeading]);

  // Display angle 0..360 for CSS rotate (Kabe position)
  const relativeAngle = useMemo(() => {
    const r = rotation;
    return r < 0 ? r + 360 : r;
  }, [rotation]);

  const isHeadingReady = heading !== null;

  const inZoneNotStable = deviation != null && Math.abs(deviation) <= ENTER_THRESHOLD && !isAlignedStable;

  const statusText = (() => {
    if (error == null) return '';
    if (locked) return `✅ Kıble bulundu (sapma: ${error.toFixed(1)}°)`;
    if (isAlignedStable) return '✅ Kıble yönündesiniz!';
    if (inZoneNotStable) return 'Hedef bölgede, 1.5 sn sabit tutun...';
    return `Sapma: ${error.toFixed(1)}°`;
  })();

  const statusColor = useMemo(() => {
    if (error == null) return "gray";
    if (locked || isAlignedStable) return "green";
    if (inZoneNotStable) return "yellow";
    return "gray";
  }, [error, locked, isAlignedStable, inZoneNotStable]);

  // Smoothing (0.75/0.25) + hysteresis + titreşim kilidi; >20° uzaklaşınca kilit açılır
  useEffect(() => {
    if (deviation == null) return;
    smoothedDeviationRef.current = smoothedDeviationRef.current * 0.75 + deviation * 0.25;
    const smooth = Math.abs(smoothedDeviationRef.current);

    // Titreşim kilidi: bir kez titrediyse, uzaklaşana kadar tekrar tetikleme
    if (hasVibratedRef.current) {
      if (smooth > UNLOCK_THRESHOLD) {
        hasVibratedRef.current = false;
        if (stableTimerRef.current) {
          clearTimeout(stableTimerRef.current);
          stableTimerRef.current = null;
        }
        setIsAlignedStable(false);
      }
      return;
    }

    if (!isAlignedStable && smooth <= ENTER_THRESHOLD) {
      if (stableTimerRef.current == null) {
        stableTimerRef.current = window.setTimeout(() => {
          setIsAlignedStable(true);
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([100, 60, 250]);
          }
          hasVibratedRef.current = true;
          stableTimerRef.current = null;
        }, STABLE_MS);
      }
    } else if (!isAlignedStable && smooth > EXIT_THRESHOLD) {
      if (stableTimerRef.current) {
        clearTimeout(stableTimerRef.current);
        stableTimerRef.current = null;
      }
    } else if (isAlignedStable && smooth > EXIT_THRESHOLD) {
      if (stableTimerRef.current) {
        clearTimeout(stableTimerRef.current);
        stableTimerRef.current = null;
      }
      setIsAlignedStable(false);
    }
  }, [deviation, isAlignedStable]);

  useEffect(() => {
    return () => {
      if (stableTimerRef.current) clearTimeout(stableTimerRef.current);
    };
  }, []);

  // Kilitleme: onaylandıktan sonra HOLD_MS süre tutunca kilit (opsiyonel)
  useEffect(() => {
    if (locked) return;
    if (error == null) return;
    if (isAlignedStable && error <= ENTER_THRESHOLD) {
      if (!inRangeSinceRef.current) inRangeSinceRef.current = Date.now();
      if (Date.now() - inRangeSinceRef.current >= HOLD_MS) setLocked(true);
    } else {
      inRangeSinceRef.current = null;
    }
  }, [error, locked, isAlignedStable]);

  // UI için: hizalı say (yeşil göster) sadece kararlı onaylandığında
  const isAligned = isAlignedStable;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Başlık */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
          🕋 KIBLE
        </h2>
        {location && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Konum: {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
          </p>
        )}
        {qiblaAngle !== null && (
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-2">
            Kıble Açısı: {qiblaAngle.toFixed(1)}°
          </p>
        )}
        
        {/* Hizalama mesajı — "Kırmızı oku Kabe'ye getir" */}
        {isHeadingReady && view === 'pusula' && deviation !== null && (
          <div className={`alignment-msg mt-3 rounded-xl px-5 py-3 text-center text-[15px] font-semibold transition-all duration-400 ${isAligned ? 'alignment-msg--aligned' : ''}`}>
            {isAligned
              ? '✅ Kıble yönündesiniz!'
              : `Kırmızı oku Kabe'ye getirin — Sapma: ${Math.abs(deviation).toFixed(1)}°`}
          </div>
        )}
        {isHeadingReady && view === 'pusula' && statusText && !isAligned && (
          <div className={`qiblaBadge qiblaBadge--${statusColor} mt-2`}>
            {statusText}
          </div>
        )}
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
      <div className="qiblaCompassWrap">
      {/* Pusula çerçevesi — hizalanda yeşil border + pulse */}
      <div className={`compass-frame relative w-full aspect-square mb-8 rounded-full overflow-visible ${isAligned ? 'compass-frame--aligned' : ''}`}>
        <div className={`compassRing ${locked ? 'isLocked' : isAligned ? 'isInRange' : ''}`} />
        <div className={`compassInner ${locked ? 'isLocked' : isAligned ? 'isInRange' : ''}`} />

        {/* 1. Kadran — cihaz yönüne göre döner (N/S/E/W gerçek yönleri gösterir); ibre yok */}
        <div
          className="absolute inset-8 rounded-full border-[5px] touch-none select-none"
          style={{
            borderColor: isAligned ? '#22c55e' : '#d1d5db',
            boxShadow: isAligned ? '0 0 30px rgba(34,197,94,0.5)' : 'none',
            transform: `rotate(${-smoothHeading}deg)`,
            transition: 'transform 0.25s linear',
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full rounded-full">
            <g className="text-gray-700 dark:text-gray-300">
              <text x="100" y="28" textAnchor="middle" className="text-[14px] font-bold fill-current">N</text>
              <text x="180" y="105" textAnchor="middle" className="text-[14px] font-bold fill-current">E</text>
              <text x="100" y="190" textAnchor="middle" className="text-[14px] font-bold fill-current">S</text>
              <text x="20" y="105" textAnchor="middle" className="text-[14px] font-bold fill-current">W</text>
            </g>
            {[...Array(36)].map((_, i) => {
              const angle = i * 10;
              const isMain = angle % 90 === 0;
              const length = isMain ? 15 : 8;
              const width = isMain ? 3 : 1.5;
              const x1 = 100 + 85 * Math.sin((angle * Math.PI) / 180);
              const y1 = 100 - 85 * Math.cos((angle * Math.PI) / 180);
              const x2 = 100 + (85 - length) * Math.sin((angle * Math.PI) / 180);
              const y2 = 100 - (85 - length) * Math.cos((angle * Math.PI) / 180);
              return (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={width} className="text-gray-400 dark:text-gray-600" />
              );
            })}
          </svg>
        </div>

        {/* 2. Kabe ikonu — kadran dışında; rotation = shortestRotation(normalizeAngle(qibla - heading)) */}
        {qiblaAngle != null && (
          <div
            className="absolute inset-8 flex items-center justify-center pointer-events-none"
            style={{
              transform: `rotate(${relativeAngle}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.25s linear',
              zIndex: 10,
            }}
          >
            <div className="w-full h-full flex items-center justify-center" style={{ transform: 'translateY(-50%)' }}>
              <span
                className={`text-4xl drop-shadow-lg block transition-all duration-300 ${isAligned ? 'qibla-indicator--found' : ''}`}
                style={{
                  transform: `rotate(${-relativeAngle}deg)${isAligned ? ' scale(1.15)' : ''}`,
                  filter: isAligned ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.9))' : undefined,
                }}
              >
                🕋
              </span>
            </div>
          </div>
        )}

        {/* 3. Kırmızı ok — her zaman 12 o'clock'ta sabit (kuzeyi gösterir) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]"
          style={{ width: 24, height: 48 }}
        >
          <svg viewBox="0 0 24 48" className="w-full h-full">
            <polygon points="12,4 10,44 12,40 14,44" className="fill-red-600" />
            <polygon points="12,44 10,4 12,8 14,4" className="fill-gray-500" />
          </svg>
        </div>

        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg transition-colors duration-300 z-[6] ${locked ? 'bg-green-600' : 'bg-primary-600'}`} />
      </div>


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

      
      {/* Kıble bulundu kartı */}
      {location && qiblaAngle !== null && locked && (
        <div className="found-card mt-5 text-center py-5 px-5 border-2 border-green-500 dark:border-green-600 rounded-2xl bg-green-50 dark:bg-green-900/20">
          <span className="text-4xl block mb-2">✅</span>
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400 mb-1">Kıble Bulundu!</h2>
          <p className="text-green-600 dark:text-green-500 font-medium">Kırmızı ok Kabe yönünü gösteriyor</p>
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
