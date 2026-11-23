import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy-policy" },
  description:
    "How Margin handles contact information, essential cookies, optional advertising, and your privacy choices.",
};

export default function PrivacyPolicyPage() {
  return (
    <ProsePage
      eyebrow="The small print"
      title="Privacy, in plain language."
      description="Last updated 21 November 2026. This policy describes the features supplied with this journal."
    >
      <p>
        Margin is an independent publication operated by its site owner. This
        demonstration edition uses a sample identity and contact address; the
        owner must replace those details and review this policy against the
        services actually enabled before launch. For privacy questions, contact{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Information you choose to share</h2>
      <p>
        If you use the contact form or email the owner, your name, email
        address, subject, and message may be used to respond to your request,
        investigate a correction, or keep a necessary record of the
        conversation. Please avoid sending passwords, financial account details,
        or other sensitive personal information.
      </p>
      <p>
        Where a contact delivery service is configured, the form sends your
        message to that service. Where it is not configured, the contact
        interface provides an email handoff. The owner’s email provider and any
        configured delivery provider process the information needed to deliver
        and store the correspondence.
      </p>
      <h2>Server and hosting information</h2>
      <p>
        The hosting provider may process technical request information such as
        IP addresses, request paths, browser information, timestamps, and error
        logs to deliver the site, prevent abuse, and diagnose problems.
        Retention and access depend on the host’s configuration and terms. The
        owner should identify the production host and relevant retention periods
        here.
      </p>
      <p>
        No third-party audience analytics tracker is installed by default. The
        daily figures displayed on this site come from a content file maintained
        by the owner. In the demonstration edition, all figures are fictional.
        Uploading aggregate statistics does not by itself install a
        visitor-tracking service.
      </p>
      <h2>Essential cookies and local preferences</h2>
      <p>
        The password-protected administration area uses an essential, signed
        session cookie to keep an authenticated owner signed in. It is not
        intended for advertising. The interface stores a light or dark theme
        preference in your browser so that choice can be remembered. An external
        consent platform, if configured by the owner, may store the preferences
        it collects. You can remove stored preferences through your browser
        settings.
      </p>
      <h2>Google AdSense and advertising cookies</h2>
      <p>
        If the owner configures Google AdSense and the required consent
        arrangements, Google and its partners may use cookies, web beacons,
        device identifiers, IP addresses, and related information to provide,
        measure, and personalize advertisements. Google’s use of advertising
        cookies can enable it and its partners to serve ads based on visits to
        this site and other sites on the internet.
      </p>
      <p>
        The supplied implementation does not load advertisements in development.
        In production, advertising remains disabled until valid publisher and
        ad-unit configuration is present, the owner enables the external consent
        integration, and that platform reports an appropriate consent or
        applicability signal. No advertising-consent banner or third-party
        consent service is installed by this template. The owner must configure
        an appropriate Google-certified consent management platform where
        required, including relevant traffic from the EEA, UK, and Switzerland.
      </p>
      <p>
        When advertising is enabled, the configured consent platform should
        provide controls to review or withdraw advertising choices. Refusing
        optional consent keeps the associated ad requests disabled. Changing a
        preference does not undo data already transmitted before that change. Ad
        placement and availability may vary.
      </p>
      <p>
        You can manage Google advertising personalization through{" "}
        <a
          href="https://myadcenter.google.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          My Ad Center
        </a>
        . Read{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          how Google uses information from partner sites
        </a>{" "}
        and{" "}
        <a
          href="https://policies.google.com/technologies/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google’s advertising technology policy
        </a>{" "}
        for further information. Your browser can also block or delete cookies,
        although that may affect some site features.
      </p>
      <h2>Why information is used</h2>
      <p>
        Depending on the applicable law and the service involved, processing may
        rely on your consent, a request you have made, legal obligations, or
        legitimate interests such as keeping the site secure and responding to
        correspondence. Optional advertising storage or personalization should
        be subject to the consent requirements that apply to the visitor.
      </p>
      <h2>Sharing, retention, and international transfers</h2>
      <p>
        Information is shared with service providers only as needed to host the
        site, deliver a message, secure the service, or provide advertising that
        has been enabled. Information may also be disclosed when legally
        required or necessary to protect rights and safety. Service providers
        may process information outside your country, subject to their
        applicable safeguards.
      </p>
      <p>
        Contact correspondence should be kept only as long as needed to handle
        the request and any necessary follow-up or legal record. Technical logs
        and advertising data follow the relevant provider’s retention controls.
        The owner must set and publish specific retention periods appropriate to
        the live service.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        Depending on your location, you may have rights to request access,
        correction, deletion, restriction, portability, or objection to certain
        processing. You may withdraw consent for future optional processing
        without changing the lawfulness of earlier processing. You may also
        complain to your local data protection authority, including the UK
        Information Commissioner’s Office where applicable.
      </p>
      <p>
        To make a request, use the <Link href="/contact">contact page</Link>.
        The owner may need enough information to verify the request without
        collecting unnecessary additional data.
      </p>
      <h2>Children, external links, and changes</h2>
      <p>
        This is a general-audience publication and is not designed to collect
        information from children. External sites have their own privacy
        practices. This policy may change when the site’s services or legal
        obligations change; the date above will be updated when it does.
      </p>
    </ProsePage>
  );
}
