import type { Retreat, RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import type { RetreatPackage, RoomType } from "@/types/retreat-offerings";
import { Hero } from "@/components/tenant-site/Hero";
import { QuickFacts } from "@/components/tenant-site/QuickFacts";
import { Story } from "@/components/tenant-site/Story";
import { Gallery } from "@/components/tenant-site/Gallery";
import { Amenities } from "@/components/tenant-site/Amenities";
import { Stay } from "@/components/tenant-site/Stay";
import { Testimonials } from "@/components/tenant-site/Testimonials";
import { Visit } from "@/components/tenant-site/Visit";
import { BookingBar } from "@/components/tenant-site/BookingBar";
import { getImageUrl } from "@/lib/constants";

export interface TenantHomepageProps {
  retreat: Retreat;
  categoryName?: string;
  galleryCategories: GalleryCategory[];
  galleries: RetreatGalleryItem[];
  galleryTotal?: number;
  roomTypes: RoomType[];
  packages: RetreatPackage[];
}

/**
 * Sole composition point for the tenant homepage. Reordering or adding
 * sections happens here only. Future per-retreat designs register
 * alongside this component (see getTenantHomepage).
 */
export function TenantHomepage({
  retreat,
  categoryName,
  galleryCategories,
  galleries,
  galleryTotal,
  roomTypes,
  packages,
}: TenantHomepageProps) {
  // Fallback imagery for rooms with no photo of their own.
  const galleryImages = galleries.map((g) =>
    getImageUrl(retreat.retreat_id, g.gallery_id)
  );

  return (
    <>
      <Hero retreat={retreat} categoryName={categoryName} />
      <QuickFacts retreat={retreat} categoryName={categoryName} />
      <Story
        name={retreat.name}
        story={retreat.story}
        description={retreat.description}
      />
      <Gallery
        retreatId={retreat.retreat_id}
        galleryCategories={galleryCategories}
        initialGalleries={galleries}
        totalCount={galleryTotal}
      />
      <Amenities amenities={retreat.amenities ?? []} />
      <Stay
        retreat={retreat}
        galleryImages={galleryImages}
        roomTypes={roomTypes}
        packages={packages}
      />
      <Testimonials retreatId={retreat.retreat_id} />
      <Visit retreat={retreat} />
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <BookingBar retreat={retreat} />
    </>
  );
}

export function getTenantHomepage(_themeName?: string | null) {
  // Only one design exists today; unknown names fall back to it.
  return TenantHomepage;
}
