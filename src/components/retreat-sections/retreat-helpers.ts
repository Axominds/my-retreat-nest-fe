export function formatBudget(min: number | null, max: number | null): string {
  if (min != null && max != null)
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min != null) return `From $${min.toLocaleString()}`;
  if (max != null) return `Up to $${max.toLocaleString()}`;
  return "";
}

export function whatsappLink(phone: string | null | undefined, retreatName: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const message = encodeURIComponent(`Hi! I'm interested in booking ${retreatName}.`);
  return `https://wa.me/${digits}?text=${message}`;
}
