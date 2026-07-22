import { get, patch, post } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/api";
import type { ListingRequest, CreateListingRequestPayload } from "@/types/listing-request";
import type { Retreat } from "@/types/retreat";

export async function submitListingRequest(
  payload: CreateListingRequestPayload
): Promise<ListingRequest> {
  const response = await post<ListingRequest>("/listing-requests/", payload);
  return response.data;
}

export async function getListingRequests(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<{ items: ListingRequest[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 10,
  };
  if (params?.status) queryParams.status = params.status;
  if (params?.search) queryParams.search = params.search;
  if (params?.sort_by) queryParams.sort_by = params.sort_by;
  if (params?.sort_order) queryParams.sort_order = params.sort_order;
  const response = await get<ListingRequest[]>("/listing-requests/", {
    params: queryParams,
    auth: true,
  });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function getListingRequest(id: number): Promise<ListingRequest> {
  const response = await get<ListingRequest>(`/listing-requests/${id}/`, {
    auth: true,
  });
  return response.data;
}

export async function approveListingRequest(
  id: number,
  slug?: string
): Promise<Retreat> {
  const response = await post<Retreat>(
    `/listing-requests/${id}/approve/`,
    slug ? { slug } : {},
    { auth: true }
  );
  return response.data;
}

export async function rejectListingRequest(
  id: number,
  rejection_reason?: string
): Promise<void> {
  await post(
    `/listing-requests/${id}/reject/`,
    rejection_reason ? { rejection_reason } : {},
    { auth: true }
  );
}

export async function updateListingRequest(
  id: number,
  payload: Partial<CreateListingRequestPayload>
): Promise<ListingRequest> {
  const response = await patch<ListingRequest>(
    `/listing-requests/${id}/`,
    payload,
    { auth: true }
  );
  return response.data;
}
