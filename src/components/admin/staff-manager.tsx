"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getRetreatUsers, createRetreatUser, deleteRetreatUser } from "@/lib/api/retreats";
import type { RetreatStaffMember } from "@/types/retreat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, User as UserIcon } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "manager", label: "Manager" },
  { value: "owner", label: "Owner" },
];

export function StaffManager({ retreatId }: { retreatId: number }) {
  const [staff, setStaff] = useState<RetreatStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [adding, setAdding] = useState(false);
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
      await createRetreatUser(retreatId, { name, email, role });
      toast.success("Staff added");
      resetForm();
      await fetchStaff();
    } catch {
      toast.error("Failed to add staff");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(member: RetreatStaffMember) {
    if (!confirm(`Remove ${member.name} from staff?`)) return;
    try {
      await deleteRetreatUser(retreatId, member.retreat_user_id);
      setStaff((prev) => prev.filter((m) => m.retreat_user_id !== member.retreat_user_id));
      toast.success("Staff removed");
    } catch {
      toast.error("Failed to remove staff");
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
          <h2 className="font-medium">Add Staff Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staff-name">Name <span className="text-destructive">*</span></Label>
              <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">Email <span className="text-destructive">*</span></Label>
              <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Role</Label>
              <Select value={role} onValueChange={(v) => { if (v) setRole(v); }}>
                <SelectTrigger id="staff-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={!name.trim() || !email.trim() || adding} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> {adding ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {staff.length === 0 && (
          <p className="text-sm text-muted-foreground">No staff assigned.</p>
        )}
        {staff.map((member) => (
          <Card key={member.retreat_user_id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium capitalize">
                      {member.role}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleRemove(member)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
