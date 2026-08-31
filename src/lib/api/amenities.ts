import { get, post, patch, del, put } from "@/lib/api/client";
import type { Amenity } from "@/types/amenity";
import type { PaginationMeta } from "@/types/api";

export async function getAmenities(params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<{ items: Amenity[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 100,
  };
  if (params?.search) {
    queryParams.search = params.search;
  }
  const response = await get<Amenity[]>("/amenities/", { params: queryParams });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function createAmenity(payload: { label: string }): Promise<Amenity> {
  const response = await post<Amenity>("/amenities/", payload, { auth: true });
  return response.data;
}

export async function updateAmenity(id: number, payload: { label?: string }): Promise<Amenity> {
  const response = await patch<Amenity>(`/amenities/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteAmenity(id: number): Promise<void> {
  await del(`/amenities/${id}/`, { auth: true });
}

export async function getRetreatAmenities(retreatId: number): Promise<Amenity[]> {
  const response = await get<Amenity[]>(`/retreats/${retreatId}/amenities/`);
  return response.data;
}

export async function setRetreatAmenities(retreatId: number, amenityIds: number[]): Promise<Amenity[]> {
  const response = await put<Amenity[]>(`/retreats/${retreatId}/amenities/`, { amenity_ids: amenityIds }, { auth: true });
  return response.data;
}
