"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
import { Loader2, MapPin, Pencil, Search } from "lucide-react";
import { forwardGeocode, reverseGeocode } from "@/lib/geocoding";

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

type InteractionMode = "edit" | "geocode";

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
  const [activeMode, setActiveMode] = useState<InteractionMode | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const hasCoords = latitude !== "" && longitude !== "";
  const position: [number, number] | null = hasCoords
    ? [Number(latitude), Number(longitude)]
    : null;

  function handleModeChange(mode: InteractionMode) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setError(null);
    setActiveMode((prev) => (prev === mode ? null : mode));
  }

  const handleAddressSearch = useCallback(
    (value: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (!value.trim()) return;
      setError(null);
      debounceTimer.current = setTimeout(async () => {
        setGeocoding(true);
        try {
          const results = await forwardGeocode(value);
          if (results.length > 0) {
            const { lat, lon, display_name } = results[0];
            onChange({
              address: display_name,
              latitude: String(lat),
              longitude: String(lon),
            });
          } else {
            setError("No location found");
          }
        } catch {
          setError("Geocoding failed");
        } finally {
          setGeocoding(false);
        }
      }, 600);
    },
    [onChange],
  );

  const handleLocationSelect = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      setError(null);
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

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const isReadonly = activeMode === null;

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
              if (activeMode === "geocode") handleAddressSearch(val);
            }}
            readOnly={isReadonly}
            placeholder={
              isReadonly
                ? "Click the map or select a mode above..."
                : activeMode === "edit"
                  ? "Edit address text (coordinates unchanged)..."
                  : "Type to search, then refine on the map..."
            }
          />
          {geocoding && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => handleModeChange("edit")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            activeMode === "edit"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("geocode")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            activeMode === "geocode"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Search className="h-3 w-3" />
          Search
        </button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="h-64 rounded-lg overflow-hidden border z-10">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 13 : DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater center={position ?? DEFAULT_CENTER} />
          {position && (
            <Marker
              position={position}
              draggable={activeMode === "geocode"}
              eventHandlers={
                activeMode === "geocode"
                  ? { dragend: handleMarkerDrag }
                  : undefined
              }
            />
          )}
          {activeMode === "geocode" && (
            <MapClickHandler onLocationSelect={handleLocationSelect} />
          )}
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
