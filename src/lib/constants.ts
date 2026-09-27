export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

// Apex domain for tenant resolution (e.g. "myretreatnest.com", "localhost" for dev).
export const ROOT_DOMAIN =
  (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost").toLowerCase();

// Apex app URL used for redirecting unknown/reserved subdomains.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token_normal";
export const ADMIN_REFRESH_TOKEN_COOKIE_NAME = "refresh_token_admin";
export const RETREAT_REFRESH_TOKEN_COOKIE_NAME = "refresh_token_retreat";

/** Refresh-cookie name for a login type. Retreat staff get their own jar. */
export function refreshCookieName(loginType: string): string {
  if (loginType === "admin") return ADMIN_REFRESH_TOKEN_COOKIE_NAME;
  if (loginType === "retreat") return RETREAT_REFRESH_TOKEN_COOKIE_NAME;
  return REFRESH_TOKEN_COOKIE_NAME;
}

export const COOKIE_MAX_AGE_DAYS = 30;

export const PORTAL_TYPE_KEY = "portal_type";
export type PortalType = "normal" | "admin" | "retreat";

const TENANT_ADMIN_PATH = /^\/sites\/[^/]+\/admin(\/|$)/;

/** Tenant admin portal (xyz.host/admin) gets the "retreat" portal (own token slot). */
export function isTenantAdminPath(pathname: string): boolean {
  return TENANT_ADMIN_PATH.test(pathname);
}

/** Any tenant route (public site or admin) — marketplace chrome is hidden. */
export function isTenantPath(pathname: string): boolean {
  return pathname.startsWith("/sites/");
}

export function portalTypeForPath(pathname: string): PortalType {
  if (pathname.startsWith("/admin")) return "admin";
  if (isTenantAdminPath(pathname)) return "retreat";
  return "normal";
}

export function getPortalType(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PORTAL_TYPE_KEY);
}

export function getHomeRoute(): string {
  const portalType = getPortalType();
  if (portalType === "admin") return "/admin";
  return "/";
}

export function getImageUrl(retreatId: number, galleryId: number): string {
  return `${API_BASE_URL}/retreats/${retreatId}/galleries/${galleryId}/image/`;
}

export function getCategoryImageUrl(categoryId: number): string {
  return `${API_BASE_URL}/categories/${categoryId}/image/`;
}

export function resolveImageUrl(path: string | null | undefined): string | null {
  return path ? `${API_BASE_URL}${path}` : null;
}
