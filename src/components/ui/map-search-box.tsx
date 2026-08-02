"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMap } from "react-leaflet";
import { DomEvent } from "leaflet";
import { forwardGeocode } from "@/lib/geocoding";
import {
  Search,
  Loader2,
  MapPin,
  X,
  PanelLeft,
  ExternalLink,
} from "lucide-react";

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

export interface MapSidePanelItem {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
}

interface MapSearchBoxProps {
  address?: string;
  latitude?: string;
  longitude?: string;
  placeholder?: string;
  onLocationSelect?: (data: {
    address: string;
    latitude: string;
    longitude: string;
  }) => void;
  sidePanelItems?: MapSidePanelItem[];
  showSidePanelToggle?: boolean;
}

export function MapSearchBox({
  address,
  latitude,
  longitude,
  placeholder = "Search places, cities...",
  onLocationSelect,
  sidePanelItems = [],
  showSidePanelToggle = true,
}: MapSearchBoxProps) {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const hasCoords =
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== undefined &&
    longitude !== "";

  const search = useCallback(async (value: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setSearching(true);
    setError(null);
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await forwardGeocode(value);
        setResults(
          data.map((r) => ({
            lat: Number(r.lat),
            lon: Number(r.lon),
            display_name: r.display_name,
          })),
        );
        if (data.length === 0) setError("No results found");
      } catch {
        setError("Search failed");
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSelect = useCallback(
    (result: GeocodeResult) => {
      setQuery(result.display_name);
      setResults([]);
      setError(null);
      inputRef.current?.blur();
      map.flyTo([result.lat, result.lon], 14, { duration: 0.8 });
      if (onLocationSelect) {
        onLocationSelect({
          address: result.display_name,
          latitude: String(result.lat),
          longitude: String(result.lon),
        });
      }
    },
    [map, onLocationSelect],
  );

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      DomEvent.disableClickPropagation(rootRef.current);
    }
  }, []);

  const showDropdown = focused && (results.length > 0 || searching || !!error);

  return (
    <div ref={rootRef} className="absolute inset-0 z-[1100] pointer-events-none">
      {/* Search input */}
      <div className="absolute top-3 left-3 w-72 max-w-[calc(100%-24px)] pointer-events-auto">
        <div
          className={`flex items-center gap-2 h-10 px-3 rounded-lg bg-background shadow-lg ring-1 transition-shadow ${
            focused ? "ring-2 ring-primary" : "ring-border"
          }`}
        >
          {searching ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              search(e.target.value);
            }}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results.length > 0) {
                handleSelect(results[0]);
              }
            }}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
          />
          {showSidePanelToggle && (
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              className={`shrink-0 p-1.5 rounded-md transition-colors ${
                panelOpen
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              aria-label="Toggle side panel"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setError(null);
              }}
              className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="mt-1.5 overflow-hidden rounded-lg bg-background shadow-xl ring-1 ring-border">
            {results.map((r, i) => (
              <button
                key={`${r.lat}-${r.lon}-${i}`}
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-muted transition-colors"
              >
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-sm leading-snug line-clamp-2">
                  {r.display_name}
                </span>
              </button>
            ))}
            {results.length === 0 && (searching || error) && (
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                {searching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  error
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side panel */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-64 max-w-[80%] -translate-x-full transition-transform duration-300 ease-out pointer-events-auto ${
          panelOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="h-full overflow-hidden rounded-r-lg bg-background shadow-xl ring-1 ring-border">
          <div className="flex items-center justify-between px-3 py-2.5 border-b">
            <p className="text-sm font-semibold">Location</p>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              aria-label="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(100%-45px)]">
            {address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span className="text-muted-foreground leading-snug">
                  {address}
                </span>
              </div>
            )}

            {hasCoords && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-muted px-2 py-1.5">
                  <p className="text-muted-foreground">Latitude</p>
                  <p className="font-medium mt-0.5">
                    {Number(latitude).toFixed(6)}
                  </p>
                </div>
                <div className="rounded-md bg-muted px-2 py-1.5">
                  <p className="text-muted-foreground">Longitude</p>
                  <p className="font-medium mt-0.5">
                    {Number(longitude).toFixed(6)}
                  </p>
                </div>
              </div>
            )}

            {sidePanelItems.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t">
                {sidePanelItems.map((item, i) =>
                  item.href ? (
                    <a
                      key={i}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium text-primary hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      {item.label}
                      {item.external && (
                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      )}
                    </a>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium text-primary hover:bg-muted transition-colors text-left"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
