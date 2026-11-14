import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  initialRelay,
  advanceRelay,
  initialNetwork,
  type Network,
} from "../src/demos/relayModel";
import { syntheticSignal, qualityMasked, authorize } from "../src/demos/model";
let s = initialRelay();
let network = { ...initialNetwork };
for (let i = 0; i < 5; i++) s = advanceRelay(s, network);
assert.equal(s.stage, 3);
assert.equal(s.received, false);
assert.deepEqual(s.copies, ["A"]);
const id = s.id;
for (let i = 0; i < 5; i++) s = advanceRelay(s, network);
assert(s.attempts > 0);
assert.equal(s.id, id);
assert.equal(s.ack, false);
network.relayA = false;
s = advanceRelay(s, network);
assert.equal(s.carrier, "B");
assert.deepEqual(s.copies, ["A", "B"]);
network.uplink = true;
s = advanceRelay(s, network);
assert.equal(s.stage, 4);
network.backend = false;
s = advanceRelay(s, network);
assert.equal(s.stage, 4);
assert.equal(s.received, false);
network.backend = true;
s = advanceRelay(s, network);
assert.equal(s.stage, 5);
assert(s.received);
s = advanceRelay(s, network);
assert.equal(s.stage, 6);
network.relayB = false;
s = advanceRelay(s, network);
assert.equal(s.stage, 6);
assert(!s.ack);
assert(s.received);
network.relayB = true;
s = advanceRelay(s, network);
assert(s.ack);
assert.equal(s.id, id);
assert.equal(advanceRelay(s, network), s);
for (let bits = 0; bits < 32; bits++) {
  const n = Object.fromEntries(
    Object.keys(initialNetwork).map((k, i) => [k, !!(bits & (1 << i))]),
  ) as Network;
  let state = initialRelay();
  for (let i = 0; i < 24; i++) state = advanceRelay(state, n);
  const deliverable =
    n.backend && (n.internet || ((n.relayA || n.relayB) && n.uplink));
  assert.equal(state.ack, deliverable, `network ${bits}`);
  assert(state.events.length <= 18);
  if (!deliverable) {
    const restored = {
      internet: true,
      relayA: true,
      relayB: true,
      uplink: true,
      backend: true,
    };
    for (let i = 0; i < 12; i++) state = advanceRelay(state, restored);
    assert(state.ack, `recovery ${bits}`);
  }
}
for (let row = 0; row < 8; row++)
  for (let col = 0; col < 12; col++) {
    for (const after of [true, false]) {
      const value = syntheticSignal(row, col, after);
      assert(value >= 0 && value <= 100);
    }
    assert.equal(qualityMasked(row, col), qualityMasked(row, col));
  }
assert.equal(
  authorize({
    action: "execute",
    resource: "workspace",
    contract: "valid",
    approval: true,
  }).decision,
  "DENY",
);
assert.equal(
  authorize({
    action: "write",
    resource: "workspace",
    contract: "valid",
    approval: false,
  }).decision,
  "REQUIRE APPROVAL",
);
assert.equal(
  authorize({
    action: "write",
    resource: "workspace",
    contract: "valid",
    approval: true,
  }).decision,
  "ALLOW",
);
assert.equal(
  readFileSync("dist/googled88bcd039a85d824.html", "utf8"),
  readFileSync("public/googled88bcd039a85d824.html", "utf8"),
);
assert(
  !readFileSync("dist/index.html", "utf8").includes("Try the Signal Lost Lab"),
);
console.log(
  "PASS: 32 network configurations and recovery paths, local retention, relay failover, backend failure, lost acknowledgment, bounded logs, deterministic evidence, authorization examples and Google verification.",
);
