"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RetreatDetailWishlistButtonProps {
  retreatId: number;
}

export function RetreatDetailWishlistButton({ retreatId }: RetreatDetailWishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getWishlist()
      .then((result) => {
        if (!cancelled) {
          setIsWishlisted(result.items.some((item) => item.retreat_id === retreatId));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [retreatId, isAuthenticated]);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setPending(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(retreatId);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(retreatId);
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-12 w-full rounded-xl border-dashed"
      onClick={handleClick}
      disabled={pending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
      <span className="ml-2 text-sm font-medium">
        {isWishlisted ? "Saved" : "Save to wishlist"}
      </span>
    </Button>
  );
}
