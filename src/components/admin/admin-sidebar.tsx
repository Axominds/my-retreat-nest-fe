"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, Tags, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { getListingRequests } from "@/lib/api/listing-requests";
import { Badge } from "@/components/ui/badge";

const sidebarLinks = [
  { href: "/admin/listing-requests", label: "Listing Requests", icon: FileText },
  { href: "/admin/retreats", label: "Retreats", icon: Building2 },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    getListingRequests({ status: "pending", page_size: 1 })
      .then((r) => setPendingCount(r.meta.total))
      .catch(() => {});
  }, []);

  return (
    <nav className={cn("flex flex-col gap-1 p-4", className)}>
      <Link href="/admin" className="text-lg font-bold mb-4 px-3">
        Admin Panel
      </Link>
      {sidebarLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        const isListingRequests = link.href === "/admin/listing-requests";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{link.label}</span>
            {isListingRequests && pendingCount !== null && pendingCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {pendingCount}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
