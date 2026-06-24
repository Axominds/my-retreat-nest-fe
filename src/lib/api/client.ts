import { API_BASE_URL } from "@/lib/constants";
import type { ApiEnvelope } from "@/types/api";

export class ApiError extends Error {
  status: number;
  data: ApiEnvelope<null>;

  constructor(status: number, data: ApiEnvelope<null>) {
    super(data.message || "An unexpected error occurred");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const json: ApiEnvelope<T> = await response.json();
  if (!response.ok) {
    throw new ApiError(response.status, json as unknown as ApiEnvelope<null>);
  }
  return json;
}

function buildHeaders(includeAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (includeAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

export async function get<T>(
  path: string,
  options?: { auth?: boolean; params?: Record<string, string | number> }
): Promise<ApiEnvelope<T>> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  const response = await fetch(url.toString(), {
    headers: buildHeaders(options?.auth ?? false),
  });
  return parseResponse<T>(response);
}

export async function post<T>(
  path: string,
  body?: unknown,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(options?.auth ?? false),
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function patch<T>(
  path: string,
  body?: unknown,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders(options?.auth ?? false),
    body: body ? JSON.stringify(body) : undefined,
  });
  return parseResponse<T>(response);
}

export async function del<T>(
  path: string,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders(options?.auth ?? false),
  });
  return parseResponse<T>(response);
}
