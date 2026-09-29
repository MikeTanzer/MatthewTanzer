Real estate site for **MatthewTanzer.com** (Matthew Tanzer, REALTOR®, Coldwell Banker Realty,
Monterey Peninsula — CA DRE# 02237563, (831) 220-9817, matthew.tanzer@cbrealty.com).
Lives in `matthewtanzer-realty/` (Next.js 16 / React 19 / Tailwind v4, dark navy + gold theme,
Cormorant Garamond display + Jost body). Own nested git repo → github.com/MikeTanzer/MatthewTanzer.
Dev server: launch.json entry `matthewtanzer-realty`, port 3300.

**Live at https://miketanzer.github.io/MatthewTanzer/** — GitHub Pages, static export.
Deploy with `npm run deploy:pages` (builds with `GITHUB_PAGES=true`, pushes `out/` to the
`gh-pages` branch). Two gotchas worth remembering:
- The local `gh` OAuth token **lacks the `workflow` scope**, so anything under
  `.github/workflows/` cannot be pushed — not by git, not via the Contents API (which
  returns a misleading 404). Hence the manual script; the ready-made Actions workflow sits
  at `deploy/github-pages-workflow.yml`. Fix with `gh auth refresh -s workflow`.
- Flipping Pages `build_type` from `workflow` to `legacy` does **not** trigger a build for an
  already-pushed branch — `POST /repos/{o}/{r}/pages/builds` is needed to kick the first one.

Static export means no API routes: the contact form composes a `mailto:` instead, and
`NEXT_PUBLIC_FORM_ENDPOINT` switches it back to a JSON POST (Formspree, or a restored
`/api/contact` on a server host).

**Listings source (the non-obvious part):** the live site is WordPress wrapping the
**MoxiWorks / Coldwell Banker** platform. There is no public JSON API. The scrape path is:
homepage → "Featured Properties → Active Properties" widget (Moxi curated list `907171`,
agent UUID `8204749c-b0a2-4453-bf84-00269fbd80b7`) → its `<noscript>` fallback enumerates every
listing URL → each `/listing/...` detail page embeds the full record as
`var Wx = {data: {listing_detail: {...}}}` (brace-match to extract; beds, baths, sqft, acreage,
description in `comments`, up to 50 photos in `images`). `scripts/sync-listings.mjs` does this and
writes `src/data/listings.json`; override the source with `LISTINGS_SOURCE_URL` once the domain
is switched to this site.

Note: the listing set is *not* Monterey-only — it includes Bay Area / Napa / Truckee properties
from the Coldwell Banker feed, so location filtering matters on the listings page.

**Region map (`/map`):** 35 public GIS layers (flood, fire, zoning, coastal, utilities,
schools, farmland) fetched live from Monterey County / CAL FIRE / FEMA ArcGIS in the browser —
nothing re-hosted. Leaflet with `preferCanvas`, keyless Esri base tiles (CARTO now demands an
API key). Provenance, validation method and the deliberate omissions are in
`docs/map-data-sources.md`; `node scripts/probe-map-layers.mjs` re-checks every layer.
Two traps: **ArcGIS returns HTTP 200 with a 404 error in the body**, so validate parsed bodies,
not status codes; and Leaflet popups are raw HTML strings that Next will *not* rewrite with
basePath, hence `NEXT_PUBLIC_BASE_PATH`. Do **not** add a sex-offender layer — Penal Code
§ 290.46(j) bars registry use for housing purposes (civil penalties to $25k + treble damages);
the page carries the Civil Code § 2079.10a notice instead.

Related: `michaeltanzer-site` (Mike's own brand site, same Next.js/Tailwind stack).
