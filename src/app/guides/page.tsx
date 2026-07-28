import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Homebuyer Guides & Resources | Matthew Tanzer Realty",
  description:
    "Practical guides for buying a home on the Monterey Peninsula — financing, offers, closing costs, and neighborhood deep-dives.",
};

const resources = [
  {
    name: "Monterey County Assessor",
    url: "https://www.countyofmonterey.gov/government/departments-a-h/assessor",
    blurb: "Property tax rates, assessed values, and supplemental tax estimator.",
  },
  {
    name: "CA DRE License Lookup",
    url: "https://www2.dre.ca.gov/publicasp/pplinfo.asp",
    blurb: "Verify any California real estate licensee — including Matthew (DRE# 02237563).",
  },
  {
    name: "California FAIR Plan",
    url: "https://www.cfpnet.com/",
    blurb: "Last-resort fire insurance for hard-to-place coastal and wildfire-zone homes.",
  },
  {
    name: "CFPB Mortgage Tools",
    url: "https://www.consumerfinance.gov/owning-a-home/",
    blurb: "Federal loan-estimate explainers and rate-comparison tools for buyers.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">Resources</div>
      <h1 className="font-display mt-2 text-5xl font-semibold">Homebuyer Guides</h1>
      <p className="mt-4 max-w-2xl text-cream/65">
        Written for buyers on the Monterey Peninsula — no fluff, no recycled national advice. These are
        the conversations Matthew has with clients every week, in guide form.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {guides.map((g, i) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="card-lift group rounded-sm border border-gold-500/15 bg-navy-900 p-8"
          >
            <div className="font-display text-5xl font-semibold text-gold-500/30">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="font-display mt-3 text-2xl font-semibold group-hover:text-gold-300">
              {g.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/60">{g.tagline}</p>
            <div className="mt-4 text-xs tracking-[0.25em] text-gold-400 uppercase">
              {g.readMinutes} min read →
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="font-display text-3xl font-semibold">Useful Resources</h2>
        <p className="mt-2 text-sm text-cream/60">Official tools worth bookmarking during your search.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {resources.map((r) => (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-gold-500/15 p-5 transition-colors hover:border-gold-400/50"
            >
              <div className="text-gold-300">{r.name} ↗</div>
              <div className="mt-1 text-sm text-cream/55">{r.blurb}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
