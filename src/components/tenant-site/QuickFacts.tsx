import { Star } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import { formatPrice } from "@/components/tenant-site/tenant-helpers";

interface QuickFactsProps {
  retreat: Retreat;
  categoryName?: string;
}

export function QuickFacts({ retreat, categoryName }: QuickFactsProps) {
  const price = formatPrice(retreat.budget_min, retreat.budget_max);
  const facts: { label: string; value: React.ReactNode }[] = [
    {
      label: "Price",
      value: price || <span className="text-[#78716c]">On request</span>,
    },
    {
      label: "Rating",
      value:
        retreat.average_rating != null ? (
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-[#b45309] text-[#b45309]" />
            {retreat.average_rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-[#78716c]">New</span>
        ),
    },
    {
      label: "Style",
      value: categoryName ?? <span className="text-[#78716c]">Retreat</span>,
    },
    {
      label: "Contact",
      value: retreat.phone ?? retreat.email ?? (
        <span className="text-[#78716c]">—</span>
      ),
    },
  ];
  return (
    <section className="border-b ts-hairline">
      <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 md:grid-cols-4">
        {facts.map((fact, i) => (
          <div
            key={fact.label}
            className={`py-7 ${i > 0 ? "border-l ts-hairline pl-6 md:pl-8" : ""} ${i === 2 ? "max-md:border-l-0 max-md:pl-0 max-md:border-t max-md:pt-6 max-md:mt-0" : ""} ${i >= 2 ? "max-md:border-t ts-hairline" : ""}`}
          >
            <p className="ts-overline text-[#a8a29e]">{fact.label}</p>
            <p className="ts-display mt-2 text-xl font-medium md:text-2xl">
              {fact.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
