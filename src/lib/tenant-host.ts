import { APP_URL, ROOT_DOMAIN } from "@/lib/constants";

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "static",
  "mail",
  "_next",
]);

function normalizeHost(value: string | null): string | null {
  if (!value) return null;
  const host = value.split(":")[0].trim().toLowerCase().replace(/\.+$/, "");
  return host || null;
}

export function normalizeRoot(root: string): string {
  const lowered = root.trim().toLowerCase().replace(/\.+$/, "");
  return lowered.startsWith("www.") ? lowered.slice(4) : lowered;
}

/** True when the host is the apex itself (or its www variant). */
export function isApexHost(host: string | null, root: string = ROOT_DOMAIN): boolean {
  const h = normalizeHost(host);
  const r = normalizeRoot(root);
  return !!h && !!r && (h === r || h === `www.${r}`);
}

/** Extracts the tenant slug from a host, or null for apex/reserved/foreign. */
export function tenantSlugFromHost(
  host: string | null,
  root: string = ROOT_DOMAIN
): string | null {
  const h = normalizeHost(host);
  const r = normalizeRoot(root);
  if (!h || !r) return null;
  if (h === r || h === `www.${r}`) return null;
  const suffix = `.${r}`;
  if (!h.endsWith(suffix)) return null;
  const candidate = h.slice(0, -suffix.length);
  if (!candidate || candidate.includes(".") || RESERVED_SUBDOMAINS.has(candidate)) return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(candidate) || candidate.length > 63) return null;
  return candidate;
}

/** True only for absolute http(s) URLs. Relative/schemeless values are rejected
    so a redirect Location can never resolve back to the requesting host. */
export function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\/[^/:?#]+/i.test(value.trim());
}

/** Bare host (no port) of an absolute URL, or null when not absolute. */
export function hostOfUrl(value: string): string | null {
  const match = value.trim().match(/^https?:\/\/([^/:?#]+)/i);
  if (!match) return null;
  const host = match[1].toLowerCase().replace(/\.+$/, "");
  return host || null;
}

/** Apex base URL used for unknown-tenant redirects. Never relative:
    malformed APP_URL falls back to a ROOT_DOMAIN-derived absolute apex. */
export function apexUrl(path: string = "/"): string {
  const raw = (APP_URL ?? "").trim();
  if (isAbsoluteHttpUrl(raw)) {
    return `${raw.replace(/\/+$/, "")}${path}`;
  }
  const root = normalizeRoot(ROOT_DOMAIN);
  const base =
    !root || root === "localhost" ? "http://localhost:3000" : `https://${root}`;
  return `${base}${path}`;
}

/** True when the apex URL points at the incoming request host
    (redirecting there would loop on the same host). */
export function apexEqualsHost(apex: string, incomingHost: string | null): boolean {
  const apexHost = hostOfUrl(apex);
  const host = normalizeHost(incomingHost);
  if (!apexHost || !host) return true; // fail closed: treat as loop risk
  const bareIncoming = host.split(":")[0];
  return apexHost === host || apexHost === bareIncoming;
}
