import { MessageSquare } from "lucide-react";
import type { Retreat } from "@/types/retreat";
import { formatPrice, whatsappLink } from "@/components/tenant-site/tenant-helpers";

/**
 * Sticky mobile booking bar (desktop booking lives in the Visit card).
 * Pure anchor — server component.
 */
export function BookingBar({ retreat }: { retreat: Retreat }) {
  const price = formatPrice(retreat.budget_min, retreat.budget_max);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t ts-hairline bg-[#faf7f1]/95 px-5 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="ts-overline text-[#a8a29e]">Starting from</p>
          <p className="ts-display truncate text-lg font-semibold">
            {price || "On request"}
          </p>
        </div>
        <a
          href={whatsappLink(retreat.phone, retreat.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#2f4a3c] px-6 text-sm font-semibold text-[#f5f1e6]"
        >
          <MessageSquare className="h-4 w-4" />
          Book Now
        </a>
      </div>
    </div>
  );
}
