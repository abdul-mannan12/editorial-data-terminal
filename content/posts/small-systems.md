---
title: "Small systems, fewer moving parts"
date: "2026-11-18"
slug: "small-systems"
excerpt: "The most useful publishing workflow I know starts with a text file. A practical case for building only the system you can comfortably maintain."
category: "Building in public"
coverImage: "/images/small-systems.svg"
readTime: 5
featured: false
---

The first version of a personal project often contains the architecture of the company we imagine it might become. There is an authentication provider, a database, a queue, and an elaborate content dashboard. Meanwhile, the person who wanted to write has spent three evenings configuring a webhook.

I understand the appeal. Infrastructure feels like preparation. It is reassuring to solve a problem that has a definite answer when the real work, writing something worthwhile, is uncertain. But a system can be technically impressive and still make its owner less likely to publish.

For a small journal, I want a workflow that remains understandable after six weeks away. That is a more demanding requirement than it first appears. It asks the system to be kind to my future attention.

## Follow the life of one article

An article begins as text. It receives a title, a date, a category, and a short description. It is reviewed, published, and occasionally corrected. Most personal publications do not need a complex model to describe that journey.

A Markdown file with frontmatter can express the important parts directly:

```typescript
type Post = {
  title: string;
  date: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: number;
  featured: boolean;
};

function articlePath(post: Post): string {
  return `/blog/${post.slug}`;
}
```

The type is useful because it makes the contract visible. The actual files should also be validated when they are loaded. A type annotation cannot stop an editor from accidentally writing an impossible date or a duplicate URL slug in a text file.

## Count responsibilities, not dependencies

A dependency count can be misleading. One well-maintained library may replace a hundred lines of fragile custom parsing. The better question is how many responsibilities the owner must remember.

For a file-based journal, the recurring jobs are usually editing content, reviewing changes, and deploying. Backups can follow the repository history. There is no content database to migrate. There is still work to do: dependencies need updates, secrets need care, and deployed behavior needs checking. Small does not mean maintenance disappears.

> [!TIP]
> Choose a workflow you can explain in a few sentences. If publishing a correction requires reconstructing a chain of services, simplify the chain before adding another feature.

The following comparison uses fictional planning estimates. It is a worksheet for reasoning about a small project, not a benchmark of particular products.

| Recurring responsibility | File-based journal              | Database-backed journal               |
| ------------------------ | ------------------------------- | ------------------------------------- |
| Content backup           | Versioned source files          | Database backup policy                |
| Schema changes           | Validate file fields            | Plan and run migrations               |
| Publishing               | Commit and deploy               | Save through an authenticated service |
| Media                    | Repository or dedicated storage | Dedicated storage is still needed     |
| Collaboration            | Review changes in Git           | Editorial permissions and roles       |

The second column is not universally better. A newsroom with several editors, scheduled publication, and thousands of media assets has different needs. The point is to match the system to the actual shape of the work.

## An honest boundary around the admin page

A local admin interface is a useful convenience. It can collect the fields, validate them, and save a correctly formatted file. It does not turn a deployed serverless application into a durable file system.

That distinction deserves a clear place in the product. On a local machine or a server with persistent writable storage, saving can update the source files directly. On an immutable deployment, the same interface can prepare a download for review and commit. Calling both operations “published” would conceal an important difference.

Good software makes its boundaries visible at the moment they matter. An export button that explains the next step is more useful than a cheerful success message for a write that disappears when a server restarts.

## Measure the publishing loop

If I were evaluating this workflow, I would measure the time between deciding to publish and seeing the article live. I would also record how often a small correction feels expensive enough to postpone.

For example, an illustrative week might contain three posts, two corrections, and one statistics update. If each change takes four minutes of operational work, the system asks for twenty-four minutes of attention. A more elaborate setup that takes fifteen minutes per change asks for ninety. Neither number says anything about the quality of the writing, but one leaves substantially more room for it.

The useful system is the one that disappears while you work and becomes understandable when something breaks. Start with files. Validate the edges. Keep a clear deployment path. Add another moving part when a repeated, observed need earns its place.
