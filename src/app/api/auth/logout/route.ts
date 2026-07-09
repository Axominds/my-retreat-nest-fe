import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_TOKEN_COOKIE_NAME, ADMIN_REFRESH_TOKEN_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  let loginType: string | null = null;
  try {
    const body = await request.json();
    loginType = body.login_type ?? null;
  } catch {
    // no body — clear both
  }
  if (loginType === "admin") {
    cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE_NAME);
  } else if (loginType === "normal") {
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
  } else {
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
    cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE_NAME);
  }
  return NextResponse.json({
    data: null,
    message: "Logged out successfully",
    meta: null,
  });
}
