"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileText,
  LockKeyhole,
  LogOut,
  Save,
  Upload,
} from "lucide-react";
import type { DailyStat } from "@/lib/types";
import "./admin-dashboard.css";

type Props = {
  configured: boolean;
  authenticated: boolean;
  writable: boolean;
  initialStats: DailyStat[];
};
type Notice = { kind: "success" | "error"; text: string } | null;
type ApiResult = {
  message?: string;
  data?: DailyStat[];
  downloaded?: boolean;
  url?: string;
};

async function submit(endpoint: string, payload: unknown): Promise<ApiResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const result = await response
      .json()
      .catch(() => ({ error: "The server returned an unexpected response." }));
    throw new Error(result.error ?? "The request could not be completed.");
  }
  if (response.headers.get("x-content-mode") === "download") {
    const file = await response.blob();
    const objectUrl = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download =
      /filename="([^"]+)"/.exec(
        response.headers.get("content-disposition") ?? "",
      )?.[1] ?? "content.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return {
      downloaded: true,
      message:
        "Validated file downloaded. Add it to your content folder, commit it, and redeploy to publish the change.",
    };
  }
  return response.json();
}

export function AdminDashboard({
  configured,
  authenticated,
  writable,
  initialStats,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"post" | "stats">("post");
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [source, setSource] = useState("");
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [recordCount, setRecordCount] = useState(initialStats.length);
  const [publishedUrl, setPublishedUrl] = useState<string>();
  const today = new Date().toISOString().slice(0, 10);

  async function perform(action: () => Promise<ApiResult>) {
    setBusy(true);
    setNotice(null);
    setPublishedUrl(undefined);
    try {
      const result = await action();
      setNotice({ kind: "success", text: result.message ?? "Done." });
      if (result.data) setRecordCount(result.data.length);
      if (result.url) setPublishedUrl(result.url);
      if (!result.downloaded) router.refresh();
    } catch (error) {
      setNotice({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void perform(async () => {
      await submit("/api/admin/login", { password: form.get("password") });
      return { message: "Signed in. Welcome back." };
    });
  }

  function handlePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    void perform(() =>
      submit("/api/admin/posts", {
        ...payload,
        slug,
        readTime: Number(form.get("readTime")),
        featured: form.get("featured") === "on",
      }),
    );
  }

  function handleDaily(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void perform(() =>
      submit("/api/admin/stats", {
        action: "upsert",
        row: {
          date: form.get("date"),
          pageViews: Number(form.get("pageViews")),
          visitors: Number(form.get("visitors")),
          subscribers: Number(form.get("subscribers")),
          revenue: Number(form.get("revenue")),
        },
      }),
    );
  }

  const noticeElement = notice && (
    <div
      role={notice.kind === "error" ? "alert" : "status"}
      className={`admin-notice ${notice.kind === "error" ? "admin-notice-error" : "admin-notice-success"}`}
    >
      {notice.kind === "error" ? (
        <AlertCircle size={18} aria-hidden="true" />
      ) : (
        <CheckCircle2 size={18} aria-hidden="true" />
      )}
      <div>
        {notice.text}
        {publishedUrl && (
          <a href={publishedUrl} className="ml-2 underline">
            Read your post
          </a>
        )}
      </div>
    </div>
  );

  if (!authenticated)
    return (
      <main id="main-content" className="container admin-page py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <div className="admin-lock">
            <LockKeyhole size={25} aria-hidden="true" />
          </div>
          <p className="eyebrow mt-6">THE EDITOR&apos;S DESK</p>
          <h1 className="mt-3 text-4xl">A little space to publish.</h1>
          <p className="muted mt-4">
            Sign in to write a new story, update your daily numbers, or export
            your data.
          </p>
          {noticeElement}
          {!configured ? (
            <div className="panel mt-8 p-6">
              <h2 className="text-xl">Set up your admin password</h2>
              <p className="muted mt-3">
                Copy <code>.env.example</code> to <code>.env.local</code>, set{" "}
                <code>ADMIN_PASSWORD</code> to a unique password of at least 12
                characters, and restart the server.
              </p>
              <p className="muted mt-3">
                The dashboard stays locked until a password is configured.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="panel mt-8 space-y-5 p-6">
              <label className="field">
                <span>Admin password</span>
                <input
                  className="input"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  maxLength={1024}
                  autoFocus
                />
              </label>
              <button
                className="button button-primary w-full justify-center"
                disabled={busy}
                type="submit"
              >
                <LockKeyhole size={16} aria-hidden="true" />
                {busy ? "Signing in…" : "Sign in to dashboard"}
              </button>
              <p className="muted text-sm">
                Your session expires after eight hours.
              </p>
            </form>
          )}
        </div>
      </main>
    );

  return (
    <main id="main-content" className="container admin-page py-10 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">THE EDITOR&apos;S DESK</p>
          <h1 className="mt-3 text-4xl md:text-5xl">
            Make something worth reading.
          </h1>
          <p className="muted mt-4">
            A quiet workspace for your words and your numbers.
          </p>
        </div>
        <button
          className="button"
          disabled={busy}
          onClick={() =>
            void perform(async () => {
              await submit("/api/admin/logout", {});
              return { message: "Signed out." };
            })
          }
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>
      <div className="panel mt-8 flex flex-wrap items-center gap-3 p-4 text-sm">
        <Database size={18} aria-hidden="true" />
        <strong>
          {writable ? "Local publishing enabled" : "Download & deploy mode"}
        </strong>
        <span className="muted">
          {writable
            ? "Changes save directly to your content files."
            : "Your host has no durable writable filesystem. Validated files download for you to commit and redeploy."}
        </span>
      </div>
      <div
        className="mt-8 flex gap-2 border-b border-[var(--border)] pb-4"
        role="tablist"
        aria-label="Admin tools"
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const next =
            event.key === "Home"
              ? "post"
              : event.key === "End"
                ? "stats"
                : tab === "post"
                  ? "stats"
                  : "post";
          setTab(next);
          setNotice(null);
          document.getElementById(`${next}-tab`)?.focus();
        }}
      >
        <button
          id="post-tab"
          role="tab"
          tabIndex={tab === "post" ? 0 : -1}
          aria-selected={tab === "post"}
          aria-controls="post-panel"
          className={`button ${tab === "post" ? "button-primary" : ""}`}
          onClick={() => {
            setTab("post");
            setNotice(null);
          }}
        >
          <FileText size={17} aria-hidden="true" />
          Write a post
        </button>
        <button
          id="stats-tab"
          role="tab"
          tabIndex={tab === "stats" ? 0 : -1}
          aria-selected={tab === "stats"}
          aria-controls="stats-panel"
          className={`button ${tab === "stats" ? "button-primary" : ""}`}
          onClick={() => {
            setTab("stats");
            setNotice(null);
          }}
        >
          <Database size={17} aria-hidden="true" />
          Daily analytics
        </button>
      </div>
      {noticeElement}
      {tab === "post" ? (
        <section
          id="post-panel"
          role="tabpanel"
          aria-labelledby="post-tab"
          className="mt-8"
        >
          <form
            className="grid gap-8 lg:grid-cols-[1fr_300px]"
            onSubmit={handlePost}
          >
            <div className="space-y-5">
              <label className="field">
                <span>Post title</span>
                <input
                  name="title"
                  className="input text-lg"
                  required
                  minLength={3}
                  maxLength={160}
                  placeholder="What have you been thinking about?"
                  onChange={(event) => {
                    if (!slugEdited)
                      setSlug(
                        event.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, "")
                          .slice(0, 100),
                      );
                  }}
                />
              </label>
              <label className="field">
                <span>Excerpt</span>
                <textarea
                  name="excerpt"
                  className="input"
                  rows={3}
                  required
                  minLength={10}
                  maxLength={500}
                  placeholder="A short introduction for the journal and search results."
                />
              </label>
              <label className="field">
                <span>Story · Markdown</span>
                <textarea
                  name="content"
                  className="input min-h-[450px] font-mono text-sm leading-relaxed"
                  required
                  minLength={20}
                  maxLength={150000}
                  placeholder={
                    "## Start with an idea\n\nWrite your story here. Tables, code blocks, and Markdown are supported.\n\n> [!NOTE]\n> Add a useful callout."
                  }
                />
              </label>
              <p className="muted text-sm">
                Use headings, lists, fenced code blocks, and tables. Callouts
                support <code>&gt; [!NOTE]</code>, <code>&gt; [!TIP]</code>, and{" "}
                <code>&gt; [!WARNING]</code>. Raw HTML is disabled for safe
                publishing.
              </p>
            </div>
            <aside className="panel h-fit space-y-5 p-5">
              <h2 className="text-2xl">Publishing details</h2>
              <label className="field">
                <span>URL slug</span>
                <input
                  className="input"
                  name="slug"
                  value={slug}
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={100}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(event.target.value);
                  }}
                />
                <span className="muted text-xs">
                  /blog/{slug || "your-story"}
                </span>
              </label>
              <label className="field">
                <span>Publication date</span>
                <input
                  type="date"
                  name="date"
                  className="input"
                  required
                  defaultValue={today}
                />
              </label>
              <label className="field">
                <span>Category</span>
                <input
                  name="category"
                  className="input"
                  required
                  maxLength={50}
                  placeholder="Building in public"
                />
              </label>
              <label className="field">
                <span>Reading time · minutes</span>
                <input
                  name="readTime"
                  className="input"
                  type="number"
                  min={1}
                  max={180}
                  required
                  defaultValue={5}
                />
              </label>
              <label className="field">
                <span>Cover image path</span>
                <input
                  name="coverImage"
                  className="input"
                  required
                  defaultValue="/images/quiet-internet.svg"
                  maxLength={500}
                />
                <span className="muted text-xs">
                  Add your image to public/images first.
                </span>
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="featured"
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Feature on the homepage
              </label>
              <button
                type="submit"
                disabled={busy}
                className="button button-primary w-full justify-center"
              >
                <Save size={16} aria-hidden="true" />
                {busy
                  ? "Validating…"
                  : writable
                    ? "Publish post"
                    : "Download post"}
              </button>
            </aside>
          </form>
        </section>
      ) : (
        <section
          id="stats-panel"
          role="tabpanel"
          aria-labelledby="stats-tab"
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <div className="panel p-6">
            <p className="eyebrow">ONE DAY AT A TIME</p>
            <h2 className="mt-2 text-2xl">Add a daily snapshot</h2>
            <p className="muted mt-2 text-sm">
              An existing date is updated. Subscribers means new subscribers for
              that day; revenue is GBP.
            </p>
            <form
              className="mt-6 grid gap-5 sm:grid-cols-2"
              onSubmit={handleDaily}
            >
              <label className="field sm:col-span-2">
                <span>Date</span>
                <input
                  className="input"
                  type="date"
                  name="date"
                  required
                  defaultValue={today}
                />
              </label>
              {[
                { name: "pageViews", label: "Page views" },
                { name: "visitors", label: "Unique visitors" },
                { name: "subscribers", label: "New subscribers" },
                { name: "revenue", label: "Revenue · GBP" },
              ].map((field) => (
                <label className="field" key={field.name}>
                  <span>{field.label}</span>
                  <input
                    className="input"
                    type="number"
                    name={field.name}
                    min={0}
                    max={1000000000}
                    step={field.name === "revenue" ? "0.01" : "1"}
                    required
                    placeholder="0"
                  />
                </label>
              ))}
              <button
                type="submit"
                disabled={busy}
                className="button button-primary justify-center sm:col-span-2"
              >
                <Save size={16} aria-hidden="true" />
                {busy
                  ? "Validating…"
                  : writable
                    ? "Save daily snapshot"
                    : "Download updated stats"}
              </button>
            </form>
          </div>
          <div className="panel p-6">
            <p className="eyebrow">BRING YOUR OWN NUMBERS</p>
            <h2 className="mt-2 text-2xl">Import daily data</h2>
            <p className="muted mt-2 text-sm">
              Upload JSON or CSV, or paste the contents below. Maximum 2 MB and
              10,000 rows. All rows are validated before any file changes.
            </p>
            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                void perform(() =>
                  submit("/api/admin/stats", {
                    action: "import",
                    source,
                    format,
                    mode: importMode,
                  }),
                );
              }}
            >
              <label className="field">
                <span>Choose a file</span>
                <input
                  type="file"
                  className="input text-sm"
                  accept=".json,.csv,application/json,text/csv"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 2_000_000) {
                      setNotice({
                        kind: "error",
                        text: "Choose a file smaller than 2 MB.",
                      });
                      event.target.value = "";
                      return;
                    }
                    try {
                      setSource(await file.text());
                      setFormat(
                        file.name.toLowerCase().endsWith(".csv")
                          ? "csv"
                          : "json",
                      );
                      setNotice(null);
                    } catch {
                      setNotice({
                        kind: "error",
                        text: "This file could not be read.",
                      });
                    }
                  }}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="field">
                  <span>File format</span>
                  <select
                    className="input"
                    value={format}
                    onChange={(event) =>
                      setFormat(event.target.value as "json" | "csv")
                    }
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                  </select>
                </label>
                <label className="field">
                  <span>Import behavior</span>
                  <select
                    className="input"
                    value={importMode}
                    onChange={(event) =>
                      setImportMode(event.target.value as "merge" | "replace")
                    }
                  >
                    <option value="merge">Merge by date</option>
                    <option value="replace">Replace all data</option>
                  </select>
                </label>
              </div>
              {importMode === "replace" && (
                <p className="admin-notice admin-notice-error text-sm">
                  Replace removes dates missing from this file. Export a backup
                  first.
                </p>
              )}
              <label className="field">
                <span>Data</span>
                <textarea
                  className="input font-mono text-xs leading-relaxed"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  required
                  rows={7}
                  maxLength={2000000}
                  placeholder={
                    format === "json"
                      ? '[{"date":"2026-11-21","pageViews":1200,"visitors":800,"subscribers":12,"revenue":8.50}]'
                      : "date,pageViews,visitors,subscribers,revenue\n2026-11-21,1200,800,12,8.50"
                  }
                />
              </label>
              <button
                type="submit"
                className="button button-primary w-full justify-center"
                disabled={busy || !source.trim()}
              >
                <Upload size={16} aria-hidden="true" />
                {busy
                  ? "Validating…"
                  : writable
                    ? "Validate & import"
                    : "Validate & download"}
              </button>
            </form>
          </div>
          <div className="panel flex flex-wrap items-center justify-between gap-4 p-5 lg:col-span-2">
            <div>
              <strong className="font-mono">{recordCount} daily records</strong>
              <p className="muted mt-1 text-sm">
                Keep a backup before importing or editing your metrics.
              </p>
            </div>
            <a
              className="button"
              href="/api/admin/stats"
              download="daily-stats.json"
            >
              <Download size={16} aria-hidden="true" />
              Export current JSON
            </a>
          </div>
        </section>
      )}
    </main>
  );
}
