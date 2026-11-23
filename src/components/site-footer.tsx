import Link from "next/link";
import { Brand } from "@/components/site-header";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand />
            <p className="mt-3 max-w-64 text-xs leading-6 muted">
              A small corner of the internet.
              <br />
              Thoughtfully made, independently written.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="footer-links">
            {[
              ["About", "/about"],
              ["Contact", "/contact"],
              ["Privacy policy", "/privacy-policy"],
              ["Terms", "/terms"],
              ["Disclaimer", "/disclaimer"],
              ["RSS", "/feed.xml"],
            ].map(([name, href]) => (
              <Link key={href} href={href} className="hover:underline">
                {name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getUTCFullYear()} Margin. Made with intention.
          </span>
          <div className="flex flex-wrap gap-5">
            <span>Independent by design.</span>
            <Link href="/admin" className="hover:underline">
              Editor’s desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
