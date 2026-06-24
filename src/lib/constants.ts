export const API_BASE_URL = "http://localhost:8000";

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

export const COOKIE_MAX_AGE_DAYS = 30;

export function getImageUrl(retreatId: number, galleryId: number): string {
  return `${API_BASE_URL}/retreats/${retreatId}/galleries/${galleryId}/image/`;
}
