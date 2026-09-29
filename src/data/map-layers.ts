/**
 * Catalog of public GIS layers rendered on /map.
 *
 * Every entry here was probed live (existence, CORS, feature count inside the
 * Peninsula bbox) before being added — see docs/map-data-sources.md. Layers are
 * fetched lazily from the publisher's own ArcGIS FeatureServer when the visitor
 * toggles them on, so nothing is copied, cached or re-hosted by this site and the
 * data is always whatever the agency currently publishes.
 */

/** Monterey County Enterprise GIS (ArcGIS Online org nOGTdfb4kF4dZljH). */
const MC = "https://services2.arcgis.com/nOGTdfb4kF4dZljH/arcgis/rest/services";

export type LayerKind = "polygon" | "line" | "point";

export interface MapLayer {
  id: string;
  label: string;
  category: CategoryId;
  kind: LayerKind;
  /** ArcGIS FeatureServer URL, without the /query suffix. */
  url: string;
  color: string;
  /** Why a buyer should care. Shown in the layer list. */
  note: string;
  source: string;
  /** Simplification tolerance in degrees; larger = coarser but faster. */
  offset?: number;
  /** Fields to prefer in the popup, in order. */
  popupFields?: string[];
  /** Cap on features requested. */
  limit?: number;
}

export type CategoryId =
  | "hazard"
  | "landuse"
  | "coastal"
  | "infra"
  | "community"
  | "ag";

export const CATEGORIES: { id: CategoryId; label: string; blurb: string }[] = [
  {
    id: "hazard",
    label: "Hazard & Disclosure",
    blurb:
      "The hazards a California seller must disclose on the Natural Hazard Disclosure statement.",
  },
  {
    id: "landuse",
    label: "Zoning & Land Use",
    blurb: "What can be built, rebuilt, or added — and what the county says it is today.",
  },
  {
    id: "coastal",
    label: "Coastal & Scenic",
    blurb: "Coastal Commission reach and the view rules that shape Peninsula permitting.",
  },
  { id: "infra", label: "Infrastructure & Utilities", blurb: "Power, water, sewer, and fiber." },
  { id: "community", label: "Community & Schools", blurb: "Schools, parks, services, heritage." },
  { id: "ag", label: "Agriculture", blurb: "Working farmland and cultivation structures." },
];

