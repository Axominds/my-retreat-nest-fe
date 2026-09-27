import { Separator } from "@/components/ui/separator";
import { RetreatDetailWishlistButton } from "@/components/wishlist/retreat-detail-wishlist-button";
import { RetreatMapWrapper } from "@/components/ui/retreat-map-wrapper";
import { Mail, Phone, Share2, MessageSquare, ExternalLink } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import { whatsappLink } from "./retreat-helpers";

interface BookingSidebarProps {
  retreat: Retreat;
  price: string;
}

export function BookingSidebar({ retreat, price }: BookingSidebarProps) {
  return (
    <aside className="lg:col-span-1">
      <div className="lg:sticky lg:top-6 space-y-4">
        {/* Booking Card */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
              Starting from
            </p>
            {price ? (
              <p className="text-3xl font-bold text-primary">
                {price}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Contact for pricing
              </p>
            )}
          </div>

          <div className="p-5 space-y-4">
            <a
              href={whatsappLink(retreat.phone, retreat.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              <MessageSquare className="h-4 w-4" />
              Book Now
            </a>

            <RetreatDetailWishlistButton retreatId={retreat.retreat_id} />

            <Separator />

            <RetreatMapWrapper
              latitude={retreat.latitude}
              longitude={retreat.longitude}
              address={retreat.address}
            />

            <Separator />

            {retreat.email && (
              <a
                href={`mailto:${retreat.email}`}
                className="flex items-center gap-3 text-sm hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-primary truncate">
                  {retreat.email}
                </span>
              </a>
            )}

            {retreat.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">
                  {retreat.phone}
                </span>
              </div>
            )}

            {retreat.social_links &&
              Object.entries(retreat.social_links)
                .filter(([, v]) => typeof v === "string" && v.length > 0)
                .map(([key, url]) => (
                  <a
                    key={key}
                    href={String(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="text-primary capitalize truncate">
                      {key}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                  </a>
                ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
