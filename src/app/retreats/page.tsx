"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRetreats } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { getWishlist } from "@/lib/api/wishlist";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { RetreatFilters, type FilterValues } from "@/components/retreats/retreat-filters";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { TreePine, SearchX, AlertCircle } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import type { PaginationMeta } from "@/types/api";

export default function RetreatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    categoryId: searchParams.get("category") || "all",
    budgetMin: "",
    budgetMax: "",
  });
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    getWishlist()
      .then((result) => {
        if (!cancelled) {
          setWishlistIds(new Set(result.items.map((item) => item.retreat_id)));
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getRetreats({ page, page_size: 12 })
      .then((result) => {
        setRetreats(result.items);
        setMeta(result.meta);
      })
      .catch(() => {
        setError("Failed to load retreats");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const filteredRetreats = retreats.filter((r) => {
    if (filters.categoryId !== "all" && r.category_id !== Number(filters.categoryId)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q) && !r.address?.toLowerCase().includes(q)) return false;
    }
    if (filters.budgetMin && r.budget_min != null && r.budget_min < Number(filters.budgetMin)) return false;
    if (filters.budgetMax && r.budget_max != null && r.budget_max > Number(filters.budgetMax)) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TreePine className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Discover
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Retreats
            </h1>
            <p className="text-lg text-muted-foreground mt-3 max-w-lg">
              Explore handpicked retreats for your next getaway. Find peace, adventure, and renewal.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <RetreatFilters categories={categories} onFilterChange={handleFilterChange} />
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <p className="text-lg font-medium">Something went wrong</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button
              onClick={() => setPage(page)}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <Skeleton className="aspect-video w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : filteredRetreats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No retreats found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <RetreatGrid
                retreats={filteredRetreats}
                categories={categories}
                renderWishlistButton={(id) => (
                  <WishlistButton
                    retreatId={id}
                    isWishlisted={wishlistIds.has(id)}
                    variant="outline"
                    onToggle={(newState) => {
                      setWishlistIds((prev) => {
                        const next = new Set(prev);
                        if (newState) next.add(id);
                        else next.delete(id);
                        return next;
                      });
                    }}
                  />
                )}
              />
            </div>
            {meta && (
              <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                <PaginationControls meta={meta} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
