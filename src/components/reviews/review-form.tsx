"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface ReviewFormProps {
  initialRating?: number;
  initialReview?: string;
  onSubmit: (rating: number, review?: string) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function ReviewForm({
  initialRating = 5,
  initialReview = "",
  onSubmit,
  isSubmitting,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(initialReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(rating, review || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <Label>Rating <span className="text-destructive">*</span></Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const filled = starValue <= (hoveredRating || rating);
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(starValue)}
                className="p-0.5"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    filled
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review">Review (optional)</Label>
        <Textarea
          id="review"
          placeholder="Share your experience..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
