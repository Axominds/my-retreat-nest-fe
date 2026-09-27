import { formatCurrencyRange } from "@/lib/format-currency";

export function formatPrice(min: number | null, max: number | null): string {
  return formatCurrencyRange(min, max);
}

export function whatsappLink(
  phone: string | null | undefined,
  retreatName: string,
  subject?: string
): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const greeting = `Hello ${retreatName}!`;
  const message = encodeURIComponent(
    subject
      ? `${greeting} I'd like to enquire about the ${subject}.`
      : `${greeting} I'd like to book a stay.`
  );
  return `https://wa.me/${digits}?text=${message}`;
}

export function directionsLink(
  latitude: number,
  longitude: number,
  label?: string | null
): string {
  const query = encodeURIComponent(label || `${latitude},${longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${query}`;
}
