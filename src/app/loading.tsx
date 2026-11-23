export default function Loading() {
  return (
    <main id="main-content" className="container py-20" aria-live="polite">
      <p className="eyebrow muted">Turning the page…</p>
      <div className="mt-8 h-52 animate-pulse rounded bg-[var(--accent-soft)]" />
    </main>
  );
}
