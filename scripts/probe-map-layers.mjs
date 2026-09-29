#!/usr/bin/env node
/**
 * Re-validates every layer in src/data/map-layers.ts against its live service.
 * Checks existence (parsing the BODY — ArcGIS returns 200 with error bodies),
 * and feature count inside the Peninsula bbox.
 *
 * Usage: node scripts/probe-map-layers.mjs
 */
import { readFileSync } from "node:fs";

const BBOX = "-122.10,36.00,-121.60,36.80";
const src = readFileSync(new URL("../src/data/map-layers.ts", import.meta.url), "utf8");

const MC = "https://services2.arcgis.com/nOGTdfb4kF4dZljH/arcgis/rest/services";
const layers = [...src.matchAll(/id:\s*"([^"]+)",[\s\S]*?url:\s*`\$\{MC\}([^`]+)`/g)].map(
  ([, id, path]) => ({ id, url: MC + path })
);

let bad = 0;
await Promise.all(
  layers.map(async ({ id, url }) => {
    const q =
      `${url}/query?where=1%3D1&geometry=${BBOX}&geometryType=esriGeometryEnvelope` +
      `&inSR=4326&spatialRel=esriSpatialRelIntersects&returnCountOnly=true&f=json`;
    try {
      const j = await (await fetch(q)).json();
      if (j.error) throw new Error(j.error.message);
      const n = j.count ?? 0;
      if (n === 0) { bad++; console.log(`  ⚠ ${id.padEnd(22)} 0 features in bbox`); }
      else console.log(`  ✓ ${id.padEnd(22)} ${String(n).padStart(6)}`);
    } catch (e) {
      bad++;
      console.log(`  ✗ ${id.padEnd(22)} ${e.message.slice(0, 50)}`);
    }
  })
);
console.log(`\n${layers.length} layers checked, ${bad} need attention.`);
process.exit(bad ? 1 : 0);
