"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X, MessageCircle } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="wordmark" aria-label="Margin home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      margin<span style={{ color: "var(--accent)" }}>.</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    try {
      localStorage.setItem("margin-theme", next ? "dark" : "light");
    } catch {
      /* Private browsers still support in-memory toggling. */
    }
  }
  const links = [
    { href: "/", label: "The journal" },
    { href: "/stats", label: "The numbers" },
    { href: "/about", label: "About" },
  ];
  return (
    <header className="site-nav">
      <nav className="container nav-inner" aria-label="Main navigation">
        <Brand />
        <div className="desktop-links">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${link.href === "/" ? (pathname === "/" || pathname.startsWith("/blog") ? "active" : "") : pathname === link.href ? "active" : ""}`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link className="button hidden sm:inline-flex" href="/contact">
            Let’s talk <MessageCircle size={13} aria-hidden="true" />
          </Link>
          <button
            className="icon-button mobile-menu-button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="container flex flex-col gap-1 border-t border-[var(--border)] pb-5 pt-3"
          aria-label="Mobile navigation"
        >
          {[...links, { href: "/contact", label: "Let’s talk" }].map((l) => (
            <Link
              href={l.href}
              key={l.href}
              className="py-3 text-sm"
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
