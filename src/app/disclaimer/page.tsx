import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  alternates: { canonical: "/disclaimer" },
  description:
    "Important context for Margin’s personal opinions, sample data, technical examples, and advertising.",
};

export default function DisclaimerPage() {
  return (
    <ProsePage
      eyebrow="The small print"
      title="A little context matters."
      description="Last updated 21 November 2026. Read the numbers, examples, and opinions with their limits in view."
    >
      <h2>Personal perspectives, general information</h2>
      <p>
        Margin is a personal publication. Its articles express the author’s
        views and are intended for general information, reflection, and
        discussion. They do not represent an employer, client, organization, or
        professional body unless an article explicitly says otherwise.
      </p>
      <p>
        Content is not individualized legal, medical, tax, investment, or other
        regulated professional advice. Make decisions in light of your own
        circumstances and consult a suitably qualified professional where
        appropriate.
      </p>
      <h2>Demonstration identity and data</h2>
      <p>
        This edition includes Alex Morgan as a sample author persona, original
        demonstration articles, and thirty days of fictional daily analytics.
        Revenue, visitors, page views, and subscriber counts are examples
        created to demonstrate the interface. They are not evidence of a live
        publication’s audience, business results, or advertising earnings.
      </p>
      <p>
        Any tables described as illustrative within an article are also invented
        examples. They should not be presented as research, testimonials,
        verified experiments, or promises of future results. The site owner
        should replace sample material and preserve clear provenance for real
        data.
      </p>
      <h2>Technical examples</h2>
      <p>
        Code and workflows are offered as educational examples. Software
        versions, hosting limits, and provider requirements change. Review the
        current documentation, protect credentials, and test a change in a
        suitable environment before relying on it in a production system.
      </p>
      <h2>Advertising and commercial relationships</h2>
      <p>
        Clearly labeled advertising may appear when configured by the owner. An
        advertisement is not an editorial recommendation. If an article includes
        an affiliate relationship, sponsorship, gifted product, or another
        material connection, that relationship should be disclosed near the
        relevant content. This demonstration does not assert that any such
        commercial relationship currently exists.
      </p>
      <h2>Accuracy and corrections</h2>
      <p>
        Reasonable efforts should be made to present information clearly and
        accurately, but mistakes and omissions are possible. Linked sources may
        change or become unavailable. If you notice an error, please use the{" "}
        <Link href="/contact">contact page</Link> and include enough context to
        locate it. Material corrections should be noted where readers can see
        them.
      </p>
      <p>
        The <Link href="/terms">terms of use</Link> and{" "}
        <Link href="/privacy-policy">privacy policy</Link> provide additional
        information about using the site and the handling of personal
        information.
      </p>
    </ProsePage>
  );
}
