'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [inRangeSince, setInRangeSince] = useState<number | null>(null);
  
  const alignmentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeadingRef = useRef<number>(0);

  // Kabe koordinatları (Mekke)
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;
  const ALIGNMENT_THRESHOLD = 5; // degrees
  const ALIGNMENT_DURATION = 1200; // ms

  // Başlıca şehir koordinatları (Fallback için)
  const cityCoordinates: Record<string, { lat: number; lon: number; qibla: number }> = {
    'İstanbul': { lat: 41.0082, lon: 28.9784, qibla: 147 },
    'Ankara': { lat: 39.9334, lon: 32.8597, qibla: 151 },
    'İzmir': { lat: 38.4237, lon: 27.1428, qibla: 143 },
    'Bursa': { lat: 40.1826, lon: 29.0665, qibla: 148 },
    'Antalya': { lat: 36.8969, lon: 30.7133, qibla: 152 },
    'Adana': { lat: 37.0000, lon: 35.3213, qibla: 157 },
    'Konya': { lat: 37.8667, lon: 32.4833, qibla: 153 },
    'Gaziantep': { lat: 37.0662, lon: 37.3833, qibla: 161 },
    'Diyarbakır': { lat: 37.9144, lon: 40.2306, qibla: 165 },
    'Trabzon': { lat: 41.0015, lon: 39.7178, qibla: 163 },
  };

  // Normalize angle to -180..180 range
  const normalizeAngle = (angle: number): number => {
    let normalized = angle % 360;
    if (normalized > 180) normalized -= 360;
    if (normalized < -180) normalized += 360;
    return normalized;
  };

  // Shortest angle difference (for alignment check)
  const shortestAngleDiff = (target: number, current: number): number => {
    return normalizeAngle(target - current);
  };

  // Linear interpolation for smooth heading
  const lerp = (start: number, end: number, t: number): number => {
    let diff = shortestAngleDiff(end, start);
    return (start + diff * t + 360) % 360;
  };

  // Calculate bearing to Kaaba
  const calculateQiblaAngle = (lat: number, lon: number): number => {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
    const kaabaLonRad = (KAABA_LON * Math.PI) / 180;

    const dLon = kaabaLonRad - lonRad;

    const y = Math.sin(dLon) * Math.cos(kaabaLatRad);
    const x =
      Math.cos(latRad) * Math.sin(kaabaLatRad) -
      Math.sin(latRad) * Math.cos(kaabaLatRad) * Math.cos(dLon);

    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    angle = (angle + 360) % 360;

    return angle;
  };

  // iOS için pusula izni
  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setNeedsPermission(false);
          setPermission('granted');
          return true;
        } else {
          setErrorMessage('Pusula izni verilmedi');
          return false;
        }
      } catch (err) {
        setErrorMessage('Pusula izni alınamadı');
        return false;
      }
    }
    return true;
  };

  // Konum al
  const getLocation = async () => {
    if (!navigator.geolocation) {
      setErrorMessage('Tarayıcınız konum özelliğini desteklemiyor');
      return;
    }

    // iOS için pusula iznini kontrol et
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
      const granted = await requestCompassPermission();
      if (!granted) return;
    }

    setErrorMessage('');
    setLocked(false);
    setInRangeSince(null);
    
    navigator.geolocation.getCurrentPosition(
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

  // DeviceOrientation API'sini dinle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let calculatedHeading: number | null = null;

      // iOS - webkitCompassHeading kullan (varsa)
      if ((event as any).webkitCompassHeading !== undefined) {
        calculatedHeading = (event as any).webkitCompassHeading;
      } 
      // Android - alpha ile hesapla
      else if (event.alpha !== null) {
        let alpha = event.alpha;
        
        // Screen orientation compensation
        const screenOrientation = window.orientation || 0;
        alpha = (alpha + screenOrientation + 360) % 360;
        
        // Convert to compass heading (0 = North)
        calculatedHeading = (360 - alpha) % 360;
      }

      if (calculatedHeading !== null) {
        setHeading(calculatedHeading);
        lastHeadingRef.current = calculatedHeading;
      }
    };

    // Compass desteğini kontrol et
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
      setCompassSupported(false);
      setErrorMessage('Cihazınız pusula özelliğini desteklemiyor');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
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

  // Calculate relative angle and error
  const relativeAngle = qiblaAngle !== null && smoothHeading !== null
    ? ((qiblaAngle - smoothHeading + 360) % 360)
    : (qiblaAngle ?? 0);
  
  const error = qiblaAngle !== null && heading !== null
    ? Math.abs(normalizeAngle(qiblaAngle - heading))
    : null;
  
  // Heading hazır mı?
  const isHeadingReady = heading !== null;

  // Alignment detection with locking
  useEffect(() => {
    if (!isHeadingReady || qiblaAngle === null || error === null) return;

    if (error <= ALIGNMENT_THRESHOLD) {
      if (inRangeSince === null) {
        setInRangeSince(Date.now());
      } else if (!locked) {
        const elapsed = Date.now() - inRangeSince;
        if (elapsed >= ALIGNMENT_DURATION) {
          setLocked(true);
          // Vibration feedback
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(30);
          }
        }
      }
    } else {
      setInRangeSince(null);
      if (locked && error > ALIGNMENT_THRESHOLD * 2) {
        // Auto-unlock if deviated too much
        setLocked(false);
      }
    }
  }, [error, inRangeSince, locked, isHeadingReady, qiblaAngle]);

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
        
        {/* Sapma ve Durum Göstergesi */}
        {isHeadingReady && view === "pusula" && error !== null && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cihaz: {smoothHeading.toFixed(1)}° | Göreceli: {relativeAngle.toFixed(1)}°
            </p>
            
            {locked ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-500 rounded-full">
                <span className="text-green-700 dark:text-green-400 font-semibold">
                  ✅ Kıble bulundu (sapma: {error.toFixed(1)}°)
                </span>
              </div>
            ) : error <= ALIGNMENT_THRESHOLD && inRangeSince !== null ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-500 rounded-full">
                <span className="text-yellow-700 dark:text-yellow-400 font-semibold">
                  Sabitlemek için {((ALIGNMENT_DURATION - (Date.now() - inRangeSince)) / 1000).toFixed(1)}s
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Sapma: {error.toFixed(1)}°
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Konum İzni Chip */}
      {!location ? (
        <div className="max-w-[520px] mx-auto mb-6">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-[14px] shadow-sm">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300 flex items-center gap-2">
              📍 Konum izni gerekli
            </span>
            <button
              onClick={getLocation}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              İzin ver
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Konumunuz kaydedilmez, sadece kıble hesaplaması için kullanılır
          </p>
        </div>
      ) : (
        <>
          {/* Görünüm Değiştirici */}
          <div className="mx-auto mt-4 flex w-full max-w-md overflow-hidden rounded-2xl bg-slate-900/90 p-1">
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
      <div className="mt-3">
      {/* Pusula */}
      <div className="relative w-full aspect-square mb-8">
        {/* Pusula Dış Halka - Locked durumunda yeşil */}
        <div className={`absolute inset-0 rounded-full shadow-2xl transition-colors duration-300 ${
          locked 
            ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900'
            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'
        }`} />
        
        {/* Pusula İç Halka */}
        <div className={`absolute inset-4 rounded-full shadow-inner transition-colors duration-300 ${
          locked
            ? 'bg-green-50 dark:bg-green-950'
            : 'bg-white dark:bg-gray-900'
        }`} />

        {/* Pusula Görseli (SABİT - DÖNMEZ) */}
        <div className="absolute inset-8">
          {/* SVG Pusula */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Yön İşaretleri */}
            <g className="text-gray-700 dark:text-gray-300">
              {/* Kuzey (N) */}
              <text x="100" y="20" textAnchor="middle" className="text-[18px] font-black fill-red-600">N</text>
              {/* Doğu (E) */}
              <text x="180" y="105" textAnchor="middle" className="text-[14px] font-bold fill-current">E</text>
              {/* Güney (S) */}
              <text x="100" y="190" textAnchor="middle" className="text-[14px] font-bold fill-current">S</text>
              {/* Batı (W) */}
              <text x="20" y="105" textAnchor="middle" className="text-[14px] font-bold fill-current">W</text>
            </g>

            {/* Derece İşaretleri */}
            {[...Array(36)].map((_, i) => {
              const angle = i * 10;
              const isMainDirection = angle % 90 === 0;
              const length = isMainDirection ? 15 : 8;
              const width = isMainDirection ? 3 : 1.5;
              const x1 = 100 + 85 * Math.sin((angle * Math.PI) / 180);
              const y1 = 100 - 85 * Math.cos((angle * Math.PI) / 180);
              const x2 = 100 + (85 - length) * Math.sin((angle * Math.PI) / 180);
              const y2 = 100 - (85 - length) * Math.cos((angle * Math.PI) / 180);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth={width}
                  className="text-gray-400 dark:text-gray-600"
                />
              );
            })}

            {/* Pusula İğnesi (Kuzey) */}
            <g>
              <polygon
                points="100,40 95,100 100,95 105,100"
                className="fill-red-600"
              />
              <polygon
                points="100,160 95,100 100,105 105,100"
                className="fill-gray-500"
              />
              <circle cx="100" cy="100" r="5" className="fill-gray-900 dark:fill-white" />
            </g>
          </svg>
        </div>

        {/* Kıble Yönü İşareti (Göreceli Açıya Göre Döner) */}
        {qiblaAngle !== null && (
          <div
            className={`absolute inset-0 ${locked ? '' : 'transition-transform duration-200'} ease-out`}
            style={{
              transform: `rotate(${relativeAngle}deg)`,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
              <div className={`drop-shadow-lg transition-all duration-300 ${
                locked ? 'text-5xl scale-125' : 'text-4xl'
              }`}>
                🕋
              </div>
            </div>
          </div>
        )}

        {/* Merkez Nokta - Locked durumunda yeşil */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg transition-colors duration-300 ${
          locked ? 'bg-green-600' : 'bg-primary-600'
        }`} />
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
                  setQiblaAngle(coords.qibla);
                  setErrorMessage('');
                }
              }}
              className="w-full px-4 py-2 border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Şehir Seçiniz</option>
              {Object.keys(cityCoordinates).map((city) => (
                <option key={city} value={city}>
                  {city} (Kıble: {cityCoordinates[city].qibla}°)
                </option>
              ))}
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

      
      {/* Locked - Kilitli Durum */}
      {location && qiblaAngle !== null && locked && (
        <div className="mt-4 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-xl text-green-700 dark:text-green-400 font-bold mb-2">
              Kıble Bulundu!
            </p>
            <p className="text-base text-green-600 dark:text-green-500 font-semibold mb-1">
              Sabit durabilirsiniz
            </p>
            <p className="text-sm text-green-600 dark:text-green-500 mt-2">
              🕋 Cihazınız Kabe&apos;ye bakıyor. Namaz için hazırsınız.
            </p>
          </div>
          <button
            onClick={() => {
              setLocked(false);
              setInRangeSince(null);
            }}
            className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            Kilidi Kaldır
          </button>
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
