"use client";

import { useMemo, useState } from "react";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/lib/listings";

type Sort = "price-desc" | "price-asc" | "newest";

export default function ListingsBrowser({ listings, cities }: { listings: Listing[]; cities: string[] }) {
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<Sort>("price-desc");

  const shown = useMemo(() => {
    const out = city === "all" ? [...listings] : listings.filter((l) => l.city === city);
    if (sort === "price-desc") out.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "price-asc") out.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "newest") out.sort((a, b) => (a.daysOnMarket ?? 9999) - (b.daysOnMarket ?? 9999));
    return out;
  }, [listings, city, sort]);

  const selectCls =
    "rounded-sm border border-gold-500/30 bg-navy-900 px-4 py-2.5 text-sm text-cream focus:border-gold-400 focus:outline-none";

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls} aria-label="Filter by city">
          <option value="all">All Locations</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectCls} aria-label="Sort listings">
          <option value="price-desc">Price: High to Low</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="newest">Newest on Market</option>
        </select>
        <span className="text-sm text-cream/50">{shown.length} shown</span>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((l, i) => (
          <ListingCard key={l.id} listing={l} priority={i < 3} />
        ))}
      </div>
    </>
  );
}