export const LAYERS: MapLayer[] = [
  // ───────────────────────── Hazard & Disclosure ─────────────────────────
  {
    id: "flood-zones",
    label: "FEMA Flood Hazard Zones",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Flood_Hazard_Zones/FeatureServer/0`,
    color: "#38bdf8",
    note: "FEMA DFIRM zones. Zone A/AE/VE means a federally backed loan requires flood insurance.",
    source: "Monterey County GIS (FEMA DFIRM)",
    offset: 0.00008,
    popupFields: ["FLD_ZONE", "ZONE_SUBTY", "SFHA_TF", "STATIC_BFE", "DEPTH"],
    limit: 3000,
  },
  {
    id: "sfha",
    label: "Special Flood Hazard Areas",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Special_Flood_Hazard_Areas/FeatureServer/0`,
    color: "#0ea5e9",
    note: "The regulatory 1%-annual-chance floodplain — the insurance trigger.",
    source: "Monterey County GIS",
    offset: 0.00008,
  },
  {
    id: "fhsz",
    label: "Fire Hazard Severity Zones",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Fire_Hazard_Severity_Zone_SRA_LRA/FeatureServer/0`,
    color: "#f97316",
    note: "CAL FIRE Moderate/High/Very High zones. Drives insurance availability and Chapter 7A build standards.",
    source: "Monterey County GIS / CAL FIRE",
    offset: 0.00008,
    popupFields: ["HAZ_CLASS", "HAZ_CODE", "SRA", "RESPONSIBILITY"],
  },
  {
    id: "wui",
    label: "Wildland-Urban Interface",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/WUI_Area/FeatureServer/0`,
    color: "#fb923c",
    note: "Where homes meet wildland fuel — the defensible-space and ember-zone areas.",
    source: "Monterey County GIS",
  },
  {
    id: "landslide",
    label: "Landslide Susceptibility",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Landslide/FeatureServer/0`,
    color: "#a16207",
    note: "Critical on Big Sur and Carmel Highlands slopes, and for any hillside foundation.",
    source: "Monterey County GIS",
    offset: 0.0001,
    limit: 2500,
  },
  {
    id: "liquefaction",
    label: "Liquefaction Zones",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Liquefaction/FeatureServer/0`,
    color: "#c084fc",
    note: "Saturated soils that lose strength in a quake — common on fill and near the bay.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
  {
    id: "faults",
    label: "Earthquake Faults",
    category: "hazard",
    kind: "line",
    url: `${MC}/Faults/FeatureServer/0`,
    color: "#ef4444",
    note: "Mapped traces. An Alquist-Priolo zone forces a fault study before building.",
    source: "Monterey County GIS / USGS",
    offset: 0.0001,
    limit: 2000,
  },
  {
    id: "tsunami",
    label: "Tsunami Inundation",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Tsunami_Inundation_Clipped/FeatureServer/7`,
    color: "#2dd4bf",
    note: "State evacuation planning extent for low-lying coastal parcels.",
    source: "Monterey County GIS / CA Geological Survey",
  },
  {
    id: "erosion",
    label: "Coastal & Soil Erosion",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Erosion/FeatureServer/0`,
    color: "#d97706",
    note: "Bluff retreat and soil loss — the long horizon on oceanfront value.",
    source: "Monterey County GIS",
    offset: 0.0001,
    limit: 2500,
  },
  {
    id: "storm-flood",
    label: "Storm Flood History",
    category: "hazard",
    kind: "polygon",
    url: `${MC}/Storm_Flood/FeatureServer/0`,
    color: "#60a5fa",
    note: "Where atmospheric rivers have actually put water — the Peninsula's real storm record.",
    source: "Monterey County GIS",
    offset: 0.0001,
    limit: 2000,
  },

  // ───────────────────────── Zoning & Land Use ─────────────────────────
  {
    id: "zoning",
    label: "Zoning Districts",
    category: "landuse",
    kind: "polygon",
    url: `${MC}/Zoning/FeatureServer/0`,
    color: "#a78bfa",
    note: "Residential, commercial, and ag districts. Heavy layer — zoom in for detail.",
    source: "Monterey County GIS",
    offset: 0.00006,
    limit: 3000,
  },
  {
    id: "lcp",
    label: "LCP Land Use Designations",
    category: "landuse",
    kind: "polygon",
    url: `${MC}/LCP_Land_Use_Designations/FeatureServer/0`,
    color: "#8b5cf6",
    note: "Local Coastal Program designations — the controlling land use inside the Coastal Zone.",
    source: "Monterey County GIS",
    offset: 0.00008,
  },
  {
    id: "adu",
    label: "ADU / Second-Unit Restrictions",
    category: "landuse",
    kind: "polygon",
    url: `${MC}/Second_Unit_Restricted_Areas/FeatureServer/0`,
    color: "#f472b6",
    note: "Where a second unit is restricted — check before you count on guest-house income.",
    source: "Monterey County GIS",
    offset: 0.00008,
  },
  {
    id: "affordable",
    label: "Affordable Housing Overlay",
    category: "landuse",
    kind: "polygon",
    url: `${MC}/Affordable_Housing_Overlay/FeatureServer/0`,
    color: "#34d399",
    note: "Parcels carrying an inclusionary or affordable-housing overlay.",
    source: "Monterey County GIS",
  },
  {
    id: "williamson",
    label: "Williamson Act Contracts",
    category: "landuse",
    kind: "polygon",
    url: `${MC}/Williamson_Act/FeatureServer/0`,
    color: "#84cc16",
    note: "Ag-preserve tax contracts. They lower taxes but restrict use and take ~10 years to unwind.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },

  // ───────────────────────── Coastal & Scenic ─────────────────────────
  {
    id: "coastal-zone",
    label: "Coastal Zone Boundary",
    category: "coastal",
    kind: "polygon",
    url: `${MC}/Coastal_Zones/FeatureServer/0`,
    color: "#22d3ee",
    note: "Inside this line a Coastal Development Permit governs most exterior work.",
    source: "Monterey County GIS / CA Coastal Commission",
    offset: 0.0001,
  },
  {
    id: "ccc-appeal",
    label: "Coastal Commission Appeal Areas",
    category: "coastal",
    kind: "polygon",
    url: `${MC}/CCC_Appeal_Areas/FeatureServer/0`,
    color: "#06b6d4",
    note: "Even an approved local permit can be appealed to the Commission here — budget extra months.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
  {
    id: "visual-sens",
    label: "Visual Sensitivity Areas",
    category: "coastal",
    kind: "polygon",
    url: `${MC}/Visual_Sens/FeatureServer/0`,
    color: "#facc15",
    note: "Ridgeline and viewshed protection — height, colour and tree removal get scrutinised.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
  {
    id: "scenic-routes",
    label: "Scenic Highways & Routes",
    category: "coastal",
    kind: "line",
    url: `${MC}/Scenic_HWYs_and_Routes/FeatureServer/0`,
    color: "#fde047",
    note: "State and county scenic corridors, including Highway 1.",
    source: "Monterey County GIS",
  },

  // ───────────────────────── Infrastructure ─────────────────────────
  {
    id: "wastewater",
    label: "Wastewater / Sanitation Districts",
    category: "infra",
    kind: "polygon",
    url: `${MC}/Wastewater_Districts/FeatureServer/0`,
    color: "#4ade80",
    note: "Which agency sewers the parcel. Outside a district usually means septic.",
    source: "Monterey County GIS",
    offset: 0.0002,
  },
  {
    id: "storm-drains",
    label: "Storm Drains",
    category: "infra",
    kind: "line",
    url: `${MC}/Storm_Drains/FeatureServer/0`,
    color: "#22c55e",
    note: "County-maintained storm drainage. Not sanitary sewer laterals — see the notes below.",
    source: "Monterey County GIS",
  },
  {
    id: "calam",
    label: "Cal-Am Water Service Area",
    category: "infra",
    kind: "polygon",
    url: `${MC}/Cal_Am_Service_Area/FeatureServer/0`,
    color: "#0891b2",
    note: "The Peninsula's water-credit question lives here. No water credit can block a remodel or new build.",
    source: "Monterey County GIS",
    offset: 0.0002,
  },
  {
    id: "fiber",
    label: "County Fiber Routes",
    category: "infra",
    kind: "line",
    url: `${MC}/County_Fiber_Routes/FeatureServer/0`,
    color: "#e879f9",
    note: "Publicly mapped fiber. Carrier last-mile service still has to be confirmed at the address.",
    source: "Monterey County GIS",
  },
  {
    id: "towers",
    label: "Telecom Towers",
    category: "infra",
    kind: "point",
    url: `${MC}/Telecomm_Towers/FeatureServer/0`,
    color: "#f0abfc",
    note: "Cell and communications towers — coverage upside, view downside.",
    source: "Monterey County GIS",
  },

  // ───────────────────────── Community ─────────────────────────
  {
    id: "schools-public",
    label: "Public Schools",
    category: "community",
    kind: "point",
    url: `${MC}/Schools_Public/FeatureServer/0`,
    color: "#60a5fa",
    note: "Public school sites across the county.",
    source: "Monterey County GIS",
  },
  {
    id: "schools-private",
    label: "Private Schools",
    category: "community",
    kind: "point",
    url: `${MC}/Schools_Private/FeatureServer/0`,
    color: "#93c5fd",
    note: "Independent and parochial schools.",
    source: "Monterey County GIS",
  },
  {
    id: "school-districts",
    label: "School District Boundaries",
    category: "community",
    kind: "polygon",
    url: `${MC}/School_Districts_Lgl/FeatureServer/0`,
    color: "#3b82f6",
    note: "Legal district boundaries — the attendance question that moves price per square foot.",
    source: "Monterey County GIS",
    offset: 0.0002,
  },
  {
    id: "historic-sites",
    label: "Historical Sites",
    category: "community",
    kind: "point",
    url: `${MC}/Historical_Sites/FeatureServer/0`,
    color: "#c6a15b",
    note: "Recorded historic sites. Listing can bring design review — and Mills Act tax relief.",
    source: "Monterey County GIS",
  },
  {
    id: "historic-districts",
    label: "Historic District Polygons",
    category: "community",
    kind: "polygon",
    url: `${MC}/HistoricPolys400_2019/FeatureServer/0`,
    color: "#d4af6e",
    note: "Mapped historic district extents.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
  {
    id: "archaeology",
    label: "Archaeological Sensitivity",
    category: "community",
    kind: "polygon",
    url: `${MC}/Archeological_Sensitivity/FeatureServer/0`,
    color: "#b45309",
    note: "High-sensitivity ground. Expect a survey condition on grading permits.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
  {
    id: "parks",
    label: "Parks",
    category: "community",
    kind: "polygon",
    url: `${MC}/Parks/FeatureServer/0`,
    color: "#16a34a",
    note: "County and regional parks.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
  {
    id: "fire-stations",
    label: "Fire Stations",
    category: "community",
    kind: "point",
    url: `${MC}/Fire_Stations/FeatureServer/0`,
    color: "#f87171",
    note: "Response distance affects both safety and insurance rating.",
    source: "Monterey County GIS",
  },
  {
    id: "hospitals",
    label: "Hospitals & Medical",
    category: "community",
    kind: "point",
    url: `${MC}/Medical_Facilities/FeatureServer/0`,
    color: "#fca5a5",
    note: "Hospitals, clinics and urgent care.",
    source: "Monterey County GIS",
  },

  // ───────────────────────── Agriculture ─────────────────────────
  {
    id: "farmland",
    label: "Important Farmland",
    category: "ag",
    kind: "polygon",
    url: `${MC}/Important_Farmlands/FeatureServer/0`,
    color: "#a3e635",
    note: "Active farm ground. Proximity means spray schedules, dust, equipment noise and night work.",
    source: "Monterey County GIS / CA Dept of Conservation",
    offset: 0.0001,
    limit: 2500,
  },
  {
    id: "greenhouses",
    label: "Greenhouses & Cultivation",
    category: "ag",
    kind: "polygon",
    url: `${MC}/Greenhouses_Nurseries/FeatureServer/0`,
    color: "#65a30d",
    note: "Mapped cultivation structures.",
    source: "Monterey County GIS",
    offset: 0.0001,
  },
];

/** The eight places the user navigates between, with a sensible zoom for each. */
export const PLACES = [
  { id: "all", label: "Whole Region", center: [36.48, -121.88] as [number, number], zoom: 10 },
  { id: "monterey", label: "Monterey", center: [36.6002, -121.8947] as [number, number], zoom: 14 },
  { id: "carmel", label: "Carmel-by-the-Sea", center: [36.5552, -121.9233] as [number, number], zoom: 15 },
  { id: "pacific-grove", label: "Pacific Grove", center: [36.6177, -121.9166] as [number, number], zoom: 14 },
  { id: "pebble-beach", label: "Pebble Beach", center: [36.5725, -121.9486] as [number, number], zoom: 14 },
  { id: "seaside", label: "Seaside", center: [36.6111, -121.8513] as [number, number], zoom: 14 },
  { id: "carmel-valley", label: "Carmel Valley", center: [36.4819, -121.7314] as [number, number], zoom: 13 },
  { id: "carmel-highlands", label: "Carmel Highlands", center: [36.4894, -121.9330] as [number, number], zoom: 14 },
  { id: "big-sur", label: "Big Sur", center: [36.2704, -121.8081] as [number, number], zoom: 12 },
];
