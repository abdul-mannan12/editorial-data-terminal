"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  LineChart,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import type { DailyStat } from "@/lib/types";

type Metric = "pageViews" | "visitors" | "subscribers" | "revenue";
type SortKey = Metric | "date";
const metrics: {
  key: Metric;
  label: string;
  icon: typeof Activity;
  description: string;
}[] = [
  {
    key: "pageViews",
    label: "Page views",
    icon: Activity,
    description: "Total pages opened",
  },
  {
    key: "visitors",
    label: "Visitors",
    icon: Users,
    description: "Daily visitors, summed",
  },
  {
    key: "subscribers",
    label: "New subscribers",
    icon: Users,
    description: "New subscribers in period",
  },
  {
    key: "revenue",
    label: "Revenue",
    icon: Wallet,
    description: "Recorded revenue in GBP",
  },
];
const ink = "var(--ink, #202724)";
const muted = "var(--muted, #737a72)";
const border = "var(--border, #d8dcd4)";
const accent = "var(--accent, #344B3D)";
const number = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

function display(value: number, metric: Metric) {
  return metric === "revenue" ? money.format(value) : number.format(value);
}

function dayLabel(date: string, long = false) {
  return new Intl.DateTimeFormat("en-US", {
    month: long ? "long" : "short",
    day: "numeric",
    ...(long ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function sum(data: DailyStat[], metric: Metric) {
  return data.reduce((total, row) => total + row[metric], 0);
}

function csvDownload(data: DailyStat[]) {
  const columns: (keyof DailyStat)[] = [
    "date",
    "pageViews",
    "visitors",
    "subscribers",
    "revenue",
  ];
  const csv = [
    columns.join(","),
    ...data.map((row) => columns.map((key) => row[key]).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `margin-daily-stats-${data.at(-1)?.date ?? "export"}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function TrendChart({
  data,
  metric,
  mode,
  compact,
}: {
  data: DailyStat[];
  metric: Metric;
  mode: "line" | "bar";
  compact: boolean;
}) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(780);
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId().replace(/:/g, "");
  const height = compact ? 230 : 275;
  const padding = { left: 48, right: 18, top: 22, bottom: 34 };
  const chartWidth = Math.max(1, width - padding.left - padding.right);
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(1, ...data.map((row) => row[metric]));
  const ceiling = Math.ceil(max / 4) * 4;
  const timestamps = data.map((row) =>
    new Date(`${row.date}T00:00:00Z`).getTime(),
  );
  const timeSpan = data.length > 1 ? timestamps.at(-1)! - timestamps[0] : 0;
  const point = (index: number) => ({
    x:
      padding.left +
      (timeSpan
        ? ((timestamps[index] - timestamps[0]) / timeSpan) * chartWidth
        : chartWidth / 2),
    y: padding.top + (1 - data[index][metric] / ceiling) * chartHeight,
  });
  const points = data.map((_, index) => point(index));
  const line = points
    .map((p, index) => `${index === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const average = data.length ? sum(data, metric) / data.length : 0;
  const tick = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      ...(metric === "revenue" ? { style: "currency", currency: "GBP" } : {}),
      notation: "compact",
      maximumFractionDigits: value > 1000 ? 1 : 0,
    }).format(value);
  const activeIndex = active !== null && active < data.length ? active : null;
  const current = activeIndex === null ? null : data[activeIndex];

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(260, entry.contentRect.width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [data.length === 0]);

  useEffect(() => setActive(null), [data, metric, mode]);

  if (!data.length)
    return (
      <div
        className="flex min-h-52 items-center justify-center text-sm"
        style={{ color: muted }}
      >
        No daily records in this period.
      </div>
    );

  return (
    <div ref={wrapper} className="relative w-full" style={{ minWidth: 0 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="group"
        aria-label={`${metrics.find((item) => item.key === metric)?.label} ${mode} chart, ${dayLabel(data[0].date)} to ${dayLabel(data.at(-1)!.date)}. Daily average ${display(average, metric)}. Focus a point and use the Left and Right arrow keys to inspect daily values.`}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) * width) / rect.width;
          setActive(
            points.reduce(
              (nearest, p, index) =>
                Math.abs(p.x - x) < Math.abs(points[nearest].x - x)
                  ? index
                  : nearest,
              0,
            ),
          );
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) * width) / rect.width;
          setActive(
            points.reduce(
              (nearest, p, index) =>
                Math.abs(p.x - x) < Math.abs(points[nearest].x - x)
                  ? index
                  : nearest,
              0,
            ),
          );
        }}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7b9c83" stopOpacity=".28" />
            <stop offset="100%" stopColor="#7b9c83" stopOpacity=".015" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((index) => {
          const y = padding.top + (index / 4) * chartHeight;
          return (
            <g key={index}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={border}
                strokeDasharray={index === 4 ? undefined : "3 5"}
              />
              <text
                x={padding.left - 11}
                y={y + 4}
                textAnchor="end"
                fill={muted}
                fontSize="12"
                fontFamily="var(--font-mono, monospace)"
              >
                {tick(ceiling * (1 - index / 4))}
              </text>
            </g>
          );
        })}
        {mode === "line" ? (
          <>
            <path
              d={`${line} L${points.at(-1)!.x},${padding.top + chartHeight} L${points[0].x},${padding.top + chartHeight} Z`}
              fill={`url(#${gradientId})`}
            />
            <path
              d={line}
              fill="none"
              stroke={accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          points.map((p, index) => (
            <rect
              key={data[index].date}
              x={p.x - Math.min(20, (chartWidth / data.length) * 0.62) / 2}
              y={p.y}
              width={Math.min(20, (chartWidth / data.length) * 0.62)}
              height={padding.top + chartHeight - p.y}
              rx="2"
              fill={accent}
              opacity={active === null || active === index ? 0.85 : 0.35}
            />
          ))
        )}
        {activeIndex !== null && (
          <line
            x1={points[activeIndex].x}
            y1={padding.top}
            x2={points[activeIndex].x}
            y2={padding.top + chartHeight}
            stroke={muted}
            strokeDasharray="3 4"
            opacity=".55"
          />
        )}
        {points.map((p, index) => (
          <circle
            key={data[index].date}
            cx={p.x}
            cy={p.y}
            r={activeIndex === index ? 5 : data.length === 1 ? 4 : 7}
            fill={
              activeIndex === index || data.length === 1
                ? accent
                : "transparent"
            }
            stroke={
              activeIndex === index ? "var(--surface, #FAF9F6)" : "transparent"
            }
            strokeWidth="2"
            data-point-index={index}
            tabIndex={index === (activeIndex ?? data.length - 1) ? 0 : -1}
            role="button"
            aria-label={`${dayLabel(data[index].date, true)}: ${display(data[index][metric], metric)}`}
            onFocus={() => setActive(index)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setActive(index);
                return;
              }
              const next =
                event.key === "ArrowLeft"
                  ? Math.max(0, index - 1)
                  : event.key === "ArrowRight"
                    ? Math.min(data.length - 1, index + 1)
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? data.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                setActive(next);
                wrapper.current
                  ?.querySelector<SVGCircleElement>(
                    `[data-point-index="${next}"]`,
                  )
                  ?.focus();
              }
            }}
          />
        ))}
        {Array.from(
          new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]),
        ).map((index) => (
          <text
            key={index}
            x={points[index].x}
            y={height - 8}
            textAnchor={
              index === 0
                ? "start"
                : index === data.length - 1
                  ? "end"
                  : "middle"
            }
            fill={muted}
            fontSize="12"
            fontFamily="var(--font-mono, monospace)"
          >
            {dayLabel(data[index].date)}
          </text>
        ))}
      </svg>
      {current && activeIndex !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 rounded border px-3 py-2 text-xs shadow-sm"
          style={{
            left: Math.max(
              8,
              Math.min(width - 178, points[activeIndex].x - 80),
            ),
            width: 170,
            maxWidth: "calc(100% - 16px)",
            borderColor: border,
            background: "var(--surface, #FAF9F6)",
            color: ink,
          }}
        >
          <p style={{ color: muted }}>{dayLabel(current.date, true)}</p>
          <p
            className="mt-1 font-semibold"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {display(current[metric], metric)}
          </p>
        </div>
      )}
    </div>
  );
}

