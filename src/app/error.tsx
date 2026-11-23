"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="container py-24 text-center">
      <p className="eyebrow muted">A momentary interruption</p>
      <h1 className="page-heading">Let’s turn the page again.</h1>
      <p className="muted my-7 text-sm">
        Something didn’t load as expected. Please try again.
      </p>
      <button className="button button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
