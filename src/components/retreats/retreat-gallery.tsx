"use client";

import { useState, useEffect } from "react";
import { getGalleries } from "@/lib/api/retreats";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RetreatGalleryProps {
  retreatId: number;
  galleryCategories: GalleryCategory[];
}

export function RetreatGallery({ retreatId, galleryCategories }: RetreatGalleryProps) {
  const [galleries, setGalleries] = useState<RetreatGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getGalleries(retreatId)
      .then((result) => {
        if (!cancelled) {
          setGalleries(result.items);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load gallery");
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [retreatId]);

  const filteredGalleries = selectedCategoryId
    ? galleries.filter((item) => item.gallery_category_id === selectedCategoryId)
    : galleries;

  const showTabs = galleryCategories.length > 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error}</p>;
  }

  if (galleries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No images yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {showTabs && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-full border transition-colors",
              selectedCategoryId === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            )}
          >
            All
          </button>
          {galleryCategories.map((cat) => (
            <button
              key={cat.gallery_category_id}
              onClick={() => setSelectedCategoryId(cat.gallery_category_id)}
              className={cn(
                "px-4 py-1.5 text-sm rounded-full border transition-colors",
                selectedCategoryId === cat.gallery_category_id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filteredGalleries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No images in this category.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredGalleries.map((item) => (
            <a
              key={item.gallery_id}
              href={getImageUrl(retreatId, item.gallery_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={getImageUrl(retreatId, item.gallery_id)}
                alt={item.caption ?? "Gallery image"}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
