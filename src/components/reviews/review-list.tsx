"use client";

import { useEffect, useState, useCallback } from "react";
import { useReviews } from "@/hooks/use-reviews";
import { useAuth } from "@/hooks/use-auth";
import { ReviewItem } from "@/components/reviews/review-item";
import { ReviewForm } from "@/components/reviews/review-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/api/users";
import type { User } from "@/types/user";
import { toast } from "sonner";

interface ReviewListProps {
  retreatId: number;
}

export function ReviewList({ retreatId }: ReviewListProps) {
  const { isAuthenticated, user: currentUser } = useAuth();
  const {
    reviews,
    isLoading,
    error,
    isSubmitting,
    fetchReviews,
    add,
    edit,
    remove,
  } = useReviews(retreatId);
  const [userMap, setUserMap] = useState<Map<number, User>>(new Map());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchUser = useCallback(async (userId: number) => {
    if (userMap.has(userId)) return;
    try {
      const user = await getUser(userId);
      setUserMap((prev) => new Map(prev).set(userId, user));
    } catch {
      // Silently fail, show user ID instead
    }
  }, [userMap]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    reviews.forEach((r) => fetchUser(r.user_id));
  }, [reviews, fetchUser]);

  const handleSubmit = async (rating: number, review?: string) => {
    try {
      await add({ rating, review });
      setShowForm(false);
      toast.success("Review submitted");
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const handleEdit = async (rating: number, review?: string) => {
    if (editingId == null) return;
    try {
      await edit(editingId, { rating, review: review ?? null });
      setEditingId(null);
      toast.success("Review updated");
    } catch {
      toast.error("Failed to update review");
    }
  };

  const handleDelete = async (reviewId: number) => {
    try {
      await remove(reviewId);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const existingReview = reviews.find(
    (r) => r.user_id === currentUser?.user_id
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Reviews ({reviews.length})
        </h2>
        {isAuthenticated && !existingReview && !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <ReviewForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingId != null && (
        <ReviewForm
          initialRating={reviews.find((r) => r.review_id === editingId)?.rating}
          initialReview={reviews.find((r) => r.review_id === editingId)?.review ?? undefined}
          onSubmit={handleEdit}
          isSubmitting={isSubmitting}
          onCancel={() => setEditingId(null)}
        />
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewItem
              key={review.review_id}
              review={review}
              user={userMap.get(review.user_id)}
              isOwn={currentUser?.user_id === review.user_id}
              onEdit={
                currentUser?.user_id === review.user_id
                  ? () => setEditingId(review.review_id)
                  : undefined
              }
              onDelete={
                currentUser?.user_id === review.user_id
                  ? () => handleDelete(review.review_id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
