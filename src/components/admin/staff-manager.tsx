"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  getRetreatUsers,
  createRetreatUser,
  updateRetreatUser,
  deleteRetreatUser,
} from "@/lib/api/retreats";
import type { RetreatStaffMember } from "@/types/retreat";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
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
  Crown,
  UserCog,
  UserRound,
} from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff", icon: UserRound },
  { value: "manager", label: "Manager", icon: UserCog },
  { value: "owner", label: "Owner", icon: Crown },
];

const ROLE_STYLES: Record<string, string> = {
  staff: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  manager:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  owner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

// Owners first, then managers, then staff; alphabetical within each group.
const ROLE_ORDER: Record<string, number> = { owner: 0, manager: 1, staff: 2 };

const roleLabel = (role: string) =>
  ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;

const initialsOf = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "?";
};

export function StaffManager({
  retreatId,
  canManage = true,
}: {
  retreatId: number;
  /** owner/manager may invite, change roles, and remove. View-only otherwise. */
  canManage?: boolean;
}) {
  const [staff, setStaff] = useState<RetreatStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [adding, setAdding] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RetreatStaffMember | null>(
    null
  );
  const [removing, setRemoving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);
  const fetched = useRef(false);

  const fetchStaff = useCallback(async () => {
    try {
      const data = await getRetreatUsers(retreatId);
      setStaff(data);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to load staff"
      );
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
  const filteredStaff = useMemo(() => {
    const list = query
      ? staff.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.email.toLowerCase().includes(query) ||
            (m.role ?? "").toLowerCase().includes(query)
        )
      : staff;
    return [...list].sort((a, b) => {
      const ra = ROLE_ORDER[a.role ?? ""] ?? 3;
      const rb = ROLE_ORDER[b.role ?? ""] ?? 3;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [staff, query]);

  const ownerCount = useMemo(
    () => staff.filter((m) => m.role?.toLowerCase() === "owner").length,
    [staff]
  );

  /** Removing the only owner would leave the retreat unmanageable. */
  const isLastOwner = useCallback(
    (m: RetreatStaffMember) =>
      m.role?.toLowerCase() === "owner" && ownerCount <= 1,
    [ownerCount]
  );

  function resetForm() {
    setName("");
    setEmail("");
    setRole("staff");
    setErrors({});
  }

  async function handleAdd() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    setAdding(true);
    try {
      const message = await createRetreatUser(retreatId, {
        name: name.trim(),
        email: email.trim(),
        role,
      });
      // The backend returns 202 with an HTML-tagged message when the email is
      // already registered under a different name.
      const isConflict = message.includes("<strong>");
      const plain = message.replace(/<[^>]+>/g, "").trim();
      if (isConflict) {
        toast.warning(plain || "That email is already registered under another name");
      } else {
        toast.success(plain || "Team member added");
      }
      resetForm();
      setInviteOpen(false);
      await fetchStaff();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to add team member"
      );
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(
    member: RetreatStaffMember,
    nextRole: string
  ) {
    setSavingRoleId(member.retreat_user_id);
    try {
      const updated = await updateRetreatUser(
        retreatId,
        member.retreat_user_id,
        { role: nextRole }
      );
      setStaff((prev) =>
        prev.map((m) => (m.retreat_user_id === member.retreat_user_id ? updated : m))
      );
      toast.success(
        `${member.name} is now ${roleLabel(nextRole).toLowerCase()}`
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to change role"
      );
    } finally {
      setSavingRoleId(null);
      setEditingRoleId(null);
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await deleteRetreatUser(retreatId, removeTarget.retreat_user_id);
      setStaff((prev) =>
        prev.filter((m) => m.retreat_user_id !== removeTarget.retreat_user_id)
      );
      toast.success(`${removeTarget.name} removed`);
      setRemoveTarget(null);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to remove member"
      );
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32 max-w-full" />
                    <Skeleton className="h-3 w-48 max-w-full" />
                  </div>
                  <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 ring-1 ring-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold leading-tight">Team members</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {staff.length} {staff.length === 1 ? "person" : "people"} can
                manage this retreat
              </p>
            </div>
          </div>
          {canManage && (
            <Button onClick={() => setInviteOpen(true)}>
              <Plus data-icon="inline-start" />
              Invite member
            </Button>
          )}
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="staff-search"
              placeholder="Search by name, email, or role..."
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No team members yet</p>
              <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
                {canManage
                  ? "Invite someone to help you manage this retreat."
                  : "Nobody else has been added to this retreat yet."}
              </p>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setInviteOpen(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Invite member
                </Button>
              )}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <SearchX className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No matches found</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Nothing matches &ldquo;{query}&rdquo;
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredStaff.map((member) => {
                const lastOwner = isLastOwner(member);
                const isEditingRole = editingRoleId === member.retreat_user_id;
                const RoleIcon =
                  ROLE_OPTIONS.find((o) => o.value === member.role)?.icon ??
                  UserRound;

                return (
                  <li key={member.retreat_user_id}>
                    <Card className="group transition-all duration-200 hover:border-primary/25 hover:bg-muted/30 hover:shadow-md">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-sm font-semibold text-primary-foreground shadow-sm ring-2 ring-background">
                              {initialsOf(member.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {member.name}
                              </p>
                              <p className="inline-flex items-center gap-1 truncate text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 shrink-0" />
                                {member.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {isEditingRole ? (
                              <select
                                value={member.role ?? ""}
                                disabled={savingRoleId === member.retreat_user_id}
                                onChange={(e) =>
                                  handleRoleChange(member, e.target.value)
                                }
                                onBlur={() => setEditingRoleId(null)}
                                aria-label={`Change role for ${member.name}`}
                                className="h-7 rounded-md border border-input bg-background px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                autoFocus
                              >
                                {ROLE_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingRoleId(member.retreat_user_id)}
                                disabled={!canManage}
                                title={
                                  canManage
                                    ? "Change role"
                                    : "Only owners and managers can change roles"
                                }
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                  ROLE_STYLES[member.role ?? ""] ??
                                    "bg-muted text-muted-foreground",
                                  canManage &&
                                    "cursor-pointer transition-opacity hover:opacity-80"
                                )}
                              >
                                <RoleIcon className="h-3 w-3" />
                                {member.role ? roleLabel(member.role) : "No role"}
                              </button>
                            )}

                            {canManage && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground opacity-60 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                                onClick={() => setRemoveTarget(member)}
                                title={
                                  lastOwner
                                    ? `${member.name} is the only owner`
                                    : `Remove ${member.name}`
                                }
                                aria-label={`Remove ${member.name}`}
                              >
                                <Trash2 />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              They&apos;ll be able to sign in and manage this retreat. If the
              email is new, a temporary password is created for them.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="staff-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-name"
                  placeholder="Full name"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => {
                    setErrors((er) => ({ ...er, email: "" }));
                    setEmail(e.target.value);
                  }}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "staff-email-error" : undefined}
                  className="bg-background pl-9"
                />
              </div>
              {errors.email && (
                <p id="staff-email-error" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v)}>
                <SelectTrigger id="staff-role" className="w-full bg-background">
                  <SelectValue>
                    {ROLE_OPTIONS.find((o) => o.value === role)?.label ??
                      "Select role"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Owners and managers can invite people and change roles. Staff
                can update the listing content.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInviteOpen(false);
                  resetForm();
                }}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !email.trim() || adding}
              >
                {adding ? (
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    data-icon="inline-start"
                  />
                ) : (
                  <Plus className="mr-2 h-4 w-4" data-icon="inline-start" />
                )}
                {adding ? "Adding..." : "Add member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {removeTarget && isLastOwner(removeTarget)
                ? "Can't remove the only owner"
                : "Remove team member"}
            </DialogTitle>
            <DialogDescription>
              {removeTarget && isLastOwner(removeTarget) ? (
                <>
                  <strong>{removeTarget.name}</strong> is the only owner of this
                  retreat. Promote another member to owner first, otherwise
                  nobody will be able to manage this listing.
                </>
              ) : (
                <>
                  Remove <strong>{removeTarget?.name}</strong> (
                  {removeTarget?.email})? They&apos;ll immediately lose access to
                  manage this retreat.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              disabled={removing}
            >
              {removeTarget && isLastOwner(removeTarget) ? "Close" : "Cancel"}
            </Button>
            {!(removeTarget && isLastOwner(removeTarget)) && (
              <Button
                variant="destructive"
                onClick={handleConfirmRemove}
                disabled={removing}
              >
                {removing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {removing ? "Removing..." : "Remove"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
