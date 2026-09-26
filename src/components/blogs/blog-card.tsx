import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { resolveImageUrl } from "@/lib/constants";
import { Newspaper, CalendarDays } from "lucide-react";
import { parseBlogTags, type Blog } from "@/types/blog";

interface BlogCardProps {
  blog: Blog;
  index?: number;
}

const GRADIENTS = [
  "from-emerald-400/40 to-green-600/40",
  "from-teal-400/40 to-emerald-700/40",
  "from-green-300/40 to-teal-600/40",
  "from-lime-400/40 to-green-600/40",
  "from-emerald-300/40 to-teal-700/40",
  "from-green-400/40 to-emerald-600/40",
];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogCard({ blog, index = 0 }: BlogCardProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const tags = parseBlogTags(blog.tags).slice(0, 3);

  return (
    <div
      className="group relative rounded-xl overflow-hidden border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/blogs/${blog.slug}`}>
        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
          {resolveImageUrl(blog.cover_image) ? (
            <img
              src={resolveImageUrl(blog.cover_image)!}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <Newspaper className="h-12 w-12 text-foreground/20 group-hover:scale-110 group-hover:text-foreground/30 transition-all duration-500" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent h-20 pointer-events-none" />
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(blog.created_at)}</span>
        </div>
        <Link href={`/blogs/${blog.slug}`}>
          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        {blog.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
