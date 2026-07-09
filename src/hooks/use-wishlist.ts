"use client";

import { useState, useCallback } from "react";
import { addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { useAuth } from "@/hooks/use-auth";

export function useWishlist() {
  const { isAuthenticated } = useAuth();
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const toggle = useCallback(
    async (retreatId: number, currentlyWishlisted: boolean) => {
      if (!isAuthenticated) {
        return;
      }

      setPendingIds((prev) => new Set(prev).add(retreatId));

      try {
        if (currentlyWishlisted) {
          await removeFromWishlist(retreatId);
        } else {
          await addToWishlist(retreatId);
        }
      } catch (err) {
        console.error("Wishlist API error:", err);
        if (!currentlyWishlisted) throw err;
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(retreatId);
          return next;
        });
      }
    },
    [isAuthenticated]
  );

  return { toggle, isPending: (id: number) => pendingIds.has(id) };
}
