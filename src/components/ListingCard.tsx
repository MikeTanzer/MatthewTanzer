import Image from "next/image";
import Link from "next/link";
import { Listing, formatPrice } from "@/lib/listings";

export default function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="card-lift group block overflow-hidden rounded-sm border border-gold-500/15 bg-navy-900"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        {listing.photos[0] && (
          <Image
            src={listing.photos[0]}
            alt={`${listing.address}, ${listing.city}`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 left-3 rounded-sm bg-navy-950/80 px-3 py-1 text-xs tracking-[0.2em] text-gold-300 uppercase backdrop-blur-sm">
          {listing.status}
        </div>
      </div>
      <div className="p-5">
        <div className="font-display text-2xl font-semibold text-gold-300">{formatPrice(listing.price)}</div>
        <div className="mt-1 truncate text-sm text-cream/90">{listing.address}</div>
        <div className="text-sm text-cream/60">
          {listing.city}, {listing.state} {listing.zip}
        </div>
        <div className="mt-3 flex gap-4 border-t border-gold-500/10 pt-3 text-xs tracking-wider text-cream/60 uppercase">
          {listing.beds != null && <span>{listing.beds} Beds</span>}
          {listing.baths != null && <span>{listing.baths} Baths</span>}
          {listing.sqft != null && <span>{listing.sqft.toLocaleString()} Sq Ft</span>}
          {listing.beds == null && listing.sqft == null && listing.acreage != null && (
            <span>{listing.acreage} Acres</span>
          )}
        </div>
      </div>
    </Link>
  );
}
