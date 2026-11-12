import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
let count = 0,
  stopped = 0,
  suspended = 0,
  clock = 1000;
const stored = new Map(),
  frequencies = [],
  peaks = [];
const param = (records) => ({
  value: 0.00001,
  setValueAtTime(v) {
    records.push(v);
  },
  exponentialRampToValueAtTime(v) {
    records.push(v);
  },
  cancelAndHoldAtTime() {},
  cancelScheduledValues() {},
});
class AudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createOscillator() {
    count++;
    return {
      frequency: param(frequencies),
      connect() {},
      disconnect() {},
      start() {},
      stop() {
        stopped++;
      },
    };
  }
  createGain() {
    return { gain: param(peaks), connect() {}, disconnect() {} };
  }
  resume() {
    return Promise.resolve();
  }
  suspend() {
    suspended++;
    return Promise.resolve();
  }
}
const context = {
  window: { AudioContext },
  document: { hidden: false },
  performance: { now: () => clock },
  localStorage: {
    getItem: (k) => stored.get(k) ?? null,
    setItem: (k, v) => stored.set(k, v),
  },
};
vm.createContext(context);
vm.runInContext(
  readFileSync("src/utils/sound.js", "utf8").replaceAll(
    "export function",
    "function",
  ),
  context,
);
const run = (s) => vm.runInContext(s, context);
run("restoreSound();playSound()");
assert.equal(count, 0);
assert.equal(run("soundVolume()"), 0.55);
run('setSound(true);playSound("hover")');
assert.equal(count, 0, "Hover cannot unlock audio");
run('playSound("project");playSound("project")');
assert.equal(count, 2);
assert.equal(stored.get("portfolio-sound"), "on");
assert(frequencies.includes(98));
assert(frequencies.includes(196));
clock += 200;
run('playSound("success")');
assert.equal(count, 4);
assert(stopped >= 6);
assert(Math.max(...peaks) <= 0.035 * 3 * 0.55);
run("setVolume(0);playSound()");
assert.equal(count, 4);
assert.equal(stored.get("portfolio-volume"), "0");
assert.equal(run("setVolume(4)"), 1);
assert.equal(run("setVolume(-4)"), 0);
run("setVolume(.25);restoreSound()");
assert.equal(run("soundVolume()"), 0.25);
run("setSound(false);playSound()");
assert.equal(count, 4);
assert.equal(stored.get("portfolio-sound"), "off");
clock += 200;
context.document.hidden = true;
run("setSound(true);playSound();pauseSound()");
assert.equal(count, 4);
assert.equal(suspended, 1);
context.document.hidden = false;
run("setVolume(1)");
for (const kind of [
  "select",
  "project",
  "open",
  "close",
  "success",
  "secret",
]) {
  clock += 400;
  run(`playSound('${kind}')`);
}
assert.equal(count, 16);
assert(Math.max(...peaks) <= 0.035 * 3);
assert(Math.min(...frequencies) >= 98);
assert(Math.max(...frequencies) <= 588);
// 3× envelopes, proportional saved volume, and worst-case release overlap headroom.
assert(peaks.includes(0.035 * 3 * .55));
assert(peaks.includes(0.011 * 3 * .55));
assert((0.035 + 0.011) * 3 * 2 < .28);
console.log(
  "PASS sound: default mute, two-layer bass, frequency/gain bounds, throttle/release, preferences, volume clamp/zero, hidden suppression and suspension. Acoustic listening not performed.",
);
assert(
  readFileSync("src/styles/interactions.css", "utf8").includes(
    "prefers-reduced-motion: reduce",
  ),
);
assert(
  readFileSync("src/sections/Projects.tsx", "utf8").includes(
    "prefers-reduced-motion: no-preference",
  ),
);
console.log("PASS reduced-motion source guards (not browser emulation).");

clock += 800;
run('playSound("hover")');
assert.equal(count,16,"Hover must not interrupt an existing cue");
run('setVolume(.5);playSound("hover")');
assert.equal(count,18);
clock += 200;
run('setVolume(.5);playSound("hover")');
assert.equal(count,18,"Hover has its own quiet interval");
console.log("PASS: hover stays quiet until audio is unlocked, does not interrupt a cue, and is independently throttled.");
