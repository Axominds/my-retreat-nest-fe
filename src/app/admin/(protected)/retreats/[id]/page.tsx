"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getRetreat, updateRetreat } from "@/lib/api/retreats";
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
import { ArrowLeft, Save, Image, Users, Info } from "lucide-react";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { StaffManager } from "@/components/admin/staff-manager";

type Tab = "info" | "gallery" | "staff";

export default function AdminRetreatDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const retreatId = Number(params.id);

  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState({
    name: "", slug: "", category_id: 0, description: "",
    email: "", phone: "", address: "",
    latitude: "", longitude: "",
    budget_min: "", budget_max: "",
    social_links_instagram: "", social_links_facebook: "",
    is_published: true,
  });
  const fetched = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || fetched.current || !retreatId) return;
    fetched.current = true;

    Promise.all([getRetreat(retreatId), getCategories()])
      .then(([r, c]) => {
        setRetreat(r);
        setCategories(c);
        const links = r.social_links as Record<string, string> | undefined;
        setForm({
          name: r.name,
          slug: r.slug,
          category_id: r.category_id,
          description: r.description ?? "",
          email: r.email ?? "",
          phone: r.phone ?? "",
          address: r.address ?? "",
          latitude: String(r.latitude ?? ""),
          longitude: String(r.longitude ?? ""),
          budget_min: String(r.budget_min ?? ""),
          budget_max: String(r.budget_max ?? ""),
          social_links_instagram: links?.instagram ?? "",
          social_links_facebook: links?.facebook ?? "",
          is_published: r.is_published,
        });
      })
      .catch(() => toast.error("Failed to load retreat"))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, retreatId]);

  async function handleSave() {
    setSaving(true);
    try {
      const links: Record<string, string> = {};
      if (form.social_links_instagram) links.instagram = form.social_links_instagram;
      if (form.social_links_facebook) links.facebook = form.social_links_facebook;

      const updated = await updateRetreat(retreatId, {
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
        is_published: form.is_published,
      });
      setRetreat(updated);
      toast.success("Retreat saved");
    } catch {
      toast.error("Failed to save retreat");
    } finally {
      setSaving(false);
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

  if (!retreat) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Retreat not found</p>
        <Link href="/admin/retreats" className="text-primary hover:underline mt-2 inline-block">Back to retreats</Link>
      </div>
    );
  }

  const categoryName = (id: number) => categories.find((c) => c.category_id === id)?.name ?? `Category ${id}`;

  const tabs: { key: Tab; label: string; icon: typeof Info }[] = [
    { key: "info", label: "Info", icon: Info },
    { key: "gallery", label: "Gallery", icon: Image },
    { key: "staff", label: "Staff", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/retreats">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">{retreat.name}</h1>
      </div>

      <div className="flex gap-1 border-b">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "info" && (
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
              <div className="space-y-2 md:col-span-2">
                <Label>Status</Label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                  className={`text-xs px-3 py-1.5 rounded font-medium ${form.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {form.is_published ? "Published" : "Draft"}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "gallery" && <GalleryManager retreatId={retreatId} />}

      {tab === "staff" && <StaffManager retreatId={retreatId} />}
    </div>
  );
}
