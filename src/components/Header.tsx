"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/listings", label: "Listings" },
  { href: "/guides", label: "Buyer Guides" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/20 bg-navy-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <div className="font-display text-2xl font-semibold tracking-[0.18em] text-cream">
            MATTHEW TANZER
          </div>
          <div className="flex items-center gap-3">
            <span className="gold-rule flex-1" />
            <span className="font-body text-[0.65rem] font-medium tracking-[0.45em] text-gold-400">
              REALTY
            </span>
            <span className="gold-rule flex-1" />
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm tracking-[0.15em] uppercase transition-colors hover:text-gold-300 ${
                pathname === l.href ? "text-gold-400" : "text-cream/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="tel:+18312209817"
            className="rounded-sm border border-gold-500 px-4 py-2 text-sm tracking-wider text-gold-300 transition-colors hover:bg-gold-500 hover:text-navy-950"
          >
            (831) 220-9817
          </a>
        </nav>

        <button
          className="text-gold-400 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-gold-500/20 px-6 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm tracking-[0.15em] uppercase text-cream/80 hover:text-gold-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
