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
  email: string;
  phone: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
  is_published?: boolean;
}

export async function getRetreats(params?: {
  page?: number;
  page_size?: number;
  is_published?: boolean;
  search?: string;
  category_id?: number;
  sort_by?: string;
  sort_order?: string;
}): Promise<{ items: Retreat[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 10,
  };
  if (params?.is_published !== undefined) {
    queryParams.is_published = params.is_published ? "true" : "false";
  }
  if (params?.search) {
    queryParams.search = params.search;
  }
  if (params?.category_id !== undefined) {
    queryParams.category_id = params.category_id;
  }
  if (params?.sort_by) {
    queryParams.sort_by = params.sort_by;
  }
  if (params?.sort_order) {
    queryParams.sort_order = params.sort_order;
  }
  const response = await get<Retreat[]>("/retreats/", { params: queryParams });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function getRetreat(id: number, params?: { is_published?: boolean }): Promise<Retreat> {
  const queryParams: Record<string, string | number> = {};
  if (params?.is_published !== undefined) {
    queryParams.is_published = params.is_published ? "true" : "false";
  }
  const response = await get<Retreat>(`/retreats/${id}/`, { params: queryParams });
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

export async function uploadRetreatThumbnail(
  retreatId: number,
  formData: FormData
): Promise<Retreat> {
  const response = await postForm<Retreat>(`/retreats/${retreatId}/thumbnail/`, formData, { auth: true });
  return response.data;
}

export async function uploadRetreatBanner(
  retreatId: number,
  formData: FormData
): Promise<Retreat> {
  const response = await postForm<Retreat>(`/retreats/${retreatId}/banner/`, formData, { auth: true });
  return response.data;
}

export async function updateGallery(
  retreatId: number,
  galleryId: number,
  payload: { caption?: string; gallery_category_id?: number | null }
): Promise<RetreatGalleryItem> {
  const response = await patch<RetreatGalleryItem>(`/retreats/${retreatId}/galleries/${galleryId}/`, payload, { auth: true });
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
