# Margin · Editorial Data Terminal

A complete personal journal built with Next.js App Router, TypeScript, and Tailwind CSS. Posts and daily metrics live in ordinary source files. The interface combines an off-white editorial reading experience with a compact analytics terminal, a dark theme, local authoring tools, and deliberately reserved advertising spaces.

The included author, four essays, and thirty days of analytics are demonstration content. All reported traffic, revenue, and subscription figures are fictional. Replace the sample identity and content before launching your own publication.

## Requirements and quick start

- Node.js **22 or newer**; Node 24 LTS is a suitable choice.
- npm, included with Node.js.
- VS Code is optional. No database, paid API, or external font request is needed.

Open this project folder in VS Code, open its terminal, and run:

```powershell
npm ci
Copy-Item .env.example .env.local
code .
npm run dev
```

On macOS/Linux, replace the copy command with `cp .env.example .env.local`. Open [localhost:3000](http://localhost:3000). `npm ci` uses the committed lockfile and installs the exact compatible dependency tree. Do not run `npm audit fix --force` without reviewing the resulting major-version changes.

Before signing into [the local admin](http://localhost:3000/admin), edit `.env.local`:

```dotenv
ADMIN_PASSWORD=replace-with-a-unique-long-password
ADMIN_SESSION_SECRET=replace-with-at-least-32-random-characters
CONTENT_WRITE_ENABLED=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONTACT_EMAIL=you@your-domain.com
```

The admin password must contain at least 12 characters. Generate a separate random signing secret, for example with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Restart the development server after changing environment variables. Keep `.env.local` private; it is ignored by Git. Leaving `CONTENT_WRITE_ENABLED` empty enables file writes in development. Setting it to `false` explicitly switches even the local dashboard to exports. Production self-hosting requires `true` and persistent writable storage.

For a production build and a local production preview:

```powershell
npm run typecheck
npm test
npm run build
npm start
```

`npm run build` uses the supported webpack production build and includes Next.js TypeScript validation. `npm test` runs focused validation and security tests with the Node test runner. The lockfile pins the installed dependency versions. A successful build verifies the application at that point; no software can promise that future configuration changes or every possible runtime condition will be bug-free.

## What is included

- Responsive journal homepage, category filtering, and searchable post archive.
- Four Markdown articles with validated frontmatter, highlighted code, tables, callouts, reading progress, share links, and Article structured data.
- `/stats` with daily and aggregate KPIs, period selection, interactive SVG trend charts, a searchable data table, and CSV export.
- `/admin` with a password login, post editor, daily metric entry, JSON/CSV import, and downloadable exports on read-only deployments.
- About, contact, privacy, terms, and disclaimer pages linked in the footer.
- Local font files, theme persistence, accessible navigation, metadata, OpenGraph images, sitemap, robots rules, and an `ads.txt` template.
- AdSense slots that reserve space and remain inactive until configuration and consent prerequisites are met.

## Add or edit a post

Save a `.md` file in `content/posts/`. A complete example:

```markdown
---
title: "A useful new idea"
date: "2026-11-21"
slug: "a-useful-new-idea"
excerpt: "A clear description of what this article offers the reader."
category: "Field notes"
coverImage: "/images/reading.svg"
readTime: 4
featured: false
---

## Start with the question

Write your article here. Standard Markdown, fenced code blocks, and tables work.

> [!TIP]
> Call attention to a useful practical detail.
```

Use an actual calendar date in `YYYY-MM-DD` format, a unique lowercase URL slug with hyphens, and a positive numeric reading time in minutes. Quote string values in frontmatter. Markdown is rendered without executing embedded JavaScript or arbitrary raw HTML. Use repository-controlled images in `public/images/` and reference them with `/images/...` URLs. Supply meaningful image alternatives in article Markdown.

The post appears at `/blog/a-useful-new-idea`; categories and the archive populate automatically. `featured: true` chooses a featured article; keep one article featured for the clearest homepage. The admin editor writes the same format and validates its fields. It does not provide a multi-user editorial workflow or a media upload service.

## Update the daily statistics

Edit `content/stats/daily-stats.json`, or use the admin dashboard. Each record has this shape:

```json
{
  "date": "2026-11-21",
  "pageViews": 2847,
  "visitors": 1924,
  "subscribers": 63,
  "revenue": 16.8
}
```

Store records in a JSON array. `pageViews`, `visitors`, and `subscribers` are non-negative whole numbers. `subscribers` means **new subscribers acquired that day**, not the cumulative mailing-list size. `revenue` is non-negative daily revenue in **GBP**; use two decimal places for ordinary currency amounts. The number of visitors must not exceed page views for the same day. Visitors are daily counts: a period total sums those counts and is not a deduplicated count of unique people across the period.

The CSV header uses the same names:

```csv
date,pageViews,visitors,subscribers,revenue
2026-11-20,2576,1753,51,14.68
2026-11-21,2847,1924,63,16.80
```

The admin validates all imported records before changing a file and explains errors. Review the pasted data before choosing **Validate & import**. **Merge by date** updates matching dates while preserving the rest; **Replace all data** removes dates missing from the import, so export a backup first. KPIs compare the selected period with the preceding equal-length period where sufficient history exists; a missing comparison is labeled rather than invented. The bundled sample spans 23 October through 21 November 2026, so add more history to obtain a complete previous 30-day comparison.

This site displays owner-supplied data; it does **not** collect audience measurements or connect to AdSense reporting automatically. Export aggregate metrics from your chosen provider and update the file. No analytics credentials are required.

## Local admin and hosting boundaries

The admin is disabled until a sufficiently long `ADMIN_PASSWORD` is configured. Authentication uses an expiring signed HttpOnly cookie, production Secure cookies, SameSite protection, same-origin request checks, bounded input, and an in-process login rate limit. Password and signing secrets remain on the server. A multi-instance public deployment should use an upstream shared rate limiter or access restriction because process-local limits do not coordinate between serverless instances.

In local development, saving a post or metric updates the content files. Check the resulting changes in Git before publishing. On a persistent self-hosted Node.js server, set `CONTENT_WRITE_ENABLED=true`, make the content directories writable by the application user, and back up those files. Keep the admin behind suitable network controls for your setup.

On **Vercel**, the dashboard provides validated downloadable content instead of promising a persistent write. Add the downloaded `.md` file to `content/posts/`, or replace the statistics JSON with the downloaded update, then commit and redeploy. Vercel Functions have a [read-only application filesystem with temporary scratch space](https://vercel.com/docs/functions/runtimes). Writing to temporary storage would not update the deployed source or survive reliably. Vercel export mode is enforced even if `CONTENT_WRITE_ENABLED=true` is set.

## Configure the contact form

Set `NEXT_PUBLIC_CONTACT_EMAIL` to a real address. Without a contact webhook, the contact interface opens a prepared email in the visitor’s mail application and displays the address for copying; it does not claim a message was delivered.

To enable server-side delivery, configure `CONTACT_WEBHOOK_URL` with a trusted HTTPS endpoint that accepts a JSON object containing `name`, `email`, and `message`. That endpoint must forward or store the message using your chosen provider. Keep its credentials in the server environment, configure any provider-specific verification there, and test actual receipt before launch. Update the privacy policy with the delivery provider and retention period. No email service is silently provisioned.

## Add Google AdSense

The architecture is ready for integration, but a code template cannot promise AdSense approval or legal compliance. Submit a site with your own identity, substantial original content, accurate policies, and working contact details. Review [Google’s AdSense policies](https://support.google.com/adsense/answer/48182) before enabling ads.

1. In `.env.local` and your deployment’s environment settings, set your approved publisher ID and real ad unit IDs:

   ```dotenv
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
   NEXT_PUBLIC_ADSENSE_HOME_SLOT=1234567890
   NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT=0987654321
   ```

2. Replace the placeholder in `public/ads.txt` with the exact line supplied by AdSense. For example, a Google direct seller record has this shape:

   ```text
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```

   Replace the example publisher value. Confirm `https://your-domain.com/ads.txt` serves your actual record after deployment.

3. Integrate and configure an appropriate **Google-certified consent management platform** where required, using Google’s [current publisher consent requirements](https://support.google.com/adsense/answer/13554116?hl=en). Configure your real domain, vendors, policy links, and consent signals. This project supplies an integration hook, not a CMP, consent banner, or certification. Install the provider’s approved script in the site layout according to its instructions, and expose its controls for reviewing and withdrawing choices.

4. Only after that integration is verified, set `NEXT_PUBLIC_ADSENSE_CMP_READY=true`, rebuild, and test consent acceptance, refusal, and withdrawal. The environment flag is a deployment gate; setting it is not evidence of compliance or visitor consent. The ad component also waits for the platform’s TCF v2 `__tcfapi` event listener to report a loaded consent state. It accepts an explicit report that GDPR does not apply, or the configured consent checks for purposes 1, 3, and 4 and Google vendor 755. Review this conservative integration hook against your CMP and ad configuration; do not bypass the checks to make a placeholder disappear.

5. Review each placement. `<AdSlot slotId="..." format="auto" />` reserves its layout area to reduce layout shift and shows a labeled placeholder during development. In production, incompletely configured slots are omitted; configured slots reserve space while waiting for the CMP and an eligible consent state. Keep ads separate from navigation and avoid encouraging invalid clicks.

Public environment variables are embedded in the browser bundle at build time. Redeploy after changing them. Update the privacy policy and advertising disclosures to match the live services. The policy pages are a realistic starting point, not jurisdiction-specific legal advice.

## Deploy to Vercel

1. Create a Git repository for this folder and push it to your Git provider. Commit the source, `package.json`, and `package-lock.json`; do not commit `.env.local`, `node_modules`, or `.next`.
2. In Vercel, choose **Add New → Project**, import that repository, and select the Next.js preset. If this folder is nested in a larger repository, select it as the project’s Root Directory.
3. Use `npm ci` as the install command and `npm run build` as the build command. Choose a supported Node.js version meeting the package’s `>=22` requirement.
4. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS site origin, such as `https://your-project.vercel.app`; set the contact address and any optional service variables. Add the admin secrets only if you want the protected export dashboard available on the deployment. Vercel automatically enables read-only export behavior.
5. Deploy, then check an article, the stats page, mobile navigation, contact behavior, `/sitemap.xml`, `/robots.txt`, and `/ads.txt`. Add your custom domain and redeploy with its final `NEXT_PUBLIC_SITE_URL` so canonical URLs and structured data agree.

Vercel’s [Hobby plan is for non-commercial personal use](https://vercel.com/docs/plans/hobby). An eligible non-commercial personal journal can start there without a paid plan, subject to usage limits. Monetizing the site with AdSense may make the project commercial and require a paid plan under Vercel’s terms. Check the current plan rules before enabling revenue features; “free hosting” and commercial monetization are not an unconditional combination.

## Make the journal your own

- Edit `src/lib/site.ts` for the name, author biography, and description.
- Replace the sample contact address and set the canonical HTTPS origin.
- Replace all fictional statistics and clearly label estimates or test data that remain.
- Review About, Privacy Policy, Terms, and Disclaimer with your actual operator, providers, jurisdiction, and retention practices.
- Replace sample covers or add optimized local images with useful alternative text.
- Review social preview and article metadata after changing the brand.

Fonts are self-hosted through Fontsource packages. The visual system uses Merriweather headings, Inter body text, JetBrains Mono statistics, warm off-white `#FAF9F6`, and slate dark mode `#0F172A`. Styles and theme tokens live in `src/app/globals.css`.

## Troubleshooting

**The admin says it is not configured.** Supply a password of at least 12 characters and restart the server. If supplied, the separate signing secret must be at least 32 characters.

**Local saving produces a download.** Leave `CONTENT_WRITE_ENABLED` empty or set it to `true` in development. On Vercel, downloads are intentional; commit the export to publish it.

**A post fails validation.** Check quoted frontmatter strings, a real `YYYY-MM-DD` date, a unique safe slug, and a numeric `readTime`. Read the validation message rather than removing validation.

**An advertisement does not appear.** Development shows labeled placeholders. Production omits incompletely configured slots and keeps configured slots empty while consent prerequisites are incomplete. A valid code configuration also does not guarantee that Google will fill an ad request.

**The form opens an email instead of sending.** Configure and test a contact webhook to enable delivery. The email handoff is the useful default when no provider exists.

**The build cannot find a content file.** Run commands from this project directory, commit both content folders, and preserve their casing when deploying from Windows to Linux.
