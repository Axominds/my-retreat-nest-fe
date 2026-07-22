"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  getListingRequest,
  updateListingRequest,
  approveListingRequest,
  rejectListingRequest,
} from "@/lib/api/listing-requests";
import { getCategories } from "@/lib/api/categories";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () =>
    import("@/components/admin/location-picker").then(
      (m) => ({ default: m.LocationPicker }),
    ),
  { ssr: false },
);
import type { ListingRequest } from "@/types/listing-request";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  X,
  User,
  Mail,
  Building2,
  Phone,
  MapPin,
  DollarSign,
  Globe,
  Save,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminListingRequestDetailPage() {
  const { adminUser, isLoading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const requestId = Number(params.id);

  const [request, setRequest] = useState<ListingRequest | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveSlug, setApproveSlug] = useState("");
  const [approving, setApproving] = useState(false);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [form, setForm] = useState({
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    retreat_name: "",
    retreat_description: "",
    category_id: 0,
    retreat_email: "",
    retreat_phone: "",
    address: "",
    latitude: "",
    longitude: "",
    budget_min: "",
    budget_max: "",
    social_links_instagram: "",
    social_links_facebook: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fetched = useRef(false);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push("/admin/login");
    }
  }, [authLoading, adminUser, router]);

  useEffect(() => {
    if (authLoading || !adminUser || fetched.current || !requestId) return;
    fetched.current = true;

    Promise.all([getListingRequest(requestId), getCategories({ page_size: 100 })])
      .then(([r, c]) => {
        setRequest(r);
        setCategories(c.items);
        const links = r.social_links as Record<string, string> | undefined;
        setForm({
          owner_name: r.owner_name,
          owner_email: r.owner_email,
          owner_phone: r.owner_phone ?? "",
          retreat_name: r.retreat_name,
          retreat_description: r.retreat_description ?? "",
          category_id: r.category_id,
          retreat_email: r.retreat_email ?? "",
          retreat_phone: r.retreat_phone ?? "",
          address: r.address ?? "",
          latitude: String(r.latitude ?? ""),
          longitude: String(r.longitude ?? ""),
          budget_min: String(r.budget_min ?? ""),
          budget_max: String(r.budget_max ?? ""),
          social_links_instagram: links?.instagram ?? "",
          social_links_facebook: links?.facebook ?? "",
        });
      })
      .catch(() => toast.error("Failed to load listing request"))
      .finally(() => setLoading(false));
  }, [authLoading, adminUser, requestId]);

  function slugify(val: string) {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function openApprove() {
    setApproveSlug(slugify(form.retreat_name));
    setApproveDialogOpen(true);
  }

  async function handleApprove() {
    if (!request) return;
    setApproving(true);
    try {
      await approveListingRequest(requestId, approveSlug || undefined);
      setRequest((prev) => prev ? { ...prev, status: "approved" as const } : prev);
      setApproveDialogOpen(false);
      toast.success("Listing approved. Retreat created.");
    } catch {
      toast.error("Failed to approve listing");
    } finally {
      setApproving(false);
    }
  }

  function openReject() {
    setRejectReason("");
    setRejectDialogOpen(true);
  }

  async function handleReject() {
    if (!request) return;
    setRejecting(true);
    try {
      await rejectListingRequest(requestId, rejectReason || undefined);
      setRequest((prev) => prev ? { ...prev, status: "rejected" as const, rejection_reason: rejectReason || null } : prev);
      setRejectDialogOpen(false);
      toast.success("Listing request rejected.");
    } catch {
      toast.error("Failed to reject listing");
    } finally {
      setRejecting(false);
    }
  }

  async function handleSave() {
    const errs: Record<string, string> = {};
    if (!form.owner_name.trim()) errs.owner_name = "Owner name is required";
    if (!form.owner_email.trim()) errs.owner_email = "Owner email is required";
    if (!form.retreat_name.trim()) errs.retreat_name = "Retreat name is required";
    if (!form.category_id) errs.category = "Category is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const links: Record<string, string> = {};
      if (form.social_links_instagram) links.instagram = form.social_links_instagram;
      if (form.social_links_facebook) links.facebook = form.social_links_facebook;

      const updated = await updateListingRequest(requestId, {
        owner_name: form.owner_name || undefined,
        owner_email: form.owner_email || undefined,
        owner_phone: form.owner_phone || undefined,
        retreat_name: form.retreat_name || undefined,
        retreat_description: form.retreat_description || undefined,
        category_id: form.category_id || undefined,
        retreat_email: form.retreat_email || undefined,
        retreat_phone: form.retreat_phone || undefined,
        address: form.address || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        budget_min: form.budget_min ? Number(form.budget_min) : undefined,
        budget_max: form.budget_max ? Number(form.budget_max) : undefined,
        social_links: links,
      });
      setRequest(updated);
      toast.success("Listing request saved");
    } catch {
      toast.error("Failed to save listing request");
    } finally {
      setSaving(false);
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

  if (!request) {
    return (
      <div className="text-center py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
          <Info className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold">Listing request not found</p>
        <p className="text-sm text-muted-foreground mt-1">This listing request may have been deleted.</p>
        <Link href="/admin/listing-requests" className="text-primary hover:underline mt-4 inline-block font-medium">Back to listing requests</Link>
      </div>
    );
  }

  const categoryName = (id: number) => categories.find((c) => c.category_id === id)?.name ?? `Category ${id}`;
  const isPending = request.status === "pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/listing-requests">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{request.retreat_name}</h1>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium shrink-0 ${
          request.status === "approved"
            ? "bg-green-100 text-green-700"
            : request.status === "rejected"
            ? "bg-red-100 text-red-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {request.status === "approved" ? "Approved" : request.status === "rejected" ? "Rejected" : "Pending"}
        </span>
        {isPending && (
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" className="gap-1.5 text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 border-green-200" variant="outline" onClick={openApprove}>
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button size="sm" className="gap-1.5 text-destructive bg-red-50 hover:bg-red-100 border-red-200" variant="outline" onClick={openReject}>
              <X className="h-3.5 w-3.5" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Owner Info, Retreat Info, Contact & Location, Pricing, Social Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Owner Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="owner_name" value={form.owner_name} onChange={(e) => { setErrors({}); setForm((f) => ({ ...f, owner_name: e.target.value })); }} disabled={!isPending} />
                  {errors.owner_name && <p className="text-xs text-destructive">{errors.owner_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_email">
                    <Mail className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="owner_email" type="email" value={form.owner_email} onChange={(e) => { setErrors({}); setForm((f) => ({ ...f, owner_email: e.target.value })); }} disabled={!isPending} />
                  {errors.owner_email && <p className="text-xs text-destructive">{errors.owner_email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_phone">
                    <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Phone
                  </Label>
                  <Input id="owner_phone" value={form.owner_phone} onChange={(e) => setForm((f) => ({ ...f, owner_phone: e.target.value }))} disabled={!isPending} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retreat Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Retreat Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retreat_name">
                    Retreat Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="retreat_name" value={form.retreat_name} onChange={(e) => { setErrors({}); setForm((f) => ({ ...f, retreat_name: e.target.value })); }} disabled={!isPending} />
                  {errors.retreat_name && <p className="text-xs text-destructive">{errors.retreat_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={String(form.category_id)} onValueChange={(v) => { setErrors({}); setForm((f) => ({ ...f, category_id: Number(v) })); }} disabled={!isPending}>
                    <SelectTrigger id="category"><SelectValue placeholder="Select category">{form.category_id ? categoryName(form.category_id) : "Select category"}</SelectValue></SelectTrigger>
                    <SelectContent side="bottom" align="start">
                      {categories.map((c) => (
                        <SelectItem key={c.category_id} value={String(c.category_id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="retreat_description">Description</Label>
                  <Textarea
                    id="retreat_description"
                    value={form.retreat_description}
                    onChange={(e) => setForm((f) => ({ ...f, retreat_description: e.target.value }))}
                    disabled={!isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Location */}
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
                  <Label htmlFor="retreat_email">
                    <Mail className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Retreat Email
                  </Label>
                  <Input id="retreat_email" type="email" value={form.retreat_email} onChange={(e) => setForm((f) => ({ ...f, retreat_email: e.target.value }))} disabled={!isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retreat_phone">
                    <Phone className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Retreat Phone
                  </Label>
                  <Input id="retreat_phone" value={form.retreat_phone} onChange={(e) => setForm((f) => ({ ...f, retreat_phone: e.target.value }))} disabled={!isPending} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <LocationPicker
                    address={form.address}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onChange={(data) => { setErrors({}); setForm((f) => ({ ...f, ...data })); }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
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
                  <Input id="budget_min" type="number" step="0.01" value={form.budget_min} onChange={(e) => setForm((f) => ({ ...f, budget_min: e.target.value }))} disabled={!isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max">
                    <DollarSign className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />
                    Budget Max
                  </Label>
                  <Input id="budget_max" type="number" step="0.01" value={form.budget_max} onChange={(e) => setForm((f) => ({ ...f, budget_max: e.target.value }))} disabled={!isPending} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
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
                  <Label htmlFor="social_instagram">Instagram URL</Label>
                  <Input id="social_instagram" placeholder="https://instagram.com/..." value={form.social_links_instagram} onChange={(e) => setForm((f) => ({ ...f, social_links_instagram: e.target.value }))} disabled={!isPending} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="social_facebook">Facebook URL</Label>
                  <Input id="social_facebook" placeholder="https://facebook.com/..." value={form.social_links_facebook} onChange={(e) => setForm((f) => ({ ...f, social_links_facebook: e.target.value }))} disabled={!isPending} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Summary + Save */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="font-medium capitalize">{request.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Submitted</p>
                <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Owner</p>
                <p className="font-medium">{request.owner_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium">{request.owner_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Category</p>
                <p className="font-medium">{categoryName(request.category_id)}</p>
              </div>
              {request.retreat_id && (
                <div>
                  <p className="text-muted-foreground text-xs">Retreat ID</p>
                  <Link href={`/admin/retreats/${request.retreat_id}`} className="font-medium text-primary hover:underline">
                    View Retreat &rarr;
                  </Link>
                </div>
              )}
              {request.rejection_reason && (
                <div>
                  <p className="text-muted-foreground text-xs">Rejection Reason</p>
                  <p className="font-medium text-destructive">{request.rejection_reason}</p>
                </div>
              )}
              {isPending && (
                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={(open) => { if (!open) setApproveDialogOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Approve Listing
            </DialogTitle>
            <DialogDescription>
              This will create a retreat and send login credentials to{" "}
              <strong>{request.owner_email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              <p><strong>Retreat:</strong> {request.retreat_name}</p>
              <p><strong>Owner:</strong> {request.owner_name}</p>
              <p><strong>Email:</strong> {request.owner_email}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approve-slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="approve-slug"
                value={approveSlug}
                onChange={(e) => setApproveSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from retreat name. You can edit it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approving || !approveSlug.trim()}>
              {approving ? "Approving..." : "Approve & Create Retreat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={(open) => { if (!open) setRejectDialogOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              Reject Listing
            </DialogTitle>
            <DialogDescription>
              This will mark the listing request as rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted rounded-lg p-3 text-sm">
              <p><strong>Retreat:</strong> {request.retreat_name}</p>
              <p><strong>Owner:</strong> {request.owner_name}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-reason">Reason (optional)</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this listing was rejected..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejecting}>
              {rejecting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
