import { get, patch, del } from "@/lib/api/client";
import type { User } from "@/types/user";
import type { PaginationMeta } from "@/types/api";

export async function getUser(id: number): Promise<User> {
  const response = await get<User>(`/users/${id}/`);
  return response.data;
}

export async function getUsers(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<{ items: User[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 10,
  };
  if (params?.search) {
    queryParams.search = params.search;
  }
  if (params?.sort_by) {
    queryParams.sort_by = params.sort_by;
  }
  if (params?.sort_order) {
    queryParams.sort_order = params.sort_order;
  }
  const response = await get<User[]>("/users/", { params: queryParams, auth: true });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function updateUser(
  id: number,
  payload: { name?: string; email?: string; phone?: string | null }
): Promise<User> {
  const response = await patch<User>(`/users/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await del(`/users/${id}/`, { auth: true });
}
