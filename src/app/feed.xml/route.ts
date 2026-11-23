import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
export const dynamic = "force-dynamic";
function xml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
export async function GET() {
  const posts = await getAllPosts();
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${site.name}</title><link>${xml(site.url)}</link><description>${xml(site.description)}</description><language>en-gb</language><atom:link href="${xml(site.url)}/feed.xml" rel="self" type="application/rss+xml"/>${posts.map((p) => `<item><title>${xml(p.title)}</title><link>${xml(site.url)}/blog/${p.slug}</link><guid isPermaLink="true">${xml(site.url)}/blog/${p.slug}</guid><pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate><category>${xml(p.category)}</category><description>${xml(p.excerpt)}</description></item>`).join("")}</channel></rss>`;
  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