export function StatsDashboard({
  data,
  compact = false,
}: {
  data: DailyStat[];
  compact?: boolean;
}) {
  const [days, setDays] = useState<7 | 14 | 30>(30);
  const [metric, setMetric] = useState<Metric>("pageViews");
  const [mode, setMode] = useState<"line" | "bar">("line");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const ordered = useMemo(
    () => [...data].sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );
  const windows = useMemo(() => {
    if (!ordered.length)
      return {
        current: [] as DailyStat[],
        prior: [] as DailyStat[],
        priorComplete: false,
      };
    const end = new Date(`${ordered.at(-1)!.date}T00:00:00Z`).getTime();
    const start = end - (days - 1) * 86400000;
    const previousStart = start - days * 86400000;
    const current = ordered.filter(
      (row) => new Date(`${row.date}T00:00:00Z`).getTime() >= start,
    );
    const prior = ordered.filter((row) => {
      const time = new Date(`${row.date}T00:00:00Z`).getTime();
      return time >= previousStart && time < start;
    });
    return {
      current,
      prior,
      priorComplete: prior.length === days && current.length === days,
    };
  }, [ordered, days]);
  const filtered = useMemo(
    () =>
      windows.current
        .filter((row) =>
          `${row.date} ${dayLabel(row.date, true)} ${row.pageViews} ${row.visitors} ${row.subscribers} ${row.revenue} ${metrics.map(({ key }) => display(row[key], key)).join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        )
        .sort((a, b) => {
          const result =
            sortKey === "date"
              ? a.date.localeCompare(b.date)
              : a[sortKey] - b[sortKey];
          return direction === "asc" ? result : -result;
        }),
    [windows.current, query, sortKey, direction],
  );
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  );

  const changeSort = (key: SortKey) => {
    setDirection(sortKey === key && direction === "desc" ? "asc" : "desc");
    setSortKey(key);
    setPage(0);
  };

  return (
    <div className="stats-dashboard" style={{ color: ink }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">
            {compact
              ? `The last ${days} days, at a glance.`
              : "Your daily performance"}
          </span>
          <span
            className="rounded-full border px-2.5 py-1 text-xs"
            style={{
              color: muted,
              borderColor: border,
              fontFamily: "var(--font-mono)",
            }}
          >
            SAMPLE DATA
          </span>
        </div>
        <div
          role="group"
          aria-label="Reporting period"
          className="inline-flex rounded-md border p-1"
          style={{ borderColor: border }}
        >
          {([7, 14, 30] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={days === value}
              onClick={() => {
                setDays(value);
                setPage(0);
              }}
              className="rounded px-3 py-1.5 text-xs transition-colors"
              style={{
                background: days === value ? accent : "transparent",
                color: days === value ? "var(--background, #FAF9F6)" : muted,
                fontFamily: "var(--font-mono)",
              }}
            >
              {value}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon, description }) => {
          const value = sum(windows.current, key);
          const old = sum(windows.prior, key);
          const percent =
            windows.priorComplete && old > 0
              ? ((value - old) / old) * 100
              : null;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setMetric(key)}
              aria-pressed={metric === key}
              className="min-w-0 rounded-md border p-4 text-left transition-colors sm:p-5"
              style={{
                borderColor: metric === key ? accent : border,
                background:
                  metric === key
                    ? "color-mix(in srgb, var(--accent, #344B3D) 5%, var(--surface, #FAF9F6))"
                    : "var(--surface, #FAF9F6)",
              }}
              title={description}
            >
              <div
                className="mb-3 flex items-center justify-between gap-2 text-xs"
                style={{ color: muted }}
              >
                <span>{label}</span>
                <Icon
                  size={14}
                  aria-hidden="true"
                  className="hidden sm:block"
                />
              </div>
              <p
                className="break-all text-lg tracking-tight sm:text-2xl"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
              >
                {display(value, key)}
              </p>
              <div
                className="mt-3 flex flex-wrap items-center gap-1.5 text-xs"
                style={{ color: muted }}
              >
                {percent === null ? (
                  <span title="A complete previous period with a nonzero baseline is required to calculate change.">
                    {windows.priorComplete
                      ? "— zero baseline"
                      : `— no prior ${days}D`}
                  </span>
                ) : (
                  <>
                    <span
                      className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5"
                      style={{
                        color:
                          percent >= 0
                            ? "var(--accent, #344B3D)"
                            : "light-dark(#a34530, #efa18b)",
                        background:
                          percent >= 0
                            ? "color-mix(in srgb, var(--accent, #344B3D) 10%, transparent)"
                            : "#b2523a12",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span className="sr-only">
                        {percent > 0
                          ? "Increase: "
                          : percent < 0
                            ? "Decrease: "
                            : "No change: "}
                      </span>
                      {percent > 0 ? (
                        <ArrowUp size={11} aria-hidden="true" />
                      ) : percent < 0 ? (
                        <ArrowDown size={11} aria-hidden="true" />
                      ) : null}
                      {Math.abs(percent).toFixed(1)}%
                    </span>
                    <span>vs prior {days}D</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className="mt-4 rounded-md border px-3 pb-3 pt-5 sm:px-5"
        style={{ borderColor: border, background: "var(--surface, #FAF9F6)" }}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: accent }}
              aria-hidden="true"
            />
            {metrics.find((item) => item.key === metric)?.label}
            <span className="ml-1 font-normal" style={{ color: muted }}>
              over time
            </span>
          </div>
          <div
            role="group"
            aria-label="Chart type"
            className="inline-flex gap-1 rounded border p-0.5"
            style={{ borderColor: border }}
          >
            <button
              type="button"
              aria-label="Line chart"
              aria-pressed={mode === "line"}
              onClick={() => setMode("line")}
              className="rounded p-1.5"
              style={{
                color: mode === "line" ? accent : muted,
                background:
                  mode === "line"
                    ? "color-mix(in srgb, var(--accent, #344B3D) 10%, transparent)"
                    : "transparent",
              }}
            >
              <LineChart size={16} />
            </button>
            <button
              type="button"
              aria-label="Bar chart"
              aria-pressed={mode === "bar"}
              onClick={() => setMode("bar")}
              className="rounded p-1.5"
              style={{
                color: mode === "bar" ? accent : muted,
                background:
                  mode === "bar"
                    ? "color-mix(in srgb, var(--accent, #344B3D) 10%, transparent)"
                    : "transparent",
              }}
            >
              <BarChart3 size={16} />
            </button>
          </div>
        </div>
        <TrendChart
          data={windows.current}
          metric={metric}
          mode={mode}
          compact={compact}
        />
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs"
          style={{
            borderColor: border,
            color: muted,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>
            {windows.current.length
              ? `${dayLabel(windows.current[0].date)} – ${dayLabel(windows.current.at(-1)!.date, true)}`
              : "No records"}
          </span>
          <span>{windows.current.length} daily records · GBP</span>
        </div>
      </div>

      {!compact && (
        <section className="mt-8" aria-labelledby="daily-records-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="daily-records-heading"
                className="text-xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Behind the chart
              </h2>
              <p className="mt-1 text-sm" style={{ color: muted }}>
                Every day, in plain numbers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => csvDownload(filtered)}
              disabled={!filtered.length}
              className="button inline-flex items-center gap-2 text-sm disabled:opacity-40"
            >
              <Download size={15} aria-hidden="true" />
              Export CSV
            </button>
          </div>
          <div
            className="overflow-hidden rounded-md border"
            style={{
              borderColor: border,
              background: "var(--surface, #FAF9F6)",
            }}
          >
            <div className="border-b p-4" style={{ borderColor: border }}>
              <label className="relative block max-w-sm">
                <span className="sr-only">Search daily data</span>
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: muted }}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search a date or value…"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(0);
                  }}
                  className="input w-full py-2 pl-9 pr-3 text-sm"
                  style={{ paddingLeft: 36 }}
                />
              </label>
            </div>
            <div
              className="overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-label="Daily metrics table"
            >
              <table className="w-full min-w-[590px] border-collapse text-sm">
                <caption className="sr-only">
                  Daily metrics for the selected {days}-day period. Click a
                  column heading to sort.
                </caption>
                <thead>
                  <tr
                    style={{
                      background:
                        "color-mix(in srgb, var(--ink, #202724) 3%, transparent)",
                    }}
                  >
                    {(
                      [{ key: "date", label: "Date" }, ...metrics] as {
                        key: SortKey;
                        label: string;
                      }[]
                    ).map(({ key, label }) => (
                      <th
                        key={key}
                        scope="col"
                        aria-sort={
                          sortKey === key
                            ? direction === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                        className={`border-b px-5 py-3 font-medium ${key === "date" ? "text-left" : "text-right"}`}
                        style={{ borderColor: border, color: muted }}
                      >
                        <button
                          type="button"
                          onClick={() => changeSort(key)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs"
                        >
                          {label}
                          {sortKey === key &&
                            (direction === "desc" ? (
                              <ArrowDown size={12} aria-hidden="true" />
                            ) : (
                              <ArrowUp size={12} aria-hidden="true" />
                            ))}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.length ? (
                    visible.map((row) => (
                      <tr
                        key={row.date}
                        className="transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_4%,transparent)]"
                      >
                        <th
                          scope="row"
                          className="border-b px-5 py-3.5 text-left font-normal"
                          style={{
                            borderColor: border,
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                          }}
                        >
                          {dayLabel(row.date, true)}
                        </th>
                        {metrics.map(({ key }) => (
                          <td
                            key={key}
                            className="border-b px-5 py-3.5 text-right"
                            style={{
                              borderColor: border,
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                            }}
                          >
                            {display(row[key], key)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center"
                        style={{ color: muted }}
                      >
                        No daily records match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div
              className="flex items-center justify-between gap-3 px-5 py-3 text-xs"
              style={{ color: muted }}
            >
              <p aria-live="polite" aria-atomic="true">
                {filtered.length
                  ? `${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, filtered.length)} of ${filtered.length} records`
                  : "0 records"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                  className="rounded border p-1.5 disabled:opacity-30"
                  style={{ borderColor: border }}
                >
                  <ChevronLeft size={15} />
                </button>
                <span>
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={safePage + 1 === totalPages}
                  onClick={() => setPage(safePage + 1)}
                  className="rounded border p-1.5 disabled:opacity-30"
                  style={{ borderColor: border }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: muted }}>
            Visitors are daily counts summed across the period, not deduplicated
            people. Percentage changes appear only when both comparison periods
            are complete; a zero baseline is shown without a percentage.
          </p>
        </section>
      )}
    </div>
  );
}
