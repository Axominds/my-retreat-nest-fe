import { get } from "@/lib/api/client";
import type { Retreat, RetreatGalleryItem } from "@/types/retreat";
import type { PaginationMeta } from "@/types/api";

export interface RetreatListResponse {
  items: Retreat[];
  meta: PaginationMeta;
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
