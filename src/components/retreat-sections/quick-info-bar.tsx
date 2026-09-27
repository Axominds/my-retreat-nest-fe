import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Retreat } from "@/types/retreat";

interface QuickInfoBarProps {
  retreat: Retreat;
  price: string;
  categoryName?: string;
}

export function QuickInfoBar({ retreat, price, categoryName }: QuickInfoBarProps) {
  return (
    <section className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 gap-4 overflow-x-auto">
          {price ? (
            <div className="text-center min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Price
              </p>
              <p className="text-lg font-bold text-primary mt-0.5 whitespace-nowrap">
                {price}
              </p>
            </div>
          ) : (
            <div className="text-center min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Price
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Contact for pricing
              </p>
            </div>
          )}
          <div className="h-10 w-px bg-border shrink-0" />
          {retreat.average_rating != null && (
            <div className="text-center min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Rating
              </p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold">
                  {retreat.average_rating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          {retreat.average_rating != null && (
            <div className="h-10 w-px bg-border shrink-0" />
          )}
          {categoryName && (
            <div className="text-center min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Category
              </p>
              <Badge
                variant="secondary"
                className="text-sm mt-0.5"
              >
                {categoryName}
              </Badge>
            </div>
          )}
          <div className="h-10 w-px bg-border shrink-0" />
          {retreat.phone && (
            <div className="text-center min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Contact
              </p>
              <p className="text-sm font-medium mt-0.5 truncate">
                {retreat.phone}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
