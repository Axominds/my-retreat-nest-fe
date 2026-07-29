export const API_BASE_URL = "http://localhost:8000";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token_normal";
export const ADMIN_REFRESH_TOKEN_COOKIE_NAME = "refresh_token_admin";

export const COOKIE_MAX_AGE_DAYS = 30;

export const PORTAL_TYPE_KEY = "portal_type";
export type PortalType = "normal" | "admin" | "retreat";

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
