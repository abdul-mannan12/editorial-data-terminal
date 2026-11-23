import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  apiError,
  atomicWrite,
  attachment,
  readJson,
  requireAdmin,
  RequestError,
  serializeWrite,
} from "@/lib/admin";
import { writesEnabled } from "@/lib/auth";
import { getAllPosts, postsDirectory, serializePost } from "@/lib/content";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { post, markdown } = serializePost(await readJson(request, 200_000));
    return await serializeWrite(async () => {
      if ((await getAllPosts()).some((existing) => existing.slug === post.slug))
        throw new RequestError(
          "A post with this slug already exists. Choose a new slug.",
          409,
        );
      if (!writesEnabled())
        return attachment(
          markdown,
          `${post.slug}.md`,
          "text/markdown; charset=utf-8",
        );
      const filename = path.resolve(postsDirectory, `${post.slug}.md`);
      if (path.dirname(filename) !== path.resolve(postsDirectory))
        throw new RequestError("Invalid post path.");
      await atomicWrite(filename, markdown);
      revalidatePath("/", "layout");
      return NextResponse.json({
        success: true,
        message:
          "Post saved to content/posts. It is now available on your site.",
        url: `/blog/${post.slug}`,
      });
    });
  } catch (error) {
    return apiError(error);
  }
}
