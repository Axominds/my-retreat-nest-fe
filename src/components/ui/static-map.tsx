"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapSearchBox } from "@/components/ui/map-search-box";
import { MapControls } from "@/components/ui/map-controls";
import { Navigation, ExternalLink } from "lucide-react";

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
  showSearch?: boolean;
  onLocationSelect?: (data: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export function StaticMap({
  latitude,
  longitude,
  address,
  className,
  showSearch = false,
  onLocationSelect,
}: StaticMapProps) {
  const [position, setPosition] = useState<[number, number]>([
    latitude,
    longitude,
  ]);
  const [selectedAddress, setSelectedAddress] = useState(address ?? "");

  useEffect(() => {
    setPosition([latitude, longitude]);
    if (address) setSelectedAddress(address);
  }, [latitude, longitude, address]);

  const handleLocationSelect = (data: {
    address: string;
    latitude: string;
    longitude: string;
  }) => {
    setPosition([Number(data.latitude), Number(data.longitude)]);
    setSelectedAddress(data.address);
    onLocationSelect?.({
      address: data.address,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    });
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border relative ${className ?? "h-48"}`}
    >
      <MapContainer
        center={position}
        zoom={13}
        className="h-full w-full relative"
        scrollWheelZoom={true}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
        {showSearch ? (
          <MapSearchBox
            latitude={String(position[0])}
            longitude={String(position[1])}
            address={selectedAddress}
            onLocationSelect={handleLocationSelect}
            sidePanelItems={[
              {
                label: "Get Directions",
                href: `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`,
                external: true,
                icon: <Navigation className="h-4 w-4" />,
              },
              {
                label: "Open in Google Maps",
                href: `https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`,
                external: true,
                icon: <ExternalLink className="h-4 w-4" />,
              },
            ]}
          />
        ) : (
          <div className="absolute bottom-3 left-3 z-[1100] flex flex-col gap-1.5">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md ring-1 ring-black/5 transition-colors hover:bg-white"
            >
              <Navigation className="h-3.5 w-3.5" />
              Get Directions
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${position[0]},${position[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md ring-1 ring-black/5 transition-colors hover:bg-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Google Maps
            </a>
          </div>
        )}
        <MapControls />
      </MapContainer>
    </div>
  );
}
