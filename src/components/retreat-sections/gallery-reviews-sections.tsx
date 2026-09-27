import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, MessageSquare } from "lucide-react";
import { RetreatGallery } from "@/components/retreats/retreat-gallery";
import { ReviewList } from "@/components/reviews/review-list";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";

interface GallerySectionProps {
  retreatId: number;
  galleryCategories: GalleryCategory[];
  initialGalleries: RetreatGalleryItem[];
}

export function GallerySection({
  retreatId,
  galleryCategories,
  initialGalleries,
}: GallerySectionProps) {
  return (
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
          initialGalleries={initialGalleries}
        />
      </Suspense>
    </section>
  );
}

export function ReviewsSection({ retreatId }: { retreatId: number }) {
  return (
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
  );
}
