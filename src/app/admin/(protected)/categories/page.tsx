"use client";

import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { getCategories, createCategory, updateCategory, deleteCategory, uploadCategoryThumbnail } from "@/lib/api/categories";
import { resolveImageUrl } from "@/lib/constants";
import type { Category } from "@/types/category";
import type { PaginationMeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { Pencil, Trash2, X, Check, Plus, Search, AlertTriangle, FolderTree, Upload, ImageIcon } from "lucide-react";

export default function AdminCategoriesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    setLoading(true);
    getCategories({ page, page_size: 10, search: debouncedSearch || undefined })
      .then((res) => {
        setCategories(res.items);
        setMeta(res.meta);
      })
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, page, debouncedSearch]);

  function resetForm() {
    setForm({ name: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try {
      const cat = await createCategory({ name: form.name, description: form.description || null });
      setCategories((prev) => [...prev, cat]);
      resetForm();
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  }

  async function handleUpdate() {
    if (!editingId || !form.name.trim()) { toast.error("Name is required"); return; }
    try {
      const updated = await updateCategory(editingId, { name: form.name, description: form.description || null });
      setCategories((prev) => prev.map((c) => (c.category_id === editingId ? updated : c)));
      toast.success("Category updated");
      resetForm();
    } catch {
      toast.error("Failed to update category");
    }
  }

  async function handleSaveImage() {
    if (!editingId || !imageFile) return;
    setSavingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const withImage = await uploadCategoryThumbnail(editingId, formData);
      setCategories((prev) => prev.map((c) => (c.category_id === editingId ? withImage : c)));
      setImageFile(null);
      setImagePreview(null);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload image");
    } finally {
      setSavingImage(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.category_id);
      setCategories((prev) => prev.filter((c) => c.category_id !== deleteTarget.category_id));
      setDeleteTarget(null);
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.category_id);
    setShowCreate(false);
    setForm({ name: cat.name, description: cat.description ?? "" });
    setImageFile(null);
    setImagePreview(null);
  }

  function handleImageSelect(f: File | null) {
    setImageFile(f);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const editingCategory = editingId ? categories.find((c) => c.category_id === editingId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.total ?? categories.length} total
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
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
            <DialogTitle>New Category</DialogTitle>
            <DialogDescription>Create a new retreat category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dlg-name">Name <span className="text-destructive">*</span></Label>
              <Input id="dlg-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dlg-desc">Description</Label>
              <Input id="dlg-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
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
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category details and image.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name <span className="text-destructive">*</span></Label>
              <Input id="edit-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input id="edit-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : editingCategory?.thumbnail_image ? (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                    <img src={resolveImageUrl(editingCategory.thumbnail_image) ?? ""} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
                />
                <Button variant="outline" size="sm" onClick={() => imageRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  {editingCategory?.thumbnail_image ? "Change" : "Upload"}
                </Button>
                {imageFile && (
                  <Button size="sm" onClick={handleSaveImage} disabled={savingImage}>
                    {savingImage ? "Saving..." : "Save"}
                  </Button>
                )}
                {(imagePreview || editingCategory?.thumbnail_image) && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            <Button onClick={handleUpdate}>
              <Check className="h-4 w-4 mr-2" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Category
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

      {/* Categories List */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <FolderTree className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No categories yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first category to organize retreats.
          </p>
          <Button onClick={() => setShowCreate(true)} className="mt-6">
            <Plus className="h-4 w-4 mr-2" /> Create Your First Category
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No categories match your search</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try a different search term.
          </p>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setPage(1); }} className="mt-6">
            <X className="h-4 w-4 mr-2" /> Clear Search
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.category_id}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                {cat.thumbnail_image ? (
                  <img src={resolveImageUrl(cat.thumbnail_image) ?? ""} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderTree className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{cat.name}</p>
                {cat.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{cat.description}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => startEdit(cat)} className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)} className="h-8 w-8 hover:text-destructive">
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