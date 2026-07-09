import { get, post, patch, del } from "@/lib/api/client";
import type { GalleryCategory } from "@/types/retreat";

export async function getGalleryCategories(retreatId: number): Promise<GalleryCategory[]> {
  const response = await get<GalleryCategory[]>(`/retreats/${retreatId}/gallery-categories/`);
  return response.data;
}

export async function createGalleryCategory(retreatId: number, payload: { name: string }): Promise<GalleryCategory> {
  const response = await post<GalleryCategory>(`/retreats/${retreatId}/gallery-categories/`, payload, { auth: true });
  return response.data;
}

export async function updateGalleryCategory(retreatId: number, id: number, payload: { name?: string }): Promise<GalleryCategory> {
  const response = await patch<GalleryCategory>(`/retreats/${retreatId}/gallery-categories/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteGalleryCategory(retreatId: number, id: number): Promise<void> {
  await del(`/retreats/${retreatId}/gallery-categories/${id}/`, { auth: true });
}
