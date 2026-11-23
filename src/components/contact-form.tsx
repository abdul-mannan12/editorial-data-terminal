"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail } from "lucide-react";

export function ContactForm({
  email,
  canSend,
}: {
  email: string;
  canSend: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError(false);
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || ""),
    };
    if (!canSend) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(`A note for Margin from ${values.name}`)}&body=${encodeURIComponent(`${values.message}\n\nFrom: ${values.name}\nReply to: ${values.email}`)}`;
      setMessage(
        "Your email draft is ready. Send it from your email app. If it didn’t open, use the email address alongside this form.",
      );
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error || "Your message could not be sent.");
      setMessage(
        "Your message has been delivered. Thanks for the thoughtful note.",
      );
      form.reset();
    } catch (err) {
      setError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please email me directly.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="panel grid gap-5 p-6 sm:p-8" onSubmit={submit}>
      <label className="field">
        Your name
        <input
          className="input"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Alex Taylor"
        />
      </label>
      <label className="field">
        Email address
        <input
          className="input"
          name="email"
          autoComplete="email"
          type="email"
          required
          maxLength={254}
          placeholder="you@example.com"
        />
      </label>
      <label className="field">
        What’s on your mind?
        <textarea
          className="input min-h-40 resize-y"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          placeholder="An idea, a question, or just a hello…"
        />
      </label>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="muted text-xs leading-6">
        {canSend
          ? "Your details are used only to respond to your message."
          : "This form opens a draft in your email app. Nothing is sent or stored on this website."}
      </p>
      <button
        className="button button-primary justify-self-start"
        type="submit"
        disabled={pending}
      >
        <Mail size={15} />
        {pending ? "Sending…" : canSend ? "Send your note" : "Open email draft"}
      </button>
      {message && (
        <p
          role={error ? "alert" : "status"}
          className={`flex gap-2 rounded border p-3 text-sm leading-6 ${error ? "border-red-400 text-red-600" : "border-[var(--border)] text-[var(--accent)]"}`}
        >
          {!error && <CheckCircle2 className="mt-1 shrink-0" size={16} />}{" "}
          {message}
        </p>
      )}
    </form>
  );
}
