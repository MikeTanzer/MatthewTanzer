import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Matthew Tanzer Realty",
  description:
    "Get in touch with Matthew Tanzer, REALTOR® with Coldwell Banker Realty on the Monterey Peninsula.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">Contact</div>
          <h1 className="font-display mt-2 text-5xl font-semibold">Let&apos;s talk real estate.</h1>
          <p className="mt-5 leading-relaxed text-cream/70">
            Whether you&apos;re six months from buying or ready to list next week, the conversation
            starts the same way. No pressure, no scripts — just straight answers about the Monterey
            Peninsula market.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-xs tracking-[0.3em] text-gold-400 uppercase">Phone</dt>
              <dd className="mt-1">
                <a href="tel:+18312209817" className="text-lg text-cream hover:text-gold-300">
                  (831) 220-9817
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.3em] text-gold-400 uppercase">Email</dt>
              <dd className="mt-1">
                <a
                  href="mailto:matthew.tanzer@cbrealty.com"
                  className="text-lg text-cream hover:text-gold-300"
                >
                  matthew.tanzer@cbrealty.com
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.3em] text-gold-400 uppercase">Serving</dt>
              <dd className="mt-1 text-cream/70">
                Monterey · Carmel · Pacific Grove · Pebble Beach · Carmel Valley
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.3em] text-gold-400 uppercase">Brokerage</dt>
              <dd className="mt-1 text-cream/70">Coldwell Banker Realty · CA DRE# 02237563</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-gold-500/20 bg-navy-900 p-8">
          <h2 className="font-display text-3xl font-semibold">Send a message</h2>
          <p className="mt-2 mb-6 text-sm text-cream/60">Matthew typically replies within a few hours.</p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
