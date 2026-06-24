"use client";

import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface WishlistButtonProps {
  retreatId: number;
  isWishlisted: boolean;
  onToggle?: (newState: boolean) => void;
}

export function WishlistButton({
  retreatId,
  isWishlisted,
  onToggle,
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const { toggle, isPending } = useWishlist();
  const router = useRouter();
  const pending = isPending(retreatId);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      await toggle(retreatId, isWishlisted);
      onToggle?.(!isWishlisted);
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
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
