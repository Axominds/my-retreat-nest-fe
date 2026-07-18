import { notFound } from "next/navigation";
import { getRetreat, getGalleries } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { getGalleryCategories } from "@/lib/api/gallery-categories";
import { RetreatGallery } from "@/components/retreats/retreat-gallery";
import { ReviewList } from "@/components/reviews/review-list";
import { WishlistFloatingButton } from "@/components/wishlist/wishlist-floating-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Mail,
  Phone,
  CalendarCheck,
  Share2,
  Star,
  Coffee,
  Ban,
  CreditCard,
  ImageIcon,
  MessageSquare,
  Info,
} from "lucide-react";

interface RetreatDetailPageProps {
  params: Promise<{ id: string }>;
}

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
];

function formatBudget(min: number | null, max: number | null): string {
  if (min != null && max != null)
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return "";
}

export default async function RetreatDetailPage({
  params,
}: RetreatDetailPageProps) {
  const { id } = await params;
  const retreatId = Number(id);

  if (isNaN(retreatId)) {
    notFound();
  }

  let retreat;
  let categories;
  let galleryCategories;
  let galleries;

  try {
    [retreat, categories, galleryCategories, galleries] = await Promise.all([
      getRetreat(retreatId, { is_published: true }),
      getCategories(),
      getGalleryCategories(retreatId),
      getGalleries(retreatId),
    ]);
  } catch {
    notFound();
  }

  const categoryName = categories.find(
    (c) => c.category_id === retreat.category_id
  )?.name;
  const price = formatBudget(retreat.budget_min, retreat.budget_max);
  const heroImage = HERO_IMAGES[retreatId % HERO_IMAGES.length];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden h-[40vh] md:h-[50vh]">
        <img
          src={heroImage}
          alt={retreat.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            {categoryName && (
              <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">
                {categoryName}
              </Badge>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              {retreat.name}
            </h1>
            {retreat.address && (
              <p className="text-white/70 mt-2 flex items-center gap-1.5 text-sm md:text-base">
                <MapPin className="h-4 w-4" />
                {retreat.address}
              </p>
            )}
            {retreat.average_rating != null && (
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold">{retreat.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-10">

            {/* Highlights / Amenities */}
            {(retreat.breakfast_included != null || retreat.free_cancellation != null || retreat.payment_type) && (
              <section>
                <div className="flex flex-wrap gap-2.5">
                  {retreat.breakfast_included && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border bg-primary/5 text-primary text-xs font-medium">
                      <Coffee className="h-3.5 w-3.5" />
                      Breakfast included
                    </div>
                  )}
                  {retreat.free_cancellation && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium">
                      <Ban className="h-3.5 w-3.5" />
                      Free cancellation
                    </div>
                  )}
                  {retreat.payment_type && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
                      <CreditCard className="h-3.5 w-3.5" />
                      {retreat.payment_type === "full"
                        ? "Pay in full"
                        : retreat.payment_type === "partial"
                        ? "Partial payment"
                        : retreat.payment_type}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Description */}
            {retreat.description && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Info className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">About this retreat</h2>
                </div>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line pl-9">
                  {retreat.description}
                </div>
              </section>
            )}

            <Separator />

            {/* Gallery */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Gallery</h2>
              </div>
              <Suspense
                fallback={
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                }
              >
                <RetreatGallery
                  retreatId={retreatId}
                  galleryCategories={galleryCategories}
                  initialGalleries={galleries.items}
                />
              </Suspense>
            </section>

            <Separator />

            {/* Reviews */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Reviews</h2>
              </div>
              <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
                <ReviewList retreatId={retreatId} />
              </Suspense>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card className="overflow-hidden border shadow-sm">
                <div className="bg-primary/5 px-6 py-4 border-b">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                    Pricing
                  </p>
                  {price ? (
                    <p className="text-2xl font-bold text-primary">{price}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Contact for pricing</p>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {retreat.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="mt-1">{retreat.address}</span>
                    </div>
                  )}
                  {retreat.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <a
                        href={`mailto:${retreat.email}`}
                        className="hover:underline text-primary truncate"
                      >
                        {retreat.email}
                      </a>
                    </div>
                  )}
                  {retreat.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span>{retreat.phone}</span>
                    </div>
                  )}

                  {retreat.social_links &&
                    Object.entries(retreat.social_links)
                      .filter(([, v]) => typeof v === "string" && v.length > 0)
                      .map(([key, url]) => (
                        <div key={key} className="flex items-center gap-3 text-sm">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <a
                            href={String(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary capitalize truncate"
                          >
                            {key}
                          </a>
                        </div>
                      ))}
                </div>

                <div className="px-6 pb-6">
                  <a
                    href={`mailto:${retreat.email ?? ""}`}
                    className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-all shadow-sm"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Book Now
                  </a>
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <WishlistFloatingButton retreatId={retreatId} />
    </div>
  );
}
