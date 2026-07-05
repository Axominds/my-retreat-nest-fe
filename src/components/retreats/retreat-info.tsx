import type { Retreat } from "@/types/retreat";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Mail, Phone, DollarSign } from "lucide-react";

interface RetreatInfoProps {
  retreat: Retreat;
  categoryName?: string;
}

function formatBudget(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return "";
}

function SocialLink({ url, label }: { url: string; label: string }) {
  const hostname = url.replace(/^https?:\/\//, "").split("/")[0];
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Globe className="h-3.5 w-3.5" />
      {hostname || label}
    </a>
  );
}

export function RetreatInfo({ retreat, categoryName }: RetreatInfoProps) {
  const price = formatBudget(retreat.budget_min, retreat.budget_max);
  const socialEntries = retreat.social_links
    ? Object.entries(retreat.social_links).filter(
        ([, v]) => typeof v === "string" && v.length > 0
      )
    : [];

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{retreat.name}</h1>
          {categoryName && (
            <Badge variant="secondary" className="text-sm">
              {categoryName}
            </Badge>
          )}
        </div>

        {retreat.address && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{retreat.address}</span>
          </div>
        )}

        {price && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-semibold text-primary">{price}</span>
          </div>
        )}
      </div>

      {retreat.description && (
        <section>
          <h2 className="text-lg font-semibold mb-3">About this retreat</h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {retreat.description}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {retreat.email && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <a
                href={`mailto:${retreat.email}`}
                className="hover:underline font-medium"
              >
                {retreat.email}
              </a>
            </div>
          </div>
        )}
        {retreat.phone && (
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <span className="font-medium">{retreat.phone}</span>
            </div>
          </div>
        )}
      </section>

      {socialEntries.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Links
          </h3>
          <div className="flex flex-wrap gap-3">
            {socialEntries.map(([key, url]) => (
              <SocialLink key={key} url={String(url)} label={key} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
