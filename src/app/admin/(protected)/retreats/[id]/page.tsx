"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getRetreat, updateRetreat, uploadRetreatThumbnail, uploadRetreatBanner } from "@/lib/api/retreats";
import { getCategories } from "@/lib/api/categories";
import type { Retreat } from "@/types/retreat";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveImageUrl } from "@/lib/constants";
import { toast } from "sonner";
import { ArrowLeft, Save, Image, Users, Info, MapPin, Mail, Phone, DollarSign, Globe, ExternalLink, ChevronDown, ChevronRight, Upload, X } from "lucide-react";
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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [showMapFields, setShowMapFields] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [savingThumbnail, setSavingThumbnail] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const fetched = useRef(false);

  const slugify = useCallback((val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
  []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || fetched.current || !retreatId) return;
    fetched.current = true;

    Promise.all([getRetreat(retreatId), getCategories({ page_size: 100 })])
      .then(([r, c]) => {
        setRetreat(r);
        setCategories(c.items);
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

  function handleNameChange(val: string) {
    setForm((f) => ({
      ...f,
      name: val,
      slug: slugManuallyEdited ? f.slug : slugify(val),
    }));
  }

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

  async function handleSaveThumbnail() {
    if (!thumbnailFile) return;
    setSavingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("image", thumbnailFile);
      const updated = await uploadRetreatThumbnail(retreatId, formData);
      setRetreat(updated);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      toast.success("Thumbnail uploaded");
    } catch {
      toast.error("Failed to upload thumbnail");
    } finally {
      setSavingThumbnail(false);
    }
  }

  async function handleSaveBanner() {
    if (!bannerFile) return;
    setSavingBanner(true);
    try {
      const formData = new FormData();
      formData.append("image", bannerFile);
      const updated = await uploadRetreatBanner(retreatId, formData);
      setRetreat(updated);
      setBannerFile(null);
      setBannerPreview(null);
      toast.success("Banner uploaded");
    } catch {
      toast.error("Failed to upload banner");
    } finally {
      setSavingBanner(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!retreat) {
    return (
      <div className="text-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
          <Info className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">Retreat not found</p>
        <p className="text-sm text-muted-foreground mt-1">This retreat may have been deleted.</p>
        <Link href="/admin/retreats" className="text-primary hover:underline mt-4 inline-block font-medium">Back to retreats</Link>
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/retreats">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{retreat.name}</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
            {categoryName(retreat.category_id)}
          </span>
        <Link href={`/retreats/${retreat.retreat_id}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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
        <div key="info-tab" className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Contact & Location, Pricing, Social Links */}
          <div className="lg:col-span-2 space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Contact & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Email
                    </Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Phone
                    </Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">
                      <MapPin className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Address
                    </Label>
                    <Input id="address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowMapFields(!showMapFields)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showMapFields ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      Coordinates
                    </button>
                    {showMapFields && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input id="latitude" type="number" step="any" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input id="longitude" type="number" step="any" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
                        </div>
                        {form.latitude && form.longitude && (
                          <div className="md:col-span-2">
                            <a
                              href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <MapPin className="h-3 w-3" />
                              View on Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">
                      <DollarSign className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Budget Min
                    </Label>
                    <Input id="budget_min" type="number" step="0.01" value={form.budget_min} onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">
                      <DollarSign className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Budget Max
                    </Label>
                    <Input id="budget_max" type="number" step="0.01" value={form.budget_max} onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social_instagram">
                      <Globe className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Instagram URL
                    </Label>
                    <Input id="social_instagram" placeholder="https://instagram.com/..." value={form.social_links_instagram} onChange={(e) => setForm((f) => ({ ...f, social_links_instagram: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social_facebook">
                      <Globe className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                      Facebook URL
                    </Label>
                    <Input id="social_facebook" placeholder="https://facebook.com/..." value={form.social_links_facebook} onChange={(e) => setForm((f) => ({ ...f, social_links_facebook: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Images + Basic Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Thumbnail */}
                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <div className="flex items-center gap-3">
                    {thumbnailPreview ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : retreat.thumbnail_image ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                        <img src={resolveImageUrl(retreat.thumbnail_image) ?? ""} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setThumbnailFile(f);
                        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
                        setThumbnailPreview(f ? URL.createObjectURL(f) : null);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => thumbnailInputRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {retreat.thumbnail_image ? "Change" : "Upload"}
                    </Button>
                    {thumbnailFile && (
                      <Button size="sm" onClick={handleSaveThumbnail} disabled={savingThumbnail}>
                        {savingThumbnail ? "Saving..." : "Save"}
                      </Button>
                    )}
                    {(thumbnailPreview || retreat.thumbnail_image) && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Banner */}
                <div className="space-y-2">
                  <Label>Banner</Label>
                  <div className="flex items-center gap-3">
                    {bannerPreview ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                        <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : retreat.banner_image ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                        <img src={resolveImageUrl(retreat.banner_image) ?? ""} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setBannerFile(f);
                        if (bannerPreview) URL.revokeObjectURL(bannerPreview);
                        setBannerPreview(f ? URL.createObjectURL(f) : null);
                      }}
                    />
                    <Button variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      {retreat.banner_image ? "Change" : "Upload"}
                    </Button>
                    {bannerFile && (
                      <Button size="sm" onClick={handleSaveBanner} disabled={savingBanner}>
                        {savingBanner ? "Saving..." : "Save"}
                      </Button>
                    )}
                    {(bannerPreview || retreat.banner_image) && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setBannerFile(null); setBannerPreview(null); }}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <Select value={String(form.category_id)} onValueChange={(v) => setForm((f) => ({ ...f, category_id: Number(v) }))}>
                    <SelectTrigger id="category"><SelectValue placeholder="Select category">{form.category_id ? categoryName(form.category_id) : "Select category"}</SelectValue></SelectTrigger>
                    <SelectContent side="bottom" align="start">
                      {categories.map((c) => (
                        <SelectItem key={c.category_id} value={String(c.category_id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                  <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug <span className="text-destructive">*</span></Label>
                  <Input id="slug" value={form.slug} onChange={(e) => { setSlugManuallyEdited(true); setForm((f) => ({ ...f, slug: e.target.value })); }} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))}
                    className={`text-xs px-3 py-1.5 rounded font-medium ${form.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {form.is_published ? "Published" : "Draft"}
                  </button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
                  <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "gallery" && (
        <div key="gallery-tab" className="animate-fade-in-up">
          <GalleryManager retreatId={retreatId} />
        </div>
      )}

      {tab === "staff" && (
        <div key="staff-tab" className="animate-fade-in-up">
          <StaffManager retreatId={retreatId} />
        </div>
      )}
    </div>
  );
}
