"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  Check,
  Clock,
  Expand,
  Maximize2,
  MessageSquare,
  Moon,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Retreat } from "@/types/retreat";
import type { RetreatPackage, RoomType } from "@/types/retreat-offerings";
import { formatPrice, splitList } from "@/types/retreat-offerings";
import { roomTypeImageUrl } from "@/lib/api/retreat-offerings";
import { whatsappLink } from "@/components/tenant-site/tenant-helpers";

interface StaySectionProps {
  retreat: Retreat;
  /** Used as a fallback photo for rooms with no photo of their own. */
  galleryImages: string[];
  roomTypes: RoomType[];
  packages: RetreatPackage[];
}

/**
 * Single-photo fullscreen viewer for a room card image. Mirrors the
 * PhotoLightbox overlay (z-80, Esc/backdrop close, scroll lock) but stays
 * local to Stay.tsx since room photos are plain URL strings, not gallery items.
 */
function RoomImageViewer({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-[80] flex flex-col bg-black/95"
      onClick={onClose}
    >
      <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-4 md:px-6">
        <span className="truncate text-sm font-medium text-white/80">{alt}</span>
        <button
          type="button"
          aria-label="Close photo viewer"
          onClick={onClose}
          className="shrink-0 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <figure
        className="relative min-h-0 flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full px-4 object-contain pb-6 md:px-10"
        />
      </figure>
    </div>
  );
}

function RoomCard({
  room,
  image,
  retreatName,
}: {
  room: RoomType;
  image?: string;
  retreatName: string;
}) {
  const signature = room.is_featured;
  const amenities = splitList(room.amenities);
  const price = formatPrice(room.price_per_night);
  // Only render the metadata row when the manager actually filled something in.
  const hasMeta =
    room.size_sqm != null || room.max_guests != null || !!room.bed_configuration;
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-[var(--ts-radius)] border ts-hairline ${
        signature ? "bg-[#2f4a3c] text-[#f5f1e6]" : "bg-[#fffdf8]"
      }`}
    >
      {image ? (
        <>
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            aria-label={`View photo of ${room.name}`}
            aria-haspopup="dialog"
            className="group/image relative block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
          >
            <img
              src={image}
              alt={room.name}
              loading="lazy"
              className="h-44 w-full object-cover transition-transform duration-500 group-hover/image:scale-[1.03]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-black/0 transition-colors group-hover/image:bg-black/15"
            />
            <span
              aria-hidden="true"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity group-hover/image:opacity-100 group-focus-visible:opacity-100"
            >
              <Expand className="h-4 w-4" />
            </span>
          </button>
          {viewerOpen && (
            <RoomImageViewer
              src={image}
              alt={room.name}
              onClose={() => setViewerOpen(false)}
            />
          )}
        </>
      ) : (
        <div
          aria-hidden="true"
          className={`h-44 w-full ${signature ? "bg-[#233829]" : "bg-[#e7e0d2]"}`}
        />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h4
            className={`ts-display text-xl font-medium ${signature ? "text-[#f5f1e6]" : ""}`}
          >
            {room.name}
          </h4>
          {signature && (
            <span className="ts-overline inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f5f1e6]/15 px-2.5 py-1 text-[#f5f1e6]">
              <Sparkles className="h-3 w-3" />
              Signature
            </span>
          )}
        </div>

        {room.description && (
          <p
            className={`mt-1.5 text-sm ${
              signature ? "text-[#f5f1e6]/75" : "text-[#78716c]"
            }`}
          >
            {room.description}
          </p>
        )}

        {hasMeta && (
          <dl
            className={`mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs ${
              signature ? "text-[#f5f1e6]/70" : "text-[#78716c]"
            }`}
          >
            {room.size_sqm != null && (
              <div className="inline-flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5" />
                {room.size_sqm} m&sup2;
              </div>
            )}
            {room.max_guests != null && (
              <div className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Up to {room.max_guests}
              </div>
            )}
            {room.bed_configuration && (
              <div className="inline-flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5" />
                {room.bed_configuration}
              </div>
            )}
          </dl>
        )}

        {amenities.length > 0 && (
          <ul
            className={`mt-5 space-y-1.5 text-sm ${
              signature ? "text-[#f5f1e6]/80" : "text-[#44403c]"
            }`}
          >
            {amenities.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <Check
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    signature ? "text-[#f5f1e6]/60" : "text-[#2f4a3c]"
                  }`}
                />
                {a}
              </li>
            ))}
          </ul>
        )}

        <div
          className={`mt-6 flex items-end justify-between gap-3 border-t pt-5 ${
            signature ? "border-[#f5f1e6]/20" : "ts-hairline"
          }`}
        >
          <p>
            <span
              className={`ts-display block text-2xl font-medium ${
                signature ? "text-[#f5f1e6]" : ""
              }`}
            >
              {price ?? "On request"}
            </span>
            {price && (
              <span
                className={`text-xs ${
                  signature ? "text-[#f5f1e6]/60" : "text-[#78716c]"
                }`}
              >
                per night
              </span>
            )}
          </p>
          <a
            href={whatsappLink(retreatName, room.name)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-colors ${
              signature
                ? "bg-[#f5f1e6] text-[#1c1917] hover:bg-white"
                : "border border-[#2f4a3c]/30 text-[#2f4a3c] hover:bg-[#2f4a3c] hover:text-[#f5f1e6]"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Enquire
          </a>
        </div>
      </div>
    </li>
  );
}

