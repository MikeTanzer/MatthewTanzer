export interface GuideSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  tagline: string;
  readMinutes: number;
  sections: GuideSection[];
}

export const guides: Guide[] = [
  {
    slug: "buying-process",
    title: "The Homebuying Process, Start to Finish",
    tagline: "Every step from pre-approval to keys in hand — and how long each one really takes.",
    readMinutes: 8,
    sections: [
      {
        heading: "1. Get pre-approved before you browse",
        body: [
          "In a competitive market like the Monterey Peninsula, sellers rarely consider offers without a pre-approval letter attached. Pre-approval means a lender has verified your income, assets, and credit — not just run a quick estimate.",
          "Talk to two or three lenders: a big bank, a local credit union, and an independent mortgage broker. Rates and fees vary more than most buyers expect, and a broker who knows local escrow timelines can matter as much as an eighth of a point.",
        ],
        bullets: [
          "Gather two years of tax returns, recent pay stubs, and bank statements",
          "Ask each lender for a Loan Estimate so you can compare apples to apples",
          "Pre-approval letters typically last 60–90 days and can be refreshed",
        ],
      },
      {
        heading: "2. Define the search — honestly",
        body: [
          "The Peninsula offers wildly different lifestyles within a ten-minute drive: walkable Victorian blocks in Pacific Grove, fog-kissed cottages in Carmel, sunny ranches in Carmel Valley, and gated estates in Pebble Beach. Price per square foot can double from one micro-neighborhood to the next.",
          "Make two lists: must-haves (bedrooms, garage, commute) and nice-to-haves (ocean view, guest unit, walkability). A good agent will tell you when your budget and your lists don't match — better to hear it in week one than month six.",
        ],
      },
      {
        heading: "3. Tour, offer, negotiate",
        body: [
          "When the right home appears, speed matters, but so does diligence. Review the seller's disclosure package before offering — in California, sellers must disclose known defects, and coastal homes carry unique items: septic systems, wells, Coastal Commission jurisdiction, and historic-district rules.",
          "Your offer is more than a price. Contingency periods (inspection, appraisal, loan), rent-backs, and closing timelines all carry weight. In multiple-offer situations, clean terms often beat a slightly higher number.",
        ],
      },
      {
        heading: "4. Escrow: the 21–30 day sprint",
        body: [
          "Once your offer is accepted, escrow opens. You'll wire your earnest money deposit (typically 3% in California), schedule inspections, and your lender orders the appraisal.",
          "Expect a general home inspection plus specialists as needed: roof, chimney, sewer lateral, pest. On the Peninsula, pest (termite) and drainage findings are common and almost always negotiable — credits and repairs are worked out in a request-for-repairs addendum.",
        ],
        bullets: [
          "Days 1–3: deposit earnest money, open escrow",
          "Days 5–17: inspections and disclosure review (your inspection contingency window)",
          "Days 10–21: appraisal and final loan underwriting",
          "Final week: remove contingencies, do the final walkthrough, sign with the notary",
        ],
      },
      {
        heading: "5. Closing and beyond",
        body: [
          "Once the deed records with Monterey County, the home is yours — recording usually happens the morning after you sign. Budget for immediate items: locks, utilities transfer, and a homestead declaration if the home is your primary residence.",
          "Keep every closing document. Your closing statement matters at tax time, and your title policy is the document you'll want if a boundary or easement question ever comes up.",
        ],
      },
    ],
  },
  {
    slug: "financing",
    title: "Financing a Coastal California Home",
    tagline: "Jumbo loans, rate buydowns, and what lenders look for above the conforming limit.",
    readMinutes: 7,
    sections: [
      {
        heading: "Most Peninsula purchases are jumbo loans",
        body: [
          "The 2026 conforming loan limit for Monterey County sits well below the median Carmel or Pebble Beach sale price, which means most buyers here use jumbo financing. Jumbo loans aren't scary — but they are documented more heavily and usually want stronger reserves.",
          "Typical jumbo expectations: 20% down (10% programs exist at a rate premium), 6–12 months of payments in reserves, and a debt-to-income ratio under 43%. Self-employed buyers should plan for extra documentation — two full years of returns, sometimes a CPA letter.",
        ],
      },
      {
        heading: "Ways to improve your rate",
        body: [
          "Rates aren't take-it-or-leave-it. Relationship pricing (moving assets to the lending bank) commonly shaves 0.125–0.5%. Temporary buydowns (2-1 or 1-0) can be seller-funded in negotiated deals. And paying discount points makes sense if you'll hold the loan past the break-even point — usually 4–6 years.",
        ],
        bullets: [
          "Ask about relationship discounts before locking",
          "Compare a 7/6 or 10/6 ARM against the 30-year fixed — the spread can be significant on jumbos",
          "If rates fall later, refinancing is always on the table; marry the house, date the rate",
        ],
      },
      {
        heading: "Cash buyers: proof and positioning",
        body: [
          "Cash purchases are common at the higher end of this market. You'll need a proof-of-funds letter dated within 30 days — a bank or brokerage statement works. Consider making the offer with a short 'delayed financing' plan: buy in cash to win the deal, then place a mortgage within six months without it counting as a cash-out refi.",
        ],
      },
      {
        heading: "The real monthly cost",
        body: [
          "Principal and interest are only part of the picture. California property tax runs roughly 1.1–1.25% of the purchase price per year (Prop 13 then caps increases at 2% annually). Add homeowner's insurance — which on the coast deserves early attention: some carriers have tightened in California, so get quotes during your inspection window, not the week of closing. Fire-zone and older-home surcharges are real.",
        ],
      },
    ],
  },
  {
    slug: "neighborhoods",
    title: "Neighborhoods of the Monterey Peninsula",
    tagline: "Monterey, Carmel, Pacific Grove, Pebble Beach, and Carmel Valley — compared honestly.",
    readMinutes: 9,
    sections: [
      {
        heading: "Monterey — the working heart",
        body: [
          "Monterey blends a real economy (hospitality, education, defense, marine science) with historic neighborhoods like Old Town, New Monterey, and Monterey Vista. It's the most attainable entry point on the Peninsula, with everything from downtown condos to mid-century family homes.",
          "Buyers should know the fog line: neighborhoods closer to the bay stay cooler and mistier; Skyline Forest and Deer Flats catch more sun. Student rentals cluster near the colleges — great for investors, worth mapping for owner-occupants.",
        ],
      },
      {
        heading: "Carmel-by-the-Sea — the storybook village",
        body: [
          "One square mile, no street addresses (homes are named or described by cross-streets), no mail delivery — locals collect mail at the post office, by design. Carmel's cottages and Comstock fairy-tale homes carry a global premium, and the village enforces strict design review to keep it that way.",
          "Practical notes: many lots are 4,000 sq ft, parking is tight, and short-term rentals are prohibited in the residential district. The payoff is walking to Carmel Beach at sunset every single day.",
        ],
      },
      {
        heading: "Pacific Grove — America's Last Hometown",
        body: [
          "PG offers the Peninsula's best combination of walkability, Victorian character, and ocean proximity at prices below Carmel. The Retreat area's historic cottages sit on small lots near downtown; Asilomar and Beach Tract homes get you steps from the coastal recreation trail.",
          "Check the historic resources inventory before planning renovations — many PG homes are listed, which adds a layer of review. Monarch butterfly habitat zones also carry tree-work restrictions.",
        ],
      },
      {
        heading: "Pebble Beach — inside the gate",
        body: [
          "The Del Monte Forest is privately managed, gated, and home to some of the most valuable residential real estate in America. Beyond the trophy estates on 17-Mile Drive, there are quieter enclaves — Country Club West, upper forest lots — where homes trade for a fraction of the oceanfront numbers.",
          "Ownership comes with Pebble Beach Community Services District utilities, del Monte Forest architectural review, and in many areas, a real conversation about trees, views, and the fog belt.",
        ],
      },
      {
        heading: "Carmel Valley — sunshine and acreage",
        body: [
          "Ten minutes inland, the fog burns off and the lots get bigger. Carmel Valley ranges from the shops-and-tasting-rooms Village to horse properties and vineyard estates along the river. It's the Peninsula's answer for buyers who want land, sun, and privacy.",
          "Diligence items differ out here: wells and water rights, septic capacity, fire insurance availability, and road maintenance agreements on private lanes. None are dealbreakers — all are knowable before you offer.",
        ],
      },
    ],
  },
  {
    slug: "offers-and-negotiation",
    title: "Writing Offers That Win",
    tagline: "What actually moves sellers — and the contingencies you should think twice before waiving.",
    readMinutes: 6,
    sections: [
      {
        heading: "Price is only the opening argument",
        body: [
          "Listing agents advise their sellers on the whole package: financing strength, contingency timelines, escrow length, rent-back flexibility, and how likely the buyer is to actually close. A well-structured offer at asking regularly beats a sloppy one over asking.",
        ],
        bullets: [
          "Shorten what you can prove: fully underwritten pre-approval supports a 10-day loan contingency",
          "Match the seller's timeline — a free 30-day rent-back has won more deals than an extra $25k",
          "Personal letters are discouraged under fair-housing guidance; let your terms do the talking",
        ],
      },
      {
        heading: "Contingencies: your safety net",
        body: [
          "California offers default 17-day inspection and appraisal contingencies, but everything is negotiable. Shortening them shows strength; waiving them transfers risk to you.",
          "Think hard before waiving inspection on older coastal homes — salt air, drainage, and foundations produce five-figure surprises. If you must compete with waived contingencies, do a pre-offer inspection instead: same information, before you're committed.",
        ],
      },
      {
        heading: "Multiple-offer situations",
        body: [
          "Ask the listing agent what the seller values — sometimes it's certainty, sometimes speed, sometimes a specific closing date for a 1031 exchange. An escalation-style approach (offering your best number with proof you can perform) tends to beat games.",
          "Set your walk-away number before the counteroffers start, and let it be a real number. The market rewards discipline; there is always another house.",
        ],
      },
      {
        heading: "After acceptance: negotiate round two",
        body: [
          "Inspection findings reopen the conversation. Credits are usually cleaner than seller-managed repairs — you control the contractor and the quality. Prioritize structural, water, and safety items; cosmetic asks erode goodwill you may need later in escrow.",
        ],
      },
    ],
  },
  {
    slug: "closing-costs",
    title: "Closing Costs & Hidden Numbers",
    tagline: "The line items beyond your down payment — what they are and who customarily pays.",
    readMinutes: 5,
    sections: [
      {
        heading: "What buyers typically pay in Monterey County",
        body: [
          "Plan on roughly 1–2% of the purchase price in buyer-side closing costs on a financed purchase, before prepaid taxes and insurance.",
        ],
        bullets: [
          "Lender fees: origination, underwriting, appraisal ($700–$1,200 on jumbos)",
          "Title insurance (lender's policy) and escrow fees — in Monterey County, escrow fees are customarily split, and the seller usually pays the owner's title policy",
          "Recording fees and notary",
          "Prepaids: 2–6 months of property taxes and a year of homeowner's insurance upfront",
          "HOA transfer and document fees where applicable (condos, Pebble Beach communities)",
        ],
      },
      {
        heading: "Property taxes: the supplemental surprise",
        body: [
          "California reassesses at sale, and the county sends a supplemental tax bill months after closing for the gap between the seller's old assessed value and your new one. It is not included in your lender's escrow account, and it surprises almost every first-time California buyer. Set the money aside at closing and the bill is a non-event.",
        ],
      },
      {
        heading: "Insurance is diligence, not paperwork",
        body: [
          "Get insurance quotes during your inspection window. Coastal proximity, wildfire zones (Carmel Valley, the Highlands, parts of Pebble Beach), and older knob-and-tube or galvanized systems all affect availability and price. If the admitted market declines, the California FAIR Plan plus a wrap policy is the fallback — workable, but price it before you remove contingencies.",
        ],
      },
      {
        heading: "Budget the first 90 days",
        body: [
          "Beyond closing: movers, locksmith, immediate deferred maintenance from the inspection report, and utility deposits. A practical rule of thumb is to hold 1% of the purchase price liquid for the first year's surprises — coastal homes are worth it, and they ask for it.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
