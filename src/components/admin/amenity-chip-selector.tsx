"use client";

import { Check } from "lucide-react";
import type { Amenity } from "@/types/amenity";

interface AmenityChipSelectorProps {
  amenities: Amenity[];
  selected: number[];
  onChange: (ids: number[]) => void;
  variant?: "default" | "hero";
}

export function AmenityChipSelector({
  amenities,
  selected,
  onChange,
  variant = "default",
}: AmenityChipSelectorProps) {
  const isHero = variant === "hero";

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {amenities.map((amenity) => {
        const active = selected.includes(amenity.amenity_id);
        return (
          <button
            key={amenity.amenity_id}
            type="button"
            onClick={() => toggle(amenity.amenity_id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
              active
                ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                : isHero
                  ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {amenity.label}
          </button>
        );
      })}
    </div>
  );
}
