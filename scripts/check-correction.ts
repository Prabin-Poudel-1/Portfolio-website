import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  project,
  frontRing,
  wrapLongitude,
  clampTilt,
  advanceRotation,
  type Coordinate,
} from "../src/utils/globeMath";
import { projects } from "../src/data/projects";
const rings: Coordinate[][] = JSON.parse(
  readFileSync("assets/geo/land.json", "utf8"),
);
assert(rings.length === 128);
for (const lon of [-180, -90, 0, 84, 180])
  for (const tilt of [-55, 0, 20, 55]) {
    for (const ring of rings) {
      const points = ring.map((p) => project(p, lon, tilt));
      for (const p of points) assert(Math.abs(Math.hypot(...p) - 1) < 1e-9);
      for (const p of frontRing(points)) {
        assert(p[2] >= 0);
        assert(p.every(Number.isFinite));
      }
    }
  }
assert.equal(wrapLongitude(540), -180);
assert.equal(clampTilt(100), 85);
assert.deepEqual(advanceRotation(84, 1, 33, true, true, false), {
  lon: 84,
  velocity: 0,
});
assert.deepEqual(advanceRotation(84, 0, 33, false, false, false), {
  lon: 84,
  velocity: 0,
});
assert.equal(advanceRotation(84, 0, 33, true, false, true).lon, 84);
assert(advanceRotation(84, 0, 33, true, false, false).lon > 84);
let step = { lon: 84, velocity: 2 };
for (let i = 0; i < 100; i++)
  step = advanceRotation(step.lon, step.velocity, 33, false, false, false);
assert.equal(step.velocity, 0);
const sentinel = projects.find((p) => p.id === "sentinel-ai")!;
assert.equal(sentinel.url, "sentinel-ai.html");
assert.equal(sentinel.live, "https://sentinel.poudelprabin.com.np");
assert.equal(projects.length, 7);
const html = readFileSync("dist/sentinel-ai.html", "utf8");
for (const word of [
  "sentinel-flow",
  "Cedar",
  "Wasmtime",
  "REQUIRE APPROVAL",
  "SECURITY.md",
  "theme.css",
])
  assert(html.includes(word));
assert(existsSync("dist/assets/geo/globe-fallback.svg"));
assert(existsSync("dist/assets/geo/land.json"));
console.log(
  "PASS: globe sphere projection, horizon clipping at 20 orientations, reduced-motion/pause/inertia logic, Sentinel destinations and case-study architecture, static map fallback.",
);
