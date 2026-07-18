import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin, TreePine, Star } from "lucide-react";
import type { Retreat } from "@/types/retreat";

interface RetreatCardProps {
  retreat: Retreat;
  categoryName?: string;
  wishlistButton?: React.ReactNode;
  index?: number;
  imageUrl?: string | null;
}

const GRADIENTS = [
  "from-emerald-400/40 to-green-600/40",
  "from-teal-400/40 to-emerald-700/40",
  "from-green-300/40 to-teal-600/40",
  "from-lime-400/40 to-green-600/40",
  "from-emerald-300/40 to-teal-700/40",
  "from-green-400/40 to-emerald-600/40",
];

function formatBudget(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return "";
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"}`}
        />
      ))}
    </div>
  );
}

export function RetreatCard({ retreat, categoryName, wishlistButton, index = 0, imageUrl }: RetreatCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const price = formatBudget(retreat.budget_min, retreat.budget_max);

  return (
    <div
      className="group relative rounded-xl overflow-hidden border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/retreats/${retreat.retreat_id}`}>
        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={retreat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <TreePine className="h-12 w-12 text-foreground/20 group-hover:scale-110 group-hover:text-foreground/30 transition-all duration-500" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent h-20 pointer-events-none" />
          {price && (
            <div className="absolute bottom-2.5 left-3">
              <span className="text-sm font-semibold text-white drop-shadow-sm">{price}</span>
            </div>
          )}
        </div>
      </Link>
      {wishlistButton && (
        <div className="absolute top-2.5 right-2.5 z-10">
          {wishlistButton}
        </div>
      )}

      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Link href={`/retreats/${retreat.retreat_id}`} className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
              {retreat.name}
            </h3>
          </Link>
          {retreat.average_rating != null && (
            <div className="flex items-center gap-1 shrink-0">
              <RatingStars rating={retreat.average_rating} />
              <span className="text-xs text-muted-foreground">{retreat.average_rating.toFixed(1)}</span>
            </div>
          )}
          {categoryName && (
            <Badge variant="secondary" className="text-xs px-2.5 py-0.5 shrink-0">
              {categoryName}
            </Badge>
          )}
        </div>

        {retreat.address && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{retreat.address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
