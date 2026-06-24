"use client";

import { useState, useCallback } from "react";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/api/reviews";
import type { RetreatReview, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";
import type { PaginationMeta } from "@/types/api";

export function useReviews(retreatId: number) {
  const [reviews, setReviews] = useState<RetreatReview[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReviews(retreatId);
      setReviews(result.items);
      setMeta(result.meta);
    } catch {
      setError("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  }, [retreatId]);

  const add = useCallback(
    async (payload: CreateReviewPayload) => {
      setIsSubmitting(true);
      try {
        const newReview = await createReview(retreatId, payload);
        setReviews((prev) => [newReview, ...prev]);
        return newReview;
      } finally {
        setIsSubmitting(false);
      }
    },
    [retreatId]
  );

  const edit = useCallback(
    async (reviewId: number, payload: UpdateReviewPayload) => {
      setIsSubmitting(true);
      try {
        const updated = await updateReview(retreatId, reviewId, payload);
        setReviews((prev) =>
          prev.map((r) => (r.review_id === reviewId ? updated : r))
        );
        return updated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [retreatId]
  );

  const remove = useCallback(
    async (reviewId: number) => {
      await deleteReview(retreatId, reviewId);
      setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
    },
    [retreatId]
  );

  return {
    reviews,
    meta,
    isLoading,
    error,
    isSubmitting,
    fetchReviews,
    add,
    edit,
    remove,
  };
}
