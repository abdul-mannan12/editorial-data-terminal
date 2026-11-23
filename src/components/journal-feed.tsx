"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import type { Post } from "@/lib/types";
import { formatDate } from "@/lib/site";

export function JournalFeed({
  posts,
  showAll = false,
}: {
  posts: Omit<Post, "content">[];
  showAll?: boolean;
}) {
  const [category, setCategory] = useState("All notes");
  const [query, setQuery] = useState("");
  const categories = useMemo(
    () => ["All notes", ...new Set(posts.map((p) => p.category))],
    [posts],
  );
  const filtered = posts.filter(
    (p) =>
      (category === "All notes" || p.category === category) &&
      `${p.title} ${p.excerpt} ${p.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section
      className="journal-section section-rule"
      id="journal"
      aria-labelledby="journal-heading"
    >
      <div className="section-heading">
        <h2 id="journal-heading" className="section-title">
          {showAll ? "The journal" : "More from the journal"}
        </h2>
        <span className="eyebrow muted">{posts.length} NOTES & COUNTING</span>
      </div>
      <div className="journal-controls">
        <div className="category-pills" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              className="pill"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs muted">
          <Search size={14} />
          <span className="sr-only">Search journal</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a note…"
            className="w-32 border-0 bg-transparent py-2 text-xs outline-offset-2"
          />
        </label>
      </div>
      <div className="article-grid">
        {filtered.map((post) => (
          <article key={post.slug} className="article-card">
            <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
              <Image
                className="article-cover"
                src={post.coverImage}
                alt=""
                width={640}
                height={350}
                sizes="(max-width:700px) 125px, 33vw"
              />
            </Link>
            <div className="feature-label">
              <span className="category-tag">{post.category}</span>
            </div>
            <h3 className="article-title">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h3>
            <p className="article-excerpt">{post.excerpt}</p>
            <div className="post-meta">
              <time dateTime={post.date}>{formatDate(post.date, true)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readTime} min read</span>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div role="status" className="panel p-10 text-center">
          <p className="font-serif text-xl">No notes found.</p>
          <p className="muted my-3 text-sm">
            Try another category or search term.
          </p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setCategory("All notes");
            }}
          >
            <X size={14} />
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
