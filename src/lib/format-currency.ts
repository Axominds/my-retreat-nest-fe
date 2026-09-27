/**
 * Single source of truth for money display.
 *
 * Every price in the product is Nepali Rupees, so the code is pinned once here
 * instead of being retyped at each call site. Amounts are rendered without
 * decimals because retreat rates are quoted in whole rupees.
 */
export const CURRENCY_CODE = "NPR";

const nprFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: CURRENCY_CODE,
  maximumFractionDigits: 0,
});

/** `18500` or `"18500.00"` -> `NPR 18,500`. Returns `null` when unusable. */
export function formatCurrency(
  value: number | string | null | undefined
): string | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return null;
  return nprFormatter.format(parsed);
}

/**
 * Range label for a budget/price pair. Returns `""` when neither bound is set
 * so callers can keep their existing `price || "On request"` fallbacks.
 */
export function formatCurrencyRange(
  min: number | string | null | undefined,
  max: number | string | null | undefined
): string {
  const low = formatCurrency(min);
  const high = formatCurrency(max);
  if (low && high) return `${low} - ${high}`;
  if (low) return `From ${low}`;
  if (high) return `Up to ${high}`;
  return "";
}
