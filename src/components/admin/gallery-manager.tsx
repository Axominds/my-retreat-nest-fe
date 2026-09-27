"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getGalleries, uploadGallery, updateGallery, deleteGallery } from "@/lib/api/retreats";
import {
  getGalleryCategories,
  createGalleryCategory,
  updateGalleryCategory,
  deleteGalleryCategory,
} from "@/lib/api/gallery-categories";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  X,
  ImageIcon,
  FolderOpen,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Images,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface QueuedFile {
  key: string;
  file: File;
  url: string;
}

let queueSeq = 0;

export function GalleryManager({ retreatId }: { retreatId: number }) {
  const [items, setItems] = useState<RetreatGalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [caption, setCaption] = useState("");
  const [galleryCategoryId, setGalleryCategoryId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RetreatGalleryItem | null>(null);
  const [changingCategoryId, setChangingCategoryId] = useState<number | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<GalleryCategory | null>(null);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fetched = useRef(false);
  const queueRef = useRef<QueuedFile[]>([]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    Promise.all([
      getGalleries(retreatId, { page_size: 100 }),
      getGalleryCategories(retreatId),
    ])
      .then(([g, c]) => {
        setItems(g.items);
        setCategories(c);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load gallery"))
      .finally(() => setLoading(false));
  }, [retreatId]);

  // Preview URLs are created in the file-picker handler (not an effect) and
  // revoked on removal, on clear, and on unmount.
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((q) => URL.revokeObjectURL(q.url));
    };
  }, []);

  const filteredItems = selectedCategory
    ? items.filter((i) => i.gallery_category_id === selectedCategory)
    : items;

  const safeLightboxIndex =
    lightboxIndex != null && lightboxIndex < filteredItems.length
      ? lightboxIndex
      : null;

  const categoryCount = useCallback(
    (id: number | null) => items.filter((i) => i.gallery_category_id === id).length,
    [items]
  );

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ key: `q${++queueSeq}`, file, url: URL.createObjectURL(file) }));

    if (incoming.length === 0) {
      toast.error("Only image files can be added");
      return;
    }
    if (incoming.length !== list.length) {
      toast.warning("Skipped some non-image files");
    }
    setQueue((prev) => [...prev, ...incoming]);
  }

  function removeQueued(key: string) {
    setQueue((prev) => {
      const target = prev.find((q) => q.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((q) => q.key !== key);
    });
  }

  function clearQueue() {
    queue.forEach((q) => URL.revokeObjectURL(q.url));
    setQueue([]);
  }

  async function handleUpload() {
    if (queue.length === 0) {
      toast.error("Select at least one image");
      return;
    }
    if (!galleryCategoryId) {
      toast.error("Select a category");
      return;
    }

    setUploading(true);
    setUploadedCount(0);

    const succeeded: RetreatGalleryItem[] = [];
    const failed: QueuedFile[] = [];
    let lastError: unknown = null;

    // Sequential so a large batch can't flood the API, with live progress.
    for (const entry of queue) {
      const formData = new FormData();
      formData.append("image", entry.file);
      if (caption.trim()) formData.append("caption", caption.trim());
      formData.append("gallery_category_id", String(galleryCategoryId));
      try {
        succeeded.push(await uploadGallery(retreatId, formData));
      } catch (err) {
        failed.push(entry);
        lastError = err;
      }
      setUploadedCount(succeeded.length + failed.length);
    }

    if (succeeded.length > 0) {
      setItems((prev) => [...prev, ...succeeded]);
    }
    // Keep only the failures queued so they can be retried.
    failed.forEach((f) => URL.revokeObjectURL(f.url));
    setQueue(failed);
    setCaption("");
    setUploading(false);

    if (failed.length === 0) {
      toast.success(
        succeeded.length === 1
          ? "Image uploaded"
          : `${succeeded.length} images uploaded`
      );
    } else if (succeeded.length === 0) {
      toast.error(
        lastError instanceof ApiError ? lastError.message : "Failed to upload images"
      );
    } else {
      toast.warning(
        `${succeeded.length} uploaded, ${failed.length} failed — failures kept for retry`
      );
    }
  }

  async function handleDelete(item: RetreatGalleryItem) {
    try {
      await deleteGallery(retreatId, item.gallery_id);
      setItems((prev) => prev.filter((i) => i.gallery_id !== item.gallery_id));
      toast.success("Image deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete image");
    } finally {
      setDeleteConfirm(null);
    }
  }

  async function handleAddCategory(): Promise<GalleryCategory | null> {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return null;
    }
    try {
      const cat = await createGalleryCategory(retreatId, { name });
      setCategories((prev) => [...prev, cat]);
      setNewCategoryName("");
      setAddingCategory(false);
      toast.success(`Category "${cat.name}" added`);
      return cat;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add category");
      return null;
    }
  }

  async function handleDeleteCategory() {
    if (!deleteCategoryTarget) return;
    try {
      await deleteGalleryCategory(retreatId, deleteCategoryTarget.gallery_category_id);
      setCategories((prev) =>
        prev.filter((c) => c.gallery_category_id !== deleteCategoryTarget.gallery_category_id)
      );
      if (galleryCategoryId === deleteCategoryTarget.gallery_category_id) {
        setGalleryCategoryId(null);
      }
      if (selectedCategory === deleteCategoryTarget.gallery_category_id) {
        setSelectedCategory(null);
      }
      setDeleteCategoryTarget(null);
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete category");
    }
  }

  async function handleUpdateCategory(cat: GalleryCategory, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    try {
      const updated = await updateGalleryCategory(retreatId, cat.gallery_category_id, {
        name: trimmed,
      });
      setCategories((prev) =>
        prev.map((c) => (c.gallery_category_id === updated.gallery_category_id ? updated : c))
      );
      setEditingCatId(null);
      setEditingCatName("");
      toast.success("Category updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update category");
    }
  }

  async function handleReassign(item: RetreatGalleryItem, value: number) {
    try {
      const updated = await updateGallery(retreatId, item.gallery_id, {
        gallery_category_id: value,
      });
      setItems((prev) =>
        prev.map((i) => (i.gallery_id === item.gallery_id ? updated : i))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update category");
    } finally {
      setChangingCategoryId(null);
    }
  }

  const categoryName = (id: number | null) =>
    id ? categories.find((c) => c.gallery_category_id === id)?.name ?? null : null;

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i == null ? null : (i + 1) % filteredItems.length));
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i == null ? null : (i - 1 + filteredItems.length) % filteredItems.length
    );
  }, [filteredItems.length]);

  useEffect(() => {
    if (lightboxIndex == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Loading gallery...
        </CardContent>
      </Card>
    );
  }

  const totalInCategory = deleteCategoryTarget
    ? categoryCount(deleteCategoryTarget.gallery_category_id)
    : 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Left column: Upload + Categories */}
      <div className="w-full space-y-4 lg:w-1/3">
        {/* Add photos */}
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Images className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Add photos</h2>
                {queue.length > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {queue.length}
                  </span>
                )}
              </div>
              {queue.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={clearQueue}
                  disabled={uploading}
                >
                  Clear all
                </Button>
              )}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={cn(
                "rounded-xl border-2 border-dashed p-5 text-center transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Choose images</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                or drag and drop &middot; multiple supported
              </p>
              <input
                ref={fileRef}
                id="gallery-upload-input"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
              <label
                htmlFor="gallery-upload-input"
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                Browse files
              </label>
            </div>

            {queue.length > 0 && (
              <ul className="grid grid-cols-3 gap-2">
                {queue.map((q) => (
                  <li
                    key={q.key}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                  >
                    {/* Object URL for a local file, not yet persisted. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.url}
                      alt={q.file.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeQueued(q.key)}
                      disabled={uploading}
                      aria-label={`Remove ${q.file.name}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-1.5">
              <label htmlFor="gallery-caption" className="text-xs font-medium">
                Caption{queue.length > 1 ? " (applies to all)" : ""}{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Input
                id="gallery-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe this photo"
                disabled={uploading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="gallery-category" className="text-xs font-medium">
                  Category <span className="text-destructive">*</span>
                </label>
                {!addingCategory && (
                  <button
                    type="button"
                    onClick={() => setAddingCategory(true)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    New category
                  </button>
                )}
              </div>

              {addingCategory ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    maxLength={20}
                    placeholder="e.g. Rooms"
                    className="h-9 text-sm"
                    autoFocus
                    disabled={uploading}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const created = await handleAddCategory();
                        if (created) setGalleryCategoryId(created.gallery_category_id);
                      }
                      if (e.key === "Escape") {
                        setAddingCategory(false);
                        setNewCategoryName("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-9"
                    disabled={uploading}
                    onClick={async () => {
                      const created = await handleAddCategory();
                      if (created) setGalleryCategoryId(created.gallery_category_id);
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    disabled={uploading}
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <select
                  id="gallery-category"
                  value={galleryCategoryId ?? ""}
                  onChange={(e) =>
                    setGalleryCategoryId(e.target.value ? Number(e.target.value) : null)
                  }
                  disabled={uploading}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="" disabled>
                    {categories.length === 0
                      ? "Create a category first"
                      : "Select a category"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.gallery_category_id} value={c.gallery_category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={uploadedCount}
                  aria-valuemin={0}
                  aria-valuemax={queue.length}
                  aria-label="Upload progress"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${(uploadedCount / queue.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploading {uploadedCount} of {queue.length}…
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || queue.length === 0}
              className="w-full"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {uploading
                ? "Uploading…"
                : queue.length > 1
                  ? `Upload ${queue.length} images`
                  : "Upload image"}
            </Button>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Categories</h2>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {categories.length}
                </span>
              </div>
              {!addingCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setAddingCategory(true)}
                >
                  <Plus className="h-3 w-3" /> Add
                </Button>
              )}
            </div>

            {addingCategory && (
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  maxLength={20}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCategory();
                    if (e.key === "Escape") {
                      setAddingCategory(false);
                      setNewCategoryName("");
                    }
                  }}
                  className="h-8 flex-1 text-xs"
                  autoFocus
                />
                <Button size="sm" className="h-8 text-xs" onClick={handleAddCategory}>
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setAddingCategory(false);
                    setNewCategoryName("");
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No categories yet. Add one to start uploading photos.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const count = categoryCount(cat.gallery_category_id);
                  return editingCatId === cat.gallery_category_id ? (
                    <div
                      key={cat.gallery_category_id}
                      className="flex w-full items-center gap-1"
                    >
                      <Input
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        maxLength={20}
                        className="h-7 flex-1 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateCategory(cat, editingCatName);
                          if (e.key === "Escape") {
                            setEditingCatId(null);
                            setEditingCatName("");
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleUpdateCategory(cat, editingCatName)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingCatId(null);
                          setEditingCatName("");
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      key={cat.gallery_category_id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.gallery_category_id);
                          setEditingCatName(cat.name);
                        }}
                        className="hover:underline"
                      >
                        {cat.name}
                      </button>
                      <span className="text-[10px] text-primary/60">({count})</span>
                      <button
                        type="button"
                        onClick={() => setDeleteCategoryTarget(cat)}
                        aria-label={`Delete ${cat.name}`}
                        className="transition-colors hover:text-destructive"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column: Gallery grid */}
      <div className="w-full space-y-4 lg:w-2/3">
        {items.length > 0 && categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "image" : "images"} &middot;{" "}
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              aria-pressed={selectedCategory === null}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
                selectedCategory === null
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              All ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.gallery_category_id}
                type="button"
                onClick={() => setSelectedCategory(c.gallery_category_id)}
                aria-pressed={selectedCategory === c.gallery_category_id}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
                  selectedCategory === c.gallery_category_id
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {c.name} ({categoryCount(c.gallery_category_id)})
              </button>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Images className="h-6 w-6 text-muted-foreground" />
              </span>
              <p className="font-semibold">No photos yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {categories.length === 0
                  ? "Create a category, then add your first photos."
                  : "Choose a category and add your first photos."}
              </p>
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-semibold">No photos in this category</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setSelectedCategory(null)}
              >
                Show all photos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filteredItems.map((item, index) => (
              <Card key={item.gallery_id} className="overflow-hidden">
                <div
                  className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-muted"
                  onClick={() => setLightboxIndex(index)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(retreatId, item.gallery_id)}
                    alt={item.caption ?? "Gallery photo"}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="View photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxIndex(index);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          setLightboxIndex(index);
                        }
                      }}
                      className="rounded-full bg-white/90 p-2 text-black"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      aria-label="Delete photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item);
                      }}
                      className="rounded-full bg-white/90 p-2 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                      <p className="truncate text-xs text-white">{item.caption}</p>
                    </div>
                  )}
                </div>
                <CardContent className="space-y-1.5 p-2.5">
                  {item.caption && (
                    <p className="truncate text-xs text-muted-foreground">
                      {item.caption}
                    </p>
                  )}
                  {changingCategoryId === item.gallery_id ? (
                    <select
                      value={item.gallery_category_id}
                      onChange={(e) => handleReassign(item, Number(e.target.value))}
                      className="h-6 w-full rounded border border-input bg-background px-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                      autoFocus
                      onBlur={() => setChangingCategoryId(null)}
                    >
                      {categories.map((c) => (
                        <option
                          key={c.gallery_category_id}
                          value={c.gallery_category_id}
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setChangingCategoryId(item.gallery_id)}
                      disabled={categories.length === 0}
                      title={
                        categories.length === 0
                          ? "Create a category first"
                          : "Change category"
                      }
                      className={cn(
                        "rounded px-2 py-0.5 text-[11px] transition-colors",
                        categoryName(item.gallery_category_id)
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "border border-dashed border-muted-foreground/20 text-muted-foreground/50 hover:text-muted-foreground"
                      )}
                    >
                      {categoryName(item.gallery_category_id) ?? "Set category"}
                    </button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete image confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Delete photo</h3>
                <p className="text-sm text-muted-foreground">
                  This permanently removes the image. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete category confirm */}
      {deleteCategoryTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteCategoryTarget(null)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold">Delete category</h3>
                {totalInCategory > 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    &quot;{deleteCategoryTarget.name}&quot; still has{" "}
                    <span className="font-medium text-foreground">
                      {totalInCategory} {totalInCategory === 1 ? "photo" : "photos"}
                    </span>
                    . Move them to another category first — categories can only
                    be deleted when empty.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Are you sure you want to delete &quot;
                    {deleteCategoryTarget.name}&quot;?
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteCategoryTarget(null)}
              >
                {totalInCategory > 0 ? "Close" : "Cancel"}
              </Button>
              {totalInCategory > 0 ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(deleteCategoryTarget.gallery_category_id);
                    setDeleteCategoryTarget(null);
                  }}
                >
                  View {totalInCategory} {totalInCategory === 1 ? "photo" : "photos"}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCategory}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {safeLightboxIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative flex max-h-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getImageUrl(retreatId, filteredItems[safeLightboxIndex].gallery_id)}
              alt={
                filteredItems[safeLightboxIndex].caption ??
                "Gallery photo"
              }
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            {filteredItems[safeLightboxIndex].caption && (
              <p className="mt-3 text-center text-sm text-white">
                {filteredItems[safeLightboxIndex].caption}
              </p>
            )}
            <p className="mt-1 text-xs text-white/60">
              {safeLightboxIndex + 1} / {filteredItems.length}
              {selectedCategory && categoryName(selectedCategory)
                ? ` · ${categoryName(selectedCategory)}`
                : ""}
            </p>

            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous photo"
                  className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next photo"
                  className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
