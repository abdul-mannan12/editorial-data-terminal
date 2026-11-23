import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { formatDate, site } from "@/lib/site";
import { ReadingProgress, SharePost } from "@/components/reading-tools";
import { AdSlot } from "@/components/ad-slot";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post)
    return { title: "Note not found", robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: `${post.date}T12:00:00Z`,
      authors: [site.author.name],
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  const posts = await getAllPosts();
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: `${post.date}T12:00:00Z`,
    dateModified: `${post.date}T12:00:00Z`,
    image: `${site.url}/opengraph-image`,
    author: {
      "@type": "Person",
      name: site.author.name,
      url: `${site.url}/about`,
    },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    inLanguage: "en-GB",
    articleSection: post.category,
  };
  return (
    <main id="main-content">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article>
        <header className="article-header">
          <Link className="eyebrow muted hover:underline" href="/#journal">
            The journal
          </Link>
          <div className="mt-7">
            <span className="category-tag">{post.category}</span>
          </div>
          <h1 className="page-heading">{post.title}</h1>
          <p className="muted mx-auto max-w-2xl text-base leading-8">
            {post.excerpt}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-xs muted">
            <span className="avatar">am</span>
            <Link href="/about" className="font-medium text-[var(--ink)]">
              {site.author.name}
            </Link>
            <span>·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readTime} min read</span>
          </div>
        </header>
        <figure className="article-hero">
          <Image
            src={post.coverImage}
            alt={`Original editorial illustration for ${post.title}`}
            width={1200}
            height={600}
            priority
            sizes="(max-width:1040px) 100vw, 1040px"
          />
          <figcaption className="muted mt-3 text-center font-mono text-[10px]">
            An independent note from Margin.
          </figcaption>
        </figure>
        <div className="prose-page !mt-0">
          <div className="prose" id="article-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                table: ({ children }) => (
                  <div className="table-wrap">
                    <table>{children}</table>
                  </div>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="callout">{children}</blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    rel={
                      href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {post.content.replace(
                /^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gm,
                (_, kind: string) =>
                  `> **${kind.charAt(0) + kind.slice(1).toLowerCase()}**`,
              )}
            </ReactMarkdown>
          </div>
          <footer className="mt-10 border-t border-[var(--border)] pt-7">
            <SharePost />
            <div className="panel mt-8 flex items-start gap-5 p-6">
              <span className="avatar">am</span>
              <div>
                <p className="eyebrow muted">Written by {site.author.name}</p>
                <p className="my-3 text-sm leading-7">{site.author.bio}</p>
                <Link className="text-link" href="/about">
                  Meet the author
                </Link>
              </div>
            </div>
          </footer>
          <AdSlot
            slotId={process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || ""}
            format="auto"
          />
          {related.length > 0 && (
            <aside className="mt-10" aria-label="More articles">
              <h2 className="section-title mb-5">Stay a little longer</h2>
              {related.map((p) => (
                <Link
                  className="flex items-start justify-between gap-6 border-t border-[var(--border)] py-5"
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                >
                  <span className="font-serif text-base leading-7">
                    {p.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] muted">
                    {p.readTime} min read
                  </span>
                </Link>
              ))}
            </aside>
          )}
        </div>
      </article>
    </main>
  );
}
