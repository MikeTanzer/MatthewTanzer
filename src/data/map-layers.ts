/**
 * Catalog of public GIS layers rendered on /map.
 *
 * Two things make coverage seamless across the region:
 *
 * 1. **Multi-source layers.** One logical layer (say "Flood Hazard Zones") can
 *    draw from several publishers at once — Monterey County, Santa Cruz County
 *    and FEMA — and the results are merged. County lines stop being holes in
 *    the map.
 * 2. **Viewport queries.** Layers are fetched for whatever the map is currently
 *    showing, not a hardcoded box, so panning north or inland keeps working.
 *
 * Every source was probed live (existence, CORS, non-empty in the region)
 * before being added — see docs/map-data-sources.md.
 */

/** Monterey County Enterprise GIS. */
const MC = "https://services2.arcgis.com/nOGTdfb4kF4dZljH/arcgis/rest/services";
/** Santa Cruz County GIS. */
const SC = "https://services1.arcgis.com/jJfZghspGKh8J9Jm/arcgis/rest/services";
/** FEMA National Flood Hazard Layer (nationwide). */
const FEMA = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
/** CAL FIRE statewide Fire Hazard Severity Zones, State Responsibility Areas. */
const CALFIRE = "https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services";
/** California Energy Commission. */
const CEC = "https://services3.arcgis.com/bWPjFyq029ChCGur/arcgis/rest/services";
/** National Park Service cultural resources. */
const NPS = "https://mapservices.nps.gov/arcgis/rest/services/cultural_resources";

export type LayerKind = "polygon" | "line" | "point";
export type CategoryId = "hazard" | "landuse" | "coastal" | "infra" | "community" | "ag";

export interface LayerSource {
  url: string;
  /** Who publishes it — shown in the popup so provenance is never ambiguous. */
  agency: string;
  /** Geometry simplification in degrees. Larger = coarser but faster. */
  offset?: number;
  limit?: number;
  /** Non-ArcGIS feed. "usgs" hits the USGS FDSN earthquake API. */
  api?: "usgs";
}

export interface MapLayer {
  id: string;
  label: string;
  category: CategoryId;
  kind: LayerKind;
  color: string;
  note: string;
  sources: LayerSource[];
  /** Below this zoom the layer is too dense to fetch; the UI says "zoom in". */
  minZoom?: number;
  popupFields?: string[];
}

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  {
    id: "hazard",
    label: "Hazard & Disclosure",
    blurb: "The hazards a California seller must disclose on the Natural Hazard Disclosure statement.",
  },
  { id: "landuse", label: "Zoning & Land Use", blurb: "What can be built, rebuilt or added." },
  { id: "coastal", label: "Coastal & Scenic", blurb: "Coastal Commission reach and view rules." },
  { id: "infra", label: "Infrastructure & Utilities", blurb: "Power, water, sewer, fiber and airspace." },
  { id: "community", label: "Community & Schools", blurb: "Schools, parks, services, heritage." },
  { id: "ag", label: "Agriculture", blurb: "Working farmland and cultivation structures." },
];

