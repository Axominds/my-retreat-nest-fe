"use client";

import DOMPurify from "isomorphic-dompurify";

interface SafeHtmlProps {
  html: string;
  className?: string;
}

/**
 * Sanitized HTML renderer shared by story/about surfaces (same allowlist as
 * the blog body). TipTap can only produce allowed nodes anyway; this guards
 * against stored HTML edited elsewhere.
 */
export function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "style", "iframe", "form", "input", "button"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
