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

const STATIC_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=60",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=60",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=60",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=60",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=60",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=60",
];

export function WishlistPageContent() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrlMap, setImageUrlMap] = useState<Map<number, string>>(new Map());

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

      const map = new Map<number, string>();
      retreatResults.forEach((r, i) => {
        map.set(r.retreat_id, STATIC_IMAGES[i % STATIC_IMAGES.length]);
      });
      setImageUrlMap(map);
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
        imageUrlMap={imageUrlMap}
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