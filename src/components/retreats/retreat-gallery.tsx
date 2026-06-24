"use client";

import { useState, useEffect } from "react";
import { getGalleries } from "@/lib/api/retreats";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem } from "@/types/retreat";
import { Skeleton } from "@/components/ui/skeleton";

interface RetreatGalleryProps {
  retreatId: number;
}

export function RetreatGallery({ retreatId }: RetreatGalleryProps) {
  const [galleries, setGalleries] = useState<RetreatGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {galleries.map((item) => (
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
  );
}
