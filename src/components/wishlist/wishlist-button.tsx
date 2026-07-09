"use client";

import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";

interface WishlistButtonProps {
  retreatId: number;
  isWishlisted: boolean;
  onToggle?: (newState: boolean) => void;
  variant?: "ghost" | "outline";
  className?: string;
}

export function WishlistButton({
  retreatId,
  isWishlisted,
  onToggle,
  variant = "ghost",
  className,
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toggle, isPending } = useWishlist();
  const pending = isPending(retreatId);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please log in to save to wishlist");
      return;
    }

    onToggle?.(!isWishlisted);

    try {
      await toggle(retreatId, isWishlisted);
    } catch (err) {
      onToggle?.(isWishlisted);
      const msg = err instanceof ApiError ? err.message : "Failed to update wishlist";
      toast.error(msg);
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={className}
      onClick={handleClick}
      disabled={pending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isWishlisted ? "fill-red-500 text-red-500" : ""
        }`}
      />
    </Button>
  );
}
