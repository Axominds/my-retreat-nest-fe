import { formatCurrencyRange } from "@/lib/format-currency";
import { PLATFORM_WHATSAPP_NUMBER } from "@/lib/constants";

export function formatBudget(min: number | null, max: number | null): string {
  return formatCurrencyRange(min, max);
}

/** All WhatsApp chats go to the RetreatNest team; the message keeps the
 *  retreat/subject context so the enquiry can be routed correctly. */
export function whatsappLink(retreatName: string, subject?: string): string {
  const greeting = "Hello RetreatNest team!";
  const message = encodeURIComponent(
    subject
      ? `${greeting} I'd like to enquire about ${subject} at ${retreatName}.`
      : `${greeting} I'd like to book a stay at ${retreatName}.`
  );
  return `https://wa.me/${PLATFORM_WHATSAPP_NUMBER}?text=${message}`;
}
