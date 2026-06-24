import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, REFRESH_TOKEN_COOKIE_NAME, COOKIE_MAX_AGE_DAYS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const cookieStore = await cookies();
    cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, data.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * COOKIE_MAX_AGE_DAYS,
    });

    return NextResponse.json({
      data: { access_token: data.data.access_token },
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
