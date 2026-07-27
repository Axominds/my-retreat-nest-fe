import { notFound } from "next/navigation";
import Link from "next/link";
import { getRetreat, getGalleries } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { API_BASE_URL } from "@/lib/constants";
import { getGalleryCategories } from "@/lib/api/gallery-categories";
import { RetreatGallery } from "@/components/retreats/retreat-gallery";
import { ReviewList } from "@/components/reviews/review-list";
import { WishlistFloatingButton } from "@/components/wishlist/wishlist-floating-button";
import { RetreatDetailWishlistButton } from "@/components/wishlist/retreat-detail-wishlist-button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RetreatMapWrapper } from "@/components/ui/retreat-map-wrapper";
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
  ExternalLink,
  ArrowLeft,
  ChevronRight,
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
  let categoryList;
  let galleryCategories;
  let galleries;

  try {
    [retreat, categoryList, galleryCategories, galleries] = await Promise.all([
      getRetreat(retreatId, { is_published: true }),
      getCategories({ page_size: 100 }),
      getGalleryCategories(retreatId),
      getGalleries(retreatId),
    ]);
  } catch {
    notFound();
  }

  const categories = categoryList.items;
  const categoryName = categories.find(
    (c) => c.category_id === retreat.category_id
  )?.name;
  const price = formatBudget(retreat.budget_min, retreat.budget_max);
  const heroImage = retreat.banner_image
    ? `${API_BASE_URL}${retreat.banner_image}`
    : HERO_IMAGES[retreatId % HERO_IMAGES.length];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative overflow-hidden h-[45vh] md:h-[55vh]">
        <img
          src={heroImage}
          alt={retreat.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <Link
            href="/retreats"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/25 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retreats
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
              <Link href="/retreats" className="hover:text-white/80 transition-colors">
                Retreats
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-white/80 truncate">{retreat.name}</span>
            </div>
            {categoryName && (
              <Badge className="bg-white/15 text-white border-0 mb-3 text-xs backdrop-blur-sm">
                {categoryName}
              </Badge>
            )}
            <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
              {retreat.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {retreat.address && (
                <p className="text-white/70 flex items-center gap-1.5 text-sm md:text-base">
                  <MapPin className="h-4 w-4" />
                  {retreat.address}
                </p>
              )}
              {retreat.average_rating != null && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">
                    {retreat.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
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

      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights / Amenities */}
            {(retreat.breakfast_included != null ||
              retreat.free_cancellation != null ||
              retreat.payment_type) && (
              <section className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">Highlights</h2>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {retreat.breakfast_included && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border bg-primary/5 text-primary text-sm font-medium">
                      <Coffee className="h-4 w-4" />
                      Breakfast included
                    </div>
                  )}
                  {retreat.free_cancellation && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 text-sm font-medium">
                      <Ban className="h-4 w-4" />
                      Free cancellation
                    </div>
                  )}
                  {retreat.payment_type && (
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 text-sm font-medium">
                      <CreditCard className="h-4 w-4" />
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
              <section className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold">
                    About this retreat
                  </h2>
                </div>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {retreat.description}
                </div>
              </section>
            )}

            {/* Gallery */}
            <section className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold">Gallery</h2>
              </div>
              <Suspense
                fallback={
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {/* Reviews */}
            <section className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-base font-semibold">Reviews</h2>
              </div>
              <Suspense
                fallback={<Skeleton className="h-40 w-full rounded-xl" />}
              >
                <ReviewList retreatId={retreatId} />
              </Suspense>
            </section>
          </div>

          {/* Sidebar */}
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
                    href={`mailto:${retreat.email ?? ""}`}
                    className="flex items-center justify-center gap-2 h-12 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    Book Now
                  </a>

                  <RetreatDetailWishlistButton retreatId={retreatId} />

                  <Separator />

                  {retreat.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="mt-1.5 text-muted-foreground">
                        {retreat.address}
                      </span>
                    </div>
                  )}

                  <RetreatMapWrapper
                    latitude={retreat.latitude}
                    longitude={retreat.longitude}
                    address={retreat.address}
                  />

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${retreat.latitude},${retreat.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Get Directions
                  </a>

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
        </div>
      </div>

      <WishlistFloatingButton retreatId={retreatId} />
    </div>
  );
}
