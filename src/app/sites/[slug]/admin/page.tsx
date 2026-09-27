"use client";

import { useEffect, useRef, useState } from "react";
import {
  getRetreat,
  updateRetreat,
  uploadRetreatThumbnail,
  uploadRetreatBanner,
} from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageUrl } from "@/lib/constants";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () =>
    import("@/components/admin/location-picker").then(
      (m) => ({ default: m.LocationPicker }),
    ),
  { ssr: false },
);
import { Save, Upload, Loader2 } from "lucide-react";

export default function TenantAdminOverviewPage() {
  const { retreatId } = useTenantAdmin();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category_id: 0,
    description: "",
    email: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
    budget_min: "",
    budget_max: "",
    social_links_instagram: "",
    social_links_facebook: "",
    is_published: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [savingImages, setSavingImages] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    Promise.all([getRetreat(retreatId), getCategories({ page_size: 100 })])
      .then(([r, c]) => {
        setRetreat(r);
        setCategories(c.items);
        setCategoriesReady(true);
        const links = r.social_links as Record<string, string> | undefined;
        setForm({
          name: r.name,
          category_id: r.category_id,
          description: r.description ?? "",
          email: r.email,
          phone: r.phone,
          address: r.address ?? "",
          latitude: String(r.latitude),
          longitude: String(r.longitude),
          budget_min: r.budget_min != null ? String(r.budget_min) : "",
          budget_max: r.budget_max != null ? String(r.budget_max) : "",
          social_links_instagram: links?.instagram ?? "",
          social_links_facebook: links?.facebook ?? "",
          is_published: r.is_published,
        });
      })
      .catch(() => toast.error("Failed to load retreat"))
      .finally(() => setLoading(false));
  }, [retreatId]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (form.category_id && !categories.some((c) => c.category_id === form.category_id)) {
      toast.error("Pick a valid category first.");
      return;
    }
    setSaving(true);
    try {
      const social_links: Record<string, string> = {};
      if (form.social_links_instagram.trim()) social_links.instagram = form.social_links_instagram.trim();
      if (form.social_links_facebook.trim()) social_links.facebook = form.social_links_facebook.trim();
      const updated = await updateRetreat(retreatId, {
        name: form.name.trim(),
        description: form.description || null,
        category_id: form.category_id || undefined,
        email: form.email,
        phone: form.phone,
        address: form.address || null,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        budget_min: form.budget_min ? Number(form.budget_min) : null,
        budget_max: form.budget_max ? Number(form.budget_max) : null,
        social_links,
        is_published: form.is_published,
      });
      setRetreat(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveImages() {
    if (!thumbnailFile && !bannerFile) return;
    setSavingImages(true);
    try {
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append("image", thumbnailFile);
        const updated = await uploadRetreatThumbnail(retreatId, fd);
        setRetreat(updated);
        setThumbnailFile(null);
      }
      if (bannerFile) {
        const fd = new FormData();
        fd.append("image", bannerFile);
        const updated = await uploadRetreatBanner(retreatId, fd);
        setRetreat(updated);
        setBannerFile(null);
      }
      setCacheBust((n) => n + 1);
      toast.success("Images updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload images");
    } finally {
      setSavingImages(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!retreat) {
    return <p className="text-muted-foreground">Couldn&apos;t load this retreat.</p>;
  }

  const thumbnailUrl = resolveImageUrl(retreat.thumbnail_image);
  const bannerUrl = resolveImageUrl(retreat.banner_image);
  // Explicit label: Base UI's SelectValue falls back to the raw id when no
  // item matches at render time, so derive the text from loaded categories.
  const selectedCategory = categories.find((c) => c.category_id === form.category_id) ?? null;
  const categoryLabel = !categoriesReady
    ? "Loading categories…"
    : (selectedCategory?.name ?? (form.category_id ? "Unknown category — pick a new one" : "Select category"));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Edit what visitors see on your site. Subdomain: <span className="font-mono">{retreat.slug}.…</span> (contact support to change it)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Basic info, contact, pricing and visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={String(form.category_id)}
                onValueChange={(v) => set("category_id", Number(v))}
                disabled={!categoriesReady}
              >
                <SelectTrigger>
                  <span className={!selectedCategory ? "text-muted-foreground" : undefined}>
                    {categoryLabel}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.category_id} value={String(c.category_id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoriesReady && form.category_id !== 0 && !selectedCategory && (
                <p className="text-xs text-destructive">
                  This category no longer exists — choose a new one before saving.
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <LocationPicker
            address={form.address}
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(data) => {
              setForm((f) => ({
                ...f,
                latitude: String(data.latitude),
                longitude: String(data.longitude),
                address: data.address,
              }));
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Budget min</Label>
              <Input
                type="number"
                value={form.budget_min}
                onChange={(e) => set("budget_min", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Budget max</Label>
              <Input
                type="number"
                value={form.budget_max}
                onChange={(e) => set("budget_max", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input value={form.social_links_instagram} onChange={(e) => set("social_links_instagram", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input value={form.social_links_facebook} onChange={(e) => set("social_links_facebook", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => set("is_published", !form.is_published)}
              className={`text-xs px-3 py-1.5 rounded font-medium ${form.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {form.is_published ? "Published" : "Draft"}
            </button>
            <p className="text-xs text-muted-foreground">
              Unpublished sites return 404 on your subdomain.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Thumbnail (cards) and banner (homepage hero).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              {thumbnailUrl && (
                <img
                  src={`${thumbnailUrl}${cacheBust ? `?v=${cacheBust}` : ""}`}
                  alt="Thumbnail"
                  className="h-32 w-full object-cover rounded-lg border"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Banner</Label>
              {bannerUrl && (
                <img
                  src={`${bannerUrl}${cacheBust ? `?v=${cacheBust}` : ""}`}
                  alt="Banner"
                  className="h-32 w-full object-cover rounded-lg border"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSaveImages}
            disabled={savingImages || (!thumbnailFile && !bannerFile)}
          >
            {savingImages ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload images
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
