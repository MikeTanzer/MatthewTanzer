import data from "@/data/listings.json";

export interface Listing {
  id: string;
  mlsNumber?: string | null;
  status: string;
  sourceUrl: string;
  urlSlug?: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  county?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price: number | null;
  beds?: number | null;
  baths?: number | null;
  fullBaths?: number | null;
  halfBaths?: number | null;
  sqft?: number | null;
  lotSqft?: number | null;
  acreage?: number | null;
  yearBuilt?: number | null;
  garageSpaces?: number | null;
  propertyType?: string | null;
  title?: string | null;
  description: string;
  daysOnMarket?: number | null;
  listedDate?: string | null;
  virtualTourUrl?: string | null;
  listingAgent?: string | null;
  listingOffice?: string | null;
  mlsAttribution?: string | null;
  photos: string[];
}

export interface ListingsFile {
  syncedAt: string;
  source: string;
  listings: Listing[];
}

const file = data as unknown as ListingsFile;

export function getListings(): Listing[] {
  return file.listings;
}

export function getListing(id: string): Listing | undefined {
  return file.listings.find((l) => l.id === id);
}

export function getSyncInfo() {
  return { syncedAt: file.syncedAt, source: file.source };
}

export function getCities(): string[] {
  return Array.from(new Set(file.listings.map((l) => l.city).filter(Boolean))).sort();
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Price upon request";
  return `$${price.toLocaleString("en-US")}`;
}

export function shortPrice(price: number | null | undefined): string {
  if (price == null) return "—";
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, "")}M`;
  return `$${Math.round(price / 1000)}K`;
}
