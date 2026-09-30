import type { Metadata } from "next";
import Link from "next/link";
import RegionMap from "@/components/RegionMap";
import { LAYERS } from "@/data/map-layers";

export const metadata: Metadata = {
  title: "Region Map & Data Layers | Matthew Tanzer Realty",
  description:
    "Interactive Monterey Peninsula map — flood and fire hazard zones, zoning, coastal jurisdiction, utilities, schools and farmland, drawn live from public county and state GIS.",
};

/** Things buyers reasonably ask for that simply are not public map data. */
const NOT_MAPPABLE = [
  {
    title: "Easements",
    why: "Easements are recorded against individual parcels in title documents, not published as a county GIS layer.",
    how: "They appear in the preliminary title report, usually within days of opening escrow. Matthew reads the Schedule B exceptions with you line by line.",
  },
  {
    title: "Sewer laterals in Monterey County",
    why: "Santa Cruz County publishes its laterals and they are mapped here. Monterey County does not release them, so south of the county line the map shows service districts only.",
    how: "The Wastewater Districts layer tells you which agency serves a parcel. For the lateral itself a sewer-camera inspection during your inspection window is the answer, and it is worth doing on any pre-1970 home either way.",
  },
  {
    title: "HOA fees",
    why: "Dues are set per association and change yearly, so there is no regional dataset to map.",
    how: "Fees arrive in the HOA document package during escrow, alongside reserves, minutes and any pending special assessment. Where a listing publishes dues, they show on that listing's page.",
  },
  {
    title: "Exact flight paths",
    why: "Airport safety and clear zones are fixed to the ground and are mapped here. Actual flight tracks are not — they shift daily with wind, aircraft type and air-traffic direction, so a single drawn corridor would misrepresent them.",
    how: "Use the Airport Safety & Clear Zones layer for the fixed part, then visit at different hours for the rest. The practical noise question on the Peninsula is runway 10R/28L alignment over Del Rey Oaks and parts of Monterey.",
  },
];

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-sm border border-gold-500/15 bg-navy-900 p-5 text-center">
      <div className="font-display text-3xl font-semibold text-gold-300">{n}</div>
      <div className="mt-1 text-[0.65rem] tracking-[0.2em] text-cream/50 uppercase">{label}</div>
    </div>
  );
}

