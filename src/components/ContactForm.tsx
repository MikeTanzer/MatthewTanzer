"use client";

import { useState } from "react";

const RECIPIENT = "matthew.tanzer@cbrealty.com";

// GitHub Pages serves static files only, so there is no server to POST to.
// The form composes a prefilled email in the visitor's mail client instead.
// To capture submissions server-side, set NEXT_PUBLIC_FORM_ENDPOINT to a form
// service (Formspree et al.) or a serverless route and redeploy.
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

const INTEREST_LABELS: Record<string, string> = {
  buying: "Looking to buy",
  selling: "Thinking of selling",
  both: "Buying and selling",
  question: "General question",
};

export default function ContactForm({
  compact = false,
  defaultMessage = "",
}: {
  compact?: boolean;
  defaultMessage?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "mailto" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    if (ENDPOINT) {
      setStatus("sending");
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        setStatus("sent");
        form.reset();
      } catch {
        setStatus("error");
      }
      return;
    }

    const subject = data.interest
      ? `Website inquiry — ${INTEREST_LABELS[data.interest] ?? data.interest}`
      : "Website inquiry";
    const body = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Phone: ${data.phone}` : null,
      "",
      data.message,
    ]
      .filter((l) => l !== null)
      .join("\n");

    window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setStatus("mailto");
  }

  const inputCls =
    "w-full rounded-sm border border-gold-500/25 bg-navy-950 px-4 py-3 text-sm text-cream placeholder:text-cream/35 focus:border-gold-400 focus:outline-none";

  if (status === "sent" || status === "mailto") {
    return (
      <div className="rounded-sm border border-gold-500/30 bg-navy-950 p-6 text-center">
        <div className="font-display text-2xl text-gold-300">Thank you.</div>
        {status === "sent" ? (
          <p className="mt-2 text-sm text-cream/70">
            Your message is on its way — Matthew will reach out shortly.
          </p>
        ) : (
          <p className="mt-2 text-sm text-cream/70">
            Your email app should be open with the message ready — just hit send. If it didn&apos;t
            open, email{" "}
            <a href={`mailto:${RECIPIENT}`} className="text-gold-300 underline">
              {RECIPIENT}
            </a>{" "}
            or call{" "}
            <a href="tel:+18312209817" className="text-gold-300 underline">
              (831) 220-9817
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <input name="name" required placeholder="Full name" className={inputCls} autoComplete="name" />
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          className={inputCls}
          autoComplete="email"
        />
      </div>
      <input name="phone" placeholder="Phone (optional)" className={inputCls} autoComplete="tel" />
      {!compact && (
        <select name="interest" className={inputCls} defaultValue="buying">
          <option value="buying">I&apos;m looking to buy</option>
          <option value="selling">I&apos;m thinking of selling</option>
          <option value="both">Buying and selling</option>
          <option value="question">General question</option>
        </select>
      )}
      <textarea
        name="message"
        required
        rows={compact ? 3 : 5}
        placeholder="How can Matthew help?"
        defaultValue={defaultMessage}
        className={inputCls}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-sm bg-gold-500 px-8 py-3 text-sm font-medium tracking-[0.2em] text-navy-950 uppercase transition-colors hover:bg-gold-300 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
      {status === "error" && (
        <p className="text-sm text-red-400">
          Something went wrong. Please call (831) 220-9817 or email {RECIPIENT}.
        </p>
      )}
    </form>
  );
}
