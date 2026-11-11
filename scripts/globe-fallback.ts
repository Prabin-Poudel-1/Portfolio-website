import { readFileSync, writeFileSync } from "node:fs";
import { frontRing, project, type Coordinate } from "../src/utils/globeMath";
const rings: Coordinate[][] = JSON.parse(
  readFileSync("assets/geo/land.json", "utf8"),
);
const paths = rings
  .map((r) => frontRing(r.map((p) => project(p, 84, 20))))
  .filter((r) => r.length > 2)
  .map(
    (r) =>
      '<path d="' +
      r
        .map(
          ([x, y], i) =>
            `${i ? "L" : "M"}${(220 + x * 180).toFixed(1)},${(220 - y * 180).toFixed(1)}`,
        )
        .join(" ") +
      'Z"/>',
  )
  .join("");
const [x, y] = project([84, 28], 84, 20);
writeFileSync(
  "assets/geo/globe-fallback.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 440"><defs><radialGradient id="o"><stop stop-color="#373e5a"/><stop offset="1" stop-color="#11131c"/></radialGradient></defs><circle cx="220" cy="220" r="180" fill="url(#o)"/><g fill="#a5b0ce" stroke="#535d7d" stroke-width=".5">${paths}</g><circle cx="220" cy="220" r="180" fill="none" stroke="#535d7d"/><circle cx="${220 + x * 180}" cy="${220 - y * 180}" r="4" fill="#d6d3ff"/></svg>`,
);
