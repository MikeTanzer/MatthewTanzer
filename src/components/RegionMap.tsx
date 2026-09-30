"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Map as LMap, GeoJSON as LGeoJSON, LayerGroup } from "leaflet";
import {
  LAYERS, CATEGORIES, PLACES, PLACE_GROUPS, DEFAULT_BOUNDS, COVERAGE_BOUNDS,
  type MapLayer, type LayerSource, type CategoryId, type Place,
} from "@/data/map-layers";
import golf from "@/data/golf-courses.json";
import { getListings, formatPrice } from "@/lib/listings";

type Status = "idle" | "loading" | "ready" | "empty" | "error" | "zoom";

const [[CS, CW], [CN, CE]] = COVERAGE_BOUNDS;
/** Inside the mapped region? Bounds beat a town-name list: a listing in a newly
 *  covered town shows up without anyone remembering to add the name. */
const inCoverage = (lat?: number | null, lng?: number | null) =>
  lat != null && lng != null && lat >= CS && lat <= CN && lng >= CW && lng <= CE;

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

const SKIP = /^(__|fid|objectid|globalid|shape|se_anno|created_|last_edit|editor|esri)/i;

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
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid #ffffff22;color:#6b7a91;font-size:10px">${
        (props.__agency as string) ?? layer.sources.map((s) => s.agency).join(", ")
      }</div>
    </div>`;
}

export default function RegionMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const overlays = useRef<Record<string, LGeoJSON>>({});
  const abort = useRef<Record<string, AbortController>>({});
  const markerGroups = useRef<Record<string, LayerGroup>>({});
  const baseRef = useRef<ReturnType<typeof import("leaflet").tileLayer> | null>(null);
  const labelRef = useRef<ReturnType<typeof import("leaflet").tileLayer> | null>(null);

  const [ready, setReady] = useState(false);
  const [viewTick, setViewTick] = useState(0);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [truncated, setTruncated] = useState<Record<string, boolean>>({});
  const [openCat, setOpenCat] = useState<CategoryId | "market" | null>("hazard");
  const [basemap, setBasemap] = useState<keyof typeof BASEMAPS>("dark");
  const [showListings, setShowListings] = useState(true);
  const [showGolf, setShowGolf] = useState(false);

  // ── init map ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    // Only this run's own map may be torn down. React StrictMode mounts, cleans
    // up and remounts in dev; removing a map another run created leaves a live
    // map on screen owned by a dead instance, whose refs never update again.
    let own: LMap | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapEl.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapEl.current, {
        preferCanvas: true, // canvas renderer handles thousands of polygons
        zoomControl: true,
        scrollWheelZoom: true,
        // The opening framing sits at ~12.6. Leaflet's default zoomSnap of 1
        // would round fitBounds down to 12 and show half again as much area,
        // so allow fractional zoom; the +/- buttons still step by whole levels.
        zoomSnap: 0,
        zoomDelta: 1,
      });
      // Fit once the container has a real size, for the same reason as jumpTo.
      map.invalidateSize();
      map.fitBounds(DEFAULT_BOUNDS, { animate: false });
      if (process.env.NODE_ENV !== "production") {
        // Dev-only handle: the map is otherwise unreachable from the console,
        // which makes view/zoom problems tedious to diagnose.
        (window as unknown as Record<string, unknown>).__map = map;
      }
      baseRef.current = L.tileLayer(BASEMAPS.dark.url, {
        attribution: BASEMAPS.dark.attr,
        maxZoom: 19,
      }).addTo(map);
      labelRef.current = L.tileLayer(BASEMAPS.dark.labels, {
        maxZoom: 19,
        pane: "shadowPane", // above overlays so place names stay readable
      }).addTo(map);
      own = map;
      mapRef.current = map;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (own) {
        own.remove();
        if (mapRef.current === own) mapRef.current = null;
        setReady(false);
      }
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
        if (!inCoverage(l.latitude, l.longitude)) continue;
        L.circleMarker([l.latitude as number, l.longitude as number], {
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

  // ── fetch one source for the current viewport ─────────────────────────
  const fetchSource = useCallback(
    async (
      src: LayerSource,
      bbox: string,
      signal: AbortSignal
    ): Promise<{ features: GeoJSON.Feature[]; capped: boolean }> => {
      if (src.api === "usgs") {
        const [w, sth, e, n] = bbox.split(",");
        const u =
          `${src.url}?format=geojson&starttime=1900-01-01&minmagnitude=4` +
          `&minlongitude=${w}&minlatitude=${sth}&maxlongitude=${e}&maxlatitude=${n}&limit=1500`;
        const j = await (await fetch(u, { signal })).json();
        for (const f of j.features ?? []) {
          if (!f.properties) continue;
          f.properties.__agency = src.agency;
          // USGS ships epoch millis and puts depth in the geometry's 3rd ordinate.
          if (typeof f.properties.time === "number") {
            f.properties.time = new Date(f.properties.time).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            });
          }
          const d = f.geometry?.coordinates?.[2];
          if (typeof d === "number") f.properties.depth = `${d.toFixed(1)} km`;
          if (typeof f.properties.mag === "number") f.properties.mag = `M ${f.properties.mag.toFixed(1)}`;
        }
        return { features: j.features ?? [], capped: false };
      }
      const params = new URLSearchParams({
        where: "1=1",
        geometry: bbox,
        geometryType: "esriGeometryEnvelope",
        inSR: "4326",
        outSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "*",
        returnGeometry: "true",
        resultRecordCount: String(src.limit ?? 1500),
        f: "geojson",
      });
      if (src.offset) params.set("maxAllowableOffset", String(src.offset));
      const res = await fetch(`${src.url}/query?${params}`, { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      // ArcGIS answers 200 with an error body — status alone proves nothing.
      if (j.error) throw new Error(j.error.message || "service error");
      // Tag each feature so the popup can name the publisher.
      for (const f of j.features ?? []) {
        if (f.properties) f.properties.__agency = src.agency;
      }
      // ArcGIS pages cap at 2,000 features whatever resultRecordCount asks for
      // and flags it here. Surfaced in the UI so a truncated layer cannot look
      // complete — at regional zoom that would read as "no farmland here".
      return { features: j.features ?? [], capped: !!j.properties?.exceededTransferLimit };
    },
    []
  );

  /** Draw a layer for the current view, merging every source that has data. */
  const drawLayer = useCallback(
    async (layer: MapLayer) => {
      const L = LRef.current, map = mapRef.current;
      if (!L || !map) return;

      if (layer.minZoom && map.getZoom() < layer.minZoom) {
        setStatus((s) => ({ ...s, [layer.id]: "zoom" }));
        const ex = overlays.current[layer.id];
        if (ex) { map.removeLayer(ex); delete overlays.current[layer.id]; }
        return;
      }

      abort.current[layer.id]?.abort();
      const ctrl = new AbortController();
      abort.current[layer.id] = ctrl;

      const b = map.getBounds().pad(0.15);
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
        .map((v) => v.toFixed(5)).join(",");

      setStatus((s) => ({ ...s, [layer.id]: "loading" }));
      const settled = await Promise.allSettled(
        layer.sources.map((src) => fetchSource(src, bbox, ctrl.signal))
      );
      if (ctrl.signal.aborted) return;

      const feats = settled.flatMap((r) => (r.status === "fulfilled" ? r.value.features : []));
      const capped = settled.some((r) => r.status === "fulfilled" && r.value.capped);
      const failed = settled.filter((r) => r.status === "rejected");
      if (failed.length === layer.sources.length) {
        console.error(`[map] ${layer.id}: every source failed`, failed);
        setStatus((s) => ({ ...s, [layer.id]: "error" }));
        return;
      }
      if (failed.length) console.warn(`[map] ${layer.id}: ${failed.length} source(s) failed`);

      const prev = overlays.current[layer.id];
      if (prev) map.removeLayer(prev);

      if (!feats.length) {
        delete overlays.current[layer.id];
        setStatus((s) => ({ ...s, [layer.id]: "empty" }));
        setCounts((c) => ({ ...c, [layer.id]: 0 }));
        return;
      }

      const gl = L.geoJSON({ type: "FeatureCollection", features: feats } as GeoJSON.FeatureCollection, {
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
      setCounts((c) => ({ ...c, [layer.id]: feats.length }));
      setTruncated((t) => ({ ...t, [layer.id]: capped }));
      setStatus((s) => ({ ...s, [layer.id]: "ready" }));
    },
    [fetchSource]
  );

  const toggleLayer = useCallback(
    (layer: MapLayer) => {
      const map = mapRef.current;
      if (!map) return;
      if (active.has(layer.id)) {
        abort.current[layer.id]?.abort();
        const ex = overlays.current[layer.id];
        if (ex) { map.removeLayer(ex); delete overlays.current[layer.id]; }
        setActive((p) => { const n = new Set(p); n.delete(layer.id); return n; });
        setStatus((s) => ({ ...s, [layer.id]: "idle" }));
        return;
      }
      setActive((p) => new Set(p).add(layer.id));
      void drawLayer(layer);
    },
    [active, drawLayer]
  );

  // ── bump a counter when the view settles; the effect below does the work
  // so refetching reads live state instead of a closed-over ref ────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let t: ReturnType<typeof setTimeout>;
    const onMove = () => {
      clearTimeout(t);
      t = setTimeout(() => setViewTick((v) => v + 1), 700); // one refetch per pan
    };
    map.on("moveend", onMove);
    return () => { clearTimeout(t); map.off("moveend", onMove); };
  }, [ready]);

  useEffect(() => {
    if (!viewTick) return; // skip the initial render
    for (const id of active) {
      const layer = LAYERS.find((l) => l.id === id);
      if (layer) void drawLayer(layer);
    }
    // `active` intentionally omitted: toggling already draws its own layer, and
    // including it would refetch every layer on each toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewTick, drawLayer]);

  const jumpTo = (p: Place) => {
    const map = mapRef.current;
    if (!map) return;
    // Fitting bounds against a container Leaflet still thinks is zero-size
    // resolves to minZoom — a click during first layout would land on the whole
    // world. Re-measure first; it is a no-op once the size is known.
    map.invalidateSize();
    // animate:false is deliberate. The map runs zoomSnap:0 so the opening
    // framing can sit at a fractional zoom (~12.6); Leaflet's animated zoom
    // path does not apply fractional targets reliably — flyToBounds and an
    // animated fitBounds both leave the zoom untouched once an earlier
    // transition has run, while animate:false applies it every time. Jumps are
    // instant instead of a flight, which for a "jump to" control reads fine.
    if (p.bounds) map.fitBounds(p.bounds, { animate: false });
    else if (p.center) map.setView(p.center, p.zoom ?? 13, { animate: false });
  };

  const clearAll = () => {
    const map = mapRef.current;
    if (!map) return;
    for (const id of active) {
      abort.current[id]?.abort();
      const l = overlays.current[id];
      if (l) { map.removeLayer(l); delete overlays.current[id]; }
    }
    setActive(new Set());
  };

  const statusDot = (id: string) => {
    const s = status[id];
    if (s === "loading") return <span className="text-[10px] text-cream/40">loading…</span>;
    if (s === "error") return <span className="text-[10px] text-red-400">unavailable</span>;
    if (s === "empty") return <span className="text-[10px] text-cream/40">none in view</span>;
    if (s === "zoom") return <span className="text-[10px] text-gold-400/70">zoom in</span>;
    if (active.has(id) && counts[id])
      return (
        <span className={`text-[10px] ${truncated[id] ? "text-gold-400/70" : "text-cream/40"}`}>
          {counts[id].toLocaleString()}
          {truncated[id] ? "+ capped" : ""}
        </span>
      );
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
        <div className="mb-5 space-y-3">
          {PLACE_GROUPS.map((g) => {
            const places = PLACES.filter((p) => p.group === g.id);
            if (!places.length) return null;
            return (
              <div key={g.id}>
                <div className="mb-1.5 text-[0.6rem] tracking-[0.2em] text-cream/35 uppercase">
                  {g.label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {places.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => jumpTo(p)}
                      disabled={!ready}
                      className="rounded-sm border border-gold-500/25 px-2.5 py-1.5 text-[11px] text-cream/80 transition-colors hover:border-gold-400 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gold-500/25 disabled:hover:text-cream/80"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
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
