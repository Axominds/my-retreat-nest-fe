import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, REFRESH_TOKEN_COOKIE_NAME, ADMIN_REFRESH_TOKEN_COOKIE_NAME, COOKIE_MAX_AGE_DAYS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { login_type } = await request.json();
    const cookieName = login_type === "admin" ? ADMIN_REFRESH_TOKEN_COOKIE_NAME : REFRESH_TOKEN_COOKIE_NAME;

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(cookieName)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { data: null, message: "No refresh token found", meta: null },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      cookieStore.delete(cookieName);
      return NextResponse.json(data, { status: response.status });
    }

    cookieStore.set(cookieName, data.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * COOKIE_MAX_AGE_DAYS,
    });

    return NextResponse.json({
      data: { access_token: data.data.access_token, refresh_token: data.data.refresh_token, login_type },
      message: data.message,
      meta: null,
    });
  } catch {
    return NextResponse.json(
      { data: null, message: "Failed to connect to server", meta: null },
      { status: 500 }
    );
  }
}
