"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageUrl, ROOT_DOMAIN } from "@/lib/constants";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () =>
    import("@/components/admin/location-picker").then((m) => ({
      default: m.LocationPicker,
    })),
  { ssr: false },
);
import { Save, Loader2, ExternalLink, ImageIcon, Check } from "lucide-react";

type FormState = {
  name: string;
  category_id: number;
  description: string;
  email: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  budget_min: string;
  budget_max: string;
  social_links_instagram: string;
  social_links_facebook: string;
  is_published: boolean;
};

function toFormState(r: Retreat): FormState {
  const links = r.social_links as Record<string, string> | undefined;
  return {
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
  };
}

/** Data-URL preview of a just-picked file. State is only written from the
    async onload, and a preview is dropped unless it matches the current
    selection, so no URL is ever leaked or shown against a stale file. */
function useFilePreview(file: File | null): string | null {
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null
  );

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = () => {
      if (!cancelled) setPreview({ file, url: String(reader.result) });
    };
    reader.readAsDataURL(file);
    return () => {
      cancelled = true;
    };
  }, [file]);

  return preview && preview.file === file ? preview.url : null;
}

export default function TenantAdminOverviewPage() {
  const { retreatId, slug, isManager } = useTenantAdmin();
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [cacheBust, setCacheBust] = useState(0);
  const fetched = useRef(false);

  // Immediate local preview of a just-picked file.
  const thumbnailPreview = useFilePreview(thumbnailFile);
  const bannerPreview = useFilePreview(bannerFile);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    Promise.all([getRetreat(retreatId), getCategories({ page_size: 100 })])
      .then(([r, c]) => {
        setRetreat(r);
        setForm(toFormState(r));
        setCategories(c.items);
        setCategoriesReady(true);
      })
      .catch(() => toast.error("Failed to load retreat"))
      .finally(() => setLoading(false));
  }, [retreatId]);

  const isDirty = useMemo(
    () =>
      !!form &&
      !!retreat &&
      (JSON.stringify(form) !== JSON.stringify(toFormState(retreat)) ||
        !!thumbnailFile ||
        !!bannerFile),
    [form, retreat, thumbnailFile, bannerFile]
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!form) return;
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (
      form.category_id &&
      !categories.some((c) => c.category_id === form.category_id)
    ) {
      toast.error("Pick a valid category first.");
      return;
    }
    setSaving(true);
    try {
      const social_links: Record<string, string> = {};
      if (form.social_links_instagram.trim())
        social_links.instagram = form.social_links_instagram.trim();
      if (form.social_links_facebook.trim())
        social_links.facebook = form.social_links_facebook.trim();

      let updated = await updateRetreat(retreatId, {
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

      // Images ride along with the same save so one button covers everything.
      const hadImages = !!thumbnailFile || !!bannerFile;
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append("image", thumbnailFile);
        updated = await uploadRetreatThumbnail(retreatId, fd);
      }
      if (bannerFile) {
        const fd = new FormData();
        fd.append("image", bannerFile);
        updated = await uploadRetreatBanner(retreatId, fd);
      }

      setRetreat(updated);
      setForm(toFormState(updated));
      setThumbnailFile(null);
      setBannerFile(null);
      setCacheBust((n) => n + 1);
      toast.success(hadImages ? "Profile and images saved." : "Profile updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
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
  const selectedCategory =
    categories.find((c) => c.category_id === form.category_id) ?? null;
  const categoryLabel = !categoriesReady
    ? "Loading categories…"
    : (selectedCategory?.name ??
      (form.category_id
        ? "Unknown category — pick a new one"
        : "Select category"));

  const publicHost = `${slug}.${ROOT_DOMAIN}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-2xl font-bold md:text-3xl">
              {retreat.name}
            </h1>
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5 text-xs",
                retreat.is_published
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  retreat.is_published ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
              {retreat.is_published ? "Live" : "Draft"}
            </Badge>
            {isManager && (
              <Badge variant="secondary" className="text-xs capitalize">
                {`You are the manager`}
              </Badge>
            )}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="font-mono">{publicHost}</span>
            </span>
            <span className="hidden sm:inline text-muted-foreground/40">|</span>
            <span>Subdomain is fixed — contact support to change it.</span>
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

      <div className="space-y-6">
        {/* Profile */}
        <Card id="profile">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Basic info, contact, pricing and visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ov-name">Name</Label>
                <Input
                  id="ov-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ov-category">Category</Label>
                <Select
                  value={String(form.category_id)}
                  onValueChange={(v) => set("category_id", Number(v))}
                  disabled={!categoriesReady}
                >
                  <SelectTrigger id="ov-category">
                    <span
                      className={!selectedCategory ? "text-muted-foreground" : undefined}
                    >
                      {categoryLabel}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem
                        key={c.category_id}
                        value={String(c.category_id)}
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesReady &&
                  form.category_id !== 0 &&
                  !selectedCategory && (
                    <p className="text-xs text-destructive">
                      This category no longer exists — choose a new one
                      before saving.
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ov-description">Description</Label>
              <Textarea
                id="ov-description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Appears on your site and in marketplace search results.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ov-email">Email</Label>
                <Input
                  id="ov-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ov-phone">Phone</Label>
                <Input
                  id="ov-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ov-address">Address</Label>
              <Input
                id="ov-address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>

            <LocationPicker
              address={form.address}
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(data) => {
                setForm((f) =>
                  f
                    ? {
                        ...f,
                        latitude: String(data.latitude),
                        longitude: String(data.longitude),
                        address: data.address,
                      }
                    : f
                );
              }}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ov-budget-min">Budget min</Label>
                <Input
                  id="ov-budget-min"
                  type="number"
                  value={form.budget_min}
                  onChange={(e) => set("budget_min", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ov-budget-max">Budget max</Label>
                <Input
                  id="ov-budget-max"
                  type="number"
                  value={form.budget_max}
                  onChange={(e) => set("budget_max", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ov-instagram">Instagram URL</Label>
                <Input
                  id="ov-instagram"
                  placeholder="https://instagram.com/..."
                  value={form.social_links_instagram}
                  onChange={(e) =>
                    set("social_links_instagram", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ov-facebook">Facebook URL</Label>
                <Input
                  id="ov-facebook"
                  placeholder="https://facebook.com/..."
                  value={form.social_links_facebook}
                  onChange={(e) =>
                    set("social_links_facebook", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3.5">
              <button
                type="button"
                role="switch"
                aria-checked={form.is_published}
                aria-label="Publish this site"
                onClick={() => set("is_published", !form.is_published)}
                className={cn(
                  "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  form.is_published ? "bg-primary" : "bg-input"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
                    form.is_published ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {form.is_published
                    ? "Your site is live"
                    : "Your site is hidden"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.is_published
                    ? "Visitors can reach it on your subdomain."
                    : "Unpublished sites return 404 on your subdomain."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || !isDirty}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save profile
              </Button>
              {isDirty && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  You have unsaved changes.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card id="images">
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Thumbnail (cards) and banner (homepage hero). Saved together with
              your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(
                [
                    {
                      id: "ov-thumbnail",
                      label: "Thumbnail",
                      ratio: "Square crop, used on cards",
                      url: thumbnailUrl,
                      local: thumbnailPreview,
                      file: thumbnailFile,
                      setFile: setThumbnailFile,
                    },
                    {
                      id: "ov-banner",
                      label: "Banner",
                      ratio: "Wide crop, used as the hero",
                      url: bannerUrl,
                      local: bannerPreview,
                      file: bannerFile,
                      setFile: setBannerFile,
                    },

                ] as const
              ).map((slot) => (
                <div key={slot.id} className="space-y-2">
                  <Label htmlFor={slot.id}>{slot.label}</Label>
                  {/* Whole preview area is the picker — native input is
                      visually hidden but stays focusable and labelled. */}
                  <label
                    className="group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/40 outline-none transition-colors hover:border-primary/60 hover:bg-primary/5 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped?.type.startsWith("image/")) slot.setFile(dropped);
                    }}
                  >
                    {slot.local || slot.url ? (
                      <>
                        <img
                          src={
                            slot.local
                              ? slot.local
                              : `${slot.url}${cacheBust ? `?v=${cacheBust}` : ""}`
                          }
                          alt={slot.label}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-black">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Change {slot.label.toLowerCase()}
                          </span>
                        </div>
                        {slot.file && (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
                            <Check className="h-3 w-3" /> New
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                          <ImageIcon className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-medium">
                          Click to upload {slot.label.toLowerCase()}
                        </span>
                        <span className="px-4 text-center text-xs text-muted-foreground">
                          or drag and drop &middot; {slot.ratio}
                        </span>
                      </>
                    )}
                    <input
                      id={slot.id}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => slot.setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {slot.file && (
                    <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      {slot.file.name} — saved with your profile
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
