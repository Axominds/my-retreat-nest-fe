import type { Blog } from "@/types/blog";
import { BlogCard } from "@/components/blogs/blog-card";

interface BlogGridProps {
  blogs: Blog[];
}

export function BlogGrid({ blogs }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog, index) => (
        <div
          key={blog.blog_id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <BlogCard blog={blog} index={index} />
        </div>
      ))}
    </div>
  );
}
