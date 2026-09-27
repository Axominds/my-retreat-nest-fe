import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getBlogs } from "@/lib/api/blogs";
import { API_BASE_URL } from "@/lib/constants";
import { BlogBody } from "@/components/blogs/blog-body";
import { BlogGrid } from "@/components/blogs/blog-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { parseBlogTags } from "@/types/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let blog;
  try {
    blog = await getBlogBySlug(slug);
  } catch {
    notFound();
  }
  if (!blog.is_published) {
    notFound();
  }

  const tags = parseBlogTags(blog.tags);
  let related: Awaited<ReturnType<typeof getBlogs>>["items"] = [];
  if (tags.length > 0) {
    try {
      const res = await getBlogs({
        tag: tags[0],
        page_size: 4,
        is_published: true,
      });
      related = res.items.filter((b) => b.blog_id !== blog.blog_id).slice(0, 3);
    } catch {
      related = [];
    }
  }

  const coverUrl = blog.cover_image ? `${API_BASE_URL}${blog.cover_image}` : null;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden -mt-16 flex min-h-[calc(40vh+4rem)] items-end">
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-emerald-800" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
          </>
        )}

        <div className="container mx-auto px-4 pt-28 pb-10 lg:pt-32 lg:pb-14 relative w-full">
          <Link href="/blogs">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 mb-6 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All blogs
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDate(blog.created_at)}</span>
          </div>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl drop-shadow-sm">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="text-lg text-white/85 mt-3 max-w-2xl">{blog.excerpt}</p>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {tags.map((tag) => (
                <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}>
                  <Badge className="bg-white/15 text-white border-0 text-xs hover:bg-white/25">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <article>
          <BlogBody html={blog.content} />
        </article>
      </div>

      {related.length > 0 && (
        <section className="container mx-auto px-4 pb-14 max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">Related stories</h2>
          <BlogGrid blogs={related} />
        </section>
      )}
    </div>
  );
}
