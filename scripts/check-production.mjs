import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
for (const file of [
  "index.html",
  "404.html",
  "sentinel-ai.html",
  "rescuer-sathi.html",
  "chitwan-care.html",
]) {
  const html = readFileSync("dist/" + file, "utf8");
  assert(/<title>/.test(html));
  assert(/name="description"/.test(html));
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url = match[1].split(/[?#]/)[0];
    if (!url || /^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
    assert(
      existsSync(path.join("dist", url.replace(/^\//, ""))),
      `${file}: ${url}`,
    );
  }
}
const sizes = readdirSync("dist/assets")
  .filter((x) =>
    /^(index-.*\.(js|css)|(?:Relay|Geospatial|Authorization|Previews)-.*\.js)$/.test(
      x,
    ),
  )
  .map((file) => ({
    file,
    bytes: statSync("dist/assets/" + file).size,
    gzip: gzipSync(readFileSync("dist/assets/" + file)).length,
  }));
console.table(sizes);
assert(
  sizes.find((x) => x.file.startsWith("index-") && x.file.endsWith(".js"))
    .gzip < 150000,
  "Initial JS gzip budget",
);
assert(
  sizes.filter((x) => /^(Relay|Geospatial|Authorization|Previews)/.test(x.file))
    .length === 4,
  "Four independent lazy demo chunks",
);
function lum(hex) {
  const v = hex
    .match(/\w\w/g)
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return v[0] * 0.2126 + v[1] * 0.7152 + v[2] * 0.0722;
}
for (const [fg, bg] of [
  ["ecf3f4", "101f2a"],
  ["afc3cb", "101f2a"],
  ["83dfd0", "101f2a"],
  ["122e36", "f2f6f4"],
  ["445f68", "f2f6f4"],
  ["07685b", "f2f6f4"],
]) {
  const values = [lum(fg), lum(bg)].sort((a, b) => b - a);
  const ratio = (values[0] + 0.05) / (values[1] + 0.05);
  assert(ratio >= 4.5);
  console.log(`Contrast #${fg}/#${bg}: ${ratio.toFixed(2)}:1`);
}
console.log(
  "PASS: static routes/assets, lazy chunks, initial JS budget and essential demo text contrast. Not a Lighthouse or full WCAG audit.",
);
