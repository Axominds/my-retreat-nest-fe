import { get, post, patch, del } from "@/lib/api/client";
import type { GalleryCategory } from "@/types/retreat";

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  const response = await get<GalleryCategory[]>("/gallery-categories/");
  return response.data;
}

export async function createGalleryCategory(payload: { name: string }): Promise<GalleryCategory> {
  const response = await post<GalleryCategory>("/gallery-categories/", payload, { auth: true });
  return response.data;
}

export async function updateGalleryCategory(id: number, payload: { name?: string }): Promise<GalleryCategory> {
  const response = await patch<GalleryCategory>(`/gallery-categories/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteGalleryCategory(id: number): Promise<void> {
  await del(`/gallery-categories/${id}/`, { auth: true });
}
