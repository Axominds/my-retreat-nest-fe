"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import { ExternalLink } from "lucide-react";

export default function TenantAdminGalleryPage() {
  const { retreatId, retreatName, slug } = useTenantAdmin();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold md:text-3xl">Gallery</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Photos of {retreatName}, organised by category. Visitors can browse
            each category on your site.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          render={<Link href={`/sites/${slug}`} target="_blank" />}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Preview site
        </Button>
      </div>
      <GalleryManager retreatId={retreatId} />
    </div>
  );
}
