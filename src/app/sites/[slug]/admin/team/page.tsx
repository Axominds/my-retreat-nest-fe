"use client";

import { StaffManager } from "@/components/admin/staff-manager";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import { AlertTriangle } from "lucide-react";

export default function TenantAdminTeamPage() {
  const { retreatId, retreatName, isManager } = useTenantAdmin();
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Staff accounts that can manage {retreatName}.
        </p>
      </div>
      {!isManager && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            You can view the team, but only owners or managers can invite,
            change roles, or remove members.
          </p>
        </div>
      )}
      <StaffManager retreatId={retreatId} />
    </div>
  );
}
