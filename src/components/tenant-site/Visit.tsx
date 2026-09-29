"use client";

import dynamic from "next/dynamic";
import { Mail, MapPin, MessageSquare, Navigation, Phone } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import { directionsLink, formatPrice, whatsappLink } from "@/components/tenant-site/tenant-helpers";

const TenantMap = dynamic(
  () =>
    import("@/components/tenant-site/TenantMap").then((m) => ({
      default: m.TenantMap,
    })),
  {
    ssr: false,
    loading: () => <div className="h-80 w-full animate-pulse rounded-[var(--ts-radius)] bg-[#e7e0d2]" />,
  }
);

export function Visit({ retreat }: { retreat: Retreat }) {
  const price = formatPrice(retreat.budget_min, retreat.budget_max);
  const socials = retreat.social_links
    ? Object.entries(retreat.social_links).filter(
        ([, v]) => typeof v === "string" && (v as string).length > 0
      )
    : [];
  return (
    <section id="visit" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <p className="ts-overline text-[#b45309]">Visit</p>
        <h2 className="ts-display mt-3 text-3xl font-medium leading-tight md:text-5xl">
          Finding your way here
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="relative z-0 isolate overflow-hidden rounded-[var(--ts-radius)] border ts-hairline lg:col-span-3">
            <TenantMap
              latitude={retreat.latitude}
              longitude={retreat.longitude}
            />
          </div>
          <div className="rounded-[var(--ts-radius)] bg-[#2f4a3c] p-8 text-[#f5f1e6] lg:col-span-2">
            <p className="ts-overline text-[#f5f1e6]/60">Your stay</p>
            <p className="ts-display mt-3 text-3xl font-medium">
              {price || "Contact for pricing"}
            </p>
            <div className="mt-6 space-y-3 text-sm text-[#f5f1e6]/85">
              {retreat.address && (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {retreat.address}
                </p>
              )}
              {retreat.email && (
                <a href={`mailto:${retreat.email}`} className="flex items-center gap-2.5 hover:underline">
                  <Mail className="h-4 w-4 shrink-0" />
                  {retreat.email}
                </a>
              )}
              {retreat.phone && (
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 shrink-0" />
                  {retreat.phone}
                </p>
              )}
              {socials.map(([key, url]) => (
                <a key={key} href={String(url)} target="_blank" rel="noopener noreferrer" className="block capitalize hover:underline">
                  {key}
                </a>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={whatsappLink(retreat.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#f5f1e6] text-sm font-semibold text-[#1c1917] hover:bg-white transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Book on WhatsApp
              </a>
              <a
                href={directionsLink(retreat.latitude, retreat.longitude, retreat.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#f5f1e6]/30 text-sm font-semibold text-[#f5f1e6] hover:bg-white/10 transition-colors"
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
