#!/usr/bin/env node
/**
 * Re-validates every SOURCE of every layer in src/data/map-layers.ts.
 *
 * Checks existence by parsing the response BODY — ArcGIS answers 200 with an
 * error object, so status codes prove nothing — and counts features in the
 * region. Run it when layers start showing "unavailable"; county services get
 * renamed without notice.
 *
 * Usage: node scripts/probe-map-layers.mjs
 */
import { readFileSync } from "node:fs";

const BBOX = "-122.30,36.00,-121.20,37.10";
const src = readFileSync(new URL("../src/data/map-layers.ts", import.meta.url), "utf8");

// Resolve the const prefixes the catalog interpolates into each URL.
const consts = Object.fromEntries(
  [...src.matchAll(/^const (MC|SC|FEMA|CALFIRE|CEC|NPS) = "([^"]+)";/gm)].map(([, k, v]) => [k, v])
);

// Split into whole layer objects first. A lazy match from `id:` to `sources:`
// can run past intervening layers and mis-pair an id with another's URLs.
const blocks = src.split(/\n  \{\n    id: /).slice(1);
const layers = [];
for (const block of blocks) {
  const id = block.match(/^"([^"]+)"/)?.[1];
  if (!id) continue;
  for (const s of block.matchAll(/url: `\$\{(\w+)\}([^`]*)`|url: "([^"]+)"/g)) {
    layers.push({ id, url: s[1] ? consts[s[1]] + s[2] : s[3] });
  }
}

let bad = 0;
await Promise.all(
  layers.map(async ({ id, url }) => {
    const label = `${id} → ${url.split("/services/")[1]?.split("/")[0] ?? url}`;
    if (url.includes("earthquake.usgs.gov")) {
      try {
        const j = await (await fetch(`${url}?format=geojson&starttime=2020-01-01&minmagnitude=4&limit=1`)).json();
        console.log(`  ✓ ${label.padEnd(52)} USGS ok`);
      } catch (e) { bad++; console.log(`  ✗ ${label.padEnd(52)} ${e.message.slice(0, 40)}`); }
      return;
    }
    const q =
      `${url}/query?where=1%3D1&geometry=${BBOX}&geometryType=esriGeometryEnvelope` +
      `&inSR=4326&spatialRel=esriSpatialRelIntersects&returnCountOnly=true&f=json`;
    try {
      const j = await (await fetch(q)).json();
      if (j.error) throw new Error(j.error.message);
      const n = j.count ?? 0;
      if (n === 0) { bad++; console.log(`  ⚠ ${label.padEnd(52)} 0 in region`); }
      else console.log(`  ✓ ${label.padEnd(52)} ${String(n).padStart(6)}`);
    } catch (e) {
      bad++;
      console.log(`  ✗ ${label.padEnd(52)} ${e.message.slice(0, 40)}`);
    }
  })
);
console.log(`\n${layers.length} sources across ${new Set(layers.map((l) => l.id)).size} layers; ${bad} need attention.`);
process.exit(bad ? 1 : 0);
