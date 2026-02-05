'use client';

import { useState, useEffect } from 'react';

interface QiblaCompassProps {
  userLat?: number;
  userLon?: number;
}

export default function QiblaCompass({ userLat, userLon }: QiblaCompassProps) {
  const [heading, setHeading] = useState<number | null>(null); // Cihaz yönü (null = henüz algılanmadı)
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null); // Kıble açısı
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [compassSupported, setCompassSupported] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Kabe koordinatları (Mekke)
  const KAABA_LAT = 21.4225;
  const KAABA_LON = 39.8262;

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

  // Kıble açısını hesapla
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
    angle = (angle + 360) % 360; // 0-360 arasına normalize et

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
        } else {
          setError('Pusula izni verilmedi');
        }
      } catch (err) {
        setError('Pusula izni alınamadı');
      }
    }
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
      await requestCompassPermission();
    }

    setError('');
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
      if (event.alpha !== null) {
        // alpha: 0-360 derece, kuzey = 0
        const alpha = event.alpha;
        const calculatedHeading = 360 - alpha; // Ters çevir (saat yönünün tersi)
        setHeading(calculatedHeading);
        console.log('🧭 Compass heading:', calculatedHeading.toFixed(1), '° | Alpha:', alpha.toFixed(1));
      } else {
        console.log('⚠️ Alpha is null - compass not working');
      }
    };

    // Compass desteğini kontrol et
    if ('DeviceOrientationEvent' in window) {
      // iOS 13+ için permission request gerekebilir
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // iOS için - kullanıcı bir butona tıkladığında çağrılmalı
        // Şimdilik sadece event listener ekle
        window.addEventListener('deviceorientation', handleOrientation);
      } else {
        // Android veya eski iOS - direkt çalışır
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } else {
      setCompassSupported(false);
      setError('Cihazınız pusula özelliğini desteklemiyor');
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
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

  // Kıble yönü (göreceli açı - normalize edilmiş)
  const relativeAngle = qiblaAngle !== null && heading !== null
    ? ((qiblaAngle - heading + 360) % 360)
    : (qiblaAngle ?? 0);
  
  // Heading hazır mı? (Cihaz sensörü çalışıyor mu?)
  const isHeadingReady = heading !== null && heading !== 0;

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
        {heading !== null && isHeadingReady && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cihaz Yönü: {heading.toFixed(1)}° | Göreceli: {relativeAngle.toFixed(1)}°
          </p>
        )}
      </div>

      {/* Pusula */}
      <div className="relative w-full aspect-square mb-8">
        {/* Pusula Dış Halka */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-2xl" />
        
        {/* Pusula İç Halka */}
        <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 shadow-inner" />

        {/* Pusula Görseli (SABİT - Artık Dönmüyor) */}
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
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `rotate(${relativeAngle}deg)`,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
              <div className="text-4xl drop-shadow-lg">
                🕋
              </div>
            </div>
          </div>
        )}

        {/* Merkez Nokta */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full shadow-lg" />
      </div>

      {/* Konum İzni Butonu */}
      {!location && (
        <button
          onClick={getLocation}
          className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📍 Konumu Aktif Et
        </button>
      )}

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
      {location && qiblaAngle !== null && isHeadingReady && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-sm text-green-700 dark:text-green-400 text-center font-semibold">
            ✅ Kıble yönü hesaplandı!
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 text-center mt-1">
            🕋 Kabe işareti Kıble yönünü gösteriyor. Cihazınızı döndürün ve 🕋 yukarı geldiğinde durun.
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 text-center mt-1">
            📐 Göreceli Açı: {relativeAngle.toFixed(1)}° (Kıble: {qiblaAngle.toFixed(1)}° - Cihaz: {heading.toFixed(1)}°)
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
  );
}
