import { get, post, patch, del, postForm } from "@/lib/api/client";
import type { Retreat, RetreatGalleryItem, RetreatStaffMember } from "@/types/retreat";
import type { PaginationMeta } from "@/types/api";

export interface RetreatListResponse {
  items: Retreat[];
  meta: PaginationMeta;
}

export interface RetreatPayload {
  name: string;
  description?: string | null;
  category_id: number;
  slug: string;
  social_links?: Record<string, unknown>;
  email?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  is_published?: boolean;
}

export async function getRetreats(params?: {
  page?: number;
  page_size?: number;
}): Promise<{ items: Retreat[]; meta: PaginationMeta }> {
  const response = await get<Retreat[]>("/retreats/", {
    params: {
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 10,
    },
  });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function getRetreat(id: number): Promise<Retreat> {
  const response = await get<Retreat>(`/retreats/${id}/`);
  return response.data;
}

export async function createRetreat(payload: RetreatPayload): Promise<Retreat> {
  const response = await post<Retreat>("/retreats/", payload, { auth: true });
  return response.data;
}

export async function updateRetreat(id: number, payload: Partial<RetreatPayload>): Promise<Retreat> {
  const response = await patch<Retreat>(`/retreats/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteRetreat(id: number): Promise<void> {
  await del(`/retreats/${id}/`, { auth: true });
}

export async function getGalleries(
  retreatId: number,
  params?: { page?: number; page_size?: number }
): Promise<{ items: RetreatGalleryItem[]; meta: PaginationMeta }> {
  const response = await get<RetreatGalleryItem[]>(`/retreats/${retreatId}/galleries/`, {
    params: {
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 50,
    },
  });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function uploadGallery(
  retreatId: number,
  formData: FormData
): Promise<RetreatGalleryItem> {
  const response = await postForm<RetreatGalleryItem>(`/retreats/${retreatId}/galleries/`, formData, { auth: true });
  return response.data;
}

export async function deleteGallery(retreatId: number, galleryId: number): Promise<void> {
  await del(`/retreats/${retreatId}/galleries/${galleryId}/`, { auth: true });
}

export async function getRetreatUsers(retreatId: number): Promise<RetreatStaffMember[]> {
  const response = await get<RetreatStaffMember[]>(`/retreats/${retreatId}/users/`, { auth: true });
  return response.data;
}

export async function createRetreatUser(
  retreatId: number,
  payload: { name: string; email: string; role: string }
): Promise<void> {
  await post(`/retreats/${retreatId}/users/`, payload, { auth: true });
}

export async function deleteRetreatUser(retreatId: number, retreatUserId: number): Promise<void> {
  await del(`/retreats/${retreatId}/users/${retreatUserId}/`, { auth: true });
}
