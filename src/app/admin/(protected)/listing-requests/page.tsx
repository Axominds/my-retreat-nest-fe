"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  getListingRequests,
  approveListingRequest,
  rejectListingRequest,
} from "@/lib/api/listing-requests";
import type { ListingRequest } from "@/types/listing-request";
import type { PaginationMeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { toast } from "sonner";
import {
  Check,
  X,
  Search,
  Mail,
  Pencil,
  Building2,
  Clock,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";

type SortKey = "newest" | "oldest";

export default function AdminListingRequestsPage() {
  const { adminUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<ListingRequest[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const [approveTarget, setApproveTarget] = useState<ListingRequest | null>(null);
  const [approveSlug, setApproveSlug] = useState("");
  const [approving, setApproving] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<ListingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push("/admin/login");
    }
  }, [authLoading, adminUser, router]);

  useEffect(() => {
    if (authLoading || !adminUser) return;

    const params: Record<string, string | number | boolean> = { page, page_size: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (sortKey === "oldest") params.sort_by = "oldest";

    getListingRequests(params)
      .then((r) => {
        setRequests(r.items);
        setMeta(r.meta);
      })
      .catch(() => toast.error("Failed to load listing requests"))
      .finally(() => setInitialLoading(false));
  }, [authLoading, adminUser, page, debouncedSearch, statusFilter, sortKey]);

  function slugify(val: string) {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function openApprove(r: ListingRequest) {
    setApproveSlug(slugify(r.retreat_name));
    setApproveTarget(r);
  }

  async function handleApprove() {
    if (!approveTarget) return;
    setApproving(true);
    try {
      const retreat = await approveListingRequest(
        approveTarget.listing_request_id,
        approveSlug || undefined
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.listing_request_id === approveTarget.listing_request_id
            ? { ...r, status: "approved" as const, retreat_id: retreat.retreat_id }
            : r
        )
      );
      setApproveTarget(null);
      toast.success("Listing approved. Retreat created.");
    } catch {
      toast.error("Failed to approve listing");
    } finally {
      setApproving(false);
    }
  }

  function openReject(r: ListingRequest) {
    setRejectReason("");
    setRejectTarget(r);
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await rejectListingRequest(
        rejectTarget.listing_request_id,
        rejectReason || undefined
      );
      setRequests((prev) =>
        prev.map((r) =>
          r.listing_request_id === rejectTarget.listing_request_id
            ? { ...r, status: "rejected" as const, rejection_reason: rejectReason || null }
            : r
        )
      );
      setRejectTarget(null);
      toast.success("Listing request rejected.");
    } catch {
      toast.error("Failed to reject listing");
    } finally {
      setRejecting(false);
    }
  }

  if (authLoading || initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Listing Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.total ?? requests.length} total
            {pendingCount > 0 && (
              <span> &middot; {pendingCount} pending</span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or retreat..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-40 bg-background">
                <SelectValue>
                  {statusFilter === "all" ? "All Status" : statusFilter === "pending" ? "Pending" : statusFilter === "approved" ? "Approved" : "Rejected"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" align="start">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortKey} onValueChange={(v) => { setSortKey(v as SortKey); setPage(1); }}>
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

      {/* List */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No listing requests</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {statusFilter !== "all" || searchQuery
              ? "No requests match your filters."
              : "No one has submitted a listing request yet."}
          </p>
          {(statusFilter !== "all" || searchQuery) && (
            <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPage(1); }} className="mt-6">
              <X className="h-4 w-4 mr-2" /> Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <div
              key={r.listing_request_id}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              {/* Icon */}
              <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/listing-requests/${r.listing_request_id}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {r.retreat_name}
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : r.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {r.status === "approved" ? "Approved" : r.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {r.owner_name} &lt;{r.owner_email}&gt;
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                {r.rejection_reason && (
                  <p className="text-xs text-destructive mt-1">
                    Reason: {r.rejection_reason}
                  </p>
                )}
                {r.retreat_id && (
                  <Link
                    href={`/admin/retreats/${r.retreat_id}`}
                    className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View retreat
                  </Link>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                {r.status === "pending" && (
                  <>
                    <Link href={`/admin/listing-requests/${r.listing_request_id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => openApprove(r)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openReject(r)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {meta && (
        <PaginationControls meta={meta} onPageChange={setPage} />
      )}
      </div>

      {/* Approve Dialog */}
      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => { if (!open) setApproveTarget(null); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Approve Listing
            </DialogTitle>
            <DialogDescription>
              This will create a retreat and send login credentials to{" "}
              <strong>{approveTarget?.owner_email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
              <p><strong>Retreat:</strong> {approveTarget?.retreat_name}</p>
              <p><strong>Owner:</strong> {approveTarget?.owner_name}</p>
              <p><strong>Email:</strong> {approveTarget?.owner_email}</p>
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
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={approving || !approveSlug.trim()}>
              {approving ? "Approving..." : "Approve & Create Retreat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => { if (!open) setRejectTarget(null); }}
      >
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
              <p><strong>Retreat:</strong> {rejectTarget?.retreat_name}</p>
              <p><strong>Owner:</strong> {rejectTarget?.owner_name}</p>
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
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejecting}>
              {rejecting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
