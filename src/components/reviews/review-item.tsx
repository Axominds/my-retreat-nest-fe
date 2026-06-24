"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { RetreatReview } from "@/types/review";
import type { User } from "@/types/user";

interface ReviewItemProps {
  review: RetreatReview;
  user?: User;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewItem({ review, user, isOwn, onEdit, onDelete }: ReviewItemProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user ? user.name.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {user?.name ?? `User #${review.user_id}`}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(review.rating)
                      ? "fill-primary text-primary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {isOwn && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button variant="ghost" size="icon-sm" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon-sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </div>

      {review.review && (
        <p className="text-sm text-muted-foreground">{review.review}</p>
      )}
    </div>
  );
}
