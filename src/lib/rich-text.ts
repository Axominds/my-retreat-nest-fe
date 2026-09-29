/** True when a stored string already contains HTML markup. */
export function isHtml(value: string): boolean {
  return /<[a-z][^>]*>/i.test(value);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Convert legacy plain-text (newline separated) into simple HTML paragraphs
 * so it round-trips through the WYSIWYG editor and the HTML renderers
 * without losing paragraph breaks.
 */
export function plainTextToHtml(text: string): string {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return "";
  return normalized
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * Plain-text version of a stored value (HTML or legacy text) for meta tags
 * and search snippets, so markup never leaks into plain-text surfaces.
 */
export function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  const withBreaks = value.replace(/<(br|p|div|h[1-6]|li|tr)[^>]*>/gi, " ");
  return withBreaks
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
