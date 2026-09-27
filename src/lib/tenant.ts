import { headers } from "next/headers";
import { API_BASE_URL } from "@/lib/constants";
import { normalizeRoot } from "@/lib/tenant-host";
import type { ValidatedTenant } from "@/lib/api/retreats";

export { apexUrl, tenantSlugFromHost, RESERVED_SUBDOMAINS } from "@/lib/tenant-host";

/** Inbound host of the current server-side request (proxy-aware). */
export async function inboundHost(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-host")?.split(",")[0]?.trim();
  const raw = forwarded || h.get("host");
  if (!raw) return null;
  const host = raw.split(":")[0].trim().toLowerCase().replace(/\.+$/, "");
  return host || null;
}

/**
 * Validates a slug against the backend by presenting it as the request host
 * (headers-only contract — no slug query param exists).
 */
export async function validateTenantBySlug(slug: string): Promise<ValidatedTenant | null> {
  const { ROOT_DOMAIN } = await import("@/lib/constants");
  try {
    const response = await fetch(`${API_BASE_URL}/retreats/validate/`, {
      headers: { "x-forwarded-host": `${slug}.${normalizeRoot(ROOT_DOMAIN)}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data as ValidatedTenant;
  } catch {
    return null;
  }
}

export interface TenantContext {
  tenant: ValidatedTenant;
  retreat: import("@/types/retreat").Retreat;
}

/**
 * Server-side tenant resolution for `sites/[slug]` routes. Prefers the
 * proxy-set tenant headers (no extra backend call on subdomain traffic);
 * falls back to a headers-only backend validation for direct apex access.
 */
export async function resolveTenantContext(slugParam: string): Promise<TenantContext | null> {
  const { getRetreat } = await import("@/lib/api/retreats");
  try {
    const h = await headers();
    const headerSlug = h.get("x-tenant-slug");
    const headerId = h.get("x-tenant-id");
    let retreatId: number | null = null;
    if (headerSlug === slugParam && headerId && Number(headerId) > 0) {
      // Validated by proxy on subdomain traffic — no extra backend call.
      retreatId = Number(headerId);
    } else {
      // Direct apex access (myretreatnest.com/sites/slug) — validate now.
      const tenant = await validateTenantBySlug(slugParam);
      if (!tenant) return null;
      retreatId = tenant.retreat_id;
    }
    const retreat = await getRetreat(retreatId, { is_published: true });
    return {
      tenant: { retreat_id: retreat.retreat_id, slug: retreat.slug, name: retreat.name },
      retreat,
    };
  } catch {
    return null;
  }
}