function PackageRow({
  pkg,
  retreatName,
}: {
  pkg: RetreatPackage;
  retreatName: string;
}) {
  const includes = splitList(pkg.includes);
  const price = formatPrice(pkg.price);

  return (
    <li className="grid gap-6 py-8 lg:grid-cols-[1fr_auto] lg:gap-12">
      <div>
        {pkg.duration_nights != null && (
          <p className="ts-overline inline-flex items-center gap-1.5 text-[#b45309]">
            <Moon className="h-3 w-3" />
            {pkg.duration_nights} {pkg.duration_nights === 1 ? "night" : "nights"}
          </p>
        )}
        <h4 className="ts-display mt-2 text-2xl font-medium md:text-3xl">{pkg.name}</h4>
        {pkg.description && (
          <p className="mt-2 max-w-xl text-[#44403c] leading-relaxed">{pkg.description}</p>
        )}
        {pkg.room_type_name && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#78716c]">
            <BedDouble className="h-3.5 w-3.5" />
            In the {pkg.room_type_name}
          </p>
        )}
        {includes.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {includes.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 text-sm text-[#44403c]"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-[#2f4a3c]" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-start gap-6 lg:flex-col lg:items-end lg:gap-4">
        <p className="lg:text-right">
          <span className="ts-display block text-2xl font-medium">
            {price ?? "On request"}
          </span>
          {price && <span className="text-xs text-[#78716c]">per person</span>}
        </p>
        <a
          href={whatsappLink(retreatName, pkg.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#2f4a3c]/30 px-5 text-sm font-semibold text-[#2f4a3c] transition-colors hover:bg-[#2f4a3c] hover:text-[#f5f1e6]"
        >
          <MessageSquare className="h-4 w-4" />
          Enquire
        </a>
      </div>
    </li>
  );
}

export function Stay({ retreat, galleryImages, roomTypes, packages }: StaySectionProps) {
  // Nothing to show: don't render an empty section or leave a dead nav anchor.
  if (roomTypes.length === 0 && packages.length === 0) return null;

  const highlight = packages.find((p) => p.is_featured) ?? null;
  const rest = packages.filter((p) => p !== highlight);
  const highlightIncludes = highlight ? splitList(highlight.includes) : [];
  const highlightPrice = highlight ? formatPrice(highlight.price) : null;

  return (
    <section id="stay" className="scroll-mt-24 bg-[#f3ede1]">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="ts-overline text-[#b45309]">Stay</p>
        <h2 className="ts-display mt-3 max-w-xl text-3xl font-medium leading-tight md:text-5xl">
          Rooms and packages
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-[#44403c]">
          Choose a room for a simple few days, or take one of our curated stays
          that bundle meals, practice, and excursions.
        </p>

        {/* Room types */}
        {roomTypes.length > 0 && (
          <div className="mt-14">
            <h3 className="ts-overline text-[#a8a29e]">Room types</h3>
            <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roomTypes.map((room, i) => (
                <RoomCard
                  key={room.retreat_room_type_id}
                  room={room}
                  image={
                    roomTypeImageUrl(retreat.retreat_id, room) ??
                    (galleryImages.length > 0 ? galleryImages[i % galleryImages.length] : undefined)
                  }
                  retreatName={retreat.name}
                />
              ))}
            </ul>
          </div>
        )}

        {/* Highlighted package */}
        {highlight && (
          <div className="mt-20">
            <h3 className="ts-overline text-[#a8a29e]">Most chosen</h3>
            <div className="mt-6 rounded-[var(--ts-radius)] bg-[#2f4a3c] p-8 text-[#f5f1e6] md:p-10">
              {highlight.duration_nights != null && (
                <p className="ts-overline inline-flex items-center gap-1.5 text-[#f5f1e6]/60">
                  <Sparkles className="h-3 w-3" />
                  {highlight.duration_nights}{" "}
                  {highlight.duration_nights === 1 ? "night" : "nights"}
                </p>
              )}
              <h3 className="ts-display mt-3 text-3xl font-medium md:text-4xl">
                {highlight.name}
              </h3>
              {highlight.description && (
                <p className="mt-3 max-w-2xl leading-relaxed text-[#f5f1e6]/85">
                  {highlight.description}
                </p>
              )}
              {highlight.room_type_name && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#f5f1e6]/60">
                  <BedDouble className="h-3.5 w-3.5" />
                  In the {highlight.room_type_name}
                </p>
              )}
              {highlightIncludes.length > 0 && (
                <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {highlightIncludes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-[#f5f1e6]/85"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#f5f1e6]/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-[#f5f1e6]/20 pt-7">
                <p>
                  <span className="ts-display block text-3xl font-medium">
                    {highlightPrice ?? "On request"}
                  </span>
                  {highlightPrice && (
                    <span className="text-xs text-[#f5f1e6]/60">per person</span>
                  )}
                </p>
                <a
                  href={whatsappLink(retreat.name, highlight.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#f5f1e6] px-6 text-sm font-semibold text-[#1c1917] transition-colors hover:bg-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  Book {highlight.name}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Remaining packages */}
        {rest.length > 0 && (
          <div className="mt-20">
            <h3 className="ts-overline text-[#a8a29e]">More packages</h3>
            <ul className="mt-6 border-t ts-hairline divide-y ts-hairline">
              {rest.map((pkg) => (
                <PackageRow
                  key={pkg.retreat_package_id}
                  pkg={pkg}
                  retreatName={retreat.name}
                />
              ))}
            </ul>
          </div>
        )}

        <p className="mt-12 flex items-center gap-2 text-xs text-[#a8a29e]">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Prices are indicative and exclude travel. Message us for exact
          availability and dates.
        </p>
      </div>
    </section>
  );
}
