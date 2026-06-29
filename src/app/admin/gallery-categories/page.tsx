"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { getGalleryCategories, createGalleryCategory, updateGalleryCategory, deleteGalleryCategory } from "@/lib/api/gallery-categories";
import type { GalleryCategory } from "@/types/retreat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Pencil, Trash2, X, Check, Plus } from "lucide-react";

export default function AdminGalleryCategoriesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || fetched.current) return;
    fetched.current = true;

    getGalleryCategories()
      .then(setItems)
      .catch(() => toast.error("Failed to load gallery categories"))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  function resetForm() {
    setName("");
    setEditingId(null);
    setShowCreate(false);
  }

  async function handleCreate() {
    if (!name.trim()) { toast.error("Name is required"); return; }
    try {
      const item = await createGalleryCategory({ name });
      setItems((prev) => [...prev, item]);
      resetForm();
      toast.success("Gallery category created");
    } catch {
      toast.error("Failed to create gallery category");
    }
  }

  async function handleUpdate() {
    if (!editingId || !name.trim()) { toast.error("Name is required"); return; }
    try {
      const updated = await updateGalleryCategory(editingId, { name });
      setItems((prev) => prev.map((i) => (i.gallery_category_id === editingId ? updated : i)));
      resetForm();
      toast.success("Gallery category updated");
    } catch {
      toast.error("Failed to update gallery category");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this gallery category?")) return;
    try {
      await deleteGalleryCategory(id);
      setItems((prev) => prev.filter((i) => i.gallery_category_id !== id));
      toast.success("Gallery category deleted");
    } catch {
      toast.error("Failed to delete gallery category");
    }
  }

  function startEdit(item: GalleryCategory) {
    setEditingId(item.gallery_category_id);
    setShowCreate(false);
    setName(item.name);
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gallery Categories</h1>
        {!showCreate && editingId === null && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Gallery Category
          </Button>
        )}
      </div>

      {showCreate && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}><Check className="h-4 w-4 mr-2" /> Create</Button>
              <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.gallery_category_id}>
            <CardContent className="pt-6">
              {editingId === item.gallery_category_id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name <span className="text-destructive">*</span></Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate}><Check className="h-4 w-4 mr-2" /> Save</Button>
                    <Button variant="outline" onClick={resetForm}><X className="h-4 w-4 mr-2" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.gallery_category_id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
