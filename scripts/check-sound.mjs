import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
let count = 0,
  stopped = 0,
  suspended = 0,
  clock = 1000,
  stored = "off";
const parameter = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
class AudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createOscillator() {
    count++;
    return {
      frequency: parameter,
      connect() {},
      disconnect() {},
      start() {},
      stop() {
        stopped++;
      },
    };
  }
  createGain() {
    return { gain: parameter, connect() {}, disconnect() {} };
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
    getItem: () => stored,
    setItem: (_, v) => {
      stored = v;
    },
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
vm.runInContext("playSound()", context);
assert.equal(count, 0);
vm.runInContext(
  'setSound(true);playSound("project");playSound("project")',
  context,
);
assert.equal(count, 1);
assert.equal(stored, "on");
clock += 200;
vm.runInContext('playSound("success")', context);
assert.equal(count, 2);
assert(stopped >= 3);
vm.runInContext("setSound(false);playSound()", context);
assert.equal(count, 2);
assert.equal(stored, "off");
clock += 200;
context.document.hidden = true;
vm.runInContext("setSound(true);playSound()", context);
assert.equal(count, 2);
vm.runInContext("pauseSound()", context);
assert.equal(suspended, 1);
console.log(
  "PASS sound: default-off, preference, throttling, voice replacement, mute, hidden-tab suppression and suspension",
);
const css = readFileSync("src/styles/interactions.css", "utf8");
assert(
  css.includes("prefers-reduced-motion: reduce") ||
    css.includes("prefers-reduced-motion:reduce"),
);
assert(
  readFileSync("src/sections/Projects.tsx", "utf8").includes(
    "prefers-reduced-motion: no-preference",
  ),
);
console.log(
  "PASS: reduced-motion guards present (source check; not browser emulation)",
);
