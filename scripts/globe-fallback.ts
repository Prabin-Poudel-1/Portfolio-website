import { readFileSync, writeFileSync } from "node:fs";
import { project, NEPAL, type Coordinate } from "../src/utils/globeMath";
// Same geographic coverage as the live sphere. Scan conversion avoids closing
// horizon-clipped polygons with diagonal chords in the no-JS/loading fallback.
const rings: Coordinate[][] = JSON.parse(
  readFileSync("assets/geo/land.json", "utf8"),
);
const w = 1440,
  h = 720,
  mask = new Uint8Array(w * h);
for (const ring of rings) {
  const coords = ring.map(([lon, lat]) => [
    ((lon + 180) / 360) * w,
    ((90 - lat) / 180) * h,
  ]);
  const minY = Math.max(0, Math.floor(Math.min(...coords.map((p) => p[1]))));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(...coords.map((p) => p[1]))));
  for (let row = minY; row <= maxY; row++) {
    const y = row + 0.5,
      crossings: number[] = [];
    for (let i = 0; i < coords.length; i++) {
      const a = coords[i],
        b = coords[(i + 1) % coords.length];
      if (a[1] > y !== b[1] > y)
        crossings.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    crossings.sort((a, b) => a - b);
    for (let i = 0; i + 1 < crossings.length; i += 2)
      mask.fill(
        255,
        row * w + Math.max(0, Math.ceil(crossings[i] - 0.5)),
        row * w + Math.min(w, Math.ceil(crossings[i + 1] - 0.5)),
      );
  }
}
const tilt = (28 * Math.PI) / 180,
  sin = Math.sin(tilt),
  cos = Math.cos(tilt);
let d = "";
for (let row = 0; row < 360; row++) {
  let start = -1;
  for (let col = 0; col <= 360; col++) {
    const x = (col + 0.5) / 180 - 1,
      y = 1 - (row + 0.5) / 180,
      zz = 1 - x * x - y * y;
    let land = false;
    if (col < 360 && zz >= 0) {
      const z = Math.sqrt(zz),
        lat = Math.asin(y * cos + z * sin),
        lon = Math.atan2(x, z * cos - y * sin) + (84 * Math.PI) / 180;
      const u = Math.floor(((((lon / (2 * Math.PI) + 0.5) % 1) + 1) % 1) * w),
        v = Math.max(0, Math.min(h - 1, Math.floor((0.5 - lat / Math.PI) * h)));
      land = mask[v * w + u] > 0;
    }
    if (land && start < 0) start = col;
    if (!land && start >= 0) {
      d += `M${40 + start} ${40 + row + 0.5}h${col - start}`;
      start = -1;
    }
  }
}
const [x, y] = project(NEPAL, 84, 28);
writeFileSync(
  "assets/geo/globe-fallback.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440"><defs><radialGradient id="o"><stop stop-color="#506887"/><stop offset="1" stop-color="#0F1420"/></radialGradient><linearGradient id="s" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs><circle cx="220" cy="220" r="180" fill="url(#o)"/><path d="${d}" fill="none" stroke="#A8BDD8" stroke-width="1"/><circle cx="220" cy="220" r="180" fill="url(#s)" stroke="#506887"/><circle cx="${220 + x * 180}" cy="${220 - y * 180}" r="4" fill="#60A5FA"/></svg>`,
);
console.log(
  "Generated globe fallback from the existing Natural Earth coverage without horizon chords.",
);
