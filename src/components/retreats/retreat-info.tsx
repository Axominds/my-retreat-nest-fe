import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Globe, Mail, Phone } from "lucide-react";

interface RetreatInfoProps {
  retreat: Retreat;
  categoryName?: string;
}

export function RetreatInfo({ retreat, categoryName }: RetreatInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{retreat.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {categoryName && <Badge>{categoryName}</Badge>}
          {retreat.address && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {retreat.address}
            </span>
          )}
        </div>
      </div>

      {(retreat.budget_min != null || retreat.budget_max != null) && (
        <div className="text-lg font-semibold">
          {retreat.budget_min != null && retreat.budget_max != null
            ? `$${retreat.budget_min} - $${retreat.budget_max}`
            : retreat.budget_min != null
              ? `From $${retreat.budget_min}`
              : `Up to $${retreat.budget_max}`}
        </div>
      )}

      {retreat.description && (
        <div>
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-muted-foreground whitespace-pre-line">
            {retreat.description}
          </p>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        {retreat.email && (
          <p className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${retreat.email}`} className="hover:underline">
              {retreat.email}
            </a>
          </p>
        )}
        {retreat.phone && (
          <p className="text-sm flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {retreat.phone}
          </p>
        )}
      </div>
    </div>
  );
}
