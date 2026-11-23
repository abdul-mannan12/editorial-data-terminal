import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Post } from "./types";

export const postsDirectory = path.join(process.cwd(), "content", "posts");
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase words separated by hyphens.",
  )
  .refine(
    (value) => !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(value),
    "This name is reserved by Windows. Choose another slug.",
  );
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value,
    "Enter a real calendar date.",
  );
export const frontmatterSchema = z.object({
  title: z.string().trim().min(3).max(160),
  date: dateSchema,
  slug: slugSchema,
  excerpt: z.string().trim().min(10).max(500),
  category: z.string().trim().min(1).max(50),
  coverImage: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (value) =>
        /^\/(?!\/)[a-zA-Z0-9/_.-]+$/.test(value) &&
        !value.split("/").includes(".."),
      "Use a local image path, such as /images/cover.svg.",
    ),
  readTime: z.coerce.number().int().min(1).max(180),
  featured: z.boolean().default(false),
});
export const postInputSchema = frontmatterSchema.extend({
  content: z.string().trim().min(20).max(150_000),
});

export function parsePost(source: string, filename = "post.md"): Post {
  // JSON schema ensures YAML types and required metadata are predictable.
  const parsed = matter(source);
  if (parsed.data.date instanceof Date)
    parsed.data.date = parsed.data.date.toISOString().slice(0, 10);
  const metadata = frontmatterSchema.safeParse(parsed.data);
  if (!metadata.success)
    throw new Error(
      `Invalid metadata in ${filename}: ${metadata.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`,
    );
  if (!parsed.content.trim())
    throw new Error(`The post ${filename} has no content.`);
  return { ...metadata.data, content: parsed.content };
}

export async function getAllPosts(): Promise<Post[]> {
  const filenames = (await fs.readdir(postsDirectory)).filter((name) =>
    name.endsWith(".md"),
  );
  const posts = await Promise.all(
    filenames.map(async (filename) =>
      parsePost(
        await fs.readFile(path.join(postsDirectory, filename), "utf8"),
        filename,
      ),
    ),
  );
  const slugs = new Set<string>();
  for (const post of posts) {
    if (slugs.has(post.slug))
      throw new Error(`Duplicate post slug: ${post.slug}`);
    slugs.add(post.slug);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  if (!slugSchema.safeParse(slug).success) return undefined;
  return (await getAllPosts()).find((post) => post.slug === slug);
}

export function serializePost(input: unknown): {
  post: Post;
  markdown: string;
} {
  const post = postInputSchema.parse(input);
  const { content, ...metadata } = post;
  return { post, markdown: matter.stringify(`${content}\n`, metadata) };
}
