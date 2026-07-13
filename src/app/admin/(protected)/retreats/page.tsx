"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getRetreats, createRetreat, deleteRetreat } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Plus,
  ExternalLink,
  Search,
  SlidersHorizontal,
  MapPin,
  Mail,
  DollarSign,
  ArrowUpDown,
  AlertTriangle,
  Building2,
} from "lucide-react";

const STATIC_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=60",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=60",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=60",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60",
];

type SortKey = "name" | "newest" | "oldest" | "status";

export default function AdminRetreatsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [deleteTarget, setDeleteTarget] = useState<Retreat | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", category_id: 0, description: "", email: "", phone: "", address: "", latitude: "", longitude: "", budget_min: "", budget_max: "", social_links_instagram: "", social_links_facebook: "" });
  const fetched = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || fetched.current) return;
    fetched.current = true;

    Promise.all([getRetreats({ page_size: 100 }), getCategories()])
      .then(([r, c]) => {
        setRetreats(r.items);
        setCategories(c);
      })
      .catch(() => toast.error("Failed to load retreats"))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  const slugify = useCallback((val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
  []);

  const sortedRetreats = useMemo(() => {
    const sorted = [...retreats];
    switch (sortKey) {
      case "name": sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "newest": sorted.sort((a, b) => b.retreat_id - a.retreat_id); break;
      case "oldest": sorted.sort((a, b) => a.retreat_id - b.retreat_id); break;
      case "status": sorted.sort((a, b) => Number(b.is_published) - Number(a.is_published)); break;
    }
    return sorted;
  }, [retreats, sortKey]);

  const filteredRetreats = useMemo(() =>
    sortedRetreats.filter((r) => {
      if (categoryFilter !== "all" && r.category_id !== Number(categoryFilter)) return false;
      if (statusFilter === "published" && !r.is_published) return false;
      if (statusFilter === "draft" && r.is_published) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.slug?.toLowerCase().includes(q)) return false;
      }
      return true;
    }),
  [sortedRetreats, searchQuery, categoryFilter, statusFilter]);

  const isFiltered = searchQuery || categoryFilter !== "all" || statusFilter !== "all";

  function resetForm() {
    setForm({ name: "", slug: "", category_id: 0, description: "", email: "", phone: "", address: "", latitude: "", longitude: "", budget_min: "", budget_max: "", social_links_instagram: "", social_links_facebook: "" });
    setShowCreate(false);
  }

  async function handleCreate() {
    try {
      const links: Record<string, string> = {};
      if (form.social_links_instagram) links.instagram = form.social_links_instagram;
      if (form.social_links_facebook) links.facebook = form.social_links_facebook;

      const retreat = await createRetreat({
        name: form.name,
        slug: form.slug,
        category_id: form.category_id,
        description: form.description || null,
        email: form.email || null,
        phone: form.phone || null,
        address: form.address || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        social_links: links,
        is_published: true,
      });
      setRetreats((prev) => [retreat, ...prev]);
      resetForm();
      toast.success("Retreat created");
    } catch {
      toast.error("Failed to create retreat");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRetreat(deleteTarget.retreat_id);
      setRetreats((prev) => prev.filter((r) => r.retreat_id !== deleteTarget.retreat_id));
      setDeleteTarget(null);
      toast.success("Retreat deleted");
    } catch {
      toast.error("Failed to delete retreat");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const categoryName = (id: number) => categories.find((c) => c.category_id === id)?.name ?? `Category ${id}`;
  const publishedCount = retreats.filter((r) => r.is_published).length;
  const draftCount = retreats.filter((r) => !r.is_published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Retreats</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {retreats.length} total &middot; {publishedCount} published &middot; {draftCount} drafts
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Retreat
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search retreats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-40 bg-background"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent side="bottom" align="start">
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.category_id} value={String(c.category_id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full sm:w-32 bg-background"><SelectValue placeholder="All status" /></SelectTrigger>
              <SelectContent side="bottom" align="start">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="w-full sm:w-32 bg-background">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" align="start">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Retreat</DialogTitle>
            <DialogDescription>Fill in the details to create a new retreat.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dlg-name">Name <span className="text-destructive">*</span></Label>
              <Input id="dlg-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-slug">Slug <span className="text-destructive">*</span></Label>
              <Input id="dlg-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-category">Category <span className="text-destructive">*</span></Label>
              <Select value={String(form.category_id)} onValueChange={(v) => setForm((f) => ({ ...f, category_id: Number(v) }))}>
                <SelectTrigger id="dlg-category"><SelectValue placeholder="Select category">{form.category_id ? categoryName(form.category_id) : "Select category"}</SelectValue></SelectTrigger>
                <SelectContent side="bottom" align="start">
                  {categories.map((c) => (
                    <SelectItem key={c.category_id} value={String(c.category_id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-email">Email</Label>
              <Input id="dlg-email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-phone">Phone</Label>
              <Input id="dlg-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dlg-address">Address</Label>
              <Input id="dlg-address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-lat">Latitude</Label>
              <Input id="dlg-lat" type="number" step="any" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-lng">Longitude</Label>
              <Input id="dlg-lng" type="number" step="any" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-budget-min">Budget Min</Label>
              <Input id="dlg-budget-min" type="number" step="0.01" value={form.budget_min} onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-budget-max">Budget Max</Label>
              <Input id="dlg-budget-max" type="number" step="0.01" value={form.budget_max} onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-social-insta">Instagram URL</Label>
              <Input id="dlg-social-insta" placeholder="https://instagram.com/..." value={form.social_links_instagram} onChange={(e) => setForm((f) => ({ ...f, social_links_instagram: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-social-fb">Facebook URL</Label>
              <Input id="dlg-social-fb" placeholder="https://facebook.com/..." value={form.social_links_facebook} onChange={(e) => setForm((f) => ({ ...f, social_links_facebook: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dlg-desc">Description</Label>
              <textarea
                id="dlg-desc"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            <Button onClick={handleCreate}><Check className="h-4 w-4 mr-2" /> Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Retreat
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retreats Grid */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      {retreats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No retreats yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Get started by creating your first retreat.
          </p>
          <Button onClick={() => setShowCreate(true)} className="mt-6">
            <Plus className="h-4 w-4 mr-2" /> Create Your First Retreat
          </Button>
        </div>
      ) : filteredRetreats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No retreats match your filters</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your search, category, or status filters.
          </p>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setStatusFilter("all"); }} className="mt-6">
            <X className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRetreats.map((retreat, i) => (
            <div
              key={retreat.retreat_id}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted">
                <img
                  src={STATIC_IMAGES[i % STATIC_IMAGES.length]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/retreats/${retreat.retreat_id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {retreat.name}
                  </Link>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {categoryName(retreat.category_id)}
                  </Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    retreat.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {retreat.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  {retreat.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {retreat.address}
                    </span>
                  )}
                  {(retreat.budget_min != null || retreat.budget_max != null) && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {retreat.budget_min != null ? `$${retreat.budget_min}` : ""}
                      {retreat.budget_min != null && retreat.budget_max != null ? " - " : ""}
                      {retreat.budget_max != null ? `$${retreat.budget_max}` : ""}
                    </span>
                  )}
                  {retreat.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {retreat.email}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground/50">ID: {retreat.retreat_id}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <Link href={`/retreats/${retreat.retreat_id}`} target="_blank">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Link href={`/admin/retreats/${retreat.retreat_id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(retreat)} className="h-8 w-8 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}