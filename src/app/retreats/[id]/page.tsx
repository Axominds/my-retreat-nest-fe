import { notFound } from "next/navigation";
import { getRetreat } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { RetreatInfo } from "@/components/retreats/retreat-info";
import { RetreatGallery } from "@/components/retreats/retreat-gallery";
import { ReviewList } from "@/components/reviews/review-list";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface RetreatDetailPageProps {
  params: Promise<{ id: string }>;
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

  try {
    [retreat, categories] = await Promise.all([
      getRetreat(retreatId),
      getCategories(),
    ]);
  } catch {
    notFound();
  }

  const categoryMap = new Map(categories.map((c) => [c.category_id, c.name]));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <RetreatInfo
        retreat={retreat}
        categoryName={categoryMap.get(retreat.category_id)}
      />

      <Separator />

      <section>
        <h2 className="text-xl font-semibold mb-4">Gallery</h2>
        <Suspense fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        }>
          <RetreatGallery retreatId={retreatId} />
        </Suspense>
      </section>

      <Separator />

      <section>
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
          <ReviewList retreatId={retreatId} />
        </Suspense>
      </section>
    </div>
  );
}
