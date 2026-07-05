import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TreePine } from "lucide-react";
import type { Retreat } from "@/types/retreat";

interface RetreatCardProps {
  retreat: Retreat;
  categoryName?: string;
  wishlistButton?: React.ReactNode;
  index?: number;
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

export function RetreatCard({ retreat, categoryName, wishlistButton, index = 0 }: RetreatCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const price = formatBudget(retreat.budget_min, retreat.budget_max);

  return (
    <Card
      className="group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/retreats/${retreat.retreat_id}`}>
        <div
          className={`aspect-video bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <TreePine className="h-12 w-12 text-foreground/20 group-hover:scale-110 group-hover:text-foreground/30 transition-all duration-500" />
        </div>
      </Link>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <Link href={`/retreats/${retreat.retreat_id}`}>
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {retreat.name}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-1.5">
              {categoryName && (
                <Badge variant="secondary" className="text-[11px] px-2 py-0">
                  {categoryName}
                </Badge>
              )}
            </div>
          </div>
          {wishlistButton && <div className="shrink-0">{wishlistButton}</div>}
        </div>

        {retreat.address && (
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{retreat.address}</span>
          </div>
        )}

        {retreat.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {retreat.description}
          </p>
        )}
      </CardContent>

      {price && (
        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-primary">{price}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
