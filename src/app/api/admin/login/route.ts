import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  allowLoginAttempt,
  createSession,
  isAdminConfigured,
  SESSION_COOKIE,
  SESSION_SECONDS,
  validatePassword,
} from "@/lib/auth";
import {
  apiError,
  assertSameOrigin,
  readJson,
  RequestError,
} from "@/lib/admin";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    if (!isAdminConfigured())
      throw new RequestError(
        "Admin is disabled. Set ADMIN_PASSWORD to at least 12 characters in .env.local, then restart the server.",
        503,
      );
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!allowLoginAttempt(ip))
      throw new RequestError(
        "Too many sign-in attempts. Try again in 10 minutes.",
        429,
      );
    const { password } = z
      .object({ password: z.string().max(1024) })
      .parse(await readJson(request, 4096));
    if (!validatePassword(password))
      throw new RequestError("That password is incorrect.", 401);
    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set(SESSION_COOKIE, createSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_SECONDS,
      path: "/",
    });
    return response;
  } catch (error) {
    return apiError(error);
  }
}
