export const API_BASE_URL = "http://localhost:8000";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
export const ADMIN_REFRESH_TOKEN_COOKIE_NAME = "admin_refresh_token";

export const COOKIE_MAX_AGE_DAYS = 30;

export function getImageUrl(retreatId: number, galleryId: number): string {
  return `${API_BASE_URL}/retreats/${retreatId}/galleries/${galleryId}/image/`;
}

export function getCategoryImageUrl(categoryId: number): string {
  return `${API_BASE_URL}/categories/${categoryId}/image/`;
}

export function resolveImageUrl(path: string | null | undefined): string | null {
  return path ? `${API_BASE_URL}${path}` : null;
}
