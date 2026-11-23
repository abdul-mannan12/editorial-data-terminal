import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  verifySession,
  validatePassword,
  writesEnabled,
} from "../src/lib/auth";
import { parsePost, serializePost, slugSchema } from "../src/lib/content";
import { mergeStats, parseStatsInput, validateStats } from "../src/lib/stats";
import { assertSameOrigin, readJson, serializeWrite } from "../src/lib/admin";
import { NextRequest } from "next/server";

const row = {
  date: "2026-11-21",
  pageViews: 1200,
  visitors: 800,
  subscribers: 12,
  revenue: 8.5,
};
const post = {
  title: "A useful daily habit",
  date: "2026-11-21",
  slug: "a-useful-daily-habit",
  excerpt: "A measured approach to building a useful writing habit.",
  category: "Field notes",
  coverImage: "/images/cover-focus.svg",
  readTime: 5,
  featured: false,
  content: "## Small steps\n\nA useful idea with enough words to publish.",
};

test("post serialization preserves YAML punctuation and metadata", () => {
  const input = {
    ...post,
    title: 'A story: with "quotes" and # signs',
    excerpt:
      "A description with: punctuation and a newline\nthat stays safely inside YAML.",
  };
  const { markdown } = serializePost(input);
  assert.deepEqual(parsePost(markdown), {
    ...input,
    content: `${input.content}\n`,
  });
});

test("bare YAML dates parse correctly", () => {
  const { markdown } = serializePost(post);
  assert.equal(
    parsePost(
      markdown.replace(/date: ['"]?2026-11-21['"]?/, "date: 2026-11-21"),
    ).date,
    "2026-11-21",
  );
});

test("unsafe slugs, invalid dates and remote covers are rejected", () => {
  for (const slug of [
    "../outside",
    "a/b",
    "a%2fb",
    "Uppercase",
    "-leading",
    "con",
    "nul",
    "com1",
  ])
    assert.equal(slugSchema.safeParse(slug).success, false);
  assert.throws(() => serializePost({ ...post, date: "2026-02-30" }));
  assert.throws(() =>
    serializePost({ ...post, coverImage: "//example.com/track.svg" }),
  );
  assert.throws(() =>
    serializePost({ ...post, coverImage: "/images/../other.svg" }),
  );
  assert.throws(() => serializePost({ ...post, content: "" }));
});

test("CSV imports quoted fields and UTF-8 BOM and validates numeric columns", () => {
  assert.deepEqual(
    parseStatsInput(
      '\uFEFFdate,pageViews,visitors,subscribers,revenue\n"2026-11-21",1200,800,12,8.50\n',
      "csv",
    ),
    [row],
  );
  assert.throws(() =>
    parseStatsInput(
      "date,pageViews,visitors,subscribers,revenue\n2026-11-21,,800,12,8.50",
      "csv",
    ),
  );
  assert.throws(() =>
    parseStatsInput(
      "date,pageViews,visitors,subscribers,wrong\n2026-11-21,1200,800,12,8.50",
      "csv",
    ),
  );
  assert.throws(() =>
    parseStatsInput(
      "date,date,pageViews,visitors,subscribers,revenue\n2026-11-20,2026-11-21,1200,800,12,8.50",
      "csv",
    ),
  );
});

test("stats reject duplicates, impossible dates, negative and malformed values", () => {
  assert.throws(() => validateStats([row, row]));
  assert.throws(() => validateStats([{ ...row, date: "2026-02-30" }]));
  assert.throws(() => validateStats([{ ...row, revenue: -1 }]));
  assert.throws(() => validateStats([{ ...row, visitors: 2000 }]));
  assert.throws(() => validateStats([{ ...row, subscribers: "12" }]));
  assert.throws(() => parseStatsInput("{broken", "json"));
});

test("merging replaces the same date and keeps other dates sorted", () => {
  assert.deepEqual(
    mergeStats(
      [row],
      [
        { ...row, date: "2026-11-20" },
        { ...row, revenue: 12 },
      ],
    ),
    [
      { ...row, date: "2026-11-20" },
      { ...row, revenue: 12 },
    ],
  );
});

test("concurrent queued imports preserve all days rather than losing updates", async () => {
  let data = [row];
  await Promise.all(
    [18, 19, 20].map((day) =>
      serializeWrite(async () => {
        const previous = data;
        await new Promise<void>((resolve) => setImmediate(resolve));
        data = mergeStats(previous, [{ ...row, date: `2026-11-${day}` }]);
      }),
    ),
  );
  assert.deepEqual(
    data.map((entry) => entry.date),
    ["2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21"],
  );
});

test("signed admin sessions reject tampering, expiry and password changes", () => {
  const previous = process.env.ADMIN_PASSWORD;
  const previousSecret = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_PASSWORD = "test-password-long-enough";
  delete process.env.ADMIN_SESSION_SECRET;
  try {
    const now = Date.UTC(2026, 10, 21);
    const token = createSession(now);
    assert.equal(verifySession(token, now), true);
    assert.equal(verifySession(token, now + 8 * 60 * 60 * 1000), false);
    assert.equal(verifySession(`${token.slice(0, -1)}!`, now), false);
    assert.equal(verifySession(token.replace("v1.", "v2."), now), false);
    assert.equal(validatePassword("test-password-long-enough"), true);
    assert.equal(validatePassword("wrong-password"), false);
    process.env.ADMIN_PASSWORD = "a-different-long-password";
    assert.equal(verifySession(token, now), false);
    delete process.env.ADMIN_PASSWORD;
    assert.equal(verifySession(token, now), false);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = previous;
    if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = previousSecret;
  }
});

test("Vercel always disables file writes even when explicitly enabled", () => {
  const previousVercel = process.env.VERCEL;
  const previousWrites = process.env.CONTENT_WRITE_ENABLED;
  try {
    process.env.VERCEL = "1";
    process.env.CONTENT_WRITE_ENABLED = "true";
    assert.equal(writesEnabled(), false);
    delete process.env.VERCEL;
    assert.equal(writesEnabled(), true);
    process.env.CONTENT_WRITE_ENABLED = "false";
    assert.equal(writesEnabled(), false);
  } finally {
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousWrites === undefined) delete process.env.CONTENT_WRITE_ENABLED;
    else process.env.CONTENT_WRITE_ENABLED = previousWrites;
  }
});

test("admin mutations reject missing origins, foreign origins and simple form requests", () => {
  const request = (headers: Record<string, string>) =>
    new NextRequest("http://localhost:3000/api/admin/posts", {
      method: "POST",
      headers,
      body: "{}",
    });
  assert.throws(() =>
    assertSameOrigin(request({ "content-type": "application/json" })),
  );
  assert.throws(() =>
    assertSameOrigin(
      request({
        origin: "https://evil.example",
        "content-type": "application/json",
      }),
    ),
  );
  assert.throws(() =>
    assertSameOrigin(
      request({
        origin: "http://localhost:3000",
        "content-type": "application/x-www-form-urlencoded",
      }),
    ),
  );
  assert.doesNotThrow(() =>
    assertSameOrigin(
      request({
        origin: "http://localhost:3000",
        "content-type": "application/json",
      }),
    ),
  );
});

test("body parser enforces streamed size limits without trusting Content-Length", async () => {
  const request = (body: string) =>
    new NextRequest("http://localhost:3000/api/admin/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
  await assert.rejects(
    readJson(request('{"value":"too big"}'), 5),
    /too large/,
  );
  await assert.rejects(readJson(request("not-json")), /valid JSON/);
  assert.deepEqual(await readJson(request('{"value":12}')), { value: 12 });
});
