"use client";

import { useCallback, useMemo, useState } from "react";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import { PhotoLightbox } from "@/components/tenant-site/PhotoLightbox";
import { Camera } from "lucide-react";

interface GalleryProps {
  retreatId: number;
  galleryCategories: GalleryCategory[];
  initialGalleries: RetreatGalleryItem[];
  /** Photos on the server, which can exceed the page we were handed. */
  totalCount?: number;
}

/** One hero tile plus four supporting tiles, as on Booking.com. */
const MOSAIC_SIZE = 5;

export function Gallery({
  retreatId,
  galleryCategories,
  initialGalleries,
  totalCount,
}: GalleryProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [lightboxId, setLightboxId] = useState<number | null>(null);

  const items = useMemo(
    () =>
      activeCategory == null
        ? initialGalleries
        : initialGalleries.filter(
            (g) => g.gallery_category_id === activeCategory
          ),
    [activeCategory, initialGalleries]
  );

  const close = useCallback(() => setLightboxId(null), []);
  const navigate = useCallback((galleryId: number) => setLightboxId(galleryId), []);

  if (initialGalleries.length === 0) return null;

  const isFiltered = activeCategory != null;
  const photoCount = isFiltered ? items.length : (totalCount ?? items.length);
  const mosaic = items.slice(0, MOSAIC_SIZE);
  const supporting = mosaic.slice(1);
  // A 2x2 block cannot hold three tiles without a hole, so odd leftovers
  // stack as a single column instead.
  const supportingCols = supporting.length === 1 || supporting.length === 3 ? 1 : 2;

  return (
    <section id="gallery" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="md:max-w-xl">
            <p className="ts-overline text-[#b45309]">Gallery</p>
            <h2 className="ts-display mt-3 text-3xl font-medium leading-tight md:text-5xl">
              Moments from the retreat
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#78716c]">
              {photoCount} {photoCount === 1 ? "photo" : "photos"}
              {isFiltered ? " in this collection" : ""} — select any to view it
              full screen.
            </p>
          </div>

          {galleryCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[11px] uppercase tracking-[0.18em] text-[#a8a29e]">
                Filter
              </span>
              <FilterChip
                active={!isFiltered}
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

        {mosaic.length === 0 ? (
          <p className="mt-10 text-[#78716c]">No photos in this collection yet.</p>
        ) : (
          <div className="relative mt-10">
            {mosaic.length === 1 ? (
              <MosaicTile
                retreatId={retreatId}
                item={mosaic[0]}
                onOpen={() => setLightboxId(mosaic[0].gallery_id)}
                className="relative h-[280px] w-full md:h-[420px]"
              />
            ) : (
              <div className="grid gap-2 md:h-[460px] md:grid-cols-[2fr_1fr]">
                <MosaicTile
                  retreatId={retreatId}
                  item={mosaic[0]}
                  onOpen={() => setLightboxId(mosaic[0].gallery_id)}
                  className="relative aspect-[16/10] md:aspect-auto"
                />
                <div
                  className={`grid grid-cols-2 gap-2 md:gap-2 ${
                    supportingCols === 1 ? "md:grid-cols-1" : "md:grid-cols-2"
                  }`}
                >
                  {supporting.map((item, i) => (
                    <MosaicTile
                      key={item.gallery_id}
                      retreatId={retreatId}
                      item={item}
                      onOpen={() => setLightboxId(item.gallery_id)}
                      // An odd trailing tile would leave half a row empty on
                      // mobile, so let it span the full width there.
                      className={`relative aspect-square md:aspect-auto ${
                        supporting.length % 2 === 1 && i === supporting.length - 1
                          ? "col-span-2 md:col-span-1"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => setLightboxId(mosaic[0].gallery_id)}
                className="group absolute bottom-4 right-4 z-10 inline-flex items-center gap-2.5 rounded-full bg-white/95 py-2 pl-2 pr-4 text-[13px] font-semibold text-[#1c1917] shadow-lg shadow-black/25 backdrop-blur transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#2f4a3c] text-[#f5f1e6]">
                  <Camera className="h-3.5 w-3.5" />
                </span>
                Show all {photoCount}
              </button>
            )}
          </div>
        )}
      </div>

      <PhotoLightbox
        retreatId={retreatId}
        items={items}
        activeId={lightboxId}
        onClose={close}
        onNavigate={navigate}
      />
    </section>
  );
}

function MosaicTile({
  retreatId,
  item,
  onOpen,
  className = "",
}: {
  retreatId: number;
  item: RetreatGalleryItem;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={item.caption ? `View photo: ${item.caption}` : "View photo"}
      className={`group overflow-hidden rounded-[var(--ts-radius)] bg-[#e7e0d2] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f4a3c] focus-visible:ring-offset-2 ${className}`}
    >
      <img
        src={getImageUrl(retreatId, item.gallery_id)}
        alt={item.caption ?? "Retreat photo"}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10"
      />
      {item.caption && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-12 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          {item.caption}
        </span>
      )}
    </button>
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
