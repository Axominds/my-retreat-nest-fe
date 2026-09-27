"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/api";

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

type PageItem = number | "gap";

function buildPages(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("gap");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("gap");
  pages.push(total);

  return pages;
}

export function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  const total = meta.total_pages;
  if (total <= 1) return null;

  const current = meta.page;
  const pages = buildPages(current, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p className="order-2 text-sm text-muted-foreground sm:order-1">
        Page{" "}
        <span className="font-medium tabular-nums text-foreground">{current}</span>{" "}
        of{" "}
        <span className="font-medium tabular-nums text-foreground">{total}</span>
      </p>

      <div className="order-1 flex items-center gap-1 sm:order-2">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Previous page"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "gap" ? (
            <span
              key={`gap-${i}`}
              aria-hidden
              className="flex h-9 w-6 select-none items-center justify-center text-sm text-muted-foreground/60"
            >
              &hellip;
            </span>
          ) : (
            <Button
              key={p}
              variant={p === current ? "default" : "ghost"}
              size="icon-lg"
              aria-label={`Page ${p}`}
              aria-current={p === current ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                "tabular-nums transition-all duration-200",
                p === current
                  ? "shadow-sm"
                  : "text-muted-foreground hover:scale-105"
              )}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Next page"
          disabled={current >= total}
          onClick={() => onPageChange(current + 1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
