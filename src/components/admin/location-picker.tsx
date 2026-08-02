"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { reverseGeocode } from "@/lib/geocoding";
import { MapSearchBox } from "@/components/ui/map-search-box";
import { MapControls } from "@/components/ui/map-controls";

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

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];
const DEFAULT_ZOOM = 4;

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 10), { duration: 0.5 });
    },
  });
  return null;
}

function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 10), { duration: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], map]);
  return null;
}

interface LocationPickerProps {
  address: string;
  latitude: string;
  longitude: string;
  required?: boolean;
  onChange: (data: {
    address: string;
    latitude: string;
    longitude: string;
  }) => void;
}

export function LocationPicker({
  address,
  latitude,
  longitude,
  required,
  onChange,
}: LocationPickerProps) {
  const [geocoding, setGeocoding] = useState(false);

  const hasCoords = latitude !== "" && longitude !== "";
  const position: [number, number] | null = hasCoords
    ? [Number(latitude), Number(longitude)]
    : null;

  const handleLocationSelect = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      try {
        const result = await reverseGeocode(lat, lng);
        onChange({
          address: result.display_name ?? "",
          latitude: String(lat),
          longitude: String(lng),
        });
      } catch {
        onChange({ address, latitude: String(lat), longitude: String(lng) });
      } finally {
        setGeocoding(false);
      }
    },
    [address, onChange],
  );

  const handleMarkerDrag = useCallback(
    (e: L.LeafletEvent) => {
      const marker = e.target as L.Marker;
      const { lat, lng } = marker.getLatLng();
      handleLocationSelect(lat, lng);
    },
    [handleLocationSelect],
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>
          Address
          {required && <span className="text-destructive"> *</span>}
        </Label>
        <div className="relative">
          <Input
            value={address}
            onChange={(e) => {
              const val = e.target.value;
              onChange({ address: val, latitude, longitude });
            }}
            placeholder="Search the address name"
          />
          {geocoding && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {!hasCoords && (
          <p className="text-xs text-muted-foreground">
            Select a location on the map or search to set the coordinates.
          </p>
        )}
      </div>

      <div className="h-64 rounded-lg overflow-hidden border relative">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 13 : DEFAULT_ZOOM}
          className="h-full w-full relative"
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={position ?? DEFAULT_CENTER} />
          {position && (
            <Marker
              position={position}
              draggable
              eventHandlers={{ dragend: handleMarkerDrag }}
            />
          )}
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <MapSearchBox
            latitude={latitude}
            longitude={longitude}
            address={address}
            onLocationSelect={(data) => onChange(data)}
            sidePanelItems={[
              ...(hasCoords
                ? [
                    {
                      label: "Open in Google Maps",
                      href: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
                      external: true,
                      icon: <MapPin className="h-4 w-4" />,
                    },
                  ]
                : []),
            ]}
          />
          <MapControls />
        </MapContainer>
      </div>

      {hasCoords && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Lat: {Number(latitude).toFixed(6)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Lng: {Number(longitude).toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
