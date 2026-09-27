import { formatCurrencyRange } from "@/lib/format-currency";

export function formatBudget(min: number | null, max: number | null): string {
  return formatCurrencyRange(min, max);
}

export function whatsappLink(phone: string | null | undefined, retreatName: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const message = encodeURIComponent(`Hi! I'm interested in booking ${retreatName}.`);
  return `https://wa.me/${digits}?text=${message}`;
}
