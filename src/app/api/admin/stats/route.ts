import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  apiError,
  atomicWrite,
  attachment,
  readJson,
  requireAdmin,
  RequestError,
  serializeWrite,
} from "@/lib/admin";
import { isAuthenticated, writesEnabled } from "@/lib/auth";
import {
  dailyStatSchema,
  getDailyStats,
  mergeStats,
  parseStatsInput,
  statsFile,
} from "@/lib/stats";

export const runtime = "nodejs";
const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("upsert"), row: dailyStatSchema }),
  z.object({
    action: z.literal("import"),
    source: z.string().min(1).max(2_000_000),
    format: z.enum(["json", "csv"]),
    mode: z.enum(["merge", "replace"]).default("merge"),
  }),
]);

export async function GET() {
  try {
    if (!(await isAuthenticated()))
      throw new RequestError("Please sign in to export data.", 401);
    return attachment(
      `${JSON.stringify(await getDailyStats(), null, 2)}\n`,
      "daily-stats.json",
      "application/json; charset=utf-8",
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const input = inputSchema.parse(await readJson(request));
    const incoming =
      input.action === "upsert"
        ? [input.row]
        : parseStatsInput(input.source, input.format);
    return await serializeWrite(async () => {
      const data =
        input.action === "import" && input.mode === "replace"
          ? incoming
          : mergeStats(await getDailyStats(), incoming);
      const json = `${JSON.stringify(data, null, 2)}\n`;
      if (!writesEnabled())
        return attachment(
          json,
          "daily-stats.json",
          "application/json; charset=utf-8",
        );
      await atomicWrite(statsFile, json);
      revalidatePath("/", "layout");
      return NextResponse.json({
        success: true,
        message: `${incoming.length} daily record${incoming.length === 1 ? "" : "s"} saved. Charts now use the updated data.`,
        data,
      });
    });
  } catch (error) {
    return apiError(error);
  }
}
