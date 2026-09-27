import { notFound } from "next/navigation";
import { getRetreat, getGalleries } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { API_BASE_URL } from "@/lib/constants";
import { getGalleryCategories } from "@/lib/api/gallery-categories";
import { HeroSection } from "@/components/retreat-sections/hero-section";
import { QuickInfoBar } from "@/components/retreat-sections/quick-info-bar";
import { AmenitiesSection, AboutSection } from "@/components/retreat-sections/content-sections";
import { GallerySection, ReviewsSection } from "@/components/retreat-sections/gallery-reviews-sections";
import { BookingSidebar } from "@/components/retreat-sections/booking-sidebar";
import { formatBudget } from "@/components/retreat-sections/retreat-helpers";

interface RetreatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RetreatDetailPage({
  params,
}: RetreatDetailPageProps) {
  const { id } = await params;
  const retreatId = Number(id);

  if (isNaN(retreatId)) {
    notFound();
  }

  let retreat;
  let categoryList;
  let galleryCategories;
  let galleries;

  try {
    [retreat, categoryList, galleryCategories, galleries] = await Promise.all([
      getRetreat(retreatId, { is_published: true }),
      getCategories({ page_size: 100 }),
      getGalleryCategories(retreatId),
      getGalleries(retreatId),
    ]);
  } catch {
    notFound();
  }

  const categories = categoryList.items;
  const categoryName = categories.find(
    (c) => c.category_id === retreat.category_id
  )?.name;
  const price = formatBudget(retreat.budget_min, retreat.budget_max);
  const hasBanner = Boolean(retreat.banner_image);
  const heroImage = hasBanner ? `${API_BASE_URL}${retreat.banner_image}` : null;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        retreat={retreat}
        heroImage={heroImage}
        backHref="/retreats"
        backLabel="Retreats"
        breadcrumbRootHref="/retreats"
        breadcrumbRootLabel="Retreats"
      />

      <QuickInfoBar retreat={retreat} price={price} categoryName={categoryName} />

      <div className="container mx-auto px-4 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            <AmenitiesSection amenities={retreat.amenities ?? []} />

            <AboutSection description={retreat.description} />

            <GallerySection
              retreatId={retreatId}
              galleryCategories={galleryCategories}
              initialGalleries={galleries.items}
            />

            <ReviewsSection retreatId={retreatId} />
          </div>

          <BookingSidebar retreat={retreat} price={price} />
        </div>
      </div>
    </div>
  );
}
