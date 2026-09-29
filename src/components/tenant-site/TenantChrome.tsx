import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { APP_URL } from "@/lib/constants";
import type { Retreat } from "@/types/retreat";
import { whatsappLink } from "@/components/tenant-site/tenant-helpers";

export function TenantChromeHeader({ retreat }: { retreat: Retreat }) {
  return (
    <header className="sticky top-0 z-50 border-b ts-hairline bg-[#faf7f1]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-baseline gap-2 min-w-0">
          <span className="ts-display text-xl font-semibold truncate">
            {retreat.name}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium tracking-wide text-[#44403c]">
          <a href="#story" className="hover:text-[#1c1917] transition-colors">Story</a>
          <a href="#gallery" className="hover:text-[#1c1917] transition-colors">Gallery</a>
          <a href="#amenities" className="hover:text-[#1c1917] transition-colors">Amenities</a>
          <a href="#stay" className="hover:text-[#1c1917] transition-colors">Stay</a>
          <a href="#visit" className="hover:text-[#1c1917] transition-colors">Visit</a>
        </nav>
        <a
          href={whatsappLink(retreat.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#2f4a3c] px-5 text-sm font-semibold text-[#f5f1e6] hover:bg-[#233829] transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Book your stay</span>
          <span className="sm:hidden">Book</span>
        </a>
      </div>
    </header>
  );
}

export function TenantChromeFooter({ retreat }: { retreat: Retreat }) {
  const socials = retreat.social_links
    ? Object.entries(retreat.social_links).filter(
        ([, v]) => typeof v === "string" && (v as string).length > 0
      )
    : [];
  return (
    <footer className="mt-24 border-t ts-hairline bg-[#f3ede1]">
      <div className="mx-auto max-w-6xl px-5 py-14 grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="ts-display text-2xl font-semibold">{retreat.name}</p>
          {retreat.address && (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#78716c]">
              {retreat.address}
            </p>
          )}
        </div>
        <div className="md:col-span-3">
          <p className="ts-overline text-[#78716c]">Contact</p>
          <div className="mt-3 space-y-1.5 text-sm">
            {retreat.email && (
              <a href={`mailto:${retreat.email}`} className="block hover:underline">
                {retreat.email}
              </a>
            )}
            {retreat.phone && <p>{retreat.phone}</p>}
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="ts-overline text-[#78716c]">Follow</p>
          <div className="mt-3 space-y-1.5 text-sm">
            {socials.length > 0 ? (
              socials.map(([key, url]) => (
                <a key={key} href={String(url)} target="_blank" rel="noopener noreferrer" className="block capitalize hover:underline">
                  {key}
                </a>
              ))
            ) : (
              <p className="text-[#a8a29e]">—</p>
            )}
          </div>
        </div>
        <div className="md:col-span-2">
          <p className="ts-overline text-[#78716c]">Explore</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <a href="#story" className="block hover:underline">Story</a>
            <a href="#gallery" className="block hover:underline">Gallery</a>
            <a href="#stay" className="block hover:underline">Stay</a>
            <a href="#visit" className="block hover:underline">Visit</a>
          </div>
        </div>
      </div>
      <div className="border-t ts-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-[#78716c] md:flex-row">
          <span>© {new Date().getFullYear()} {retreat.name}. All rights reserved.</span>
          <Link href={APP_URL} className="hover:text-[#1c1917] transition-colors">
            Powered by My Retreat Nest
          </Link>
        </div>
      </div>
    </footer>
  );
}
