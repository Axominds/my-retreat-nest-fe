"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, DollarSign, SlidersHorizontal, Star, Coffee, ChevronDown, ChevronUp, LocateFixed, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types/category";
import type { Amenity } from "@/types/amenity";

interface RetreatFiltersProps {
  categories: Category[];
  amenities?: Amenity[];
  onFilterChange: (filters: FilterValues) => void;
  variant?: "default" | "hero";
  initialValues?: Partial<FilterValues>;
}

export interface GeoCenter {
  latitude: number;
  longitude: number;
  label: string;
}

export const RADIUS_PRESETS_KM = [10, 25, 50, 100];
export const DEFAULT_RADIUS_KM = 25;

export interface FilterValues {
  search: string;
  categoryId: string;
  budgetMin: string;
  budgetMax: string;
  rating: string;
  amenityIds: number[];
  center: GeoCenter | null;
  radiusKm: number;
}

export function RetreatFilters({ categories, amenities = [], onFilterChange, variant = "default", initialValues }: RetreatFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    categoryId: "all",
    budgetMin: "",
    budgetMax: "",
    rating: "",
    amenityIds: [],
    center: null,
    radiusKm: DEFAULT_RADIUS_KM,
    ...initialValues,
  });
  const [showMore, setShowMore] = useState(false);
  const [locating, setLocating] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: FilterValues[keyof FilterValues]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const toggleAmenity = (id: number) => {
    const next = filters.amenityIds.includes(id)
      ? filters.amenityIds.filter((a) => a !== id)
      : [...filters.amenityIds, id];
    updateFilter("amenityIds", next);
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const next: FilterValues = {
          ...filters,
          center: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            label: "Your location",
          },
          radiusKm: filters.radiusKm || DEFAULT_RADIUS_KM,
        };
        setFilters(next);
        onFilterChange(next);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Allow access to filter by distance.");
        } else if (err.code === err.TIMEOUT) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Could not get your location. Please try again.");
        }
      },
      { timeout: 10000 }
    );
  };

  const clearLocation = () => {
    const next: FilterValues = { ...filters, center: null };
    setFilters(next);
    onFilterChange(next);
  };

  const clearFilters = () => {
    const cleared: FilterValues = { search: "", categoryId: "all", budgetMin: "", budgetMax: "", rating: "", amenityIds: [], center: null, radiusKm: DEFAULT_RADIUS_KM };
    setFilters(cleared);
    setShowMore(false);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.search || filters.categoryId !== "all" || filters.budgetMin || filters.budgetMax || filters.rating || filters.amenityIds.length > 0 || filters.center !== null;

  const activeCount = [
    filters.categoryId !== "all",
    !!filters.budgetMin || !!filters.budgetMax,
    !!filters.rating,
    filters.amenityIds.length > 0,
    filters.center !== null,
  ].filter(Boolean).length;

  const isHero = variant === "hero";

  return (
    <div className={`${isHero ? "p-5" : "rounded-xl border bg-card shadow-sm p-4 md:p-5"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isHero ? "text-white/60" : "text-muted-foreground"}`}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className={`ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${isHero ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant={isHero ? "ghost" : "ghost"} size="sm" onClick={clearFilters} className={`h-7 text-xs ${isHero ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground"}`}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg ${isHero ? "bg-white/10" : "bg-muted"}`}>
          <Search className={`h-4 w-4 ${isHero ? "text-white/60" : "text-muted-foreground"}`} />
        </div>
        <Input
          placeholder="Search by name, description, or location..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className={`h-12 pl-14 text-sm ${isHero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/20" : "bg-background"}`}
        />
      </div>

      {/* Nearby location */}
      <div className="mb-4">
        <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
          <MapPin className="h-3 w-3" />
          Nearby
        </p>
        {filters.center ? (
          <div className="space-y-2">
            <div className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${isHero ? "bg-white/10 border-white/10 text-white" : "bg-background border-border text-foreground"}`}>
              <span className="flex items-center gap-1.5 min-w-0">
                <LocateFixed className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  {filters.center.label} · within {filters.radiusKm} km
                </span>
              </span>
              <button
                type="button"
                onClick={clearLocation}
                aria-label="Clear location filter"
                className={`shrink-0 rounded p-0.5 ${isHero ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RADIUS_PRESETS_KM.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => updateFilter("radiusKm", km)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    filters.radiusKm === km
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : isHero
                        ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant={isHero ? "ghost" : "outline"}
            size="sm"
            onClick={useMyLocation}
            disabled={locating}
            className={`w-full h-9 text-xs font-medium ${isHero ? "bg-white/10 text-white/80 border border-white/10 hover:bg-white/20 hover:text-white" : ""}`}
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5 mr-1.5" />
            )}
            {locating ? "Locating…" : "Use my location"}
          </Button>
        )}
      </div>

      {/* Category chips */}
      <div className="mb-4">
        <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => updateFilter("categoryId", "all")}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
              filters.categoryId === "all"
                ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                : isHero
                  ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => updateFilter("categoryId", String(cat.category_id))}
              className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                filters.categoryId === String(cat.category_id)
                  ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                  : isHero
                    ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick budget row */}
      <div className="mb-4">
        <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
          <DollarSign className="h-3 w-3" />
          Budget range
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>$</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) => updateFilter("budgetMin", e.target.value)}
              className={`h-9 pl-7 text-sm ${isHero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : "bg-background"}`}
            />
          </div>
          <span className={`text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>—</span>
          <div className="relative flex-1">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>$</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) => updateFilter("budgetMax", e.target.value)}
              className={`h-9 pl-7 text-sm ${isHero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : "bg-background"}`}
            />
          </div>
        </div>
      </div>

      {/* More filters toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-all duration-200 ${
          isHero
            ? "text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {showMore ? "Hide" : "More"} filters
        {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {showMore && (
        <div className="mt-4 pt-4 border-t space-y-5 animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
          {/* Rating */}
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
              <Star className="h-3 w-3" />
              Minimum rating
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "", label: "Any" },
                { value: "4", label: "4+" },
                { value: "3", label: "3+" },
                { value: "2", label: "2+" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("rating", opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    filters.rating === opt.value
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : isHero
                        ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
              <Coffee className="h-3 w-3" />
              Amenities
            </p>
            {amenities.length === 0 ? (
              <p className={`text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>
                No amenities available.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((amenity) => {
                  const active = filters.amenityIds.includes(amenity.amenity_id);
                  return (
                    <button
                      key={amenity.amenity_id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.amenity_id)}
                      aria-pressed={active}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                        active
                          ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                          : isHero
                            ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                            : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {amenity.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
