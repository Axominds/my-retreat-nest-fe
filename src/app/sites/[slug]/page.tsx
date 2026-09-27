import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGalleries } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { API_BASE_URL } from "@/lib/constants";
import { getGalleryCategories } from "@/lib/api/gallery-categories";
import { resolveTenantContext } from "@/lib/tenant";
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
  return {
    title: `${retreat.name} — My Retreat Nest`,
    description: retreat.description ?? `Discover ${retreat.name} on My Retreat Nest.`,
    openGraph: {
      title: retreat.name,
      description: retreat.description ?? undefined,
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

  const Theme = getTenantHomepage(null);
  return (
    <>
      <TenantChromeHeader retreat={retreat} />
      <Theme
        retreat={retreat}
        categoryName={categoryName}
        galleryCategories={galleryCategories}
        galleries={galleries.items}
      />
      <TenantChromeFooter retreat={retreat} />
    </>
  );
}
