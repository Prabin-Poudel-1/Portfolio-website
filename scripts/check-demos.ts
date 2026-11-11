import assert from "node:assert/strict";
import {
  authorize,
  nextStage,
  evidenceCell,
  swipeDirection,
} from "../src/demos/model";
import { projects } from "../src/data/projects";
import { existsSync, readFileSync } from "node:fs";
let step = 0;
for (let i = 0; i < 10; i++) step = nextStage(step, false);
assert.equal(step, 3, "offline gateway blocks forwarding");
for (let i = 0; i < 10; i++) step = nextStage(step, true);
assert.equal(step, 7, "reconnection reaches ack and stops");
let combinations = 0;
for (const action of ["read", "write", "delete"])
  for (const resource of ["workspace", "secrets"])
    for (const contract of ["valid", "expired", "revoked"])
      for (const approval of [false, true]) {
        const r = authorize({ action, resource, contract, approval });
        const allowed =
          contract === "valid" &&
          resource === "workspace" &&
          (action === "read" || (action === "write" && approval));
        assert.equal(r.decision === "ALLOW", allowed);
        if (action === "delete") assert.equal(r.decision, "DENY");
        assert(r.reason);
        combinations++;
      }
assert.equal(
  authorize({
    action: "write",
    resource: "workspace",
    contract: "valid",
    approval: false,
  }).decision,
  "REQUIRE APPROVAL",
);
for (let r = 0; r < 8; r++)
  for (let c = 0; c < 12; c++)
    for (const after of [true, false])
      assert(evidenceCell(r, c, after) >= 0 && evidenceCell(r, c, after) <= 4);
assert.equal(swipeDirection(-100, 10), 1);
assert.equal(swipeDirection(100, 10), -1);
assert.equal(swipeDirection(60, 100), 0);
assert.equal(swipeDirection(20, 0), 0);
assert.equal(projects.length, 7);
for (const p of projects) {
  if (p.image) assert(existsSync("dist/" + p.image));
  if (p.url.endsWith(".html")) assert(existsSync("dist/" + p.url));
}
for (const name of ["club-mobile.webp", "club-desktop.webp"])
  assert(existsSync("dist/assets/screenshots/" + name));
assert(readFileSync("dist/404.html", "utf8").includes('content="noindex"'));
assert(readFileSync("dist/sitemap.xml", "utf8").includes("rescuer-sathi.html"));
assert(readFileSync("dist/robots.txt", "utf8").includes("Sitemap:"));
console.log(
  `PASS: offline relay/reconnect, ${combinations} policy combinations, 192 evidence cells, directional swipe thresholds, seven project assets/routes and SEO output.`,
);

assert.equal(
  authorize({
    action: "execute",
    resource: "workspace",
    contract: "valid",
    approval: true,
  }).decision,
  "DENY",
);
