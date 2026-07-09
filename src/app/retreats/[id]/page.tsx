import { notFound } from "next/navigation";
import { getRetreat, getGalleries } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { getGalleryCategories } from "@/lib/api/gallery-categories";
import { RetreatInfo } from "@/components/retreats/retreat-info";
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
      getRetreat(retreatId),
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
            {retreat.rating != null && (
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-white font-semibold">{retreat.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-10">
            <RetreatInfo retreat={retreat} categoryName={categoryName} />

            <Separator />

            <section>
              <h2 className="text-lg font-semibold mb-4">Gallery</h2>
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

            <section>
              <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
                <ReviewList retreatId={retreatId} />
              </Suspense>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card className="p-6 space-y-5 border shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Price
                  </p>
                  {price ? (
                    <p className="text-2xl font-bold text-primary">{price}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Contact for pricing</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {retreat.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{retreat.address}</span>
                    </div>
                  )}
                  {retreat.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${retreat.email}`}
                        className="hover:underline text-primary"
                      >
                        {retreat.email}
                      </a>
                    </div>
                  )}
                  {retreat.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{retreat.phone}</span>
                    </div>
                  )}

                  {retreat.social_links &&
                    Object.entries(retreat.social_links)
                      .filter(
                        ([, v]) => typeof v === "string" && v.length > 0
                      )
                      .map(([key, url]) => (
                        <div
                          key={key}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Share2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a
                            href={String(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-primary capitalize"
                          >
                            {key}
                          </a>
                        </div>
                      ))}
                </div>

                <Separator />

                <a
                  href={`mailto:${retreat.email ?? ""}`}
                  className="inline-flex items-center justify-center gap-2 h-10 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium transition-all shadow-sm"
                >
                  <CalendarCheck className="h-4 w-4" />
                  Book Now
                </a>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      <WishlistFloatingButton retreatId={retreatId} />
    </div>
  );
}
