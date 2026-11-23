import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAuthenticated } from "./auth";

export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function assertSameOrigin(request: NextRequest): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    throw new RequestError("This action requires a same-origin request.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new RequestError("Send application/json.", 415);
}

export async function requireAdmin(request: NextRequest): Promise<void> {
  assertSameOrigin(request);
  if (!(await isAuthenticated()))
    throw new RequestError("Your session expired. Please sign in again.", 401);
}

export async function readJson(
  request: NextRequest,
  maxBytes = 2_100_000,
): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes)
    throw new RequestError("This request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("A request body is required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new RequestError("This request is too large.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RequestError("The request must contain valid JSON.");
  }
}

export function apiError(error: unknown): NextResponse {
  const headers = { "Cache-Control": "no-store" };
  if (error instanceof RequestError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status, headers },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: error.issues
          .map((issue) => `${issue.path.join(".") || "Data"}: ${issue.message}`)
          .slice(0, 8)
          .join("; "),
      },
      { status: 400, headers },
    );
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "The uploaded JSON could not be parsed." },
      { status: 400, headers },
    );
  if (error instanceof Error && !(error as NodeJS.ErrnoException).code)
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers },
    );
  console.error(
    "Admin operation failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return NextResponse.json(
    {
      error:
        "The file could not be saved. Check the server filesystem permissions.",
    },
    { status: 500, headers },
  );
}

const queueState = globalThis as typeof globalThis & {
  marginWriteQueue?: Promise<unknown>;
};
export async function serializeWrite<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const previous = queueState.marginWriteQueue ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(operation);
  queueState.marginWriteQueue = next.catch(() => undefined);
  return next;
}

export async function atomicWrite(
  filename: string,
  content: string,
): Promise<void> {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, content, { encoding: "utf8", flag: "wx" });
    await fs.rename(temporary, filename);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

export function attachment(
  content: string,
  filename: string,
  type: string,
): NextResponse {
  return new NextResponse(content, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Content-Mode": "download",
    },
  });
}
