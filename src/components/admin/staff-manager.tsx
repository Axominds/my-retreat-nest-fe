"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getRetreatUsers, createRetreatUser, deleteRetreatUser } from "@/lib/api/retreats";
import type { RetreatStaffMember } from "@/types/retreat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  Search,
  SearchX,
  X,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "manager", label: "Manager" },
  { value: "owner", label: "Owner" },
];

const ROLE_STYLES: Record<string, string> = {
  staff: "bg-sky-100 text-sky-700",
  manager: "bg-amber-100 text-amber-700",
  owner: "bg-emerald-100 text-emerald-700",
};

const roleLabel = (role: string) =>
  ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

function StaffRowSkeleton() {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <Skeleton className="h-3.5 w-32 max-w-full" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StaffManager({ retreatId }: { retreatId: number }) {
  const [staff, setStaff] = useState<RetreatStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RetreatStaffMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const fetched = useRef(false);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await getRetreatUsers(retreatId);
      setStaff(data);
    } catch {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [retreatId]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetchStaff();
  }, [fetchStaff]);

  const query = search.trim().toLowerCase();
  const filteredStaff = query
    ? staff.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query)
      )
    : staff;

  function resetForm() {
    setName("");
    setEmail("");
    setRole("staff");
    setErrors({});
  }

  async function handleAdd() {
    if (!name.trim() || !email.trim()) { toast.error("Name and email are required"); return; }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrors({ email: "Please enter a valid email address" });
      toast.error("Please enter a valid email address");
      return;
    }
    setAdding(true);
    try {
      const message = await createRetreatUser(retreatId, { name, email, role });
      const isConflict = message.includes("<");
      const plain = message.replace(/<[^>]+>/g, "").trim();
      if (isConflict) {
        toast.warning(plain || "User already exists with a different name");
      } else {
        toast.success(plain || "Staff added");
      }
      resetForm();
      await fetchStaff();
    } catch {
      toast.error("Failed to add staff");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(member: RetreatStaffMember) {
    setRemoveTarget(member);
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await deleteRetreatUser(retreatId, removeTarget.retreat_user_id);
      setStaff((prev) => prev.filter((m) => m.retreat_user_id !== removeTarget.retreat_user_id));
      toast.success("Staff removed");
      setRemoveTarget(null);
    } catch {
      toast.error("Failed to remove staff");
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_170px_auto] gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <StaffRowSkeleton />
          <StaffRowSkeleton />
          <StaffRowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/15">
        <div className="h-1 bg-gradient-to-r from-primary via-emerald-500 to-teal-400" />
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 ring-1 ring-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold leading-tight">Add Staff Member</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invite a team member to help manage this retreat
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Users className="h-3.5 w-3.5" />
              {staff.length} member{staff.length === 1 ? "" : "s"}
            </span>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_170px_auto] gap-4"
            onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
          >
            <div className="space-y-2">
              <Label htmlFor="staff-name">Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="staff-name"
                  placeholder="Full name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => { setErrors((er) => ({ ...er, email: "" })); setEmail(e.target.value); }}
                  aria-invalid={!!errors.email}
                  className="pl-9 bg-background"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select value={role} onValueChange={(v) => { if (v) setRole(v); }}>
                <SelectTrigger id="staff-role" className="w-full bg-background">
                  <SelectValue>
                    {ROLE_OPTIONS.find((o) => o.value === role)?.label ?? "Select role"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={!name.trim() || !email.trim() || adding}
                className="w-full md:w-auto"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />
                ) : (
                  <Plus data-icon="inline-start" />
                )}
                {adding ? "Adding..." : "Add Staff"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-sm font-semibold inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Team Members
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {query ? `${filteredStaff.length} of ${staff.length}` : staff.length}
              </span>
            </h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="staff-search"
              placeholder="Search staff by name or email..."
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 bg-background"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {staff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No staff assigned yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add your first team member using the form above
                </p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                  <SearchX className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No matches found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Nothing matches &ldquo;{search.trim()}&rdquo;
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              filteredStaff.map((member) => (
                <Card
                  key={member.retreat_user_id}
                  className="group transition-all duration-200 hover:shadow-md hover:border-primary/25 hover:bg-muted/30"
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground flex items-center justify-center text-sm font-semibold ring-2 ring-background shadow-sm">
                          {initialsOf(member.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {member.role && (
                          <span
                            className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                              ROLE_STYLES[member.role] ?? "bg-muted text-muted-foreground"
                            }`}
                          >
                            {roleLabel(member.role)}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(member)}
                          title={`Remove ${member.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Staff Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>{removeTarget?.name}</strong> ({removeTarget?.email}) from
              this retreat? They will lose access to manage it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove} disabled={removing}>
              {removing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {removing ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
