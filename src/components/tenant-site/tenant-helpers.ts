import { formatCurrencyRange } from "@/lib/format-currency";
import { PLATFORM_WHATSAPP_NUMBER } from "@/lib/constants";

export function formatPrice(min: number | null, max: number | null): string {
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

export function directionsLink(
  latitude: number,
  longitude: number,
  label?: string | null
): string {
  const query = encodeURIComponent(label || `${latitude},${longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${query}`;
}
