"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PORTAL_TYPE_KEY, portalTypeForPath, type PortalType } from "@/lib/constants";
import { tenantSlugFromHost } from "@/lib/tenant-host";

export function PortalTypeSetter() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // On tenant subdomains the visible path is "/" or "/admin/..." while the
    // real route is rewritten — hostname is authoritative here.
    const onTenantHost = tenantSlugFromHost(window.location.hostname) != null;
    const type: PortalType = onTenantHost
      ? (pathname.startsWith("/admin") ? "retreat" : "normal")
      : portalTypeForPath(pathname);
    sessionStorage.setItem(PORTAL_TYPE_KEY, type);
  }, [pathname]);

  return null;
}
