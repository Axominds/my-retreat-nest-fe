"use client";

import { GalleryManager } from "@/components/admin/gallery-manager";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";

export default function TenantAdminGalleryPage() {
  const { retreatId, retreatName } = useTenantAdmin();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Gallery</h1>
        <p className="text-sm text-muted-foreground">
          Photos of {retreatName}, organized by category.
        </p>
      </div>
      <GalleryManager retreatId={retreatId} />
    </div>
  );
}
