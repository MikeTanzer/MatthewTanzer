"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Map as LMap, GeoJSON as LGeoJSON, LayerGroup } from "leaflet";
import { LAYERS, CATEGORIES, PLACES, type MapLayer, type CategoryId } from "@/data/map-layers";
import golf from "@/data/golf-courses.json";
import { getListings, formatPrice } from "@/lib/listings";

type Status = "idle" | "loading" | "ready" | "empty" | "error";

const REGION_CITIES = new Set([
  "Carmel", "Pebble Beach", "Pacific Grove", "Monterey",
  "Seaside", "Carmel Valley", "Big Sur", "Carmel Highlands",
]);

const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const ESRI_ATTR = "Tiles &copy; Esri";

const BASEMAPS = {
  dark: {
    url: `${ESRI}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    // Base tiles carry no place names, so pair them with the matching
    // reference layer — on this map, knowing Carmel from Pebble Beach matters.
    labels: `${ESRI}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
    attr: ESRI_ATTR,
  },
  satellite: {
    url: `${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,
    attr: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
  },
  streets: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    labels: null,
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const;

/** Fields never worth showing in a popup. */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const SKIP = /^(fid|objectid|globalid|shape|se_anno|created_|last_edit|editor|esri)/i;

function popupHtml(layer: MapLayer, props: Record<string, unknown>): string {
  const entries: [string, unknown][] = [];
  for (const f of layer.popupFields ?? []) {
    if (props[f] !== undefined && props[f] !== null && props[f] !== "") entries.push([f, props[f]]);
  }
  if (entries.length < 4) {
    for (const [k, v] of Object.entries(props)) {
      if (entries.length >= 6) break;
      if (SKIP.test(k) || v === null || v === "" || v === undefined) continue;
      if (entries.some(([ek]) => ek === k)) continue;
      entries.push([k, v]);
    }
  }
  const rows = entries
    .map(
      ([k, v]) =>
        `<div style="display:flex;gap:8px;justify-content:space-between;padding:2px 0">
           <span style="color:#8b9bb4;font-size:10px;letter-spacing:.06em;text-transform:uppercase">${k.replace(/_/g, " ")}</span>
           <span style="color:#f5f1e8;font-size:12px;text-align:right">${String(v)}</span>
         </div>`
    )
    .join("");
  return `<div style="min-width:190px">
      <div style="color:${layer.color};font-size:11px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px">${layer.label}</div>
      ${rows || '<div style="color:#8b9bb4;font-size:12px">No attributes published.</div>'}
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid #ffffff22;color:#6b7a91;font-size:10px">${layer.source}</div>
    </div>`;
}

export default function RegionMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const overlays = useRef<Record<string, LGeoJSON>>({});
  const markerGroups = useRef<Record<string, LayerGroup>>({});
  const baseRef = useRef<ReturnType<typeof import("leaflet").tileLayer> | null>(null);
  const labelRef = useRef<ReturnType<typeof import("leaflet").tileLayer> | null>(null);

  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [openCat, setOpenCat] = useState<CategoryId | "market" | null>("hazard");
  const [basemap, setBasemap] = useState<keyof typeof BASEMAPS>("dark");
  const [showListings, setShowListings] = useState(true);
  const [showGolf, setShowGolf] = useState(false);

  // ── init map ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapEl.current, {
        center: [36.48, -121.88],
        zoom: 10,
        preferCanvas: true, // canvas renderer handles thousands of polygons
        zoomControl: true,
        scrollWheelZoom: true,
      });
      baseRef.current = L.tileLayer(BASEMAPS.dark.url, {
        attribution: BASEMAPS.dark.attr,
        maxZoom: 19,
      }).addTo(map);
      labelRef.current = L.tileLayer(BASEMAPS.dark.labels, {
        maxZoom: 19,
        pane: "shadowPane", // above overlays so place names stay readable
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── basemap swap ──────────────────────────────────────────────────────
  useEffect(() => {
    const L = LRef.current, map = mapRef.current;
    if (!L || !map || !baseRef.current) return;
    map.removeLayer(baseRef.current);
    if (labelRef.current) { map.removeLayer(labelRef.current); labelRef.current = null; }

    const cfg = BASEMAPS[basemap];
    baseRef.current = L.tileLayer(cfg.url, { attribution: cfg.attr, maxZoom: 19 }).addTo(map);
    baseRef.current.bringToBack();
    if (cfg.labels) {
      labelRef.current = L.tileLayer(cfg.labels, { maxZoom: 19, pane: "shadowPane" }).addTo(map);
    }
  }, [basemap]);

  // ── listings + golf marker groups ─────────────────────────────────────
  useEffect(() => {
    const L = LRef.current, map = mapRef.current;
    if (!L || !map || !ready) return;

    if (!markerGroups.current.listings) {
      const g = L.layerGroup();
      for (const l of getListings()) {
        if (!l.latitude || !l.longitude || !REGION_CITIES.has(l.city)) continue;
        L.circleMarker([l.latitude, l.longitude], {
          radius: 8, color: "#0a1220", weight: 2,
          fillColor: "#c6a15b", fillOpacity: 1,
        })
          .bindPopup(
            `<div style="min-width:180px">
               <div style="color:#c6a15b;font-size:17px;font-weight:600">${formatPrice(l.price)}</div>
               <div style="color:#f5f1e8;font-size:13px;margin-top:2px">${l.address}</div>
               <div style="color:#8b9bb4;font-size:12px">${l.city}, ${l.state} ${l.zip}</div>
               <div style="color:#8b9bb4;font-size:11px;margin-top:6px">
                 ${[l.beds && `${l.beds} bd`, l.baths && `${l.baths} ba`,
                    l.sqft && `${l.sqft.toLocaleString()} sqft`].filter(Boolean).join(" · ")}
               </div>
               <a href="${BASE}/listings/${l.id}/" style="color:#d4af6e;font-size:11px;letter-spacing:.1em;text-transform:uppercase;display:inline-block;margin-top:8px">View listing →</a>
             </div>`
          )
          .addTo(g);
      }
      markerGroups.current.listings = g;
    }
    if (!markerGroups.current.golf) {
      const g = L.layerGroup();
      for (const c of golf.courses) {
        L.circleMarker([c.lat, c.lng], {
          radius: 6, color: "#0a1220", weight: 2,
          fillColor: "#22c55e", fillOpacity: 0.95,
        })
          .bindPopup(
            `<div><div style="color:#22c55e;font-size:11px;letter-spacing:.12em;text-transform:uppercase">Golf Course</div>
             <div style="color:#f5f1e8;font-size:13px;margin-top:3px">${c.name}</div>
             <div style="color:#6b7a91;font-size:10px;margin-top:6px">OpenStreetMap</div></div>`
          )
          .addTo(g);
      }
      markerGroups.current.golf = g;
    }

    const toggle = (key: string, on: boolean) => {
      const g = markerGroups.current[key];
      if (!g) return;
      if (on && !map.hasLayer(g)) g.addTo(map);
      if (!on && map.hasLayer(g)) map.removeLayer(g);
    };
    toggle("listings", showListings);
    toggle("golf", showGolf);
  }, [ready, showListings, showGolf]);

  // ── fetch + toggle a GIS layer ────────────────────────────────────────
  const toggleLayer = useCallback(async (layer: MapLayer) => {
    const L = LRef.current, map = mapRef.current;
    if (!L || !map) return;

    // already on → remove
    if (active.has(layer.id)) {
      const ex = overlays.current[layer.id];
      if (ex) map.removeLayer(ex);
      setActive((p) => { const n = new Set(p); n.delete(layer.id); return n; });
      return;
    }
    setActive((p) => new Set(p).add(layer.id));

    // cached → re-add
    if (overlays.current[layer.id]) {
      overlays.current[layer.id].addTo(map);
      return;
    }

    setStatus((s) => ({ ...s, [layer.id]: "loading" }));
    try {
      const params = new URLSearchParams({
        where: "1=1",
        geometry: "-122.10,36.00,-121.60,36.80",
        geometryType: "esriGeometryEnvelope",
        inSR: "4326",
        outSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "*",
        returnGeometry: "true",
        resultRecordCount: String(layer.limit ?? 1500),
        f: "geojson",
      });
      if (layer.offset) params.set("maxAllowableOffset", String(layer.offset));

      const res = await fetch(`${layer.url}/query?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const gj = await res.json();
      if (gj.error) throw new Error(gj.error.message || "service error");

      const feats = gj.features?.length ?? 0;
      if (!feats) {
        setStatus((s) => ({ ...s, [layer.id]: "empty" }));
        setActive((p) => { const n = new Set(p); n.delete(layer.id); return n; });
        return;
      }

      const gl = L.geoJSON(gj, {
        style: () =>
          layer.kind === "line"
            ? { color: layer.color, weight: 2.5, opacity: 0.9 }
            : { color: layer.color, weight: 1, opacity: 0.85, fillColor: layer.color, fillOpacity: 0.22 },
        pointToLayer: (_f, latlng) =>
          L.circleMarker(latlng, {
            radius: 5, color: "#0a1220", weight: 1.5,
            fillColor: layer.color, fillOpacity: 0.95,
          }),
        onEachFeature: (f, lyr) => {
          if (f.properties) lyr.bindPopup(popupHtml(layer, f.properties));
        },
      }).addTo(map);

      overlays.current[layer.id] = gl;
      setCounts((c) => ({ ...c, [layer.id]: feats }));
      setStatus((s) => ({ ...s, [layer.id]: "ready" }));
    } catch (err) {
      console.error(`[map] ${layer.id}:`, err);
      setStatus((s) => ({ ...s, [layer.id]: "error" }));
      setActive((p) => { const n = new Set(p); n.delete(layer.id); return n; });
    }
  }, [active]);

  const flyTo = (center: [number, number], zoom: number) =>
    mapRef.current?.flyTo(center, zoom, { duration: 0.8 });

  const clearAll = () => {
    const map = mapRef.current;
    if (!map) return;
    for (const id of active) {
      const l = overlays.current[id];
      if (l) map.removeLayer(l);
    }
    setActive(new Set());
  };

  const statusDot = (id: string) => {
    const s = status[id];
    if (s === "loading") return <span className="text-[10px] text-cream/40">loading…</span>;
    if (s === "error") return <span className="text-[10px] text-red-400">unavailable</span>;
    if (s === "empty") return <span className="text-[10px] text-cream/40">none here</span>;
    if (active.has(id) && counts[id]) return <span className="text-[10px] text-cream/40">{counts[id].toLocaleString()}</span>;
    return null;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
      {/* ── control panel ── */}
      <div className="order-2 max-h-[78vh] overflow-y-auto rounded-sm border border-gold-500/20 bg-navy-900 p-4 lg:order-1">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs tracking-[0.25em] text-gold-400 uppercase">Jump to</span>
          {active.size > 0 && (
            <button onClick={clearAll} className="text-[10px] tracking-wider text-cream/50 uppercase hover:text-gold-300">
              Clear {active.size}
            </button>
          )}
        </div>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {PLACES.map((p) => (
            <button
              key={p.id}
              onClick={() => flyTo(p.center, p.zoom)}
              className="rounded-sm border border-gold-500/25 px-2.5 py-1.5 text-[11px] text-cream/80 transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-5 space-y-2 border-y border-gold-500/15 py-4">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={showListings} onChange={(e) => setShowListings(e.target.checked)} className="accent-gold-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
            <span className="text-sm text-cream/85">Matthew&apos;s listings</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" checked={showGolf} onChange={(e) => setShowGolf(e.target.checked)} className="accent-gold-500" />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#22c55e" }} />
            <span className="text-sm text-cream/85">Golf courses</span>
          </label>
          <div className="flex gap-2 pt-2">
            {(["dark", "satellite", "streets"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBasemap(b)}
                className={`flex-1 rounded-sm border px-2 py-1.5 text-[11px] tracking-wider uppercase transition-colors ${
                  basemap === b ? "border-gold-400 text-gold-300" : "border-gold-500/20 text-cream/50 hover:text-cream/80"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {CATEGORIES.map((cat) => {
          const layers = LAYERS.filter((l) => l.category === cat.id);
          const on = layers.filter((l) => active.has(l.id)).length;
          const open = openCat === cat.id;
          return (
            <div key={cat.id} className="mb-2 border-b border-gold-500/10 pb-2 last:border-0">
              <button
                onClick={() => setOpenCat(open ? null : cat.id)}
                className="flex w-full items-center justify-between py-2 text-left"
              >
                <span className="text-xs font-medium tracking-[0.15em] text-gold-400 uppercase">
                  {cat.label}{on > 0 && <span className="ml-1.5 text-cream/50">({on})</span>}
                </span>
                <span className="text-gold-400">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="space-y-1 pb-2">
                  <p className="mb-2 text-[11px] leading-relaxed text-cream/45">{cat.blurb}</p>
                  {layers.map((l) => (
                    <div key={l.id}>
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-sm px-1 py-1.5 hover:bg-navy-800">
                        <input
                          type="checkbox"
                          checked={active.has(l.id)}
                          onChange={() => toggleLayer(l)}
                          className="mt-1 accent-gold-500"
                        />
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: l.color }} />
                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm text-cream/85">{l.label}</span>
                            {statusDot(l.id)}
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-cream/45">{l.note}</span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── map ── */}
      <div className="order-1 lg:order-2">
        <div
          ref={mapEl}
          className="h-[58vh] w-full rounded-sm border border-gold-500/20 lg:h-[78vh]"
          style={{ background: "#0a1220" }}
        />
        {!ready && <p className="mt-2 text-xs text-cream/40">Loading map…</p>}
      </div>
    </div>
  );
}
