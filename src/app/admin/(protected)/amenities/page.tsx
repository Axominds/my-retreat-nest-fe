"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { getAmenities, createAmenity, updateAmenity, deleteAmenity } from "@/lib/api/amenities";
import type { Amenity } from "@/types/amenity";
import type { PaginationMeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, X, Check, Plus, Search, AlertTriangle, Sparkles } from "lucide-react";

export default function AdminAmenitiesPage() {
  const { adminUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Amenity | null>(null);
  const [form, setForm] = useState({ label: "" });

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push("/admin/login");
    }
  }, [authLoading, adminUser, router]);

  useEffect(() => {
    if (authLoading || !adminUser) return;
    getAmenities({ page, page_size: 10, search: debouncedSearch || undefined })
      .then((res) => {
        setAmenities(res.items);
        setMeta(res.meta);
      })
      .catch(() => toast.error("Failed to load amenities"))
      .finally(() => setInitialLoading(false));
  }, [authLoading, adminUser, page, debouncedSearch]);

  function resetForm() {
    setForm({ label: "" });
    setEditingId(null);
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!form.label.trim()) { toast.error("Label is required"); return; }
    try {
      const amenity = await createAmenity({ label: form.label });
      setAmenities((prev) => [...prev, amenity]);
      resetForm();
      toast.success("Amenity created");
    } catch {
      toast.error("Failed to create amenity");
    }
  }

  async function handleUpdate() {
    if (!editingId || !form.label.trim()) { toast.error("Label is required"); return; }
    try {
      const result = await updateAmenity(editingId, { label: form.label });
      setAmenities((prev) => prev.map((a) => (a.amenity_id === editingId ? result : a)));
      toast.success("Amenity updated");
      resetForm();
    } catch {
      toast.error("Failed to update amenity");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAmenity(deleteTarget.amenity_id);
      setAmenities((prev) => prev.filter((a) => a.amenity_id !== deleteTarget.amenity_id));
      setDeleteTarget(null);
      toast.success("Amenity deleted");
    } catch {
      toast.error("Failed to delete amenity");
    }
  }

  function startEdit(amenity: Amenity) {
    setEditingId(amenity.amenity_id);
    setShowCreate(false);
    setForm({ label: amenity.label });
  }

  if (authLoading || initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Amenities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.total ?? amenities.length} total
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Amenity
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search amenities..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Amenity</DialogTitle>
            <DialogDescription>Create a new amenity that retreats can offer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dlg-label">Label <span className="text-destructive">*</span></Label>
              <Input id="dlg-label" placeholder="e.g. Swimming Pool" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            <Button onClick={handleCreate}><Check className="h-4 w-4 mr-2" /> Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Amenity</DialogTitle>
            <DialogDescription>Update the amenity label.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label <span className="text-destructive">*</span></Label>
              <Input id="edit-label" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            <Button onClick={handleUpdate}><Check className="h-4 w-4 mr-2" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Amenity
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.label}</strong>? This will remove it from any retreats that use it. This action cannot be undone.
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

      {/* Amenities List */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      {amenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No amenities yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first amenity to let retreats showcase what they offer.
          </p>
          <Button onClick={() => setShowCreate(true)} className="mt-6">
            <Plus className="h-4 w-4 mr-2" /> Create Your First Amenity
          </Button>
        </div>
      ) : searchQuery && amenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No amenities match your search</h3>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setPage(1); }} className="mt-6">
            <X className="h-4 w-4 mr-2" /> Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {amenities.map((amenity) => (
            <div
              key={amenity.amenity_id}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{amenity.label}</p>
              </div>
              <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => startEdit(amenity)} className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(amenity)} className="h-8 w-8 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {meta && (
        <PaginationControls meta={meta} onPageChange={setPage} />
      )}
      </div>
    </div>
  );
}
