import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { z } from "zod";
import { dateSchema } from "./content";
import type { DailyStat } from "./types";

export const statsFile = path.join(
  process.cwd(),
  "content",
  "stats",
  "daily-stats.json",
);
const count = z.number().int().nonnegative().max(1_000_000_000);
export const dailyStatSchema = z
  .object({
    date: dateSchema,
    pageViews: count,
    visitors: count,
    subscribers: count,
    revenue: z
      .number()
      .nonnegative()
      .max(1_000_000_000)
      .refine((value) => Number.isFinite(value), "Revenue must be finite."),
  })
  .strict()
  .refine(
    (row) => row.visitors <= row.pageViews,
    "Visitors cannot exceed page views.",
  );
export const statsSchema = z
  .array(dailyStatSchema)
  .min(1)
  .max(10_000)
  .superRefine((rows, context) => {
    const dates = new Set<string>();
    rows.forEach((row, index) => {
      if (dates.has(row.date))
        context.addIssue({
          code: "custom",
          message: `Duplicate date: ${row.date}`,
          path: [index, "date"],
        });
      dates.add(row.date);
    });
  });

export function validateStats(input: unknown): DailyStat[] {
  return statsSchema.parse(input).sort((a, b) => a.date.localeCompare(b.date));
}

export function parseStatsInput(
  source: string,
  format: "json" | "csv",
): DailyStat[] {
  if (Buffer.byteLength(source, "utf8") > 2_000_000)
    throw new Error("Stats files must be smaller than 2 MB.");
  if (format === "json") return validateStats(JSON.parse(source));
  const expected = ["date", "pageViews", "visitors", "subscribers", "revenue"];
  const rows = parse(source, {
    columns: (headers: string[]) => {
      if (
        headers.length !== expected.length ||
        new Set(headers).size !== expected.length ||
        expected.some((key) => !headers.includes(key))
      )
        throw new Error(`CSV headers must be: ${expected.join(",")}`);
      return headers;
    },
    bom: true,
    skip_empty_lines: true,
    trim: true,
    max_record_size: 10_000,
  }) as Record<string, string>[];
  return validateStats(
    rows.map((row) => {
      if (
        Object.keys(row).length !== expected.length ||
        expected.some((key) => !Object.hasOwn(row, key))
      )
        throw new Error(`CSV headers must be: ${expected.join(",")}`);
      if (
        expected
          .slice(1)
          .some((key) => row[key] === "" || !/^\d+(?:\.\d+)?$/.test(row[key]))
      )
        throw new Error("CSV metric values must be non-negative numbers.");
      return {
        date: row.date,
        pageViews: Number(row.pageViews),
        visitors: Number(row.visitors),
        subscribers: Number(row.subscribers),
        revenue: Number(row.revenue),
      };
    }),
  );
}

export async function getDailyStats(): Promise<DailyStat[]> {
  return validateStats(JSON.parse(await fs.readFile(statsFile, "utf8")));
}

export function mergeStats(
  existing: DailyStat[],
  incoming: DailyStat[],
): DailyStat[] {
  const rows = new Map(existing.map((row) => [row.date, row]));
  for (const row of incoming) rows.set(row.date, row);
  return validateStats([...rows.values()]);
}
