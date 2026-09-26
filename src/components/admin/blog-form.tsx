"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getBlog, createBlog, updateBlog, uploadBlogCover, deleteBlogCover } from "@/lib/api/blogs";
import { resolveImageUrl } from "@/lib/constants";
import type { Blog } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { ArrowLeft, Upload, ImageIcon, Eye, EyeOff } from "lucide-react";

const BlogEditor = dynamic(
  () => import("@/components/admin/blog-editor").then((m) => m.BlogEditor),
  { ssr: false, loading: () => <Skeleton className="h-[380px] w-full rounded-xl" /> }
);

function slugifyInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

interface BlogFormProps {
  blogId?: number;
}

export function BlogForm({ blogId }: BlogFormProps) {
  const router = useRouter();
  const isEdit = blogId !== undefined;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null | undefined>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const [imageCacheBust, setImageCacheBust] = useState(0);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEdit) return;
    getBlog(blogId)
      .then((b: Blog) => {
        setTitle(b.title);
        setSlug(b.slug);
        setSlugTouched(true);
        setExcerpt(b.excerpt ?? "");
        setContent(b.content);
        setTags(b.tags ?? "");
        setIsPublished(b.is_published);
        setCoverImage(b.cover_image ?? null);
      })
      .catch(() => toast.error("Failed to load blog"))
      .finally(() => setLoading(false));
  }, [isEdit, blogId]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyInput(value));
    }
  };

  const handleImageSelect = (f: File | null) => {
    setImageFile(f);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSaveCover = async (id: number) => {
    if (!imageFile) return;
    setSavingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const updated = await uploadBlogCover(id, formData);
      setCoverImage(updated.cover_image ?? null);
      setImageFile(null);
      setImagePreview(null);
      setImageCacheBust(Date.now());
      toast.success("Cover uploaded");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload cover");
    } finally {
      setSavingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) { toast.error("Content is required"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await updateBlog(blogId, {
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || null,
          content,
          tags: tags.trim() || null,
          is_published: isPublished,
        });
        if (imageFile) await handleSaveCover(blogId);
        toast.success("Blog updated");
        router.push("/admin/blogs");
      } else {
        const created = await createBlog({
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || null,
          content,
          tags: tags.trim() || null,
          is_published: isPublished,
        });
        if (imageFile) {
          const formData = new FormData();
          formData.append("image", imageFile);
          try {
            await uploadBlogCover(created.blog_id, formData);
          } catch {
            toast.error("Blog created, but cover upload failed");
          }
        }
        toast.success("Blog created");
        router.push("/admin/blogs");
      }
    } catch {
      toast.error(isEdit ? "Failed to update blog" : "Failed to create blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/blogs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? "Edit Blog" : "New Blog"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEdit ? "Update the post details and content." : "Write and publish a new post."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPublished((v) => !v)}
            title={isPublished ? "Published — click to unpublish" : "Draft — click to publish"}
          >
            {isPublished ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {isPublished ? "Published" : "Draft"}
          </Button>
          <Button onClick={handleSave} disabled={saving || savingImage}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create blog"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Title <span className="text-destructive">*</span></Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="A calming weekend in the hills"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-content">Content <span className="text-destructive">*</span></Label>
            <BlogEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4 space-y-4 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                placeholder="a-calming-weekend-in-the-hills"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from the title. Leave blank to auto-generate on create.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-excerpt">Excerpt</Label>
              <Textarea
                id="blog-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary shown on cards…"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blog-tags">Tags</Label>
              <Input
                id="blog-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="yoga, wellness, travel"
              />
              <p className="text-xs text-muted-foreground">Comma-separated.</p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div>
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
            <Label>Cover image</Label>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border bg-muted shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : coverImage ? (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border bg-muted shrink-0">
                  <img src={`${resolveImageUrl(coverImage)}?t=${imageCacheBust}`} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-14 rounded-lg border bg-muted flex items-center justify-center shrink-0">
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
                {coverImage || imagePreview ? "Change" : "Upload"}
              </Button>
            </div>
            {isEdit && imageFile && (
              <Button size="sm" onClick={() => handleSaveCover(blogId)} disabled={savingImage}>
                {savingImage ? "Saving…" : "Save cover"}
              </Button>
            )}
            {isEdit && !imageFile && coverImage && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={async () => {
                  try {
                    const updated = await deleteBlogCover(blogId);
                    setCoverImage(updated.cover_image ?? null);
                    setImageCacheBust(Date.now());
                    toast.success("Cover removed");
                  } catch {
                    toast.error("Failed to remove cover");
                  }
                }}
              >
                Remove cover
              </Button>
            )}
            {!isEdit && imagePreview && (
              <p className="text-xs text-muted-foreground">Cover uploads with the blog on create.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
