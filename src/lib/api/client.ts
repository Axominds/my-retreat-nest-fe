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

const tokens: Record<string, string | null> = {};
let activeType: string | null = null;

export function setAccessToken(type: string, token: string | null) {
  tokens[type] = token;
  if (token !== null) {
    activeType = type;
  } else if (activeType === type) {
    activeType = Object.keys(tokens).find((k) => tokens[k] !== null) ?? null;
  }
}

export function getAccessToken(): string | null {
  return activeType ? tokens[activeType] ?? null : null;
}

export function getAccessTokenFor(type: string): string | null {
  return tokens[type] ?? null;
}

export function setActiveType(type: string | null) {
  activeType = type;
}

export function getActiveType(): string | null {
  return activeType;
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
  const token = getAccessToken();
  if (includeAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
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

export async function postForm<T>(
  path: string,
  formData: FormData,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (options?.auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  return parseResponse<T>(response);
}