export default function MapPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-6 py-12">
      <div className="text-xs font-medium tracking-[0.4em] text-gold-400 uppercase">Region Intelligence</div>
      <h1 className="font-display mt-2 text-5xl font-semibold">Map &amp; Data Layers</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-cream/65">
        Every overlay is drawn live from the agency that publishes it — Monterey County and Santa
        Cruz County Enterprise GIS, CAL FIRE, FEMA, USGS, the California Energy Commission and the
        National Park Service. Layers are fetched for whatever the map is currently showing, and a
        single layer merges every publisher that covers the area, so county lines are not holes.
        Pan or zoom and the data follows. Coverage runs from Santa Cruz and Gilroy in the north,
        down the Salinas Valley through Salinas, Gonzales, Soledad and Greenfield, and out along the
        coast to Big Sur.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat n={String(LAYERS.length)} label="Live GIS layers" />
        <Stat n="23" label="Places mapped" />
        <Stat n="7" label="Public agencies" />
        <Stat n="Live" label="Follows the map" />
      </div>

      <div className="mt-10">
        <RegionMap />
      </div>

      {/* How to read it */}
      <section className="mt-16 grid gap-8 lg:grid-cols-3">
        <div className="rounded-sm border border-gold-500/20 bg-navy-900 p-7">
          <h2 className="font-display text-2xl font-semibold text-gold-300">Start with the disclosure set</h2>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            California sellers must deliver a Natural Hazard Disclosure statement covering flood, fire,
            earthquake fault, seismic and dam-inundation status. The <strong>Hazard &amp; Disclosure</strong>{" "}
            group maps those same determinations, so you can see what the NHD will say before you write
            an offer rather than on day ten of escrow.
          </p>
        </div>
        <div className="rounded-sm border border-gold-500/20 bg-navy-900 p-7">
          <h2 className="font-display text-2xl font-semibold text-gold-300">Then check what you can build</h2>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            On the Peninsula, permission matters as much as price. Layer{" "}
            <strong>Coastal Zone</strong>, <strong>Appeal Areas</strong> and{" "}
            <strong>Visual Sensitivity</strong> together and you can see why two similar lots can be a
            year apart on entitlement. <strong>Cal-Am Service Area</strong> speaks to the water-credit
            question that quietly governs remodels here.
          </p>
        </div>
        <div className="rounded-sm border border-gold-500/20 bg-navy-900 p-7">
          <h2 className="font-display text-2xl font-semibold text-gold-300">Then the lived details</h2>
          <p className="mt-3 text-sm leading-relaxed text-cream/70">
            <strong>Important Farmland</strong> is the layer buyers new to the area most often skip.
            Proximity to working ground means spray schedules, dust, equipment noise and night
            harvesting. None of that is a reason to avoid a home — it is a reason to visit at 6am
            before committing.
          </p>
        </div>
      </section>

      {/* Property taxes */}
      <section className="mt-14 rounded-sm border border-gold-500/20 bg-navy-900 p-8">
        <h2 className="font-display text-3xl font-semibold">Property tax rates</h2>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-cream/70">
          California property tax is not a neighbourhood rate you can shade on a map — it is set per
          parcel. Under Proposition 13 the base is <strong>1% of assessed value</strong>, and assessed
          value resets to your purchase price when you buy, then rises at most 2% a year. On top of the
          base sit voter-approved bonds and direct charges, which vary by Tax Rate Area (TRA) and
          typically bring the Peninsula total to roughly <strong>1.1%–1.25%</strong>.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Find the parcel's real number", "The Assessor's parcel lookup gives the TRA and current assessed value.", "https://www.countyofmonterey.gov/government/departments-a-h/assessor"],
            ["See the rate for that TRA", "The Auditor-Controller publishes the full rate book each year, TRA by TRA.", "https://www.countyofmonterey.gov/government/departments-a-h/auditor-controller"],
            ["Budget the supplemental bill", "A separate bill arrives months after closing for the gap between the seller's assessment and yours.", "https://www.countyofmonterey.gov/government/departments-i-z/treasurer-tax-collector"],
          ].map(([t, d, href]) => (
            <a key={t} href={href} target="_blank" rel="noopener noreferrer"
               className="rounded-sm border border-gold-500/15 p-5 transition-colors hover:border-gold-400/50">
              <div className="text-gold-300">{t} ↗</div>
              <div className="mt-1.5 text-sm leading-relaxed text-cream/55">{d}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Honest limits */}
      <section className="mt-14">
        <h2 className="font-display text-3xl font-semibold">What a map can&apos;t tell you</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-cream/65">
          Some of the most consequential facts about a property are genuinely not public map data.
          Rather than draw something approximate and let it look authoritative, here is what is
          missing and exactly how to get it.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {NOT_MAPPABLE.map((x) => (
            <div key={x.title} className="rounded-sm border border-gold-500/15 bg-navy-900 p-6">
              <h3 className="font-display text-xl font-semibold text-gold-300">{x.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/60">{x.why}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/80">
                <span className="text-[0.65rem] tracking-[0.2em] text-gold-400 uppercase">How to get it → </span>
                {x.how}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Megan's Law — statutory notice */}
      <section className="mt-14 rounded-sm border border-gold-500/25 bg-navy-900 p-8">
        <h2 className="font-display text-2xl font-semibold">Registered sex offender information</h2>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-cream/70">
          This information is deliberately not mapped here, and no California brokerage will map it.
          Penal Code § 290.46(j) permits use of the Megan&apos;s Law registry only to protect a person at
          risk, and expressly prohibits its use for purposes relating to <em>housing or
          accommodations</em>. Misuse carries civil penalties of up to $25,000 plus treble damages and
          attorney&apos;s fees. The registry is public and you are free to consult it directly — but the
          lawful route is the state&apos;s own database, not a realtor&apos;s overlay.
        </p>
        <p className="mt-5 border-l-2 border-gold-500/40 py-1 pl-4 text-sm leading-relaxed text-cream/75">
          <strong>Notice:</strong> Pursuant to Section 290.46 of the Penal Code, information about
          specified registered sex offenders is made available to the public via an Internet Web site
          maintained by the Department of Justice at{" "}
          <a href="https://www.meganslaw.ca.gov" target="_blank" rel="noopener noreferrer" className="text-gold-300 underline">
            www.meganslaw.ca.gov
          </a>
          . Depending on an offender&apos;s criminal history, this information will include either the
          address at which the offender resides or the community of residence and ZIP Code in which
          the offender resides.
        </p>
        <p className="mt-4 text-xs text-cream/45">
          This is the notice California Civil Code § 2079.10a requires in residential purchase
          contracts. Agents and sellers are not required to obtain or provide registry data themselves.
        </p>
      </section>

      {/* Sources + disclaimer */}
      <section className="mt-14 rounded-sm border border-gold-500/15 p-7">
        <h2 className="text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase">Sources &amp; limitations</h2>
        <div className="mt-4 grid gap-6 text-sm leading-relaxed text-cream/60 md:grid-cols-2">
          <div>
            <p>
              Layers are requested directly from <strong>Monterey County</strong> and{" "}
              <strong>Santa Cruz County</strong> Enterprise GIS, with fire severity zones from{" "}
              <strong>CAL FIRE</strong>, flood zones from <strong>FEMA</strong>&apos;s National Flood
              Hazard Layer, seismic history from <strong>USGS</strong>, transmission lines from the{" "}
              <strong>California Energy Commission</strong>, and historic listings from the{" "}
              <strong>National Park Service</strong>. Golf courses come from{" "}
              <strong>OpenStreetMap</strong>; base maps from <strong>Esri</strong>.
            </p>
          </div>
          <div>
            <p>
              Public GIS is a <em>planning</em> tool, not a determination. Boundaries are generalised,
              publication lags amendments, and large layers are capped and simplified here for
              performance, so zoom in before relying on an edge. Dense layers such as sewer laterals
              only load once you are zoomed in far enough to draw them honestly. For anything that affects your
              offer — a flood determination, a fire-zone insurance quote, a permit question — get the
              parcel-specific answer from the county, your title officer, or your insurer.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-gold-500/10 pt-4 text-xs text-cream/40">
          Provided for informational purposes only. Not a survey, title report, flood determination or
          legal advice. Matthew Tanzer and Coldwell Banker Realty make no warranty as to the accuracy
          or currency of third-party government data.
        </p>
      </section>

      <div className="mt-12 text-center">
        <h3 className="font-display text-2xl font-semibold">Want this run for a specific address?</h3>
        <p className="mt-2 text-sm text-cream/60">
          Matthew will pull the parcel-level hazard, zoning and permit picture before you write an offer.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-sm bg-gold-500 px-8 py-3 text-sm font-medium tracking-[0.2em] text-navy-950 uppercase transition-colors hover:bg-gold-300"
        >
          Ask Matthew
        </Link>
      </div>
    </div>
  );
}
