import { get, post, patch, del, postForm } from "@/lib/api/client";
import type { Category } from "@/types/category";
import type { PaginationMeta } from "@/types/api";

export async function getCategories(params?: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<{ items: Category[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 10,
  };
  if (params?.search) {
    queryParams.search = params.search;
  }
  const response = await get<Category[]>("/categories/", { params: queryParams });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
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

export async function uploadCategoryThumbnail(id: number, formData: FormData): Promise<Category> {
  const response = await postForm<Category>(`/categories/${id}/thumbnail/`, formData, { auth: true });
  return response.data;
}
