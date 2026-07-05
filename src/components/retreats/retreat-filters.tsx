"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Category } from "@/types/category";

interface RetreatFiltersProps {
  categories: Category[];
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  categoryId: string;
  budgetMin: string;
  budgetMax: string;
}

export function RetreatFilters({ categories, onFilterChange }: RetreatFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    categoryId: "all",
    budgetMin: "",
    budgetMax: "",
  });

  const updateFilter = (key: keyof FilterValues, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const clearFilters = () => {
    const cleared = { search: "", categoryId: "all", budgetMin: "", budgetMax: "" };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.search || filters.categoryId !== "all" || filters.budgetMin || filters.budgetMax;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <SlidersHorizontal className="h-3 w-3" />
        Filters
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search retreats..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.categoryId}
          onValueChange={(v) => updateFilter("categoryId", v ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min budget"
          value={filters.budgetMin}
          onChange={(e) => updateFilter("budgetMin", e.target.value)}
          className="w-[130px]"
        />
        <Input
          type="number"
          placeholder="Max budget"
          value={filters.budgetMax}
          onChange={(e) => updateFilter("budgetMax", e.target.value)}
          className="w-[130px]"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
