import type { ReactNode } from "react";

export function ProsePage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main id="main-content" className="prose-page">
      <p className="eyebrow muted">{eyebrow}</p>
      <h1 className="page-heading">{title}</h1>
      {description && (
        <p className="muted mb-9 text-base leading-8">{description}</p>
      )}
      <div className="prose">{children}</div>
    </main>
  );
}
