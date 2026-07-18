"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { getRetreat } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
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
        getCategories({ page_size: 100 }),
      ]);
      setCategories(cats.items);
      const ids = new Set(wlResult.items.map((item) => item.retreat_id));
      setWishlistIds(ids);

      const retreatResults = await Promise.all(
        wlResult.items.map((item) => getRetreat(item.retreat_id, { is_published: true }))
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
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
          <Search className="h-7 w-7 text-destructive" />
        </div>
        <p className="text-lg font-semibold text-destructive">{error}</p>
        <Button variant="outline" onClick={loadData} className="mt-4">
          Try again
        </Button>
      </div>
    );
  }

  if (retreats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-muted mb-6">
          <Heart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold">Your wishlist is empty</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Start exploring retreats and save your favorites by tapping the heart icon.
        </p>
        <Link href="/retreats">
          <Button className="mt-8">
            <Search className="h-4 w-4 mr-2" />
            Explore Retreats
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Heart className="h-4 w-4" />
        <span>
          {retreats.length} saved retreat{retreats.length !== 1 ? "s" : ""}
        </span>
      </div>
      <RetreatGrid
        retreats={retreats}
        categories={categories}
        renderWishlistButton={(id) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(id)}
            aria-label="Remove from wishlist"
            className="hover:bg-white/20"
          >
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          </Button>
        )}
      />
    </div>
  );
}