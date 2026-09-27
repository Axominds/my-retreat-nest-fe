"use client";

import Link from "next/link";
import { StaffManager } from "@/components/admin/staff-manager";
import { useTenantAdmin } from "@/components/tenant/tenant-admin-provider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function TenantAdminTeamPage() {
  const { retreatId, retreatName, slug, isManager } = useTenantAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold md:text-3xl">Team</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Staff accounts that can manage {retreatName}.
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          render={<Link href={`/sites/${slug}`} target="_blank" />}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Preview site
        </Button>
      </div>

      {!isManager && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            You can view the team, but only owners or managers can invite
            people, change roles, or remove members.
          </p>
        </div>
      )}

      <StaffManager retreatId={retreatId} canManage={isManager} />
    </div>
  );
}
