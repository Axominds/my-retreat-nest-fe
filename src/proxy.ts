import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/constants";
import { apexEqualsHost, apexUrl, isApexHost, tenantSlugFromHost } from "@/lib/tenant-host";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost").toLowerCase();
const VALIDATE_TIMEOUT_MS = 5000;

function backendUnavailablePage(slug: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Temporarily unavailable</title></head><body style="font-family: Georgia, serif; background: #faf7f1; color: #1c1917; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0;"><main style="text-align: center; padding: 2rem;"><h1 style="font-size: 2rem; font-weight: 500;">${slug} is waking up</h1><p style="color: #78716c;">Our servers are starting. Please reload in a few seconds.</p></main></body></html>`;
}

/**
 * Multi-tenant routing:
 * - `xyz.<root>` → validate via backend (headers-only) → rewrite to
 *   `/sites/[slug]/...` with tenant headers.
 * - Unknown/unpublished slug → redirect to apex (never to the same host —
 *   that would loop; falls back to a dead-end 404 rewrite instead).
 * - Backend unreachable → 503 page, no redirect (a redirect would hide the
 *   outage and historically looped on relative Locations).
 * - Apex / reserved / foreign hosts → pass through untouched.
 */
export async function proxy(request: NextRequest) {
  const incomingHost = request.headers.get("host") ?? "";
  const slug = tenantSlugFromHost(incomingHost, ROOT_DOMAIN);
  if (!slug) {
    // Apex direct access to a tenant admin path is unsupported — bounce to
    // the tenant subdomain admin instead of serving it without a tenant.
    // (Public apex /sites/<slug> access is intentionally kept.)
    const adminMatch = request.nextUrl.pathname.match(/^\/sites\/([^/]+)\/admin(\/.*)?$/);
    if (adminMatch && isApexHost(incomingHost, ROOT_DOMAIN)) {
      const [, adminSlug, adminRest] = adminMatch;
      const apexHost = incomingHost.split(":")[0].toLowerCase().replace(/\.+$/, "");
      const hostPort = incomingHost.includes(":") ? `:${incomingHost.split(":").slice(1).join(":")}` : "";
      const protocol =
        apexHost === "localhost" || apexHost === "127.0.0.1" ? "http" : "https";
      return NextResponse.redirect(
        `${protocol}://${adminSlug}.${apexHost}${hostPort}/admin${adminRest ?? ""}`
      );
    }
    return NextResponse.next();
  }

  const validateHeaders = new Headers();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (origin) validateHeaders.set("origin", origin);
  if (referer) validateHeaders.set("referer", referer);
  // Server fetches send no Origin — forward the inbound host explicitly.
  validateHeaders.set("x-forwarded-host", incomingHost);

  let reachable = true;
  let tenant: { retreat_id: number; slug: string; name: string } | null = null;
  try {
    const response = await fetch(`${API_BASE_URL}/retreats/validate/`, {
      headers: validateHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(VALIDATE_TIMEOUT_MS),
    });
    if (response.ok) {
      const json = await response.json();
      tenant = json.data;
    }
  } catch {
    reachable = false;
  }

  if (!tenant) {
    if (!reachable) {
      return new NextResponse(backendUnavailablePage(slug), {
        status: 503,
        headers: { "content-type": "text/html; charset=utf-8", "retry-after": "5" },
      });
    }
    const apex = apexUrl("/");
    if (apexEqualsHost(apex, incomingHost)) {
      // Redirecting would land back on this host and loop — dead-end instead.
      const url = request.nextUrl.clone();
      url.pathname = `/sites/${slug}/not-found`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.redirect(apex);
  }

  const url = request.nextUrl.clone();
  const pathname = url.pathname === "/" ? "/" : url.pathname;
  url.pathname = `/sites/${tenant.slug}${pathname}`;

  const rewritten = NextResponse.rewrite(url);
  rewritten.headers.set("x-tenant-slug", tenant.slug);
  rewritten.headers.set("x-tenant-id", String(tenant.retreat_id));
  return rewritten;
}

export const config = {
  matcher: ["/((?!_next|sites|api|favicon.ico|.*\\..*).*)"],
};
