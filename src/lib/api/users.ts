import { get, patch } from "@/lib/api/client";
import type { User } from "@/types/user";

export async function getUser(id: number): Promise<User> {
  const response = await get<User>(`/users/${id}/`);
  return response.data;
}

export async function updateUser(
  id: number,
  payload: { name?: string; email?: string; phone?: string | null }
): Promise<User> {
  const response = await patch<User>(`/users/${id}/`, payload, { auth: true });
  return response.data;
}
