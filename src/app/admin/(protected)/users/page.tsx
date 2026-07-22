"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { getUsers, deleteUser } from "@/lib/api/users";
import type { User } from "@/types/user";
import type { PaginationMeta } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationControls } from "@/components/retreats/pagination-controls";
import { Trash2, Search, AlertTriangle, UsersIcon, X, Mail, Phone, Shield, ArrowUpDown } from "lucide-react";

export default function AdminUsersPage() {
  const { adminUser, isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sortOrder, setSortOrder] = useState<"name" | "newest">("newest");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push("/admin/login");
    }
  }, [authLoading, adminUser, router]);

  useEffect(() => {
    if (authLoading || !adminUser) return;
    const sortOpts = sortOrder === "name"
      ? { sort_by: "name", sort_order: "asc" }
      : { sort_by: "user_id", sort_order: "desc" };
    getUsers({
      page,
      page_size: 10,
      search: debouncedSearch || undefined,
      ...sortOpts,
    })
      .then((res) => {
        setUsers(res.items);
        setMeta(res.meta);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setInitialLoading(false));
  }, [authLoading, adminUser, page, debouncedSearch, sortOrder]);

  async function handleDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.user_id === currentUser?.user_id) {
      toast.error("You cannot delete yourself");
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteUser(deleteTarget.user_id);
      setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget.user_id));
      setDeleteTarget(null);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  }

  function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.total ?? users.length} total
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-card border rounded-xl p-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex gap-2.5">
            <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v as typeof sortOrder); setPage(1); }}>
              <SelectTrigger className="w-32 bg-background">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" align="start">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This action cannot be undone.
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

      {/* Users List */}
      <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
            <UsersIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {searchQuery ? "No users match your search" : "No users found"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {searchQuery ? "Try a different search term." : "Users will appear here once they register."}
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => { setSearchQuery(""); setPage(1); }} className="mt-6">
              <X className="h-4 w-4 mr-2" /> Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{u.name}</p>
                  {u.user_id === currentUser?.user_id && (
                    <span className="text-[11px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">You</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {u.email}
                  </span>
                  {u.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {u.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {u.login_type}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget(u)}
                  disabled={u.user_id === currentUser?.user_id}
                  className="h-8 w-8 hover:text-destructive"
                  title={u.user_id === currentUser?.user_id ? "You cannot delete yourself" : "Delete user"}
                >
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