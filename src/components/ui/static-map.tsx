"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface StaticMapProps {
  latitude: number;
  longitude: number;
  address?: string | null;
  className?: string;
}

export function StaticMap({
  latitude,
  longitude,
  className,
}: StaticMapProps) {
  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div
        className={`rounded-lg overflow-hidden border ${className ?? "h-48"} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
      >
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]} />
        </MapContainer>
      </div>
    </a>
  );
}
