"use client";

import Image from "next/image";
import { useState } from "react";

export default function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  if (!photos.length) return null;

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-sm border border-gold-500/15">
        <Image
          src={photos[active]}
          alt={`${alt} — photo ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setActive((active - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-navy-950/70 p-3 text-gold-300 backdrop-blur-sm transition-colors hover:bg-navy-950"
            >
              ‹
            </button>
            <button
              onClick={() => setActive((active + 1) % photos.length)}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-navy-950/70 p-3 text-gold-300 backdrop-blur-sm transition-colors hover:bg-navy-950"
            >
              ›
            </button>
            <div className="absolute right-3 bottom-3 rounded-sm bg-navy-950/70 px-3 py-1 text-xs text-cream/80 backdrop-blur-sm">
              {active + 1} / {photos.length}
            </div>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {photos.map((p, i) => (
            <button
              key={p}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-sm border ${
                i === active ? "border-gold-400" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={p} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
