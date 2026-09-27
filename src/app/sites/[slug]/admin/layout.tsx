"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { validateRetreatTenant, getRetreatUsers, type ValidatedTenant } from "@/lib/api/retreats";
import { ApiError } from "@/lib/api/client";
import { TenantAdminProvider } from "@/components/tenant/tenant-admin-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Sparkles,
  Images,
  BedDouble,
  Users,
  MessageSquare,
  ExternalLink,
  Menu,
  LogOut,
} from "lucide-react";

function basePath() {
  // Visible tenant admin URLs are host-scoped (xyz.host/admin/...) — the
  // internal /sites/[slug] prefix must never leak into links.
  return "/admin";
}

export default function TenantAdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = String(params.slug ?? "");
  const { user, isLoading: authLoading, logout } = useAuth();

  const [tenant, setTenant] = useState<ValidatedTenant | null>(null);
  const [tenantState, setTenantState] = useState<"loading" | "ready" | "missing">("loading");
  const [role, setRole] = useState<string | null>(null);
  const [accessState, setAccessState] = useState<"checking" | "ok" | "denied">("checking");
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname.endsWith("/admin/login");

  // Resolve tenant from backend (headers-only validate).
  useEffect(() => {
    if (!slug) {
      setTenantState("missing");
      return;
    }
    validateRetreatTenant()
      .then((t) => {
        if (t.slug !== slug) {
          setTenantState("missing");
          return;
        }
        setTenant(t);
        setTenantState("ready");
      })
      .catch(() => setTenantState("missing"));
  }, [slug]);

  const isRetreatUser = !!user && user.login_type === "retreat";

  useEffect(() => {
    if (isLoginPage || authLoading || tenantState !== "ready") return;
    if (!isRetreatUser) {
      router.push("/admin/login");
    }
  }, [isLoginPage, authLoading, isRetreatUser, tenantState, router]);

  // Membership: 403 means "valid session, but not staff of this retreat".
  // 401 means "no/invalid credentials" (e.g. expired session) → back to login.
  // A single retry covers token propagation right after login/refresh.
  useEffect(() => {
    if (isLoginPage || authLoading || !isRetreatUser || !tenant) {
      return;
    }
    let cancelled = false;
    setAccessState("checking");
    const check = (retriesLeft: number): void => {
      getRetreatUsers(tenant.retreat_id)
        .then((staff) => {
          if (cancelled) return;
          const mine = user?.email
            ? staff.find((s) => s.email.toLowerCase() === user.email.toLowerCase())
            : undefined;
          setRole(mine?.role ?? null);
          setAccessState("ok");
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const status = err instanceof ApiError ? err.status : 0;
          if (status === 401 && retriesLeft > 0) {
            setTimeout(() => {
              if (!cancelled) check(retriesLeft - 1);
            }, 400);
            return;
          }
          if (status === 401) {
            router.push("/admin/login");
            return;
          }
          setAccessState("denied");
        });
    };
    check(1);
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, authLoading, isRetreatUser, tenant, user?.email, router, slug]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (tenantState === "loading" || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (tenantState === "missing") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Retreat not found</h1>
        <p className="text-muted-foreground">
          This admin portal doesn&apos;t match a published retreat.
        </p>
      </div>
    );
  }

  if (!isRetreatUser) return null;

  if (accessState === "checking") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (accessState === "denied") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">No access</h1>
        <p className="text-muted-foreground mb-6">
          Your account isn&apos;t staff of {tenant?.name ?? "this retreat"}.
        </p>
        <Button variant="outline" onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    );
  }

  const isManager =
    role != null && (role.toLowerCase() === "owner" || role.toLowerCase() === "manager");

  const nav = [
    { href: basePath(), label: "Overview", icon: LayoutDashboard },
    { href: `${basePath()}/amenities`, label: "Amenities", icon: Sparkles },
    { href: `${basePath()}/gallery`, label: "Gallery", icon: Images },
    { href: `${basePath()}/stay`, label: "Stay", icon: BedDouble },
    { href: `${basePath()}/team`, label: "Team", icon: Users },
    { href: `${basePath()}/reviews`, label: "Reviews", icon: MessageSquare },
  ];

  const sidebar = (
    <div className="flex flex-col gap-1 p-4">
      <div className="px-2 py-3 mb-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Managing</p>
        <p className="font-bold truncate">{tenant?.name}</p>
        {role && (
          <p className="text-xs text-muted-foreground capitalize mt-0.5">{role}</p>
        )}
      </div>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            pathname === item.href
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
      <div className="mt-4 pt-4 border-t flex flex-col gap-1">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <TenantAdminProvider
      value={{
        slug,
        retreatId: tenant!.retreat_id,
        retreatName: tenant!.name,
        role,
        isManager,
      }}
    >
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:flex md:w-60 md:flex-col md:border-r">
          {sidebar}
        </aside>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            className="md:hidden absolute top-4 left-4 z-40"
            render={<Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>}
          />
          <SheetContent side="left" className="w-60 p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
        <main className="flex-1 px-4 py-6 md:px-8 overflow-auto">
          {children}
        </main>
      </div>
    </TenantAdminProvider>
  );
}
