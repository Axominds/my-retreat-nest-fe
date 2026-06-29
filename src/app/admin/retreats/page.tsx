"use client";

import { useEffect, useState, useRef } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Pencil, Trash2, X, Check, Plus, ExternalLink } from "lucide-react";

export default function AdminRetreatsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
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

  async function handleDelete(id: number) {
    if (!confirm("Delete this retreat?")) return;
    try {
      await deleteRetreat(id);
      setRetreats((prev) => prev.filter((r) => r.retreat_id !== id));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Retreats</h1>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Retreat
          </Button>
        )}
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select value={String(form.category_id)} onValueChange={(v) => setForm((f) => ({ ...f, category_id: Number(v) }))}>
                  <SelectTrigger id="category"><SelectValue placeholder="Select category">{categoryName(form.category_id) || "Select category"}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.category_id} value={String(c.category_id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_min">Budget Min</Label>
                <Input id="budget_min" type="number" step="0.01" value={form.budget_min} onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Budget Max</Label>
                <Input id="budget_max" type="number" step="0.01" value={form.budget_max} onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram URL</Label>
                <Input id="social_instagram" placeholder="https://instagram.com/..." value={form.social_links_instagram} onChange={(e) => setForm((f) => ({ ...f, social_links_instagram: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="social_facebook">Facebook URL</Label>
                <Input id="social_facebook" placeholder="https://facebook.com/..." value={form.social_links_facebook} onChange={(e) => setForm((f) => ({ ...f, social_links_facebook: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}><Check className="h-4 w-4 mr-2" /> Create</Button>
              <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {retreats.map((retreat) => (
          <Card key={retreat.retreat_id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{retreat.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {categoryName(retreat.category_id)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${retreat.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {retreat.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  {retreat.slug && <p className="text-sm text-muted-foreground">/{retreat.slug}</p>}
                </div>
                <div className="flex gap-1">
                  <Link href={`/retreats/${retreat.retreat_id}`} target="_blank">
                    <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                  </Link>
                  <Link href={`/admin/retreats/${retreat.retreat_id}`}>
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(retreat.retreat_id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
