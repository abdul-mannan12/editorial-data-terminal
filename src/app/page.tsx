import Link from "next/link";
import Image from "next/image";
import { BookOpen, TrendingUp } from "lucide-react";
import { getAllPosts } from "@/lib/content";
import { getDailyStats } from "@/lib/stats";
import { formatDate, site } from "@/lib/site";
import { JournalFeed } from "@/components/journal-feed";
import { AdSlot } from "@/components/ad-slot";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [posts, stats] = await Promise.all([getAllPosts(), getDailyStats()]);
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const last7 = stats.slice(-7);
  const previous = stats.slice(-14, -7);
  const views = last7.reduce((s, r) => s + r.pageViews, 0);
  const prior = previous.reduce((s, r) => s + r.pageViews, 0);
  const change =
    prior > 0 && previous.length === 7 && last7.length === 7
      ? ((views - prior) / prior) * 100
      : null;
  const subscribers = last7.reduce((s, r) => s + r.subscribers, 0);
  const revenue = last7.reduce((s, r) => s + r.revenue, 0);
  const max = Math.max(1, ...last7.map((s) => s.pageViews));
  const coords = last7.map(
    (r, i) =>
      `${i * (286 / Math.max(1, last7.length - 1))},${84 - (r.pageViews / max) * 70}`,
  );
  const publicPosts = posts
    .filter((p) => p.slug !== featured?.slug)
    .map(({ content, ...post }) => {
      void content;
      return post;
    });
  return (
    <main id="main-content" className="container">
      <section className="hero">
        <div className="hero-meta">
          <span className="eyebrow muted">
            An independent journal by {site.author.name}
          </span>
          <span className="eyebrow muted">
            Digital craft. Everyday curiosity.
          </span>
        </div>
        <h1>
          A little perspective.
          <br />A lot of <em>curiosity.</em>
        </h1>
        <div className="hero-bottom">
          <p className="hero-description">
            Notes on building things, paying attention, and finding a little
            more meaning in the everyday. Welcome to my corner of the internet.
          </p>
          <div className="author-inline">
            <span className="avatar" aria-hidden="true">
              am
            </span>
            <div>
              <p className="mb-1 font-medium">{site.author.name}</p>
              <p className="muted text-[10px]">Writer, maker & curious human</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section-rule">
        <div className="section-heading">
          <h2 className="eyebrow">The latest dispatch</h2>
          <span className="eyebrow muted">A thought worth your time</span>
        </div>
        <div className="home-feature">
          <div>
            {featured ? (
              <article>
                <Link
                  href={`/blog/${featured.slug}`}
                  aria-label={`Read ${featured.title}`}
                >
                  <Image
                    className="featured-cover"
                    src={featured.coverImage}
                    alt="An original illustration of a quiet, tree-lined digital landscape"
                    width={1000}
                    height={510}
                    priority
                    sizes="(max-width:700px) 100vw, 65vw"
                  />
                </Link>
                <div className="feature-label">
                  <span className="category-tag">{featured.category}</span>
                  <span className="eyebrow muted" style={{ fontSize: 9 }}>
                    Editor’s pick
                  </span>
                </div>
                <h2 className="featured-title">
                  <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
                </h2>
                <p className="feature-excerpt">{featured.excerpt}</p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="post-meta">
                    <time dateTime={featured.date}>
                      {formatDate(featured.date, true)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{featured.readTime} min read</span>
                  </div>
                  <Link className="text-link" href={`/blog/${featured.slug}`}>
                    <BookOpen size={13} />
                    Read the story
                  </Link>
                </div>
              </article>
            ) : (
              <div className="panel p-8">
                <h2 className="font-serif text-2xl">A fresh page.</h2>
                <p className="muted my-4">The first note is on its way.</p>
                <Link href="/admin" className="button">
                  Open the editor’s desk
                </Link>
              </div>
            )}
          </div>
          <aside aria-label="Weekly statistics">
            <div className="snapshot panel">
              <div className="snapshot-title">
                <h2 className="eyebrow">Behind the pages</h2>
                <span className="sample-badge">DEMO DATA</span>
              </div>
              <p className="muted text-[11px]">
                Page views · last 7 recorded days
              </p>
              <p className="snapshot-number">{views.toLocaleString("en-GB")}</p>
              <div className="flex items-center gap-2 text-[10px] text-[var(--accent)]">
                <TrendingUp size={12} />
                {change === null
                  ? "No complete prior period"
                  : `${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous 7 days`}
              </div>
              <svg
                viewBox="0 0 286 100"
                role="img"
                aria-label={`Page views for the last ${last7.length} recorded days; ${views.toLocaleString()} in total.`}
                className="mt-5 block w-full"
              >
                <defs>
                  <linearGradient
                    id="snapshot-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop stopColor="var(--accent)" stopOpacity=".16" />
                    <stop
                      offset="1"
                      stopColor="var(--accent)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>
                {[25, 50, 75].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="286"
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="3 4"
                  />
                ))}
                {coords.length > 0 && (
                  <>
                    <path
                      d={`M0,100 L${coords.join(" L")} L286,100 Z`}
                      fill="url(#snapshot-fill)"
                    />
                    <path
                      d={`M${coords.join(" L")}`}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </svg>
              <div className="flex justify-between font-mono text-[9px] muted">
                <span>
                  {last7[0]?.date
                    ? formatDate(last7[0].date, true)
                    : "No records"}
                </span>
                <span>
                  {last7.at(-1)?.date
                    ? formatDate(last7.at(-1)!.date, true)
                    : ""}
                </span>
              </div>
              <div className="snapshot-kpis">
                <div>
                  <p className="text-[10px] muted">New subscribers</p>
                  <strong>+{subscribers}</strong>
                </div>
                <div>
                  <p className="text-[10px] muted">Recorded revenue</p>
                  <strong>£{revenue.toFixed(2)}</strong>
                </div>
              </div>
              <Link href="/stats" className="button mt-4 w-full text-[11px]">
                Explore the numbers <TrendingUp size={13} />
              </Link>
              <p className="muted mt-3 text-[9px] leading-4">
                Illustrative sample metrics. A transparent look at the journey,
                without the vanity.
              </p>
            </div>
            <div className="margin-note">
              <span className="eyebrow" style={{ fontSize: 9 }}>
                A note in the margin
              </span>
              <p>
                “The best things often happen when we leave a little room for
                them.”
              </p>
              <Link
                href="/about"
                className="text-[10px] muted underline underline-offset-4"
              >
                A little about this space
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <JournalFeed posts={publicPosts} />
      <div className="about-strip">
        <div>
          <p className="eyebrow mb-3" style={{ fontSize: 9 }}>
            Less noise. More signal.
          </p>
          <h2>A small journal. An open conversation.</h2>
          <p className="muted text-xs leading-6">
            Read at your own pace. Follow along with RSS, or drop me a note.
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <Link href="/feed.xml" className="button button-primary">
            Follow via RSS
          </Link>
          <Link href="/contact" className="button">
            Say hello
          </Link>
        </div>
      </div>
      <AdSlot
        slotId={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT || ""}
        format="horizontal"
      />
    </main>
  );
}
