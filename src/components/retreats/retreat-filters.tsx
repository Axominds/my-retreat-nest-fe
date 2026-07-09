"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, SlidersHorizontal } from "lucide-react";
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
  const [showBudget, setShowBudget] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const clearFilters = () => {
    const cleared = { search: "", categoryId: "all", budgetMin: "", budgetMax: "", rating: "", breakfastIncluded: "", paymentType: "", freeCancellation: "" };
    setFilters(cleared);
    setShowBudget(false);
    setShowMore(false);
    onFilterChange(cleared);
  };

  const hasActiveFilters =
    filters.search || filters.categoryId !== "all" || filters.budgetMin || filters.budgetMax || filters.rating || filters.breakfastIncluded || filters.paymentType || filters.freeCancellation;

  const hero = variant === "hero";

  return (
    <div className={`space-y-4 ${hero ? "p-5" : "rounded-xl border bg-card shadow-sm p-4 md:p-5"}`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${hero ? "text-white/60" : "text-muted-foreground"}`}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </div>
        {hasActiveFilters && (
          <Button variant={hero ? "ghost" : "ghost"} size="sm" onClick={clearFilters} className={`h-7 text-xs ${hero ? "text-white/70 hover:text-white hover:bg-white/10" : ""}`}>
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${hero ? "text-white/50" : "text-muted-foreground"}`} />
        <Input
          placeholder="Search retreats..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className={`pl-10 ${hero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : ""}`}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateFilter("categoryId", "all")}
          className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
            filters.categoryId === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : hero
                ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
                : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category_id}
            onClick={() => updateFilter("categoryId", String(cat.category_id))}
            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
              filters.categoryId === String(cat.category_id)
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : hero
                  ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Budget toggle + inputs */}
      <div className="space-y-2">
        <button
          onClick={() => setShowBudget(!showBudget)}
          className={`text-xs font-medium transition-colors flex items-center gap-1 ${hero ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          Budget range {showBudget ? "▲" : "▼"}
        </button>
        {showBudget && (
          <div className="flex flex-wrap items-center gap-2 animate-fade-in-up">
            <Input
              type="number"
              placeholder="Min"
              value={filters.budgetMin}
              onChange={(e) => updateFilter("budgetMin", e.target.value)}
              className={`w-[120px] h-9 text-sm ${hero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : ""}`}
            />
            <span className={`text-xs ${hero ? "text-white/50" : "text-muted-foreground"}`}>to</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.budgetMax}
              onChange={(e) => updateFilter("budgetMax", e.target.value)}
              className={`w-[120px] h-9 text-sm ${hero ? "bg-white/10 border-white/10 text-white placeholder:text-white/50" : ""}`}
            />
          </div>
        )}
      </div>

      {/* More filters toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className={`text-xs font-medium transition-colors flex items-center gap-1 ${hero ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
      >
        <SlidersHorizontal className="h-3 w-3" />
        More filters {showMore ? "▲" : "▼"}
      </button>

      {showMore && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Rating */}
          <div>
            <p className={`text-xs font-medium mb-2 ${hero ? "text-white/70" : "text-muted-foreground"}`}>Rating</p>
            <div className="flex flex-wrap gap-2">
              {["", "4", "3", "2"].map((val) => (
                <button
                  key={val}
                  onClick={() => updateFilter("rating", val)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    filters.rating === val
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : hero
                        ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {val === "" ? "Any" : `${val}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Breakfast included */}
          <div>
            <p className={`text-xs font-medium mb-2 ${hero ? "text-white/70" : "text-muted-foreground"}`}>Breakfast</p>
            <div className="flex flex-wrap gap-2">
              {["", "yes", "no"].map((val) => (
                <button
                  key={val}
                  onClick={() => updateFilter("breakfastIncluded", val)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    filters.breakfastIncluded === val
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : hero
                        ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {val === "" ? "Any" : val === "yes" ? "Included" : "Not included"}
                </button>
              ))}
            </div>
          </div>

          {/* Payment type */}
          <div>
            <p className={`text-xs font-medium mb-2 ${hero ? "text-white/70" : "text-muted-foreground"}`}>Payment type</p>
            <div className="flex flex-wrap gap-2">
              {["", "online", "pay_at_property"].map((val) => (
                <button
                  key={val}
                  onClick={() => updateFilter("paymentType", val)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    filters.paymentType === val
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : hero
                        ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {val === "" ? "Any" : val === "online" ? "Online" : "Pay at property"}
                </button>
              ))}
            </div>
          </div>

          {/* Cancellation */}
          <div>
            <p className={`text-xs font-medium mb-2 ${hero ? "text-white/70" : "text-muted-foreground"}`}>Cancellation</p>
            <div className="flex flex-wrap gap-2">
              {["", "yes", "no"].map((val) => (
                <button
                  key={val}
                  onClick={() => updateFilter("freeCancellation", val)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    filters.freeCancellation === val
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : hero
                        ? "bg-white/10 text-white/80 border-white/10 hover:bg-white/20 hover:text-white"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {val === "" ? "Any" : val === "yes" ? "Free cancellation" : "Non-refundable"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
