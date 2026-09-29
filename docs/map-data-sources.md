# Region map — data sources & validation

`/map` renders public GIS layers for the Monterey Peninsula. Nothing is copied,
cached or re-hosted: each layer is fetched from the publishing agency's own
ArcGIS FeatureServer in the visitor's browser when they toggle it on.

## Why these sources

| Publisher | Role |
|---|---|
| Monterey County Enterprise GIS (`services2.arcgis.com/nOGTdfb4kF4dZljH`) | Primary. 415 named public layers; republishes FEMA DFIRM and CAL FIRE data alongside its own zoning, coastal and utility layers. |
| CAL FIRE | Fire Hazard Severity Zones (via the county's SRA/LRA layer). |
| FEMA | Flood zones, as DFIRM panels republished by the county (`FLD_ZONE`, `SFHA_TF`, `STATIC_BFE`). |
| CA Coastal Commission | Coastal Zone boundary and appeal jurisdiction. |
| OpenStreetMap (Overpass) | Golf courses — baked to `src/data/golf-courses.json` at author time, not fetched at runtime. |
| Esri | Base map tiles (dark canvas, world imagery) — keyless endpoints. |

## Validation performed

Every layer in `src/data/map-layers.ts` was probed before being added:

1. **Service exists** — `?f=json` returns a layer list, not an error body.
   ArcGIS returns **HTTP 200 with a 404 error in the body**, so status codes alone
   are not sufficient. Always check the parsed body.
2. **CORS** — `Access-Control-Allow-Origin` present for the deployed origin.
3. **Non-empty in the Peninsula bbox** (`-122.10,36.00,-121.60,36.80`) via
   `returnCountOnly=true`.
4. **Renders in-browser** — all 35 layers re-tested from the live page with
   `f=geojson`, confirming geometry comes back under real CORS conditions.

Layers that failed and were dropped: `Alquist_Priolo_QuakeZone` and
`Fire_Perimeters` (0 features in bbox), `TRA_Parcels` and `Parcels` (too slow —
they time out), `2024_PSPS_Forecasted_Outage_Areas` (0 features; it is a
seasonal layer that empties out of fire season).

## Performance

Large layers are simplified server-side with `maxAllowableOffset` and capped with
`resultRecordCount`. Leaflet runs with `preferCanvas: true`, which handles a few
thousand polygons far better than the default SVG renderer. Zoning is the
heaviest layer at ~2,500 features in the bbox.

**Consequence:** geometry is generalised for display. Zoom in before trusting an
edge, and never treat this as a determination — see the disclaimer on the page.

## Deliberately not mapped

- **Easements** — recorded per parcel in title documents; no GIS layer exists.
- **Private sewer laterals** — private property, and utilities withhold main
  alignments as critical infrastructure. The Wastewater Districts layer answers
  *which agency serves the parcel*, which is the mappable part.
- **HOA fees** — set per association, no regional dataset.
- **Flight paths** — actual tracks vary daily with wind and ATC direction; a
  single drawn corridor would misrepresent it.
- **Registered sex offenders** — **legally prohibited.** California Penal Code
  § 290.46(j) permits use of the Megan's Law registry only to protect a person at
  risk and expressly bars use for purposes relating to *housing or
  accommodations*; misuse carries civil penalties up to $25,000 plus treble
  damages and attorney's fees. The page instead carries the notice required by
  Civil Code § 2079.10a and links to the state database. Do not add this layer.
- **Hurricanes** — California does not experience hurricanes. The coastal
  equivalents here are tsunami inundation, atmospheric-river flooding and bluff
  erosion, all of which are mapped.

## Re-validating

`scripts/probe-map-layers.mjs` re-runs checks 1–3 against every layer in the
catalog. Run it if layers start showing "unavailable" — county services are
occasionally renamed.
