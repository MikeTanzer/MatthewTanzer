import type { Metadata } from "next";
import ListingsBrowser from "@/components/ListingsBrowser";
import { getListings, getCities, getSyncInfo } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Active Listings | Matthew Tanzer Realty",
  description: "Browse active luxury listings across the Monterey Peninsula and Northern California.",
};

export default function ListingsPage() {
  const listings = getListings();
  const cities = getCities();
  const { syncedAt } = getSyncInfo();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">Portfolio</div>
      <h1 className="font-display mt-2 text-5xl font-semibold">Active Listings</h1>
      <p className="mt-3 max-w-2xl text-cream/60">
        {listings.length} properties represented by Coldwell Banker Realty. Updated{" "}
        {new Date(syncedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
      </p>
      <ListingsBrowser listings={listings} cities={cities} />
    </div>
  );
}
