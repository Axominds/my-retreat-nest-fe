"use client";

import DOMPurify from "isomorphic-dompurify";

interface BlogBodyProps {
  html: string;
}

export function BlogBody({ html }: BlogBodyProps) {
  const clean = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style", "iframe", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });

  return (
    <div
      className="blog-content text-foreground/90 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
