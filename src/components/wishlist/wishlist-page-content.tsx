"use client";

import { useEffect, useState, useCallback } from "react";
import { getWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { getRetreat } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { toast } from "sonner";

export function WishlistPageContent() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [wlResult, cats] = await Promise.all([
        getWishlist(),
        getCategories(),
      ]);
      setCategories(cats);
      const ids = new Set(wlResult.items.map((item) => item.retreat_id));
      setWishlistIds(ids);

      const retreatResults = await Promise.all(
        wlResult.items.map((item) => getRetreat(item.retreat_id))
      );
      setRetreats(retreatResults);
    } catch {
      setError("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemove = async (retreatId: number) => {
    try {
      await removeFromWishlist(retreatId);
      setRetreats((prev) => prev.filter((r) => r.retreat_id !== retreatId));
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(retreatId);
        return next;
      });
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove from wishlist");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (retreats.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground">
          Start exploring retreats and save your favorites!
        </p>
      </div>
    );
  }

  return (
    <RetreatGrid
      retreats={retreats}
      categories={categories}
      renderWishlistButton={(id) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRemove(id)}
          aria-label="Remove from wishlist"
        >
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
        </Button>
      )}
    />
  );
}
