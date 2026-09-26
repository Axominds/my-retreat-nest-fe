"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getBlogs, getBlogTags } from "@/lib/api/blogs";
import { BlogGrid } from "@/components/blogs/blog-grid";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchX, AlertCircle, Newspaper, X } from "lucide-react";
import { Search } from "lucide-react";
import type { Blog } from "@/types/blog";
import type { PaginationMeta } from "@/types/api";

export default function BlogsContent() {
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeTag, setActiveTag] = useState<string | null>(searchParams.get("tag"));
  const [sortBy, setSortBy] = useState("newest");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    getBlogTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const apiParams = {
      page,
      page_size: 12,
      is_published: true,
      search: search || undefined,
      tag: activeTag || undefined,
      sort_by: sortBy === "oldest" ? "oldest" : undefined,
    };

    let cancelled = false;
    let transitionTimer: ReturnType<typeof setTimeout> | undefined;

    const debounceTimer = setTimeout(() => {
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
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
      if (transitionTimer) clearTimeout(transitionTimer);
    };
  }, [page, search, activeTag, sortBy]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTagSelect = (tag: string | null) => {
    setActiveTag(tag);
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
                className="h-12 pl-14 text-sm bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Tag filter + sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleTagSelect(null)}
              className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                activeTag === null
                  ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(activeTag === tag ? null : tag)}
                className={`text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                onClick={() => handleTagSelect(null)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5"
              >
                <X className="h-3 w-3" />
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
              Try a different search term or tag.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <p className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{meta?.page ?? page}</span> of{" "}
                <span className="font-medium text-foreground">{meta?.total_pages ?? 1}</span> ·{" "}
                <span className="font-medium text-foreground">{meta?.total ?? 0}</span> blogs
                {activeTag && (
                  <> tagged <span className="font-medium text-foreground">{activeTag}</span></>
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
