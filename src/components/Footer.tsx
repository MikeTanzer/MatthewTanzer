import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gold-500/20 bg-navy-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="font-display text-xl font-semibold tracking-[0.18em]">MATTHEW TANZER</div>
          <div className="mb-4 text-[0.6rem] font-medium tracking-[0.45em] text-gold-400">REALTY</div>
          <p className="text-sm leading-relaxed text-cream/60">
            Matthew Tanzer, REALTOR®
            <br />
            Coldwell Banker Realty · Monterey Peninsula
            <br />
            CA DRE# 02237563
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Explore</h3>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/listings" className="hover:text-gold-300">Active Listings</Link></li>
            <li><Link href="/guides" className="hover:text-gold-300">Homebuyer Guides &amp; Resources</Link></li>
            <li><Link href="/contact" className="hover:text-gold-300">Contact Matthew</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Get in touch</h3>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>
              <a href="tel:+18312209817" className="hover:text-gold-300">(831) 220-9817</a>
            </li>
            <li>
              <a href="mailto:matthew.tanzer@cbrealty.com" className="hover:text-gold-300">
                matthew.tanzer@cbrealty.com
              </a>
            </li>
            <li className="pt-2 text-cream/50">Monterey · Carmel · Pacific Grove</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold-500/10 px-6 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Matthew Tanzer Realty. Listing data provided by MLSListings Inc. via
        Coldwell Banker Realty. All information deemed reliable but not guaranteed.
      </div>
    </footer>
  );
}
