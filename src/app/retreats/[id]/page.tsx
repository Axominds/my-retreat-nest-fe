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
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Mail,
  Phone,
  CalendarCheck,
  Share2,
} from "lucide-react";

interface RetreatDetailPageProps {
  params: Promise<{ id: string }>;
}

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

  return (
    <div className="min-h-screen">
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
              <Card className="p-6 space-y-5">
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
                  className="inline-flex items-center justify-center gap-2 h-9 w-full rounded-lg border border-transparent bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium whitespace-nowrap transition-all px-2.5"
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
