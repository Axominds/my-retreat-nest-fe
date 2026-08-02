"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { RetreatCard } from "@/components/retreats/retreat-card";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import type { PaginationMeta } from "@/types/api";

interface PagedRetreatCarouselProps {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  fetchPage: (page: number) => Promise<{
    items: Retreat[];
    meta: PaginationMeta;
  }>;
  categories: Category[];
  renderWishlistButton?: (retreatId: number) => React.ReactNode;
  pageSize?: number;
}

export function PagedRetreatCarousel({
  badge,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
  fetchPage,
  categories,
  renderWishlistButton,
  pageSize = 6,
}: PagedRetreatCarouselProps) {
  const [page, setPage] = useState(1);
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const totalPages = meta?.total_pages ?? 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const categoryMap = new Map(
    categories.map((c) => [c.category_id, c.name]),
  );

  const load = useCallback(
    async (targetPage: number) => {
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPage(targetPage);
        if (id !== requestId.current) return;
        setRetreats(result.items);
        setMeta(result.meta);
        setPage(targetPage);
      } catch {
        if (id === requestId.current) setError("Failed to load retreats");
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    void load(1);
    return () => {
      requestId.current++;
    };
  }, [load]);

  const goTo = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages) return;
    void load(targetPage);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
        <div>
          {badge}
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {totalPages > 1 && (
            <>
              <div className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {String(page).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground/60">/</span>
                <span>{String(totalPages).padStart(2, "0")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(page - 1)}
                  disabled={!canPrev || loading}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground shadow-sm ring-1 ring-border transition-all hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(page + 1)}
                  disabled={!canNext || loading}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-all hover:opacity-90 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-52 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : retreats.length > 0 ? (
        <>
          <div
            key={page}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up"
          >
            {retreats.map((retreat) => (
              <RetreatCard
                key={retreat.retreat_id}
                retreat={retreat}
                categoryName={categoryMap.get(retreat.category_id)}
                wishlistButton={renderWishlistButton?.(retreat.retreat_id)}
                index={retreats.indexOf(retreat)}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i + 1)}
                    aria-label={`Go to page ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i + 1 === page
                        ? "w-7 bg-primary"
                        : "w-2 bg-foreground/15 hover:bg-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {viewAllHref && (
            <div className="text-center">
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                {viewAllLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
