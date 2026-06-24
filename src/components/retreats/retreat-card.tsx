import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";

interface RetreatCardProps {
  retreat: Retreat;
  categoryName?: string;
  wishlistButton?: React.ReactNode;
}

export function RetreatCard({ retreat, categoryName, wishlistButton }: RetreatCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/retreats/${retreat.retreat_id}`}>
        <div className="aspect-video bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No image</span>
        </div>
      </Link>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/retreats/${retreat.retreat_id}`}>
            <h3 className="font-semibold text-lg leading-tight hover:underline">
              {retreat.name}
            </h3>
          </Link>
          {wishlistButton && <div className="shrink-0">{wishlistButton}</div>}
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        {categoryName && (
          <Badge variant="secondary">{categoryName}</Badge>
        )}
        {retreat.address && (
          <p className="text-sm text-muted-foreground">{retreat.address}</p>
        )}
        {retreat.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {retreat.description}
          </p>
        )}
      </CardContent>
      {(retreat.budget_min != null || retreat.budget_max != null) && (
        <CardFooter className="pt-0">
          <p className="text-sm font-medium">
            {retreat.budget_min != null && retreat.budget_max != null
              ? `$${retreat.budget_min} - $${retreat.budget_max}`
              : retreat.budget_min != null
                ? `From $${retreat.budget_min}`
                : `Up to $${retreat.budget_max}`}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
