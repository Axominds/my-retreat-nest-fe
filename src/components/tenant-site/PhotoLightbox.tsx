"use client";

import { useCallback, useEffect, useRef } from "react";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem } from "@/types/retreat";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoLightboxProps {
  retreatId: number;
  items: RetreatGalleryItem[];
  activeId: number | null;
  onClose: () => void;
  onNavigate: (galleryId: number) => void;
}

/**
 * Full-screen photo viewer shared by the gallery mosaic and the photos +
 * reviews section. Handles keyboard, swipe, scroll lock and neighbour
 * preloading; the caller owns which photo is active.
 */
export function PhotoLightbox({
  retreatId,
  items,
  activeId,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const touchStartX = useRef<number | null>(null);

  const activeIndex =
    activeId == null ? -1 : items.findIndex((g) => g.gallery_id === activeId);
  const active = activeIndex >= 0 ? items[activeIndex] : undefined;

  const goTo = useCallback(
    (index: number) => {
      const item = items[(index + items.length) % items.length];
      if (item) onNavigate(item.gallery_id);
    },
    [items, onNavigate]
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (activeIndex < 0 || items.length === 0) return;
      goTo(activeIndex + dir);
    },
    [activeIndex, goTo, items.length]
  );

  useEffect(() => {
    if (activeIndex < 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, onClose, step]);

  // Warm the neighbouring photos so stepping through feels instant.
  useEffect(() => {
    if (activeIndex < 0 || items.length < 2) return;
    for (const offset of [-1, 1]) {
      const neighbour =
        items[(activeIndex + offset + items.length) % items.length];
      if (neighbour) {
        const img = new Image();
        img.src = getImageUrl(retreatId, neighbour.gallery_id);
      }
    }
  }, [activeIndex, items, retreatId]);

  if (!active) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={active.caption ?? "Photo viewer"}
      className="fixed inset-0 z-[80] flex flex-col bg-black/95"
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        touchStartX.current = null;
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-4 md:px-6">
        <span className="text-sm font-medium text-white/80">
          {activeIndex + 1} / {items.length}
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 md:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 md:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <figure
          className="relative h-full w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={getImageUrl(retreatId, active.gallery_id)}
            alt={active.caption ?? "Retreat photo"}
            className="absolute inset-0 h-full w-full px-14 object-contain md:px-20"
          />
          {active.caption && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-center text-sm text-white/90">
              {active.caption}
            </figcaption>
          )}
        </figure>
      </div>

      {items.length > 1 && (
        <div
          className="shrink-0 overflow-x-auto px-4 py-4 md:px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            {items.map((item, i) => (
              <button
                key={item.gallery_id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={
                  item.caption
                    ? `Go to photo: ${item.caption}`
                    : `Go to photo ${i + 1}`
                }
                aria-current={i === activeIndex}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-md transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  i === activeIndex
                    ? "opacity-100 ring-2 ring-white"
                    : "opacity-45 hover:opacity-80"
                }`}
              >
                <img
                  src={getImageUrl(retreatId, item.gallery_id)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
