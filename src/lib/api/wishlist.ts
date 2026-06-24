import { get, post, del } from "@/lib/api/client";
import type { WishlistItem } from "@/types/wishlist";
import type { PaginationMeta } from "@/types/api";

export async function getWishlist(
  params?: { page?: number; page_size?: number }
): Promise<{ items: WishlistItem[]; meta: PaginationMeta }> {
  const response = await get<WishlistItem[]>("/users/wishlists/retreats/", {
    auth: true,
    params: {
      page: params?.page ?? 1,
      page_size: params?.page_size ?? 50,
    },
  });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function addToWishlist(retreatId: number): Promise<void> {
  await post(`/users/wishlists/retreats/${retreatId}/`, undefined, {
    auth: true,
  });
}

export async function removeFromWishlist(retreatId: number): Promise<void> {
  await del(`/users/wishlists/retreats/${retreatId}/`, { auth: true });
}
