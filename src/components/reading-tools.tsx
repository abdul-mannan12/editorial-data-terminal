"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const article = document.getElementById("article-body");
      if (!article) return;
      const top = article.getBoundingClientRect().top + window.scrollY;
      const end = top + article.offsetHeight - window.innerHeight;
      setProgress(
        Math.max(
          0,
          Math.min(
            1,
            (window.scrollY - top + 100) / Math.max(1, end - top + 100),
          ),
        ),
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div
      className="reading-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  );
}

export function SharePost() {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState("copied");
      window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="button" onClick={copy}>
        {state === "copied" ? <Check size={14} /> : <Copy size={14} />}{" "}
        {state === "copied" ? "Link copied" : "Copy article link"}
      </button>
      <span role="status" className="muted text-xs">
        {state === "error"
          ? "Copy the address from your browser to share this note."
          : ""}
      </span>
    </div>
  );
}
