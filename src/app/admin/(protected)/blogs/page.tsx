"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { getBlogs, deleteBlog, updateBlog } from "@/lib/api/blogs";
import { resolveImageUrl } from "@/lib/constants";
import type { Blog } from "@/types/blog";
import type { PaginationMeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Search, AlertTriangle, Newspaper, Eye, EyeOff } from "lucide-react";

export default function AdminBlogsPage() {
  const { adminUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push("/admin/login");
    }
  }, [authLoading, adminUser, router]);

  useEffect(() => {
    if (authLoading || !adminUser) return;
    getBlogs({ page, page_size: 10, search: debouncedSearch || undefined })
      .then((res) => {
        setBlogs(res.items);
        setMeta(res.meta);
      })
      .catch(() => toast.error("Failed to load blogs"))
      .finally(() => setInitialLoading(false));
  }, [authLoading, adminUser, page, debouncedSearch]);

  async function handleTogglePublish(blog: Blog) {
    try {
      const updated = await updateBlog(blog.blog_id, { is_published: !blog.is_published });
      setBlogs((prev) => prev.map((b) => (b.blog_id === blog.blog_id ? updated : b)));
      toast.success(updated.is_published ? "Blog published" : "Blog unpublished");
    } catch {
      toast.error("Failed to update blog");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBlog(deleteTarget.blog_id);
      setBlogs((prev) => prev.filter((b) => b.blog_id !== deleteTarget.blog_id));
      setDeleteTarget(null);
      toast.success("Blog deleted");
    } catch {
      toast.error("Failed to delete blog");
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blogs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.total ?? blogs.length} total
          </p>
        </div>
        <Link href="/admin/blogs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Blog
          </Button>
        </Link>
      </div>

      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Blog
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
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

      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
              <Newspaper className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No blogs yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Write your first post to share stories with your visitors.
            </p>
            <Link href="/admin/blogs/new" className="mt-6">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Write Your First Blog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {blogs.map((blog) => (
              <div
                key={blog.blog_id}
                className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <div className="w-16 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                  {blog.cover_image ? (
                    <img src={resolveImageUrl(blog.cover_image) ?? ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{blog.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">/{blog.slug}</p>
                </div>
                <button
                  onClick={() => handleTogglePublish(blog)}
                  title={blog.is_published ? "Published — click to unpublish" : "Draft — click to publish"}
                >
                  <Badge variant={blog.is_published ? "default" : "secondary"} className="cursor-pointer">
                    {blog.is_published ? (
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Published</span>
                    ) : (
                      <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" /> Draft</span>
                    )}
                  </Badge>
                </button>
                <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/blogs/${blog.blog_id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(blog)} className="h-8 w-8 hover:text-destructive">
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
