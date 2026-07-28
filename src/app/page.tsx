import Image from "next/image";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import { getListings } from "@/lib/listings";

export default function Home() {
  const listings = getListings();
  const featured = listings.slice(0, 6);
  const hero = listings[0]?.photos[1] || listings[0]?.photos[0];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden">
        {hero && (
          <Image
            src={hero}
            alt="Monterey Peninsula luxury real estate"
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/60 via-navy-950/30 to-navy-950" />
        <div className="relative z-10 px-6 text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="gold-rule w-16" />
            <span className="text-xs font-medium tracking-[0.5em] text-gold-400 uppercase">
              Coldwell Banker Realty
            </span>
            <span className="gold-rule w-16" />
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-wide text-cream md:text-7xl">
            Life on the Peninsula,
            <br />
            <span className="text-gold-300 italic">beautifully found.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-light text-cream/75">
            Matthew Tanzer represents buyers and sellers of exceptional coastal homes across Monterey,
            Carmel, Pacific Grove, and Pebble Beach.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/listings"
              className="rounded-sm bg-gold-500 px-8 py-3 text-sm font-medium tracking-[0.2em] text-navy-950 uppercase transition-colors hover:bg-gold-300"
            >
              View Listings
            </Link>
            <Link
              href="/contact"
              className="rounded-sm border border-cream/40 px-8 py-3 text-sm tracking-[0.2em] text-cream uppercase transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              Work with Matthew
            </Link>
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">Featured</div>
            <h2 className="font-display mt-2 text-4xl font-semibold">Active Properties</h2>
          </div>
          <Link
            href="/listings"
            className="hidden text-sm tracking-[0.2em] text-gold-400 uppercase hover:text-gold-300 md:block"
          >
            View all {listings.length} →
          </Link>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((l, i) => (
            <ListingCard key={l.id} listing={l} priority={i < 3} />
          ))}
        </div>
        <div className="mt-10 text-center md:hidden">
          <Link href="/listings" className="text-sm tracking-[0.2em] text-gold-400 uppercase">
            View all {listings.length} →
          </Link>
        </div>
      </section>

      {/* About strip */}
      <section className="border-y border-gold-500/15 bg-navy-900">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">About</div>
            <h2 className="font-display mt-2 text-4xl font-semibold">
              A local guide to the Monterey Peninsula
            </h2>
            <p className="mt-6 leading-relaxed text-cream/70">
              From storied cottages in Carmel-by-the-Sea to estates along 17-Mile Drive, Matthew pairs
              deep local knowledge with the reach of Coldwell Banker Realty — one of the most trusted
              names in coastal California real estate.
            </p>
            <p className="mt-4 leading-relaxed text-cream/70">
              Whether you&apos;re buying your first home in Pacific Grove or listing a legacy property in
              Pebble Beach, you&apos;ll get honest advice, sharp negotiation, and white-glove service from
              first showing to final signature.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block rounded-sm border border-gold-500 px-8 py-3 text-sm tracking-[0.2em] text-gold-300 uppercase transition-colors hover:bg-gold-500 hover:text-navy-950"
            >
              Start a Conversation
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              ["Monterey", "Harbor life & historic adobes"],
              ["Carmel", "Storybook cottages by the sea"],
              ["Pacific Grove", "Victorian charm on the point"],
            ].map(([area, blurb]) => (
              <div key={area} className="rounded-sm border border-gold-500/20 p-6">
                <div className="font-display text-2xl font-semibold text-gold-300">{area}</div>
                <div className="mt-2 text-xs leading-relaxed text-cream/60">{blurb}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides teaser */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">Resources</div>
        <h2 className="font-display mt-2 text-4xl font-semibold">Smarter homebuying starts here</h2>
        <p className="mx-auto mt-4 max-w-xl text-cream/70">
          Practical guides on financing, offers, escrow, and the neighborhoods of the Monterey
          Peninsula — written for real buyers, not brochures.
        </p>
        <Link
          href="/guides"
          className="mt-8 inline-block rounded-sm bg-gold-500 px-8 py-3 text-sm font-medium tracking-[0.2em] text-navy-950 uppercase transition-colors hover:bg-gold-300"
        >
          Browse the Guides
        </Link>
      </section>
    </>
  );
}
