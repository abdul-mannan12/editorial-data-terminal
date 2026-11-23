import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  apiError,
  assertSameOrigin,
  readJson,
  RequestError,
} from "@/lib/admin";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(200).optional(),
});
const state = globalThis as typeof globalThis & {
  marginContactLimits?: Map<string, { count: number; reset: number }>;
};
const limits = (state.marginContactLimits ??= new Map());
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const value = schema.parse(await readJson(request, 20_000));
    if (value.website) return NextResponse.json({ ok: true });
    const key =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    const now = Date.now();
    for (const [id, limit] of limits) if (limit.reset < now) limits.delete(id);
    const entry = limits.get(key) || { count: 0, reset: now + 15 * 60_000 };
    if (entry.count >= 5)
      throw new RequestError(
        "A few too many notes. Please try again in 15 minutes or send an email directly.",
        429,
      );
    entry.count++;
    limits.set(key, entry);
    const url = process.env.CONTACT_WEBHOOK_URL;
    if (!url)
      throw new RequestError(
        "Contact delivery is not configured. Please use the displayed email address.",
        503,
      );
    if (new URL(url).protocol !== "https:")
      throw new RequestError("Contact delivery needs an HTTPS endpoint.", 503);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: value.name,
        email: value.email,
        message: value.message,
      }),
      signal: AbortSignal.timeout(8000),
      redirect: "error",
    });
    if (!response.ok)
      throw new RequestError(
        "Your message could not be delivered. Please email directly.",
        502,
      );
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
