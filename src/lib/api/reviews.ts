import { get, post, patch, del } from "@/lib/api/client";
import type { RetreatReview, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";
import type { PaginationMeta } from "@/types/api";

export async function getReviews(
  retreatId: number,
  params?: { page?: number; page_size?: number }
): Promise<{ items: RetreatReview[]; meta: PaginationMeta }> {
  const response = await get<RetreatReview[]>(`/retreats/${retreatId}/reviews/`, {
    params: {
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 20,
    },
  });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function createReview(
  retreatId: number,
  payload: CreateReviewPayload
): Promise<RetreatReview> {
  const response = await post<RetreatReview>(
    `/retreats/${retreatId}/reviews/`,
    payload,
    { auth: true }
  );
  return response.data;
}

export async function updateReview(
  retreatId: number,
  reviewId: number,
  payload: UpdateReviewPayload
): Promise<RetreatReview> {
  const response = await patch<RetreatReview>(
    `/retreats/${retreatId}/reviews/${reviewId}/`,
    payload,
    { auth: true }
  );
  return response.data;
}

export async function deleteReview(
  retreatId: number,
  reviewId: number
): Promise<void> {
  await del(`/retreats/${retreatId}/reviews/${reviewId}/`, { auth: true });
}
