import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "margin_admin_session";
export const SESSION_SECONDS = 60 * 60 * 8;

export function isAdminConfigured(): boolean {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12;
}

function secret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!isAdminConfigured() || !password)
    throw new Error(
      "Set ADMIN_PASSWORD to at least 12 characters to enable the dashboard.",
    );
  const separate =
    process.env.ADMIN_SESSION_SECRET &&
    process.env.ADMIN_SESSION_SECRET.length >= 32
      ? process.env.ADMIN_SESSION_SECRET
      : "";
  return createHash("sha256")
    .update(`margin-session-v1:${password}:${separate}`)
    .digest("hex");
}

function equal(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function validatePassword(password: string): boolean {
  return (
    isAdminConfigured() && equal(password, process.env.ADMIN_PASSWORD ?? "")
  );
}

export function createSession(now = Date.now()): string {
  const payload = `v1.${Math.floor(now / 1000) + SESSION_SECONDS}`;
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}`;
}

export function verifySession(
  value: string | undefined,
  now = Date.now(),
): boolean {
  if (!value || !isAdminConfigured()) return false;
  const match = /^v1\.(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match) return false;
  const expires = Number(match[1]);
  const current = Math.floor(now / 1000);
  if (expires <= current || expires > current + SESSION_SECONDS + 5)
    return false;
  return equal(
    match[2],
    createHmac("sha256", secret()).update(`v1.${match[1]}`).digest("base64url"),
  );
}

export async function isAuthenticated(): Promise<boolean> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export function writesEnabled(): boolean {
  return (
    !process.env.VERCEL &&
    (process.env.CONTENT_WRITE_ENABLED === "true" ||
      (process.env.NODE_ENV === "development" &&
        process.env.CONTENT_WRITE_ENABLED !== "false"))
  );
}

type Attempt = { count: number; reset: number };
const authState = globalThis as typeof globalThis & {
  marginLoginAttempts?: Map<string, Attempt>;
};
const attempts = (authState.marginLoginAttempts ??= new Map<string, Attempt>());

export function allowLoginAttempt(ip: string, now = Date.now()): boolean {
  for (const [key, entry] of attempts)
    if (entry.reset <= now) attempts.delete(key);
  const key = createHash("sha256").update(ip).digest("hex");
  const global = attempts.get("global") ?? {
    count: 0,
    reset: now + 10 * 60_000,
  };
  const individual = attempts.get(key) ?? {
    count: 0,
    reset: now + 10 * 60_000,
  };
  global.count++;
  individual.count++;
  attempts.set("global", global);
  if (attempts.size < 1000 || attempts.has(key)) attempts.set(key, individual);
  return global.count <= 50 && individual.count <= 5 && attempts.size < 1000;
}
