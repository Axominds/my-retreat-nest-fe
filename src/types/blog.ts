export interface Blog {
  blog_id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  tags: string | null;
  cover_image?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function parseBlogTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}
