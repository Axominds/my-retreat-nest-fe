import { Star } from "lucide-react";

/** Shared star row for the tenant site, so review surfaces stay identical. */
export function Stars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.round(value)
              ? "fill-[#b45309] text-[#b45309]"
              : "text-[#e7e0d2]"
          }`}
        />
      ))}
    </span>
  );
}
