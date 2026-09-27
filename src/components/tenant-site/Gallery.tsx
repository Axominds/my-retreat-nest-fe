"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/constants";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryProps {
  retreatId: number;
  galleryCategories: GalleryCategory[];
  initialGalleries: RetreatGalleryItem[];
}

function imageUrl(retreatId: number, galleryId: number): string {
  return `${API_BASE_URL}/retreats/${retreatId}/galleries/${galleryId}/image/`;
}

export function Gallery({ retreatId, galleryCategories, initialGalleries }: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(
    () =>
      activeCategory == null
        ? initialGalleries
        : initialGalleries.filter((g) => g.gallery_category_id === activeCategory),
    [activeCategory, initialGalleries]
  );

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setLightbox((current) => {
        if (current == null || items.length === 0) return current;
        const idx = items.findIndex((g) => g.gallery_id === current);
        const next = (idx + dir + items.length) % items.length;
        return items[next].gallery_id;
      });
    },
    [items]
  );

  useEffect(() => {
    if (lightbox == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, step]);

  if (initialGalleries.length === 0) return null;

  const active = lightbox != null ? items.find((g) => g.gallery_id === lightbox) : undefined;

  return (
    <section id="gallery" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="ts-overline text-[#b45309]">Gallery</p>
            <h2 className="ts-display mt-3 text-3xl font-medium leading-tight md:text-5xl">
              Moments from the retreat
            </h2>
          </div>
          {galleryCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={activeCategory == null}
                label="All"
                onClick={() => setActiveCategory(null)}
              />
              {galleryCategories.map((c) => (
                <FilterChip
                  key={c.gallery_category_id}
                  active={activeCategory === c.gallery_category_id}
                  label={c.name}
                  onClick={() => setActiveCategory(c.gallery_category_id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {items.map((item, i) => (
            <button
              key={item.gallery_id}
              type="button"
              onClick={() => setLightbox(item.gallery_id)}
              className={`group relative overflow-hidden rounded-[var(--ts-radius)] bg-[#e7e0d2] text-left ${
                i === 0 ? "col-span-2 row-span-2 aspect-[16/10] md:aspect-auto md:min-h-[420px]" : "aspect-square"
              }`}
            >
              <img
                src={imageUrl(retreatId, item.gallery_id)}
                alt={item.caption ?? "Retreat photo"}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.caption}
                </span>
              )}
            </button>
          ))}
        </div>
        {items.length === 0 && (
          <p className="mt-8 text-[#78716c]">No photos in this collection yet.</p>
        )}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption ?? "Photo viewer"}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-3 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 md:left-8"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-3 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 md:right-8"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageUrl(retreatId, active.gallery_id)}
              alt={active.caption ?? "Retreat photo"}
              className="max-h-[80vh] w-auto rounded object-contain"
            />
            {active.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/80">
                {active.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-[#2f4a3c] bg-[#2f4a3c] text-[#f5f1e6]"
          : "ts-hairline bg-transparent text-[#44403c] hover:border-[#2f4a3c]"
      }`}
    >
      {label}
    </button>
  );
}
