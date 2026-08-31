export interface Amenity {
  amenity_id: number;
  label: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;
}
