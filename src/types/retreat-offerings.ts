import { formatCurrency } from "@/lib/format-currency";

export interface RoomType {
  retreat_room_type_id: number;
  retreat_id: number;
  name: string;
  slug: string;
  description?: string | null;
  size_sqm?: number | null;
  max_guests?: number | null;
  bed_configuration?: string | null;
  /** Comma separated list as stored by the API. Use `splitList` to read it. */
  amenities?: string | null;
  /** Decimal string as returned by the API, e.g. `"18500.00"`. */
  price_per_night?: string | null;
  is_featured: boolean;
  image_path?: string | null;
  display_order: number;
}

export interface RetreatPackage {
  retreat_package_id: number;
  retreat_id: number;
  room_type_id?: number | null;
  /** Resolved server-side; `null` once the linked room type is deleted. */
  room_type_name?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  duration_nights?: number | null;
  /** Comma separated list as stored by the API. Use `splitList` to read it. */
  includes?: string | null;
  /** Decimal string as returned by the API, e.g. `"32000.00"`. */
  price?: string | null;
  is_featured: boolean;
  display_order: number;
}

export type RoomTypeInput = {
  name: string;
  description?: string | null;
  size_sqm?: number | null;
  max_guests?: number | null;
  bed_configuration?: string | null;
  amenities?: string | null;
  price_per_night?: string | null;
  is_featured: boolean;
  display_order: number;
};

export type RoomTypeUpdate = Partial<RoomTypeInput>;

export type PackageInput = {
  name: string;
  description?: string | null;
  room_type_id?: number | null;
  duration_nights?: number | null;
  includes?: string | null;
  price?: string | null;
  is_featured: boolean;
  display_order: number;
};

export type PackageUpdate = Partial<PackageInput>;

/** Splits a comma separated API list into trimmed, non-empty entries. */
export function splitList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Joins entries back into the comma separated form the API stores. */
export function joinList(values: string[]): string {
  return values
    .map((entry) => entry.trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * Formats an API decimal string for display, dropping a trailing `.00` so
 * whole amounts read as `NPR 18,500` rather than `NPR 18,500.00`.
 */
export function formatPrice(value?: string | null): string | null {
  return formatCurrency(value);
}
