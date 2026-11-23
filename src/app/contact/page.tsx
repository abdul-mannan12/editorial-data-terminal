import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Rss } from "lucide-react";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/contact-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Let’s talk",
  description:
    "A question, a thoughtful disagreement, or a simple hello. Get in touch with the author of Margin.",
  alternates: { canonical: "/contact" },
};
export default function ContactPage() {
  return (
    <main id="main-content" className="container py-12 sm:py-16">
      <p className="eyebrow muted">The conversation continues</p>
      <h1 className="page-heading">A note goes a long way.</h1>
      <p className="muted mb-10 max-w-xl text-sm leading-8">
        Have a question, an interesting idea, or a different way of seeing
        things? I’d love to hear it.
      </p>
      <div className="grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
        <ContactForm
          email={site.email}
          canSend={Boolean(process.env.CONTACT_WEBHOOK_URL)}
        />
        <aside className="space-y-8 md:p-6">
          <div>
            <Mail size={20} className="mb-4 text-[var(--accent)]" />
            <h2 className="font-serif text-xl">The direct route</h2>
            <a
              href={`mailto:${site.email}`}
              className="my-4 inline-block text-sm underline underline-offset-4"
            >
              {site.email}
            </a>
            <p className="muted text-xs leading-7">
              A real person on the other end. No ticket numbers or automated
              replies.
            </p>
          </div>
          <div className="border-t border-[var(--border)] pt-7">
            <Rss size={19} className="mb-4 text-[var(--accent)]" />
            <h2 className="font-serif text-xl">Keep in the loop</h2>
            <p className="muted my-4 text-xs leading-7">
              The journal has an RSS feed. Follow it in your favourite reader
              and get new notes at your own pace.
            </p>
            <Link href="/feed.xml" className="text-link">
              Subscribe to the feed
            </Link>
          </div>
          <p className="muted text-xs leading-6">
            Please replace the example contact address before publishing. See
            the{" "}
            <Link href="/privacy-policy" className="underline">
              privacy policy
            </Link>{" "}
            for how messages are handled.
          </p>
        </aside>
      </div>
    </main>
  );
}
