import { API_BASE_URL, getPortalType } from "@/lib/constants";
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
  const portalType = getPortalType();
  if (portalType) {
    return localStorage.getItem(storageKey(portalType));
  }
  if (forcedLoginType) {
    return localStorage.getItem(storageKey(forcedLoginType));
  }
  return null;
}

export function getAccessTokenFor(type: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKey(type));
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith("access_token_")) {
      localStorage.removeItem(key);
    }
  }
}

function getLoginType(): string | null {
  if (typeof window === "undefined") return null;
  return getPortalType() ?? forcedLoginType;
}

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const loginType = getLoginType();
      if (!loginType) return false;
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_type: loginType }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.access_token) {
        clearTokens();
        return false;
      }
      setAccessToken(loginType, json.data.access_token);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function redirectToLogin(loginType: string | null): never {
  clearTokens();
  const target = loginType === "admin" ? "/admin/login" : "/login";
  if (typeof window !== "undefined") {
    window.location.href = target;
  }
  throw new ApiError(401, {
    data: null,
    message: "Session expired.",
    meta: null,
  });
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
  let headers = buildHeaders(options?.auth ?? false);
  const response = await fetch(url.toString(), { headers });
  if (response.status === 403 && options?.auth) {
    const loginType = getLoginType();
    if (await attemptRefresh()) {
      headers = buildHeaders(true);
      const retryResponse = await fetch(url.toString(), { headers });
      return parseResponse<T>(retryResponse);
    }
    redirectToLogin(loginType);
  }
  return parseResponse<T>(response);
}

export async function post<T>(
  path: string,
  body?: unknown,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  let headers = buildHeaders(options?.auth ?? false);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 403 && options?.auth) {
    const loginType = getLoginType();
    if (await attemptRefresh()) {
      headers = buildHeaders(true);
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return parseResponse<T>(retryResponse);
    }
    redirectToLogin(loginType);
  }
  return parseResponse<T>(response);
}

export async function patch<T>(
  path: string,
  body?: unknown,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  let headers = buildHeaders(options?.auth ?? false);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 403 && options?.auth) {
    const loginType = getLoginType();
    if (await attemptRefresh()) {
      headers = buildHeaders(true);
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: "PATCH",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      return parseResponse<T>(retryResponse);
    }
    redirectToLogin(loginType);
  }
  return parseResponse<T>(response);
}

export async function del<T>(
  path: string,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  let headers = buildHeaders(options?.auth ?? false);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  if (response.status === 403 && options?.auth) {
    const loginType = getLoginType();
    if (await attemptRefresh()) {
      headers = buildHeaders(true);
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: "DELETE",
        headers,
      });
      return parseResponse<T>(retryResponse);
    }
    redirectToLogin(loginType);
  }
  return parseResponse<T>(response);
}

export async function postForm<T>(
  path: string,
  formData: FormData,
  options?: { auth?: boolean }
): Promise<ApiEnvelope<T>> {
  const buildFormHeaders = (): Record<string, string> => {
    const h: Record<string, string> = {};
    const token = getAccessToken();
    if (options?.auth && token) {
      h["Authorization"] = `Bearer ${token}`;
    }
    return h;
  };
  let headers = buildFormHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (response.status === 403 && options?.auth) {
    const loginType = getLoginType();
    if (await attemptRefresh()) {
      headers = buildFormHeaders();
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: formData,
      });
      return parseResponse<T>(retryResponse);
    }
    redirectToLogin(loginType);
  }
  return parseResponse<T>(response);
}
