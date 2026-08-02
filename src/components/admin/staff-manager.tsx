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
import { toast } from "sonner";
import {
  Trash2,
  Plus,
  User as UserIcon,
  Mail,
  ShieldCheck,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";

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

export function StaffManager({ retreatId }: { retreatId: number }) {
  const [staff, setStaff] = useState<RetreatStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [adding, setAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RetreatStaffMember | null>(null);
  const [removing, setRemoving] = useState(false);
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

  function resetForm() {
    setName("");
    setEmail("");
    setRole("staff");
  }

  async function handleAdd() {
    if (!name.trim() || !email.trim()) { toast.error("Name and email are required"); return; }
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
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">Loading staff...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Add Staff Member</h2>
                <p className="text-xs text-muted-foreground">
                  Invite a team member to manage this retreat
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {staff.length} member{staff.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="staff-name"
                  placeholder="Full name"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
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
                onClick={handleAdd}
                disabled={!name.trim() || !email.trim() || adding}
                className="w-full"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No staff assigned</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a team member above to get started
            </p>
          </div>
        ) : (
          staff.map((member) => (
            <Card
              key={member.retreat_user_id}
              className="group transition-all duration-200 hover:shadow-md hover:border-primary/20"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {member.role && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          ROLE_STYLES[member.role] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {roleLabel(member.role)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove(member)}
                      title={`Remove ${member.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
