export function formatPrice(min: number | null, max: number | null): string {
  if (min != null && max != null)
    return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return "";
}

export function whatsappLink(phone: string | null | undefined, retreatName: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const message = encodeURIComponent(`Hello ${retreatName}! I'd like to book a stay.`);
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
