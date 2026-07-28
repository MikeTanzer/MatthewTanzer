#!/usr/bin/env node
/**
 * Pulls Matthew Tanzer's active listings from his live site (MoxiWorks /
 * Coldwell Banker platform) and writes them to src/data/listings.json.
 *
 * Source of truth: the "Featured Properties → Active Properties" widget on
 * the homepage (MoxiWorks curated list 907171). Its <noscript> fallback
 * enumerates every listing with a detail URL; each detail page embeds the
 * full listing record as `Wx = {data: {listing_detail: {...}}}`.
 *
 * When the domain is switched later, point LISTINGS_SOURCE_URL at wherever
 * the MoxiWorks site lives (e.g. the cbmoxi/moxiworks-hosted URL).
 *
 * Usage: npm run sync-listings
 *        LISTINGS_SOURCE_URL=https://... npm run sync-listings
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL = process.env.LISTINGS_SOURCE_URL || "https://matthewtanzer.com/";
const OUT_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "listings.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

/** Extract the balanced-brace JSON object that starts at html[start]. */
function extractJsonObject(html, start) {
  let depth = 0,
    inStr = false,
    esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) return JSON.parse(html.slice(start, i + 1));
      }
    }
  }
  throw new Error("Unbalanced JSON object");
}

function parseFallbackListings(html) {
  const re =
    /<a href="(https?:\/\/[^"]+\/listing\/[^"]+)" class="fallback-listing">\s*<strong>([^<]+)<\/strong><br>\s*<em>([^<]+)<\/em><br>\s*<img src="([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) {
    out.push({ url: m[1], address: m[2].trim(), price: m[3].trim(), photo: m[4] });
  }
  return out;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function mapDetail(d, sourceUrl) {
  const loc = d.location || {};
  const baths = d.bathroom_details || {};
  return {
    id: String(d.listingid),
    mlsNumber: d.mlsnumber || null,
    status: d.status || "Active",
    sourceUrl,
    urlSlug: d.url_slug || null,
    address: loc.address || "",
    city: loc.city || "",
    state: loc.state || "CA",
    zip: loc.zip || "",
    county: loc.county || null,
    latitude: num(loc.latitude),
    longitude: num(loc.longitude),
    price: num(d.list_price),
    beds: num(d.bedrooms),
    baths: num(baths.bathrooms_display) ?? num(d.bathrooms),
    fullBaths: num(baths.full_baths),
    halfBaths: num(baths.half_baths),
    sqft: num(d.sqr_footage),
    lotSqft: num(d.lot_sqr_footage),
    acreage: num(d.acreage),
    yearBuilt: num(d.year_build),
    garageSpaces: num(d.garage_spaces),
    propertyType: d.property_type || null,
    title: d.title || null,
    description: d.comments || "",
    daysOnMarket: num(d.days_on_market),
    listedDate: d.listed_date || null,
    virtualTourUrl: d.virtual_tour_url || null,
    listingAgent: d.listing_agentname || d.mls_listing_agentname || null,
    listingOffice:
      (typeof d.listing_office === "string" ? d.listing_office : d.listing_office?.name) ||
      d.mls_listing_officename ||
      null,
    mlsAttribution: d.formatted_broker_contact_attribution || null,
    photos: (Array.isArray(d.images) ? d.images : [])
      .slice(0, 16)
      .map((im) => im.full_url)
      .filter(Boolean),
  };
}

const homepage = await fetchText(SOURCE_URL);
const fallback = parseFallbackListings(homepage);
if (!fallback.length) {
  throw new Error(
    `No listings found in the Featured Properties fallback at ${SOURCE_URL} — the source page layout may have changed.`
  );
}
console.log(`Found ${fallback.length} listings on ${SOURCE_URL}`);

const listings = [];
for (const item of fallback) {
  try {
    const html = await fetchText(item.url);
    const marker = "listing_detail: ";
    const idx = html.indexOf(marker);
    if (idx === -1) throw new Error("listing_detail blob not found");
    const detail = extractJsonObject(html, idx + marker.length);
    const mapped = mapDetail(detail, item.url);
    if (!mapped.photos.length && item.photo) mapped.photos = [item.photo];
    listings.push(mapped);
    console.log(`  ✓ ${mapped.address}, ${mapped.city} — $${mapped.price?.toLocaleString()}`);
  } catch (err) {
    console.warn(`  ✗ ${item.address}: ${err.message} (using fallback card data)`);
    listings.push({
      id: item.url.split("/").pop(),
      status: "Active",
      sourceUrl: item.url,
      address: item.address,
      city: "",
      state: "CA",
      zip: "",
      price: num(item.price.replace(/[^0-9.]/g, "")),
      description: "",
      photos: [item.photo],
    });
  }
}

listings.sort((a, b) => (b.price || 0) - (a.price || 0));
mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(
  OUT_FILE,
  JSON.stringify({ syncedAt: new Date().toISOString(), source: SOURCE_URL, listings }, null, 2)
);
console.log(`\nWrote ${listings.length} listings → ${OUT_FILE}`);
