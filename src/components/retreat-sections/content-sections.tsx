import { Check, Info } from "lucide-react";
import type { Amenity } from "@/types/amenity";

export function AmenitiesSection({ amenities }: { amenities: Amenity[] }) {
  if (!amenities || amenities.length === 0) return null;
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold">Amenities</h2>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {amenities.map((amenity) => (
          <div
            key={amenity.amenity_id}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border bg-primary/5 text-primary text-sm font-medium"
          >
            <Check className="h-4 w-4" />
            {amenity.label}
          </div>
        ))}
      </div>
    </section>
  );
}

export function AboutSection({ description }: { description: string | null }) {
  if (!description) return null;
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold">
          About this retreat
        </h2>
      </div>
      <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
        {description}
      </div>
    </section>
  );
}
