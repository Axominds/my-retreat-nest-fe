import type { ApiEnvelope } from "@/types/api";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export async function login(
  email: string,
  password: string,
  loginType: string = "normal"
): Promise<ApiEnvelope<{ access_token: string }>> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, login_type: loginType }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Login failed");
  }
  return json;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<ApiEnvelope<{ user_id: number; name: string; email: string; phone: string | null }>> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export async function refreshToken(loginType: string = "normal"): Promise<ApiEnvelope<TokenResponse & { login_type: string }>> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login_type: loginType }),
  });
  return response.json();
}

export async function logout(loginType?: string): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: loginType ? JSON.stringify({ login_type: loginType }) : undefined,
  });
}

export async function forgotPassword(email: string): Promise<ApiEnvelope<null>> {
  const response = await fetch("/api/auth/forgot-password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to send reset email");
  }
  return json;
}

export async function resetPassword(token: string, newPassword: string): Promise<ApiEnvelope<null>> {
  const response = await fetch("/api/auth/reset-password/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to reset password");
  }
  return json;
}
