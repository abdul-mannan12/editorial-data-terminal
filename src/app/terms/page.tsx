import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  alternates: { canonical: "/terms" },
  description:
    "The terms for reading and using Margin, including intellectual property, acceptable use, and external links.",
};

export default function TermsPage() {
  return (
    <ProsePage
      eyebrow="The small print"
      title="Terms of use."
      description="Last updated 21 November 2026. Please use this small corner of the internet thoughtfully."
    >
      <p>
        These terms apply to your use of Margin. By accessing the site, you
        agree to use it lawfully and in accordance with these terms. If you
        disagree, please stop using the site. This demonstration edition must be
        reviewed and adapted by its owner before public operation.
      </p>
      <h2>The publication</h2>
      <p>
        Margin provides independent essays, technical notes, and illustrative
        data for general information and discussion. Content can change, and
        older articles may describe a tool or situation that has since changed.
        Publication dates and any noted corrections provide context rather than
        a promise that every statement remains current.
      </p>
      <h2>Intellectual property and fair use</h2>
      <p>
        Unless otherwise stated, original site content belongs to its respective
        copyright holder. You may link to an article and quote a reasonable
        excerpt with clear attribution and a link to the original, subject to
        applicable law. Replication of entire articles, removal of attribution,
        or commercial reuse may require permission.
      </p>
      <p>
        Third-party names, trademarks, and linked material remain the property
        of their owners. Source code included with this website may have its own
        license; these reading terms do not override an applicable software
        license.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not interfere with the site, attempt unauthorized access to its
        administration area, distribute malicious content, submit spam, or use
        the service to infringe another person’s rights. Automated access must
        respect the site’s published access rules and avoid unreasonable load.
      </p>
      <h2>Messages and submissions</h2>
      <p>
        You remain responsible for information you submit through a contact form
        or email. Sending a message does not create a confidential,
        professional, or advisory relationship. Please send only material you
        have the right to share. The handling of personal information is
        described in the <Link href="/privacy-policy">privacy policy</Link>.
      </p>
      <h2>Advertising and external links</h2>
      <p>
        Advertisements and links to external websites may be displayed. Their
        presence does not mean that the owner endorses every associated product,
        service, or claim. External services have separate terms and privacy
        practices, and you should assess them before making a purchase or
        sharing information.
      </p>
      <h2>Availability and responsibility</h2>
      <p>
        The site is provided on an “as available” basis. Reasonable care may be
        taken in publishing and maintenance, but uninterrupted access, complete
        accuracy, or suitability for a particular purpose cannot be guaranteed.
        Use technical examples with appropriate review and testing for your own
        circumstances.
      </p>
      <p>
        To the extent permitted by applicable law, the owner is not responsible
        for indirect or consequential losses arising from use of the site or
        reliance on general information. Nothing in these terms excludes a
        liability or consumer right that cannot legally be excluded.
      </p>
      <h2>Changes and contact</h2>
      <p>
        The owner may update these terms as the publication changes. The revised
        date will appear above. Any governing-law or dispute provisions needed
        for the owner’s actual jurisdiction should be added after appropriate
        review. Questions can be sent to{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> or through the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
