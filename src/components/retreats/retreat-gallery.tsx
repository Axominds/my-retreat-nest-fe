"use client";

import { useState, useEffect, useCallback } from "react";
import { getGalleries } from "@/lib/api/retreats";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface RetreatGalleryProps {
  retreatId: number;
  galleryCategories: GalleryCategory[];
  initialGalleries?: RetreatGalleryItem[];
}

export function RetreatGallery({
  retreatId,
  galleryCategories,
  initialGalleries,
}: RetreatGalleryProps) {
  const [galleries, setGalleries] = useState<RetreatGalleryItem[]>(
    initialGalleries ?? []
  );
  const [isLoading, setIsLoading] = useState(!initialGalleries);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialGalleries) return;

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

    return () => {
      cancelled = true;
    };
  }, [retreatId, initialGalleries]);

  const filteredGalleries = selectedCategoryId
    ? galleries.filter(
        (item) => item.gallery_category_id === selectedCategoryId
      )
    : galleries;

  const showTabs = galleryCategories.length > 0;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex != null) {
      setLightboxIndex((lightboxIndex + 1) % filteredGalleries.length);
    }
  }, [lightboxIndex, filteredGalleries.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex != null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filteredGalleries.length) %
          filteredGalleries.length
      );
    }
  }, [lightboxIndex, filteredGalleries.length]);

  useEffect(() => {
    if (lightboxIndex == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground">{error}</p>;
  }

  if (galleries.length === 0) {
    return <p className="text-sm text-muted-foreground">No images yet.</p>;
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredGalleries.map((item, index) => (
            <button
              key={item.gallery_id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={getImageUrl(retreatId, item.gallery_id)}
                alt={item.caption ?? "Gallery image"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">
                    {item.caption}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {lightboxIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {filteredGalleries.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(
                retreatId,
                filteredGalleries[lightboxIndex].gallery_id
              )}
              alt={
                filteredGalleries[lightboxIndex].caption ?? "Gallery image"
              }
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
            {filteredGalleries[lightboxIndex].caption && (
              <p className="text-center text-white/80 text-sm mt-3">
                {filteredGalleries[lightboxIndex].caption}
              </p>
            )}
            <p className="text-center text-white/50 text-xs mt-1">
              {lightboxIndex + 1} / {filteredGalleries.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
