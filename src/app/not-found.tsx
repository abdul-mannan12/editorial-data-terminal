import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="container py-24 text-center">
      <p className="eyebrow muted">A page out of place · 404</p>
      <h1 className="page-heading">Nothing in this margin.</h1>
      <p className="muted my-7 text-sm">
        This page may have moved, or the note hasn’t been written yet.
      </p>
      <Link href="/" className="button button-primary">
        Back to the journal
      </Link>
    </main>
  );
}
