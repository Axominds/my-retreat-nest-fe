export interface ListingRequest {
  listing_request_id: number;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
  retreat_name: string;
  retreat_description: string | null;
  category_id: number;
  retreat_email: string | null;
  retreat_phone: string | null;
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  budget_min: string | null;
  budget_max: string | null;
  social_links: Record<string, string>;
  status: "pending" | "approved" | "rejected";
  reviewed_by: number | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  retreat_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateListingRequestPayload {
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  retreat_name: string;
  retreat_description?: string;
  category_id: number;
  retreat_email?: string;
  retreat_phone?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  budget_min?: number;
  budget_max?: number;
  social_links: Record<string, string>;
}
