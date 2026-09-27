import { get, post, patch, del, postForm } from "@/lib/api/client";
import type { Blog } from "@/types/blog";
import type { PaginationMeta } from "@/types/api";

export interface BlogPayload {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  tags?: string | null;
  is_published?: boolean;
}

export async function getBlogs(params?: {
  page?: number;
  page_size?: number;
  is_published?: boolean;
  search?: string;
  tag?: string;
  tags?: string[];
  sort_by?: string;
}): Promise<{ items: Blog[]; meta: PaginationMeta }> {
  const queryParams: Record<string, string | number> = {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 12,
  };
  if (params?.is_published !== undefined) {
    queryParams.is_published = params.is_published ? "true" : "false";
  }
  if (params?.search) {
    queryParams.search = params.search;
  }
  if (params?.tag) {
    queryParams.tag = params.tag;
  }
  if (params?.tags && params.tags.length > 0) {
    queryParams.tags = params.tags.join(",");
  }
  if (params?.sort_by) {
    queryParams.sort_by = params.sort_by;
  }
  const response = await get<Blog[]>("/blogs/", { params: queryParams });
  return {
    items: response.data,
    meta: response.meta as PaginationMeta,
  };
}

export async function getBlogTags(): Promise<string[]> {
  const response = await get<string[]>("/blogs/tags/");
  return response.data;
}

export async function getBlog(id: number): Promise<Blog> {
  const response = await get<Blog>(`/blogs/${id}/`);
  return response.data;
}

export async function getBlogBySlug(slug: string): Promise<Blog> {
  const response = await get<Blog>(`/blogs/slug/${slug}/`);
  return response.data;
}

export async function createBlog(payload: BlogPayload): Promise<Blog> {
  const response = await post<Blog>("/blogs/", payload, { auth: true });
  return response.data;
}

export async function updateBlog(id: number, payload: Partial<BlogPayload>): Promise<Blog> {
  const response = await patch<Blog>(`/blogs/${id}/`, payload, { auth: true });
  return response.data;
}

export async function deleteBlog(id: number): Promise<void> {
  await del(`/blogs/${id}/`, { auth: true });
}

export async function uploadBlogCover(
  id: number,
  formData: FormData
): Promise<Blog> {
  const response = await postForm<Blog>(`/blogs/${id}/cover/`, formData, { auth: true });
  return response.data;
}

export async function deleteBlogCover(id: number): Promise<Blog> {
  const response = await del<Blog>(`/blogs/${id}/cover/`, { auth: true });
  return response.data;
}
