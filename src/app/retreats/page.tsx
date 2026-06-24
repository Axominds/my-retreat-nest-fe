"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getRetreats } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { RetreatGrid } from "@/components/retreats/retreat-grid";
import { RetreatFilters, type FilterValues } from "@/components/retreats/retreat-filters";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import type { PaginationMeta } from "@/types/api";

export default function RetreatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

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
    if (
      filters.categoryId !== "all" &&
      r.category_id !== Number(filters.categoryId)
    ) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !r.name.toLowerCase().includes(q) &&
        !r.description?.toLowerCase().includes(q) &&
        !r.address?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filters.budgetMin && r.budget_min != null && r.budget_min < Number(filters.budgetMin)) {
      return false;
    }
    if (filters.budgetMax && r.budget_max != null && r.budget_max > Number(filters.budgetMax)) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Retreats</h1>
        <p className="text-muted-foreground mt-1">
          Discover your perfect getaway.
        </p>
      </div>

      <RetreatFilters categories={categories} onFilterChange={handleFilterChange} />

      {error ? (
        <p className="text-destructive">{error}</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredRetreats.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No retreats found matching your criteria.
        </p>
      ) : (
        <>
          <RetreatGrid
            retreats={filteredRetreats}
            categories={categories}
          />
          {meta && (
            <PaginationControls meta={meta} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
