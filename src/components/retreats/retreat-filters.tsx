"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, DollarSign, SlidersHorizontal, Star, Coffee, Ban, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import type { Category } from "@/types/category";

interface RetreatFiltersProps {
  categories: Category[];
  onFilterChange: (filters: FilterValues) => void;
  variant?: "default" | "hero";
}

export interface FilterValues {
  search: string;
  categoryId: string;
  budgetMin: string;
  budgetMax: string;
  rating: string;
  breakfastIncluded: string;
  paymentType: string;
  freeCancellation: string;
}

export function RetreatFilters({ categories, onFilterChange, variant = "default" }: RetreatFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    categoryId: "all",
    budgetMin: "",
    budgetMax: "",
    rating: "",
    breakfastIncluded: "",
    paymentType: "",
    freeCancellation: "",
  });
  const [showMore, setShowMore] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const clearFilters = () => {
    const cleared = { search: "", categoryId: "all", budgetMin: "", budgetMax: "", rating: "", breakfastIncluded: "", paymentType: "", freeCancellation: "" };
    setFilters(cleared);
    setShowMore(false);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.search || filters.categoryId !== "all" || filters.budgetMin || filters.budgetMax || filters.rating || filters.breakfastIncluded || filters.paymentType || filters.freeCancellation;

  const activeCount = [
    filters.categoryId !== "all",
    !!filters.budgetMin || !!filters.budgetMax,
    !!filters.rating,
    !!filters.breakfastIncluded,
    !!filters.paymentType,
    !!filters.freeCancellation,
  ].filter(Boolean).length;

  const isHero = variant === "hero";

  return (
    <div className={`${isHero ? "p-5" : "rounded-xl border bg-card shadow-sm p-4 md:p-5"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isHero ? "text-white/60" : "text-muted-foreground"}`}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className={`ml-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${isHero ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
              {activeCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant={isHero ? "ghost" : "ghost"} size="sm" onClick={clearFilters} className={`h-7 text-xs ${isHero ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground"}`}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg ${isHero ? "bg-white/10" : "bg-muted"}`}>
          <Search className={`h-4 w-4 ${isHero ? "text-white/60" : "text-muted-foreground"}`} />
        </div>
        <Input
          placeholder="Search by name, description, or location..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className={`h-12 pl-14 text-sm ${isHero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/20" : "bg-background"}`}
        />
      </div>

      {/* Category chips */}
      <div className="mb-4">
        <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => updateFilter("categoryId", "all")}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
              filters.categoryId === "all"
                ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                : isHero
                  ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => updateFilter("categoryId", String(cat.category_id))}
              className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                filters.categoryId === String(cat.category_id)
                  ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                  : isHero
                    ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick budget row */}
      <div className="mb-4">
        <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
          <DollarSign className="h-3 w-3" />
          Budget range
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>$</span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) => updateFilter("budgetMin", e.target.value)}
              className={`h-9 pl-7 text-sm ${isHero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : "bg-background"}`}
            />
          </div>
          <span className={`text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>—</span>
          <div className="relative flex-1">
            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isHero ? "text-white/40" : "text-muted-foreground"}`}>$</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) => updateFilter("budgetMax", e.target.value)}
              className={`h-9 pl-7 text-sm ${isHero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : "bg-background"}`}
            />
          </div>
        </div>
      </div>

      {/* More filters toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border transition-all duration-200 ${
          isHero
            ? "text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
        }`}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {showMore ? "Hide" : "More"} filters
        {showMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {showMore && (
        <div className="mt-4 pt-4 border-t space-y-5 animate-fade-in-up" style={{ animationDuration: "0.2s" }}>
          {/* Rating */}
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
              <Star className="h-3 w-3" />
              Minimum rating
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "", label: "Any" },
                { value: "4", label: "4+" },
                { value: "3", label: "3+" },
                { value: "2", label: "2+" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("rating", opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    filters.rating === opt.value
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : isHero
                        ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breakfast */}
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
              <Coffee className="h-3 w-3" />
              Breakfast
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "", label: "Any" },
                { value: "yes", label: "Included" },
                { value: "no", label: "Not included" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("breakfastIncluded", opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    filters.breakfastIncluded === opt.value
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : isHero
                        ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment type */}
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
              <CreditCard className="h-3 w-3" />
              Payment type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "", label: "Any" },
                { value: "online", label: "Online" },
                { value: "pay_at_property", label: "Pay at property" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("paymentType", opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    filters.paymentType === opt.value
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : isHero
                        ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cancellation */}
          <div>
            <p className={`text-[11px] font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isHero ? "text-white/50" : "text-muted-foreground"}`}>
              <Ban className="h-3 w-3" />
              Cancellation
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "", label: "Any" },
                { value: "yes", label: "Free" },
                { value: "no", label: "Non-refundable" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("freeCancellation", opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    filters.freeCancellation === opt.value
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : isHero
                        ? "bg-white/10 text-white/70 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
