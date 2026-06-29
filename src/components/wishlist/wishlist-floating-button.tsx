"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface WishlistFloatingButtonProps {
  retreatId: number;
}

export function WishlistFloatingButton({ retreatId }: WishlistFloatingButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    getWishlist()
      .then((result) => {
        if (!cancelled) {
          const ids = new Set(result.items.map((item) => item.retreat_id));
          setIsWishlisted(ids.has(retreatId));
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
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        disabled={pending}
        size="icon"
        className="h-14 w-14 rounded-full shadow-xl"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-7 w-7 transition-colors ${
            isWishlisted ? "fill-white text-white" : ""
          }`}
        />
      </Button>
    </div>
  );
}
