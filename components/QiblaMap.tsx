"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import * as L from "leaflet";

// react-leaflet bileşenlerini dinamik olarak yükle
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

type Props = {
  userLat: number;
  userLng: number;
  kaabaLat?: number;
  kaabaLng?: number;
};

const DEFAULT_KAABA = { lat: 21.4225, lng: 39.8262 };

function makeDotIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;border-radius:999px;
      background:${color};
      border:3px solid white;
      box-shadow:0 6px 18px rgba(0,0,0,.25);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function QiblaMap({
  userLat,
  userLng,
  kaabaLat,
  kaabaLng,
}: Props) {
  const kaaba = {
    lat: kaabaLat ?? DEFAULT_KAABA.lat,
    lng: kaabaLng ?? DEFAULT_KAABA.lng,
  };

  const center = useMemo(() => {
    // Kullanıcıyı biraz merkeze al, Kabe uzak olduğu için zoomu çok kaçırmayalım
    return { lat: userLat, lng: userLng };
  }, [userLat, userLng]);

  const userIcon = useMemo(() => makeDotIcon("#3b82f6"), []);
  const kaabaIcon = useMemo(() => makeDotIcon("#22c55e"), []);

  // Kesik çizgi efekti (Leaflet Polyline dashArray destekler)
  const pathOptions = useMemo(
    () => ({ dashArray: "8 10", weight: 3, opacity: 0.9, color: "#059669" }),
    []
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: 420, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">📍 Konumunuz</p>
              <p className="text-sm">{userLat.toFixed(4)}°, {userLng.toFixed(4)}°</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={[kaaba.lat, kaaba.lng]} icon={kaabaIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold">🕋 Kabe</p>
              <p className="text-sm">Mekke, Suudi Arabistan</p>
              <p className="text-xs">{kaaba.lat}°, {kaaba.lng}°</p>
            </div>
          </Popup>
        </Marker>

        <Polyline
          positions={[
            [userLat, userLng],
            [kaaba.lat, kaaba.lng],
          ]}
          pathOptions={pathOptions as any}
        />
      </MapContainer>

      <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
        🗺️ Harita kıble hattını gösterir (kesik çizgi). Yakınlaştırmak için + / - kullanabilirsiniz.
      </div>
    </div>
  );
}
