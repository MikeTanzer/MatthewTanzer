import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuide } from "@/data/guides";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: "Guide not found" };
  return { title: `${g.title} | Matthew Tanzer Realty`, description: g.tagline };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const others = guides.filter((g) => g.slug !== slug).slice(0, 2);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/guides" className="text-sm tracking-[0.2em] text-gold-400 uppercase hover:text-gold-300">
        ← All Guides
      </Link>
      <h1 className="font-display mt-6 text-4xl font-semibold md:text-5xl">{guide.title}</h1>
      <p className="mt-4 text-lg text-cream/65">{guide.tagline}</p>
      <div className="mt-3 text-xs tracking-[0.25em] text-gold-400 uppercase">{guide.readMinutes} min read</div>
      <div className="gold-rule mt-8" />

      {guide.sections.map((s) => (
        <section key={s.heading} className="mt-12">
          <h2 className="font-display text-3xl font-semibold text-gold-300">{s.heading}</h2>
          {s.body.map((p, i) => (
            <p key={i} className="mt-4 leading-relaxed text-cream/75">
              {p}
            </p>
          ))}
          {s.bullets && (
            <ul className="mt-4 space-y-2">
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-cream/75">
                  <span className="mt-1 text-gold-400">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <div className="mt-16 rounded-sm border border-gold-500/25 bg-navy-900 p-8 text-center">
        <h3 className="font-display text-2xl font-semibold">Questions about your situation?</h3>
        <p className="mt-2 text-sm text-cream/60">
          Every purchase is different. Get answers specific to your budget, timeline, and neighborhood.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-sm bg-gold-500 px-8 py-3 text-sm font-medium tracking-[0.2em] text-navy-950 uppercase transition-colors hover:bg-gold-300"
        >
          Talk to Matthew
        </Link>
      </div>

      {others.length > 0 && (
        <div className="mt-16">
          <h3 className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Keep reading</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {others.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="rounded-sm border border-gold-500/15 p-5 transition-colors hover:border-gold-400/50"
              >
                <div className="font-display text-xl font-semibold">{g.title}</div>
                <div className="mt-1 text-sm text-cream/55">{g.tagline}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
