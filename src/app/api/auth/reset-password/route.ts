import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, new_password } = body;

    const response = await fetch(`${API_BASE_URL}/auth/reset-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { data: null, message: "Failed to connect to server", meta: null },
      { status: 500 }
    );
  }
}
