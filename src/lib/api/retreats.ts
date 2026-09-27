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
  is_featured?: boolean;
  thumbnail_image?: string | null;
  banner_image?: string | null;
}

export async function getRetreats(params?: {
  page?: number;
  page_size?: number;
  is_published?: boolean;
  is_featured?: boolean;
  search?: string;
  category_id?: number;
  budget_min?: number;
  budget_max?: number;
  rating?: number;
  sort_by?: string;
  sort_order?: string;
  amenity_ids?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}): Promise<{ items: Retreat[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 10,
  };
  if (params?.is_published !== undefined) {
    queryParams.is_published = params.is_published ? "true" : "false";
  }
  if (params?.is_featured !== undefined) {
    queryParams.is_featured = params.is_featured ? "true" : "false";
  }
  if (params?.search) {
    queryParams.search = params.search;
  }
  if (params?.category_id !== undefined) {
    queryParams.category_id = params.category_id;
  }
  if (params?.budget_min !== undefined) {
    queryParams.budget_min = params.budget_min;
  }
  if (params?.budget_max !== undefined) {
    queryParams.budget_max = params.budget_max;
  }
  if (params?.rating !== undefined) {
    queryParams.rating = params.rating;
  }
  if (params?.sort_by) {
    queryParams.sort_by = params.sort_by;
  }
  if (params?.sort_order) {
    queryParams.sort_order = params.sort_order;
  }
  if (params?.amenity_ids) {
    queryParams.amenity_ids = params.amenity_ids;
  }
  if (params?.latitude !== undefined) {
    queryParams.latitude = params.latitude;
  }
  if (params?.longitude !== undefined) {
    queryParams.longitude = params.longitude;
  }
  if (params?.radius_km !== undefined) {
    queryParams.radius_km = params.radius_km;
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

export interface ValidatedTenant {
  retreat_id: number;
  slug: string;
  name: string;
}

/**
 * Resolves the current tenant via `GET /retreats/validate/`, which reads the
 * tenant purely from request headers (Origin/Referer/Host). Browser fetches
 * send Origin automatically for cross-origin calls; server-side callers must
 * forward the inbound host via `x-forwarded-host` (undici forbids overriding
 * `host`, and server fetches send no Origin by default). Throws ApiError-like
 * Error with `status` on failure so callers can branch on 404.
 */
export async function validateRetreatTenant(forwardedHost?: string): Promise<ValidatedTenant> {
  const { API_BASE_URL } = await import("@/lib/constants");
  const { ApiError } = await import("@/lib/api/client");
  const response = await fetch(`${API_BASE_URL}/retreats/validate/`, {
    headers: forwardedHost ? { "x-forwarded-host": forwardedHost } : undefined,
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, json);
  }
  return json.data as ValidatedTenant;
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

export async function deleteRetreatThumbnail(retreatId: number): Promise<void> {
  await del(`/retreats/${retreatId}/thumbnail/`, { auth: true });
}

export async function deleteRetreatBanner(retreatId: number): Promise<void> {
  await del(`/retreats/${retreatId}/banner/`, { auth: true });
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
): Promise<string> {
  const response = await post<null>(`/retreats/${retreatId}/users/`, payload, { auth: true });
  return response.message ?? "";
}

export async function deleteRetreatUser(retreatId: number, retreatUserId: number): Promise<void> {
  await del(`/retreats/${retreatId}/users/${retreatUserId}/`, { auth: true });
}
