import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description:
    "Meet the person and the principles behind Margin, an independent journal about digital craft and a considered life.",
};

export default function AboutPage() {
  return (
    <ProsePage
      eyebrow="Behind the journal"
      title="A little more room for what matters."
      description="An independent space for thoughtful work, everyday experiments, and the occasional useful number."
    >
      <h2>Hello, I’m {site.author.name}.</h2>
      <p>
        I’m a writer and independent maker interested in the places where
        technology meets everyday life. I write about building small things,
        paying attention, and making digital spaces that feel a little more
        human.
      </p>
      <p>
        Margin is my working notebook in public. It is a place to share an idea
        before it becomes a grand theory, to explain a technical decision in
        ordinary language, and to keep a record of what an experiment actually
        taught me.
      </p>
      <h2>What you’ll find here</h2>
      <p>
        The journal moves between digital life, building in public, and field
        notes. An essay might consider the shape of a quieter internet. A
        practical note might explain a file-based publishing workflow. The
        common thread is a preference for useful, understandable things over
        unnecessary complexity.
      </p>
      <p>
        The <Link href="/stats">statistics page</Link> makes another part of the
        work visible. Numbers can help us notice a pattern, but they need
        context. I aim to explain what a measure represents, where it came from,
        and what it cannot tell us.
      </p>
      <h2>A few editorial promises</h2>
      <ul>
        <li>
          Write for people first, with clear titles and a comfortable reading
          experience.
        </li>
        <li>
          Distinguish personal observations, illustrative examples, and sourced
          factual claims.
        </li>
        <li>
          Label advertising and disclose a material commercial relationship when
          one exists.
        </li>
        <li>Correct meaningful mistakes and welcome thoughtful feedback.</li>
      </ul>
      <h2>A note about this edition</h2>
      <p>
        This installation includes a sample author persona, original
        demonstration essays, and fictional analytics so you can explore the
        complete publishing experience. Alex Morgan is a sample identity. The
        owner should replace this biography, contact details, and demonstration
        data before presenting the site as a personal publication.
      </p>
      <h2>Let’s keep the conversation useful</h2>
      <p>
        Questions, corrections, and considered disagreements are welcome. Visit
        the <Link href="/contact">contact page</Link> or write to{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. Please include the
        article link when reporting a correction so I can find the relevant
        passage.
      </p>
    </ProsePage>
  );
}
