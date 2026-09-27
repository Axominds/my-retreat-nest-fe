"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getAmenities, setRetreatAmenities } from "@/lib/api/amenities";
import { getRetreat } from "@/lib/api/retreats";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import type { Amenity } from "@/types/amenity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AmenityChipSelector } from "@/components/admin/amenity-chip-selector";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  ExternalLink,
  Search,
  X,
  Sparkles,
  CheckCheck,
  Eraser,
} from "lucide-react";

type Scope = "all" | "selected" | "unselected";

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "selected", label: "Selected" },
  { value: "unselected", label: "Not selected" },
];

export default function TenantAdminAmenitiesPage() {
  const { retreatId, slug } = useTenantAdmin();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [initialSelected, setInitialSelected] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    Promise.all([getAmenities({ page_size: 100 }), getRetreat(retreatId)])
      .then(([all, retreat]) => {
        const loaded = retreat.amenities?.map((a) => a.amenity_id) ?? [];
        setAmenities(all.items ?? all);
        setSelected(loaded);
        setInitialSelected(loaded);
      })
      .catch(() => toast.error("Failed to load amenities"))
      .finally(() => setLoading(false));
  }, [retreatId]);

  // Order-insensitive comparison so re-picking the same set isn't "dirty".
  const isDirty = useMemo(() => {
    if (!initialSelected) return false;
    const a = [...initialSelected].sort();
    const b = [...selected].sort();
    return a.length !== b.length || a.some((v, i) => v !== b[i]);
  }, [initialSelected, selected]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return amenities.filter((a) => {
      if (q && !a.label.toLowerCase().includes(q)) return false;
      if (scope === "selected") return selected.includes(a.amenity_id);
      if (scope === "unselected") return !selected.includes(a.amenity_id);
      return true;
    });
  }, [amenities, query, scope, selected]);

  const visibleIds = useMemo(
    () => visible.map((a) => a.amenity_id),
    [visible]
  );

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  function selectAllVisible() {
    setSelected((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  function clearAll() {
    setSelected([]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await setRetreatAmenities(retreatId, selected);
      setInitialSelected(selected);
      toast.success(
        selected.length === 0
          ? "All amenities removed."
          : `Saved ${selected.length} ${selected.length === 1 ? "amenity" : "amenities"}.`
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const hasFilters = query.trim().length > 0 || scope !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold md:text-3xl">Amenities</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Choose what your retreat offers. These appear on your site and drive
            the filters on the marketplace.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          render={<Link href={`/sites/${slug}`} target="_blank" />}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Preview site
        </Button>
      </div>

      {amenities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </span>
            <div>
              <h3 className="font-semibold">No amenities available yet</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                The amenity list is managed centrally. Once options are added
                they&apos;ll appear here for you to pick from.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Toolbar */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search amenities…"
                    aria-label="Search amenities"
                    className="pl-9 pr-9"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div
                  className="flex items-center gap-1.5"
                  role="group"
                  aria-label="Filter amenities"
                >
                  {SCOPES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setScope(s.value)}
                      aria-pressed={scope === s.value}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        scope === s.value
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium tabular-nums text-foreground">
                    {selected.length}
                  </span>{" "}
                  of {amenities.length} selected
                  {hasFilters && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      &middot; {visible.length} shown
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllVisible}
                    disabled={allVisibleSelected || visibleIds.length === 0}
                  >
                    <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                    {hasFilters ? "Select shown" : "Select all"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    disabled={selected.length === 0}
                    className="hover:text-destructive"
                  >
                    <Eraser className="mr-1.5 h-3.5 w-3.5" />
                    Clear all
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Offered amenities</CardTitle>
                <Badge variant="secondary" className="tabular-nums text-xs">
                  {selected.length} selected
                </Badge>
              </div>
              <CardDescription>
                Selected amenities are highlighted below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
                  <p className="text-sm font-medium">Nothing to show here</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {query.trim()
                      ? `No amenities match “${query.trim()}”.`
                      : scope === "selected"
                        ? "You haven't selected any amenities yet."
                        : "Every amenity is already selected."}
                  </p>
                  {hasFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setQuery("");
                        setScope("all");
                      }}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Reset filters
                    </Button>
                  )}
                </div>
              ) : (
                <AmenityChipSelector
                  amenities={visible}
                  selected={selected}
                  onChange={setSelected}
                />
              )}

              <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <Button onClick={handleSave} disabled={saving || !isDirty}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save amenities
                </Button>
                {isDirty && (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    You have unsaved changes.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
