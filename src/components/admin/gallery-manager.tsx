"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getGalleries, uploadGallery, deleteGallery } from "@/lib/api/retreats";
import {
  getGalleryCategories,
  createGalleryCategory,
  deleteGalleryCategory,
} from "@/lib/api/gallery-categories";
import { getImageUrl } from "@/lib/constants";
import type { RetreatGalleryItem, GalleryCategory } from "@/types/retreat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";
import {
  Trash2,
  Upload,
  Plus,
  X,
  ImageIcon,
  FolderOpen,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export function GalleryManager({ retreatId }: { retreatId: number }) {
  const [items, setItems] = useState<RetreatGalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [galleryCategoryId, setGalleryCategoryId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RetreatGalleryItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const fetched = useRef(false);

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

  const filteredItems = selectedCategory
    ? items.filter((i) => i.gallery_category_id === selectedCategory)
    : items;

  const categoryCount = (id: number | null) =>
    items.filter((i) => i.gallery_category_id === id).length;

  function resetUpload() {
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
    setGalleryCategoryId(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFileSelect(f: File | null) {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpload() {
    if (!file) {
      toast.error("Select an image");
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);
    if (caption) formData.append("caption", caption);
    if (galleryCategoryId) formData.append("gallery_category_id", String(galleryCategoryId));

    try {
      const item = await uploadGallery(retreatId, formData);
      setItems((prev) => [...prev, item]);
      resetUpload();
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
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

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    try {
      const cat = await createGalleryCategory(retreatId, { name });
      setCategories((prev) => [...prev, cat]);
      setNewCategoryName("");
      setAddingCategory(false);
      toast.success("Category added");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add category");
    }
  }

  async function handleDeleteCategory(cat: GalleryCategory) {
    if (!confirm(`Delete category "${cat.name}"? This won't delete the images.`)) return;
    try {
      await deleteGalleryCategory(retreatId, cat.gallery_category_id);
      setCategories((prev) => prev.filter((c) => c.gallery_category_id !== cat.gallery_category_id));
      if (galleryCategoryId === cat.gallery_category_id) setGalleryCategoryId(null);
      if (selectedCategory === cat.gallery_category_id) setSelectedCategory(null);
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete category");
    }
  }

  const categoryName = (id: number | null) =>
    id ? categories.find((c) => c.gallery_category_id === id)?.name ?? `Category ${id}` : null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex != null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex != null) {
      setLightboxIndex(
        (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    if (lightboxIndex == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, goNext, goPrev]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Loading gallery...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Upload Image</h2>
          </div>

          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f?.type.startsWith("image/")) {
                handleFileSelect(f);
              } else {
                toast.error("Please drop an image file");
              }
            }}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative mx-auto max-w-[200px] aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{file?.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP up to 10MB
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Caption</label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional caption..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={galleryCategoryId ?? ""}
                  onChange={(e) =>
                    setGalleryCategoryId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.gallery_category_id} value={c.gallery_category_id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!file || uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      {/* Categories Card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Categories</h2>
              <Badge variant="secondary" className="ml-1">
                {categories.length}
              </Badge>
            </div>
            {!addingCategory && (
              <Button variant="outline" size="sm" onClick={() => setAddingCategory(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            )}
          </div>

          {addingCategory && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                  if (e.key === "Escape") {
                    setAddingCategory(false);
                    setNewCategoryName("");
                  }
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleAddCategory}>
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingCategory(false);
                  setNewCategoryName("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories yet. Group your images by creating a category.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.gallery_category_id}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-full"
                >
                  {cat.name}
                  <span className="text-xs text-primary/60 ml-0.5">
                    ({categoryCount(cat.gallery_category_id)})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats + Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            <span>{items.length} image{items.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <span>{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</span>
          </div>
        </div>

        {items.length > 0 && categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              All ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.gallery_category_id}
                onClick={() => setSelectedCategory(cat.gallery_category_id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedCategory === cat.gallery_category_id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {cat.name} ({categoryCount(cat.gallery_category_id)})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">
            {selectedCategory
              ? "No images in this category"
              : "No images yet"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedCategory
              ? "Try selecting a different category"
              : "Upload your first image above"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <Card
              key={item.gallery_id}
              className="group overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={getImageUrl(retreatId, item.gallery_id)}
                  alt={item.caption ?? "Gallery image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="p-1.5 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors shadow-sm"
                    title="Preview"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(item)}
                    className="p-1.5 rounded-full bg-white/90 text-destructive hover:bg-white transition-colors shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{item.caption}</p>
                  </div>
                )}
              </div>
              <CardContent className="p-2.5 space-y-1.5">
                {item.caption && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.caption}
                  </p>
                )}
                {item.gallery_category_id && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded inline-block">
                    {categoryName(item.gallery_category_id)}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-background rounded-lg shadow-lg p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Delete Image</h3>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {filteredItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div
            className="max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(retreatId, filteredItems[lightboxIndex].gallery_id)}
              alt={filteredItems[lightboxIndex].caption ?? "Gallery image"}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
            {filteredItems[lightboxIndex].caption && (
              <p className="text-center text-white/80 text-sm mt-3">
                {filteredItems[lightboxIndex].caption}
              </p>
            )}
            <p className="text-center text-white/50 text-xs mt-1">
              {lightboxIndex + 1} / {filteredItems.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
