export interface ApiEnvelope<T> {
  data: T;
  message: string;
  meta: PaginationMeta | null;
}

export interface PaginationMeta {
  total: number;
  total_pages: number;
  page_size: number;
  page: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
