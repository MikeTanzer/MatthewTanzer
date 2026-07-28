import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import ContactForm from "@/components/ContactForm";
import { getListing, getListings, formatPrice } from "@/lib/listings";

export function generateStaticParams() {
  return getListings().map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const l = getListing(id);
  if (!l) return { title: "Listing not found" };
  return {
    title: `${l.address}, ${l.city} | Matthew Tanzer Realty`,
    description: l.description.slice(0, 155),
  };
}

function Fact({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="rounded-sm border border-gold-500/15 bg-navy-900 p-4 text-center">
      <div className="font-display text-2xl font-semibold text-gold-300">{value}</div>
      <div className="mt-1 text-[0.65rem] tracking-[0.25em] text-cream/50 uppercase">{label}</div>
    </div>
  );
}

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link href="/listings" className="text-sm tracking-[0.2em] text-gold-400 uppercase hover:text-gold-300">
        ← All Listings
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">{listing.address}</h1>
          <p className="mt-2 text-lg text-cream/60">
            {listing.city}, {listing.state} {listing.zip}
            {listing.county ? ` · ${listing.county}` : ""}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-semibold text-gold-300">{formatPrice(listing.price)}</div>
          <div className="mt-1 text-xs tracking-[0.25em] text-cream/50 uppercase">
            {listing.status}
            {listing.mlsNumber ? ` · MLS# ${listing.mlsNumber}` : ""}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Gallery photos={listing.photos} alt={`${listing.address}, ${listing.city}`} />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Fact label="Beds" value={listing.beds} />
            <Fact label="Baths" value={listing.baths} />
            <Fact label="Sq Ft" value={listing.sqft?.toLocaleString()} />
            <Fact label="Acres" value={listing.acreage ?? undefined} />
            <Fact label="Built" value={listing.yearBuilt} />
          </div>

          <h2 className="font-display mt-10 text-3xl font-semibold">About this property</h2>
          <p className="mt-4 leading-relaxed whitespace-pre-line text-cream/75">{listing.description}</p>

          {listing.virtualTourUrl && (
            <a
              href={listing.virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-sm border border-gold-500 px-6 py-3 text-sm tracking-[0.2em] text-gold-300 uppercase transition-colors hover:bg-gold-500 hover:text-navy-950"
            >
              View Virtual Tour ↗
            </a>
          )}

          <div className="mt-10 border-t border-gold-500/15 pt-6 text-sm text-cream/50">
            {listing.listingAgent && (
              <p>
                Listed by {listing.listingAgent}
                {listing.listingOffice ? `, ${listing.listingOffice}` : ""}. Data via MLSListings Inc.
              </p>
            )}
            <p className="mt-2">
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-400/80 hover:text-gold-300"
              >
                View original listing ↗
              </a>
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-sm border border-gold-500/20 bg-navy-900 p-6">
          <h3 className="font-display text-2xl font-semibold">Ask about this home</h3>
          <p className="mt-2 text-sm text-cream/60">
            Matthew will get back to you the same day with details, disclosures, or a private showing.
          </p>
          <div className="mt-5">
            <ContactForm
              compact
              defaultMessage={`I'd like more information about ${listing.address}, ${listing.city} (MLS# ${listing.mlsNumber ?? "n/a"}).`}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
