import { MapPin, Star } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import type { Retreat } from "@/types/retreat";
import { formatPrice, whatsappLink } from "@/components/tenant-site/tenant-helpers";
import { MessageSquare } from "lucide-react";

interface HeroProps {
  retreat: Retreat;
  categoryName?: string;
}

export function Hero({ retreat, categoryName }: HeroProps) {
  const heroImage = retreat.banner_image ? `${API_BASE_URL}${retreat.banner_image}` : null;
  const price = formatPrice(retreat.budget_min, retreat.budget_max);
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[78vh] min-h-[540px] w-full">
        {heroImage ? (
          <img
            src={heroImage}
            alt={retreat.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#2f4a3c]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-5 pb-12 md:pb-16">
            <p className="ts-overline text-white/70">
              {categoryName ? `${categoryName} · ` : ""}A place to slow down
            </p>
            <h1 className="ts-display mt-4 max-w-3xl text-5xl font-medium leading-[1.02] text-white md:text-7xl">
              {retreat.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
              {retreat.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {retreat.address}
                </span>
              )}
              {retreat.average_rating != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#d97706] text-[#d97706]" />
                  <span className="font-semibold text-white">
                    {retreat.average_rating.toFixed(1)}
                  </span>
                  <span className="text-white/60">guest rating</span>
                </span>
              )}
              {price && <span className="font-medium text-white">{price}</span>}
            </div>
            <div className="mt-8">
              <a
                href={whatsappLink(retreat.phone, retreat.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#f5f1e6] px-7 text-sm font-semibold text-[#1c1917] hover:bg-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Plan your stay
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
