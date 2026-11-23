import type { Metadata } from "next";
import Link from "next/link";
import { Database, LockKeyhole } from "lucide-react";
import { StatsDashboard } from "@/components/stats-dashboard";
import { getDailyStats } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Daily analytics",
  description:
    "A transparent daily journal of page views, visitors, subscribers, and revenue. Explore the numbers behind the writing.",
  alternates: { canonical: "/stats" },
};

export default async function StatsPage() {
  const data = await getDailyStats();
  return (
    <main id="main-content" className="container py-10 sm:py-14">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex items-center gap-2 text-xs"
        style={{ color: "var(--muted)" }}
      >
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span>Daily analytics</span>
      </nav>
      <header
        className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b pb-8"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">The open dashboard</p>
          <h1
            className="text-4xl leading-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            A practice in transparency.
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            Good stories deserve honest numbers. A daily record of the readers,
            small milestones, and steady work behind this journal.
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}
        >
          <Database size={14} aria-hidden="true" />
          {data.length} daily entries
        </div>
      </header>
      <StatsDashboard data={data} />
      <aside
        className="mt-10 flex items-start gap-3 rounded-md border p-5"
        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      >
        <LockKeyhole size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="text-sm leading-relaxed">
          <h2 className="mb-1 font-medium" style={{ color: "var(--ink)" }}>
            A small note on the numbers
          </h2>
          <p>
            This starter includes fictional demonstration data for October
            23–November 21, 2026. These are sample records, not live tracking.
            The site does not collect visitor analytics itself. The owner can
            replace the dataset through the{" "}
            <Link href="/admin" className="underline underline-offset-4">
              private dashboard
            </Link>{" "}
            or the daily statistics JSON file. Revenue is recorded in British
            pounds (GBP).
          </p>
        </div>
      </aside>
    </main>
  );
}