export const LAYERS: MapLayer[] = [
  // ───────────────────────── Hazard & Disclosure ─────────────────────────
  {
    id: "flood-zones",
    label: "Flood Hazard Zones",
    category: "hazard",
    kind: "polygon",
    color: "#38bdf8",
    note: "FEMA zones from three publishers merged. Zone A/AE/VE means a federally backed loan requires flood insurance.",
    popupFields: ["FLD_ZONE", "ZONE_SUBTY", "SFHA_TF", "STATIC_BFE", "DEPTH"],
    sources: [
      { url: `${FEMA}/28`, agency: "FEMA NFHL", offset: 0.00008, limit: 2000 },
      { url: `${MC}/Flood_Hazard_Zones/FeatureServer/0`, agency: "Monterey County", offset: 0.00008, limit: 2000 },
      { url: `${SC}/FEMA_Flood_Hazard_Areas/FeatureServer/20`, agency: "Santa Cruz County", offset: 0.00008, limit: 1500 },
    ],
  },
  {
    id: "floodway",
    label: "Regulatory Floodway",
    category: "hazard",
    kind: "polygon",
    color: "#0ea5e9",
    note: "The channel that must stay clear to carry flood flow. Building here is effectively barred.",
    sources: [
      { url: `${SC}/FEMA_Floodway/FeatureServer/17`, agency: "Santa Cruz County", offset: 0.00008 },
      { url: `${MC}/Special_Flood_Hazard_Areas/FeatureServer/0`, agency: "Monterey County", offset: 0.00008 },
    ],
  },
  {
    id: "fhsz",
    label: "Fire Hazard Severity Zones",
    category: "hazard",
    kind: "polygon",
    color: "#f97316",
    note: "CAL FIRE Moderate/High/Very High. Drives insurance availability and Chapter 7A build standards.",
    popupFields: ["HAZ_CLASS", "FHSZ_Description", "HAZ_CODE", "SRA", "RESPONSIBILITY"],
    sources: [
      { url: `${CALFIRE}/FHSZSRA_23_3/FeatureServer/0`, agency: "CAL FIRE (state areas)", offset: 0.00008, limit: 2000 },
      { url: `${MC}/Fire_Hazard_Severity_Zone_SRA_LRA/FeatureServer/0`, agency: "Monterey County", offset: 0.00008 },
      { url: `${SC}/Fire_Hazard_Severity_Zones/FeatureServer/0`, agency: "Santa Cruz County", offset: 0.00008 },
    ],
  },
  {
    id: "fire-history",
    label: "Recent Fire Perimeters",
    category: "hazard",
    kind: "polygon",
    color: "#dc2626",
    note: "Where fire has actually burned, including the 2020 CZU Lightning Complex.",
    sources: [{ url: `${SC}/CZU_Fire_Perimeter/FeatureServer/3`, agency: "Santa Cruz County", offset: 0.0001 }],
  },
  {
    id: "wildfire-probability",
    label: "Decadal Wildfire Probability",
    category: "hazard",
    kind: "polygon",
    color: "#fb923c",
    note: "Modelled likelihood of burning over a decade — a forward look rather than a zone label.",
    sources: [{ url: `${SC}/Decadal_Wildfire_Probability/FeatureServer/0`, agency: "Santa Cruz County", offset: 0.0001 }],
  },
  {
    id: "wui",
    label: "Wildland-Urban Interface",
    category: "hazard",
    kind: "polygon",
    color: "#fdba74",
    note: "Where homes meet wildland fuel — defensible-space and ember-zone territory.",
    sources: [{ url: `${MC}/WUI_Area/FeatureServer/0`, agency: "Monterey County" }],
  },
  {
    id: "earthquake-history",
    label: "Earthquake History (M4+)",
    category: "hazard",
    kind: "point",
    color: "#f43f5e",
    note: "Every recorded magnitude 4+ event since 1900, live from USGS. Click one for magnitude, depth and date.",
    popupFields: ["mag", "place", "time", "depth"],
    sources: [{ url: "https://earthquake.usgs.gov/fdsnws/event/1/query", agency: "USGS", api: "usgs" }],
  },
  {
    id: "faults",
    label: "Earthquake Faults",
    category: "hazard",
    kind: "line",
    color: "#ef4444",
    note: "Mapped traces. An Alquist-Priolo zone forces a fault study before building.",
    sources: [
      { url: `${MC}/Faults/FeatureServer/0`, agency: "Monterey County", offset: 0.0001, limit: 1500 },
      { url: `${SC}/Fault_Traces/FeatureServer/5`, agency: "Santa Cruz County", offset: 0.0001, limit: 1500 },
    ],
  },
  {
    id: "landslide",
    label: "Landslide Susceptibility",
    category: "hazard",
    kind: "polygon",
    color: "#a16207",
    note: "Critical on Big Sur, Carmel Highlands and the Santa Cruz Mountains.",
    sources: [
      { url: `${MC}/Landslide/FeatureServer/0`, agency: "Monterey County", offset: 0.0001, limit: 2000 },
      { url: `${SC}/Cooper_Clark_Landslide_Map/FeatureServer/15`, agency: "Santa Cruz County", offset: 0.0001, limit: 1500 },
    ],
  },
  {
    id: "liquefaction",
    label: "Liquefaction Zones",
    category: "hazard",
    kind: "polygon",
    color: "#c084fc",
    note: "Saturated soils that lose strength in a quake — common on fill and near the bay.",
    sources: [{ url: `${MC}/Liquefaction/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 }],
  },
  {
    id: "tsunami",
    label: "Tsunami Hazard Area",
    category: "hazard",
    kind: "polygon",
    color: "#2dd4bf",
    note: "State evacuation planning extent for low-lying coastal parcels.",
    sources: [
      { url: `${MC}/Tsunami_Inundation_Clipped/FeatureServer/7`, agency: "Monterey County" },
      { url: `${SC}/Tsunami_Hazard_Area/FeatureServer/0`, agency: "Santa Cruz County", offset: 0.0001 },
    ],
  },
  {
    id: "erosion",
    label: "Coastal & Soil Erosion",
    category: "hazard",
    kind: "polygon",
    color: "#d97706",
    note: "Bluff retreat and soil loss — the long horizon on oceanfront value.",
    sources: [{ url: `${MC}/Erosion/FeatureServer/0`, agency: "Monterey County", offset: 0.0001, limit: 2000 }],
  },
  {
    id: "storm-flood",
    label: "Storm Flood History",
    category: "hazard",
    kind: "polygon",
    color: "#60a5fa",
    note: "Where atmospheric rivers have actually put water — the real storm record.",
    sources: [{ url: `${MC}/Storm_Flood/FeatureServer/0`, agency: "Monterey County", offset: 0.0001, limit: 2000 }],
  },

  // ───────────────────────── Zoning & Land Use ─────────────────────────
  {
    id: "zoning",
    label: "Zoning Districts",
    category: "landuse",
    kind: "polygon",
    color: "#a78bfa",
    note: "Residential, commercial and ag districts from both counties.",
    minZoom: 11,
    sources: [
      { url: `${MC}/Zoning/FeatureServer/0`, agency: "Monterey County", offset: 0.00006, limit: 2000 },
      { url: `${SC}/Zoning/FeatureServer/25`, agency: "Santa Cruz County", offset: 0.00006, limit: 2000 },
    ],
  },
  {
    id: "lcp",
    label: "LCP Land Use Designations",
    category: "landuse",
    kind: "polygon",
    color: "#8b5cf6",
    note: "Local Coastal Program designations — the controlling land use inside the Coastal Zone.",
    sources: [{ url: `${MC}/LCP_Land_Use_Designations/FeatureServer/0`, agency: "Monterey County", offset: 0.00008 }],
  },
  {
    id: "adu",
    label: "ADU / Second-Unit Restrictions",
    category: "landuse",
    kind: "polygon",
    color: "#f472b6",
    note: "Where a second unit is restricted — check before counting on guest-house income.",
    sources: [{ url: `${MC}/Second_Unit_Restricted_Areas/FeatureServer/0`, agency: "Monterey County", offset: 0.00008 }],
  },
  {
    id: "affordable",
    label: "Affordable Housing Overlay",
    category: "landuse",
    kind: "polygon",
    color: "#34d399",
    note: "Parcels carrying an inclusionary or affordable-housing overlay.",
    sources: [{ url: `${MC}/Affordable_Housing_Overlay/FeatureServer/0`, agency: "Monterey County" }],
  },
  {
    id: "williamson",
    label: "Williamson Act Contracts",
    category: "landuse",
    kind: "polygon",
    color: "#84cc16",
    note: "Ag-preserve tax contracts. Lower taxes, restricted use, ~10 years to unwind.",
    sources: [{ url: `${MC}/Williamson_Act/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 }],
  },

  // ───────────────────────── Coastal & Scenic ─────────────────────────
  {
    id: "coastal-zone",
    label: "Coastal Zone Boundary",
    category: "coastal",
    kind: "polygon",
    color: "#22d3ee",
    note: "Inside this line a Coastal Development Permit governs most exterior work.",
    sources: [
      { url: `${MC}/Coastal_Zones/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 },
      { url: `${SC}/Coastal_Zone/FeatureServer/4`, agency: "Santa Cruz County", offset: 0.0001 },
    ],
  },
  {
    id: "ccc-appeal",
    label: "Coastal Commission Appeal Areas",
    category: "coastal",
    kind: "polygon",
    color: "#06b6d4",
    note: "Even an approved local permit can be appealed to the Commission here — budget extra months.",
    sources: [
      { url: `${MC}/CCC_Appeal_Areas/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 },
      { url: `${SC}/Coastal_Zone_Appeal_Jurisdiction/FeatureServer/5`, agency: "Santa Cruz County", offset: 0.0001 },
    ],
  },
  {
    id: "visual-sens",
    label: "Visual Sensitivity Areas",
    category: "coastal",
    kind: "polygon",
    color: "#facc15",
    note: "Ridgeline and viewshed protection — height, colour and tree removal get scrutinised.",
    sources: [{ url: `${MC}/Visual_Sens/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 }],
  },
  {
    id: "scenic-routes",
    label: "Scenic Highways & Routes",
    category: "coastal",
    kind: "line",
    color: "#fde047",
    note: "State and county scenic corridors, including Highway 1.",
    sources: [{ url: `${MC}/Scenic_HWYs_and_Routes/FeatureServer/0`, agency: "Monterey County" }],
  },

  // ───────────────────────── Infrastructure ─────────────────────────
  {
    id: "transmission",
    label: "Electric Transmission Lines",
    category: "infra",
    kind: "line",
    color: "#fbbf24",
    note: "High-voltage transmission statewide, with owner and kV. The grid backbone behind PSPS shutoffs.",
    popupFields: ["Name", "kV", "Owner", "Status", "Type"],
    sources: [{ url: `${CEC}/Transmission_Line/FeatureServer/2`, agency: "CA Energy Commission", limit: 1200 }],
  },
  {
    id: "airport-zones",
    label: "Airport Safety & Clear Zones",
    category: "infra",
    kind: "polygon",
    color: "#94a3b8",
    note: "Mapped approach and clear zones — the part of aircraft noise that is actually fixed to the ground.",
    sources: [{ url: `${SC}/Airport_Clear_Zones/FeatureServer/13`, agency: "Santa Cruz County", offset: 0.0001 }],
  },
  {
    id: "sewer-laterals",
    label: "Sewer Laterals",
    category: "infra",
    kind: "line",
    color: "#4ade80",
    note: "Mapped sewer laterals. Published by Santa Cruz County only — Monterey County does not release them.",
    minZoom: 14,
    sources: [{ url: `${SC}/Sewer_Laterals/FeatureServer/4`, agency: "Santa Cruz County", limit: 2000 }],
  },
  {
    id: "wastewater",
    label: "Wastewater / Sanitation Districts",
    category: "infra",
    kind: "polygon",
    color: "#22c55e",
    note: "Which agency sewers the parcel. Outside a district usually means septic.",
    sources: [{ url: `${MC}/Wastewater_Districts/FeatureServer/0`, agency: "Monterey County", offset: 0.0002 }],
  },
  {
    id: "stormwater",
    label: "Storm Drains & Conduits",
    category: "infra",
    kind: "line",
    color: "#16a34a",
    note: "Public storm drainage. Not sanitary sewer — see the notes below the map.",
    minZoom: 13,
    sources: [
      { url: `${MC}/Storm_Drains/FeatureServer/0`, agency: "Monterey County", limit: 2000 },
      { url: `${SC}/Stormwater_Conduits/FeatureServer/1`, agency: "Santa Cruz County", limit: 2000 },
    ],
  },
  {
    id: "water-service",
    label: "Water Service Areas",
    category: "infra",
    kind: "polygon",
    color: "#0891b2",
    note: "Who supplies water. On the Peninsula the Cal-Am water-credit question can block a remodel outright.",
    sources: [
      { url: `${MC}/Cal_Am_Service_Area/FeatureServer/0`, agency: "Monterey County", offset: 0.0002 },
      { url: `${SC}/Water_Service_Areas/FeatureServer/0`, agency: "Santa Cruz County", offset: 0.0002 },
    ],
  },
  {
    id: "fiber",
    label: "County Fiber Routes",
    category: "infra",
    kind: "line",
    color: "#e879f9",
    note: "Publicly mapped fiber. Carrier last-mile service still has to be confirmed at the address.",
    sources: [{ url: `${MC}/County_Fiber_Routes/FeatureServer/0`, agency: "Monterey County" }],
  },
  {
    id: "towers",
    label: "Telecom Towers",
    category: "infra",
    kind: "point",
    color: "#f0abfc",
    note: "Cell and communications towers — coverage upside, view downside.",
    sources: [{ url: `${MC}/Telecomm_Towers/FeatureServer/0`, agency: "Monterey County" }],
  },

  // ───────────────────────── Community ─────────────────────────
  {
    id: "schools",
    label: "Schools",
    category: "community",
    kind: "point",
    color: "#60a5fa",
    note: "Public and private school sites across both counties.",
    sources: [
      { url: `${MC}/Schools_Public/FeatureServer/0`, agency: "Monterey County" },
      { url: `${MC}/Schools_Private/FeatureServer/0`, agency: "Monterey County" },
      { url: `${SC}/Schools/FeatureServer/0`, agency: "Santa Cruz County" },
    ],
  },
  {
    id: "school-districts",
    label: "School District Boundaries",
    category: "community",
    kind: "polygon",
    color: "#3b82f6",
    note: "The attendance question that moves price per square foot.",
    sources: [{ url: `${MC}/School_Districts_Lgl/FeatureServer/0`, agency: "Monterey County", offset: 0.0002 }],
  },
  {
    id: "nrhp",
    label: "National Register of Historic Places",
    category: "community",
    kind: "point",
    color: "#e3c98f",
    note: "Federally listed historic properties, nationwide coverage.",
    sources: [{ url: `${NPS}/nrhp_locations/MapServer/0`, agency: "National Park Service" }],
  },
  {
    id: "historic-sites",
    label: "County Historical Sites",
    category: "community",
    kind: "point",
    color: "#c6a15b",
    note: "Locally recorded sites. Listing can bring design review — and Mills Act tax relief.",
    sources: [{ url: `${MC}/Historical_Sites/FeatureServer/0`, agency: "Monterey County" }],
  },
  {
    id: "historic-districts",
    label: "Historic District Polygons",
    category: "community",
    kind: "polygon",
    color: "#d4af6e",
    note: "Mapped historic district extents.",
    sources: [{ url: `${MC}/HistoricPolys400_2019/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 }],
  },
  {
    id: "archaeology",
    label: "Archaeological Sensitivity",
    category: "community",
    kind: "polygon",
    color: "#b45309",
    note: "High-sensitivity ground. Expect a survey condition on grading permits.",
    sources: [{ url: `${MC}/Archeological_Sensitivity/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 }],
  },
  {
    id: "parks",
    label: "Parks",
    category: "community",
    kind: "polygon",
    color: "#16a34a",
    note: "County and regional parks across both counties.",
    sources: [
      { url: `${MC}/Parks/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 },
      { url: `${SC}/Existing_Parks/FeatureServer/4`, agency: "Santa Cruz County", offset: 0.0001 },
    ],
  },
  {
    id: "fire-stations",
    label: "Fire Stations",
    category: "community",
    kind: "point",
    color: "#f87171",
    note: "Response distance affects both safety and insurance rating.",
    sources: [{ url: `${MC}/Fire_Stations/FeatureServer/0`, agency: "Monterey County" }],
  },
  {
    id: "hospitals",
    label: "Hospitals & Medical",
    category: "community",
    kind: "point",
    color: "#fca5a5",
    note: "Hospitals, clinics and urgent care.",
    sources: [{ url: `${MC}/Medical_Facilities/FeatureServer/0`, agency: "Monterey County" }],
  },

  // ───────────────────────── Agriculture ─────────────────────────
  {
    id: "farmland",
    label: "Farmland & Ag Fields",
    category: "ag",
    kind: "polygon",
    color: "#a3e635",
    note: "Working ground. Proximity means spray schedules, dust, equipment noise and night harvesting.",
    minZoom: 11,
    sources: [
      { url: `${MC}/Important_Farmlands/FeatureServer/0`, agency: "Monterey County", offset: 0.0001, limit: 2000 },
      { url: `${SC}/Agricultural_Fields/FeatureServer/0`, agency: "Santa Cruz County", offset: 0.0001, limit: 2000 },
    ],
  },
  {
    id: "greenhouses",
    label: "Greenhouses & Cultivation",
    category: "ag",
    kind: "polygon",
    color: "#65a30d",
    note: "Mapped cultivation structures.",
    sources: [{ url: `${MC}/Greenhouses_Nurseries/FeatureServer/0`, agency: "Monterey County", offset: 0.0001 }],
  },
];

