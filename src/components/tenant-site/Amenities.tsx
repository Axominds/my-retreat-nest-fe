import type { Amenity } from "@/types/amenity";

export function Amenities({ amenities }: { amenities: Amenity[] }) {
  if (!amenities || amenities.length === 0) return null;
  return (
    <section id="amenities" className="scroll-mt-24 bg-[#f3ede1]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <p className="ts-overline text-[#b45309]">Amenities</p>
        <h2 className="ts-display mt-3 max-w-xl text-3xl font-medium leading-tight md:text-5xl">
          Everything, thoughtfully provided
        </h2>
        <ol className="mt-12 grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {amenities.map((amenity, i) => (
            <li
              key={amenity.amenity_id}
              className="flex items-baseline gap-5 border-t ts-hairline py-5"
            >
              <span className="ts-display text-sm text-[#a8a29e]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="ts-display text-xl font-medium md:text-2xl">
                {amenity.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
