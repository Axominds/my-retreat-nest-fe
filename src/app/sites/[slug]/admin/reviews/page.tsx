"use client";

import { ReviewList } from "@/components/reviews/review-list";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";

export default function TenantAdminReviewsPage() {
  const { retreatId, retreatName } = useTenantAdmin();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">
          What guests say about {retreatName}. Reviews are written by guests
          and can&apos;t be edited here.
        </p>
      </div>
      <ReviewList retreatId={retreatId} canCreate={false} />
    </div>
  );
}
