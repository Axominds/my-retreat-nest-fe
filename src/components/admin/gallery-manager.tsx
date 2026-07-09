"use client";

import { useEffect, useState, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Upload, Plus, X } from "lucide-react";

export function GalleryManager({ retreatId }: { retreatId: number }) {
  const [items, setItems] = useState<RetreatGalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [galleryCategoryId, setGalleryCategoryId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
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
      .catch(() => toast.error("Failed to load gallery"))
      .finally(() => setLoading(false));
  }, [retreatId]);

  function resetUpload() {
    setFile(null);
    setCaption("");
    setGalleryCategoryId(null);
    if (fileRef.current) fileRef.current.value = "";
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
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item: RetreatGalleryItem) {
    if (!confirm("Delete this image?")) return;
    try {
      await deleteGallery(retreatId, item.gallery_id);
      setItems((prev) => prev.filter((i) => i.gallery_id !== item.gallery_id));
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
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
    } catch {
      toast.error("Failed to add category");
    }
  }

  async function handleDeleteCategory(cat: GalleryCategory) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteGalleryCategory(retreatId, cat.gallery_category_id);
      setCategories((prev) => prev.filter((c) => c.gallery_category_id !== cat.gallery_category_id));
      if (galleryCategoryId === cat.gallery_category_id) {
        setGalleryCategoryId(null);
      }
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
  }

  const categoryName = (id: number | null) =>
    id ? categories.find((c) => c.gallery_category_id === id)?.name ?? `Category ${id}` : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading gallery...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-medium">Upload Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gallery-file">Image</Label>
              <Input
                id="gallery-file"
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-caption">Caption</Label>
              <Input
                id="gallery-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gallery-category">Category</Label>
              <Select
                value={galleryCategoryId ? String(galleryCategoryId) : ""}
                onValueChange={(v) => setGalleryCategoryId(v ? Number(v) : null)}
              >
                <SelectTrigger id="gallery-category">
                  <SelectValue placeholder="None">
                    {galleryCategoryId
                      ? categories.find((c) => c.gallery_category_id === galleryCategoryId)?.name
                      : "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.gallery_category_id} value={String(c.gallery_category_id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            <Upload className="h-4 w-4 mr-2" /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Categories</h2>
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

          <div className="flex flex-wrap gap-2">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
            {categories.map((cat) => (
              <span
                key={cat.gallery_category_id}
                className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm px-2.5 py-1 rounded-full"
              >
                {cat.name}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">No images yet.</p>
        )}
        {items.map((item) => (
          <Card key={item.gallery_id}>
            <CardContent className="p-2 space-y-2">
              <div className="aspect-video bg-muted rounded overflow-hidden">
                <img
                  src={getImageUrl(retreatId, item.gallery_id)}
                  alt={item.caption ?? "Gallery image"}
                  className="w-full h-full object-cover"
                />
              </div>
              {item.caption && (
                <p className="text-xs text-muted-foreground truncate">{item.caption}</p>
              )}
              {item.gallery_category_id && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded inline-block">
                  {categoryName(item.gallery_category_id)}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleDelete(item)}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
