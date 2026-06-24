export interface Retreat {
  retreat_id: number;
  name: string;
  description: string | null;
  category_id: number;
  slug: string;
  social_links: Record<string, unknown>;
  email: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  is_published: boolean;
}

export interface RetreatGalleryItem {
  gallery_id: number;
  retreat_id: number;
  caption: string | null;
  order: number | null;
  gallery_category_id: number | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface GalleryCategory {
  gallery_category_id: number;
  name: string;
}