/** Places to jump between, now spanning both counties. */
export const PLACES = [
  { id: "all", label: "Whole Region", center: [36.65, -121.80] as [number, number], zoom: 9 },
  { id: "monterey", label: "Monterey", center: [36.6002, -121.8947] as [number, number], zoom: 14 },
  { id: "carmel", label: "Carmel-by-the-Sea", center: [36.5552, -121.9233] as [number, number], zoom: 15 },
  { id: "pacific-grove", label: "Pacific Grove", center: [36.6177, -121.9166] as [number, number], zoom: 14 },
  { id: "pebble-beach", label: "Pebble Beach", center: [36.5725, -121.9486] as [number, number], zoom: 14 },
  { id: "seaside", label: "Seaside", center: [36.6111, -121.8513] as [number, number], zoom: 14 },
  { id: "carmel-valley", label: "Carmel Valley", center: [36.4819, -121.7314] as [number, number], zoom: 13 },
  { id: "carmel-highlands", label: "Carmel Highlands", center: [36.4894, -121.9330] as [number, number], zoom: 14 },
  { id: "big-sur", label: "Big Sur", center: [36.2704, -121.8081] as [number, number], zoom: 12 },
  { id: "salinas", label: "Salinas", center: [36.6777, -121.6555] as [number, number], zoom: 13 },
  { id: "watsonville", label: "Watsonville", center: [36.9102, -121.7569] as [number, number], zoom: 13 },
  { id: "santa-cruz", label: "Santa Cruz", center: [36.9741, -122.0308] as [number, number], zoom: 13 },
];
