export interface RetreatReview {
  review_id: number;
  user_id: number;
  retreat_id: number;
  rating: number;
  review: string | null;
}

export interface CreateReviewPayload {
  rating: number;
  review?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  review?: string | null;
}
