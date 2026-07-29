"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PORTAL_TYPE_KEY } from "@/lib/constants";

export function PortalTypeSetter() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PORTAL_TYPE_KEY, pathname.startsWith("/admin") ? "admin" : "normal");
  }, [pathname]);

  return null;
}
