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

function storageKey(type: string): string {
  return `access_token_${type}`;
}

const ACTIVE_TYPE_KEY = "active_auth_type";

let forcedLoginType: string | null = null;

export function setForcedLoginType(type: string | null) {
  forcedLoginType = type;
}

export function setAccessToken(type: string, token: string | null) {
  if (typeof window === "undefined") return;
  const key = storageKey(type);
  if (token === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, token);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  if (forcedLoginType) {
    return localStorage.getItem(storageKey(forcedLoginType));
  }
  const activeType = localStorage.getItem(ACTIVE_TYPE_KEY);
  if (!activeType) return null;
  return localStorage.getItem(storageKey(activeType));
}

export function getAccessTokenFor(type: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKey(type));
}

export function setActiveType(type: string | null) {
  if (typeof window === "undefined") return;
  if (type === null) {
    localStorage.removeItem(ACTIVE_TYPE_KEY);
  } else {
    localStorage.setItem(ACTIVE_TYPE_KEY, type);
  }
}

export function getActiveType(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_TYPE_KEY);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith("access_token_")) {
      localStorage.removeItem(key);
    }
  }
  localStorage.removeItem(ACTIVE_TYPE_KEY);
}

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  if (response.status === 204) {
    return { data: null as unknown as T, message: "", meta: null };
  }
  const text = await response.text();
  if (!text) {
    return { data: null as unknown as T, message: "", meta: null };
  }
  const json: ApiEnvelope<T> = JSON.parse(text);
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
