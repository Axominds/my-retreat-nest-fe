"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getRetreats } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { getWishlist } from "@/lib/api/wishlist";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { RetreatFilters, type FilterValues } from "@/components/retreats/retreat-filters";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchX, AlertCircle, Sparkles, Mountain, ArrowRight } from "lucide-react";
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
    rating: "",
    breakfastIncluded: "",
    paymentType: "",
    freeCancellation: "",
  });
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    getCategories({ page_size: 100 })
      .then((c) => setCategories(c.items))
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
    setIsTransitioning(true);

    getRetreats({ page, page_size: 12, is_published: true })
      .then((result) => {
        setRetreats(result.items);
        setMeta(result.meta);
      })
      .catch(() => {
        setError("Failed to load retreats");
      })
      .finally(() => {
        setIsLoading(false);
        setTimeout(() => setIsTransitioning(false), 300);
      });
  }, [page]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const filteredRetreats = useMemo(() =>
    retreats.filter((r) => {
      if (filters.categoryId !== "all" && r.category_id !== Number(filters.categoryId)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.description?.toLowerCase().includes(q) && !r.address?.toLowerCase().includes(q)) return false;
      }
      if (filters.budgetMin && r.budget_min != null && r.budget_min < Number(filters.budgetMin)) return false;
      if (filters.budgetMax && r.budget_max != null && r.budget_max > Number(filters.budgetMax)) return false;
      if (filters.rating && r.average_rating != null && r.average_rating < Number(filters.rating)) return false;
      if (filters.breakfastIncluded && r.breakfast_included != null) {
        const wantsBreakfast = filters.breakfastIncluded === "yes";
        if (r.breakfast_included !== wantsBreakfast) return false;
      }
      if (filters.paymentType && r.payment_type != null && r.payment_type !== filters.paymentType) return false;
      if (filters.freeCancellation && r.free_cancellation != null) {
        const wantsFree = filters.freeCancellation === "yes";
        if (r.free_cancellation !== wantsFree) return false;
      }
      return true;
    }),
  [retreats, filters]);

  const selectedCategoryName = filters.categoryId !== "all"
    ? categories.find((c) => c.category_id === Number(filters.categoryId))?.name
    : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-emerald-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 py-14 lg:py-16 relative">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 lg:pr-6">
              <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                  <Mountain className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                  Discover
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white animate-fade-in-up" style={{ animationDelay: "80ms" }}>
                Find your perfect retreat
              </h1>
              <p className="text-lg text-white/80 mt-3 max-w-xl animate-fade-in-up" style={{ animationDelay: "160ms" }}>
                Explore handpicked retreats for your next getaway. Search by name, category, budget, or amenities — your ideal escape is just a click away.
              </p>
              {meta && (
                <div className="flex flex-wrap items-center gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
                  <div className="flex items-center gap-1.5 text-xs text-white/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{meta.total} retreat{meta.total !== 1 ? "s" : ""} available</span>
                  </div>
                  {selectedCategoryName && (
                    <Badge className="bg-white/15 text-white border-0 text-xs">
                      {selectedCategoryName}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <div className="bg-white/25 backdrop-blur-xl rounded-xl border border-white/30 shadow-xl shadow-black/5">
                <RetreatFilters categories={categories} onFilterChange={handleFilterChange} variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Content */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-5">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <button
              onClick={() => setPage(page)}
              className="mt-5 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredRetreats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No retreats found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Results bar */}
            <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredRetreats.length}</span> of{" "}
                <span className="font-medium text-foreground">{meta?.total ?? 0}</span> retreats
              </p>
            </div>

            <div
              className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
            >
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
            </div>

            {meta && (
              <div className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
                <PaginationControls meta={meta} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* List Your Property */}
      <section className="container mx-auto px-4 pb-10 md:pb-14">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
                Owners
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                List Your Property
              </h2>
              <p className="text-white/80 mt-2 max-w-lg text-lg">
                Earn up to $10,000/month hosting your retreat. Zero setup fees, instant bookings, dedicated support.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <Link href="/list-your-property">
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 font-semibold shadow-lg">
                    Get Started <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-white/60 text-xs">Free to list · No hidden fees</p>
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-6xl md:text-7xl font-black text-white/30 leading-none">$$</div>
              <p className="text-white/50 text-sm mt-1">EARN</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-10 md:pb-14">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/50" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
                Join Today
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Escape?
              </h2>
              <p className="text-white/80 mt-2 max-w-lg text-lg">
                Join thousands of happy travelers who found their perfect retreat.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <Link href="/retreats">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-white/90 font-semibold shadow-lg">
                    Browse All Retreats <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                      Sign Up Free
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="shrink-0 text-center">
              <div className="text-6xl md:text-7xl font-black text-white/30 leading-none">GO</div>
              <p className="text-white/50 text-sm mt-1">BOOK</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
