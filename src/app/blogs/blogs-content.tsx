"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBlogs, getBlogTags } from "@/lib/api/blogs";
import { BlogGrid } from "@/components/blogs/blog-grid";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX, AlertCircle, Newspaper, X, Check, Tag as TagIcon } from "lucide-react";
import { Search } from "lucide-react";
import type { Blog } from "@/types/blog";
import type { PaginationMeta } from "@/types/api";

function parseSelectedTags(sp: URLSearchParams): string[] {
  const raw = [sp.get("tags"), sp.get("tag")]
    .filter((value): value is string => Boolean(value))
    .join(",");
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
  );
}

export default function BlogsContent() {
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeTags, setActiveTags] = useState<string[]>(() =>
    parseSelectedTags(new URLSearchParams(searchParams.toString()))
  );
  const [sortBy, setSortBy] = useState("newest");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    getBlogTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const apiParams = {
      page,
      page_size: 12,
      is_published: true,
      search: debouncedSearch || undefined,
      tags: activeTags.length > 0 ? activeTags : undefined,
      sort_by: sortBy === "oldest" ? "oldest" : undefined,
    };

    let cancelled = false;
    let transitionTimer: ReturnType<typeof setTimeout> | undefined;

    const startTimer = setTimeout(() => {
      if (cancelled) return;
      setIsLoading(true);
      setError(null);
      setIsTransitioning(true);

      getBlogs(apiParams)
        .then((result) => {
          if (cancelled) return;
          setBlogs(result.items);
          setMeta(result.meta);
        })
        .catch(() => {
          if (cancelled) return;
          setError("Failed to load blogs");
        })
        .finally(() => {
          if (cancelled) return;
          setIsLoading(false);
          transitionTimer = setTimeout(() => setIsTransitioning(false), 300);
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [page, debouncedSearch, activeTags, sortBy]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((selected) => selected !== tag)
        : [...current, tag]
    );
    setPage(1);
  };

  const clearTags = () => {
    setActiveTags([]);
    setPage(1);
  };

  const hasFilters = activeTags.length > 0 || search.trim().length > 0;

  const clearAll = () => {
    setActiveTags([]);
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-emerald-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
        <div className="container mx-auto px-4 py-14 lg:py-16 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4 animate-fade-in-up">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Newspaper className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium uppercase tracking-widest text-white/70">
                Journal
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white animate-fade-in-up" style={{ animationDelay: "80ms" }}>
              Stories from the retreat
            </h1>
            <p className="text-lg text-white/80 mt-3 animate-fade-in-up" style={{ animationDelay: "160ms" }}>
              Wellness guides, travel notes, and inspiration for your next getaway.
            </p>
            <div className="relative mt-6 animate-fade-in-up" style={{ animationDelay: "240ms" }}>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Search className="h-4 w-4 text-white/60" />
              </div>
              <Input
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-12 pl-14 pr-12 text-sm bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Tag filter + sort */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1.5 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TagIcon className="h-3.5 w-3.5" />
              Tags
            </span>
            <button
              onClick={clearTags}
              aria-pressed={activeTags.length === 0}
              className={`inline-flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                activeTags.length === 0
                  ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              All
            </button>
            {tags.map((tag) => {
              const isSelected = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={isSelected}
                  className={`inline-flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {tag}
                </button>
              );
            })}
            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={clearTags}
                aria-label="Clear selected tags"
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setPage(1); }}
                aria-pressed={sortBy === opt.value}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  sortBy === opt.value
                    ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No blogs found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {hasFilters
                ? "No stories match the filters you picked. Try removing one."
                : "Try a different search term or tag."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-primary px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">
                  {meta?.total ?? 0}
                </span>{" "}
                {meta?.total === 1 ? "blog" : "blogs"}
                {activeTags.length > 0 && (
                  <>
                    {" "}tagged{" "}
                    <span className="font-medium text-foreground">
                      {activeTags.join(" or ")}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
              <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                <BlogGrid blogs={blogs} />
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
    </div>
  );
}
