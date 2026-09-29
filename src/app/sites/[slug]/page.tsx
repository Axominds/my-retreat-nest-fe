import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGalleries } from "@/lib/api/retreats";
import { getPackages, getRoomTypes } from "@/lib/api/retreat-offerings";
import { getCategories } from "@/lib/api/categories";
import { API_BASE_URL } from "@/lib/constants";
import { getGalleryCategories } from "@/lib/api/gallery-categories";
import { resolveTenantContext } from "@/lib/tenant";
import { stripHtml } from "@/lib/rich-text";
import { getTenantHomepage } from "@/components/tenant-site/TenantHomepage";
import { TenantChromeHeader, TenantChromeFooter } from "@/components/tenant-site/TenantChrome";

interface TenantHomePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TenantHomePageProps): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await resolveTenantContext(slug);
  if (!ctx) return {};
  const { retreat } = ctx;
  const ogImage = retreat.banner_image ? `${API_BASE_URL}${retreat.banner_image}` : undefined;
  // Story/descriptions may contain HTML — meta tags need plain text.
  const metaDescription =
    stripHtml(retreat.story) ||
    stripHtml(retreat.description) ||
    `Discover ${retreat.name} on My Retreat Nest.`;
  return {
    title: `${retreat.name} — My Retreat Nest`,
    description: metaDescription,
    openGraph: {
      title: retreat.name,
      description: metaDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function TenantHomePage({ params }: TenantHomePageProps) {
  const { slug } = await params;
  const ctx = await resolveTenantContext(slug);
  if (!ctx) notFound();
  const { retreat } = ctx;

  let categoryList;
  let galleryCategories;
  let galleries;
  try {
    [categoryList, galleryCategories, galleries] = await Promise.all([
      getCategories({ page_size: 100 }),
      getGalleryCategories(retreat.retreat_id),
      getGalleries(retreat.retreat_id),
    ]);
  } catch {
    notFound();
  }

  const categoryName = categoryList.items.find(
    (c) => c.category_id === retreat.category_id
  )?.name;

  // Offerings are supplementary: if they fail to load the page should still
  // render, just without the Stay section. Only the core data above 404s.
  const [roomTypes, packages] = await Promise.all([
    getRoomTypes(retreat.retreat_id).catch(() => []),
    getPackages(retreat.retreat_id).catch(() => []),
  ]);

  const Theme = getTenantHomepage(null);
  return (
    <>
      <TenantChromeHeader retreat={retreat} />
      <Theme
        retreat={retreat}
        categoryName={categoryName}
        galleryCategories={galleryCategories}
        galleries={galleries.items}
        galleryTotal={galleries.meta?.total ?? galleries.items.length}
        roomTypes={roomTypes}
        packages={packages}
      />
      <TenantChromeFooter retreat={retreat} />
    </>
  );
}
