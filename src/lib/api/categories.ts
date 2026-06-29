import { get, post, patch, del } from "@/lib/api/client";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await get<Category[]>("/categories/");
  return response.data;
}

export async function createCategory(payload: { name: string; description?: string | null }): Promise<Category> {
  const response = await post<Category>("/categories/", payload, { auth: true });
  return response.data;
}

export async function updateCategory(id: number, payload: { name?: string; description?: string | null }): Promise<Category> {
  const response = await patch<Category>(`/categories/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await del(`/categories/${id}/`, { auth: true });
}
