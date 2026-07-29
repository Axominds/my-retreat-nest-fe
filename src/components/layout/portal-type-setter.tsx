"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PortalTypeSetter() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("portal_type", pathname.startsWith("/admin") ? "admin" : "normal");
  }, [pathname]);

  return null;
}
