import { get } from "@/lib/api/client";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await get<Category[]>("/categories/");
  return response.data;
}
