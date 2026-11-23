import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  return [
    ...[
      "",
      "/stats",
      "/about",
      "/contact",
      "/privacy-policy",
      "/terms",
      "/disclaimer",
    ].map((route) => ({
      url: `${site.url}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.5,
    })),
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
