# Region map — data sources & validation

`/map` renders public GIS layers for the Monterey Peninsula. Nothing is copied,
cached or re-hosted: each layer is fetched from the publishing agency's own
ArcGIS FeatureServer in the visitor's browser when they toggle it on.

## Why these sources

| Publisher | Role |
|---|---|
| Monterey County Enterprise GIS (`services2.arcgis.com/nOGTdfb4kF4dZljH`) | 415 named public layers; zoning, coastal, utility, hazard. |
| Santa Cruz County GIS (`services1.arcgis.com/jJfZghspGKh8J9Jm`) | 406 layers covering everything north of the county line, including **sewer laterals** and **airport clear zones**, which Monterey does not publish. |
| FEMA National Flood Hazard Layer | Nationwide flood zones (`FLD_ZONE`, `SFHA_TF`, `STATIC_BFE`). Gives coverage past both county edges. |
| CAL FIRE | Statewide Fire Hazard Severity Zones (State Responsibility Areas). |
| USGS FDSN | Earthquake history, M4+ since 1900. Not ArcGIS — its own GeoJSON API. |
| CA Energy Commission | Electric transmission lines with owner and kV. |
| National Park Service | National Register of Historic Places. |
| OpenStreetMap (Overpass) | Golf courses — baked to `src/data/golf-courses.json` at author time, not fetched at runtime. |
| Esri | Base map tiles (dark canvas, imagery) — keyless endpoints. |

## Coverage model

Two mechanisms keep the map from having holes:

**Multi-source layers.** A `MapLayer` holds a list of `sources`. Toggling "Flood
Hazard Zones" queries FEMA, Monterey County and Santa Cruz County at once and
merges the results, so a county line is not a blank area. Each feature is tagged
with `__agency` so its popup names the actual publisher.

**Viewport queries.** Layers are fetched for `map.getBounds()`, padded 15%, not a
hardcoded box, and refetched (debounced 700ms) whenever the view settles. Panning
into a new county loads that county's data.

Dense layers carry a `minZoom`; below it the UI shows "zoom in" rather than
requesting tens of thousands of features. FeatureServer pages cap at **2,000
features per request** regardless of `resultRecordCount`, so per-source limits are
set to that ceiling and `exceededTransferLimit` is expected on dense layers.

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
- **Sewer laterals south of the county line** — Santa Cruz County publishes
  ~17,700 of them and they are mapped. Monterey County does not release them, so
  there the Wastewater Districts layer (which agency serves the parcel) is the
  mappable part.
- **HOA fees** — set per association, no regional dataset.
- **Flight paths** — airport safety and clear zones are fixed to the ground and
  are mapped. Actual tracks vary daily with wind and ATC direction, so no corridor
  is drawn.
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


## React + Leaflet gotcha (cost a real debugging session)

The init effect must only tear down **the map that run created**:

```ts
let own: LMap | null = null;
// ... own = map; mapRef.current = map;
return () => { if (own) { own.remove(); ... } };
```

The earlier version called `mapRef.current?.remove()` in cleanup. Under React
StrictMode's dev mount → cleanup → remount, that left a *live map on screen owned
by a dead component instance*: its refs never updated again, so `moveend`
refetches saw an empty active-layer set and silently did nothing, and merged
layers under-counted. The symptom was subtle — the map looked fine and layers
loaded on toggle, but panning never refreshed anything.

Related: refetch is driven by a `viewTick` state counter rather than a ref read
inside the Leaflet event closure, so it always reads live React state.
