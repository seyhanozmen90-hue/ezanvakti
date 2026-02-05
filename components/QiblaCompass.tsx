'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

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
  const [error, setError] = useState<string>('');
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [isAligned, setIsAligned] = useState<boolean>(false);
  
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

  // Shortest angle difference (for alignment check)
  const shortestAngleDiff = (target: number, current: number): number => {
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
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
          setError('Pusula izni verilmedi');
          return false;
        }
      } catch (err) {
        setError('Pusula izni alınamadı');
        return false;
      }
    }
    return true;
  };

  // Konum al
  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError('Tarayıcınız konum özelliğini desteklemiyor');
      return;
    }

    // iOS için pusula iznini kontrol et
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsPermission(true);
      const granted = await requestCompassPermission();
      if (!granted) return;
    }

    setError('');
    setIsAligned(false);
    
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
        setError('Konum izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.');
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
      setError('Cihazınız pusula özelliğini desteklemiyor');
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
  }, [heading]);

  // Calculate relative angle
  const relativeAngle = qiblaAngle !== null && smoothHeading !== null
    ? ((qiblaAngle - smoothHeading + 360) % 360)
    : (qiblaAngle ?? 0);
  
  // Heading hazır mı?
  const isHeadingReady = heading !== null;

  // Alignment detection
  useEffect(() => {
    if (!isHeadingReady || qiblaAngle === null || isAligned) return;

    const angleDiff = Math.abs(shortestAngleDiff(relativeAngle, 0));

    if (angleDiff <= ALIGNMENT_THRESHOLD) {
      if (!alignmentTimerRef.current) {
        alignmentTimerRef.current = setTimeout(() => {
          setIsAligned(true);
        }, ALIGNMENT_DURATION);
      }
    } else {
      if (alignmentTimerRef.current) {
        clearTimeout(alignmentTimerRef.current);
        alignmentTimerRef.current = null;
      }
    }

    return () => {
      if (alignmentTimerRef.current) {
        clearTimeout(alignmentTimerRef.current);
        alignmentTimerRef.current = null;
      }
    };
  }, [relativeAngle, isHeadingReady, qiblaAngle, isAligned]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Başlık */}
      <div className="text-center mb-8">
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
        {isHeadingReady && view === "pusula" && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cihaz: {smoothHeading.toFixed(1)}° | Göreceli: {relativeAngle.toFixed(1)}°
          </p>
        )}
        {isAligned && (
          <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-2 animate-pulse">
            ✅ Kıble Yönü Bulundu!
          </p>
        )}
      </div>

      {/* Konum İzni Butonu */}
      {!location ? (
        <button
          onClick={getLocation}
          className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📍 Konumu Aktif Et
        </button>
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
      <div>
      {/* Pusula */}
      <div className="relative w-full aspect-square mb-8">
        {/* Pusula Dış Halka */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-2xl" />
        
        {/* Pusula İç Halka */}
        <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 shadow-inner" />

        {/* Pusula Görseli (Cihaz heading kadar ters döner) */}
        <div
          className="absolute inset-8 transition-transform duration-200 ease-out"
          style={{
            transform: `rotate(${-smoothHeading}deg)`,
          }}
        >
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
            className={`absolute inset-0 transition-transform ${isAligned ? 'duration-100' : 'duration-200'} ease-out`}
            style={{
              transform: `rotate(${relativeAngle}deg)`,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
              <div className={`text-4xl drop-shadow-lg ${isAligned ? 'scale-125 animate-pulse' : ''}`}>
                🕋
              </div>
            </div>
          </div>
        )}

        {/* Merkez Nokta */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full shadow-lg" />
      </div>


      {/* Hata Mesajı + Fallback Şehir Seçimi */}
      {error && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
                  setError('');
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

      {/* Başarı Mesajı - Sadece Heading Hazırsa */}
      {location && qiblaAngle !== null && isHeadingReady && !isAligned && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-400 text-center font-semibold">
            🧭 Cihazınızı döndürün
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500 text-center mt-1">
            🕋 Kabe işaretini yukarı getirin. 5° içinde 1.2 saniye kalırsa kilitlenecek.
          </p>
          <div className="mt-2 text-center">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {Math.abs(shortestAngleDiff(relativeAngle, 0)).toFixed(1)}°
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-500">
              sapma
            </div>
          </div>
        </div>
      )}
      
      {/* Hizalama Başarılı */}
      {location && qiblaAngle !== null && isAligned && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-xl">
          <p className="text-lg text-green-700 dark:text-green-400 text-center font-bold">
            ✅ Kıble Yönü Bulundu!
          </p>
          <p className="text-sm text-green-600 dark:text-green-500 text-center mt-2">
            🕋 Cihazınız şu an Kabe&apos;ye bakıyor. Namaz için hazırsınız.
          </p>
          <button
            onClick={() => setIsAligned(false)}
            className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            Tekrar Hizala
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
        <div className="mt-4">
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
