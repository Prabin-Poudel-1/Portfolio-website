import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTypewriter, interests } from "../src/utils/typewriter";
let id = 0, text = "", delay = 0;
const jobs = new Map<number, () => void>();
const writer = createTypewriter(value => { text = value; }, (fn, ms) => {
  delay = ms; jobs.set(++id, fn); return id;
}, key => { jobs.delete(key); });
const step = () => {
  assert.equal(jobs.size, 1, "Only one pending character timer");
  const [key, fn] = jobs.entries().next().value!;
  jobs.delete(key); fn();
};
assert.equal(text, ""); assert.equal(delay, 900);
step(); assert.equal(text, "S");
writer.pause(true); assert.equal(jobs.size, 0);
writer.pause(false); step(); assert.equal(text, "So", "Resume without restarting");
for (let i = 2; i < interests[0].length; i++) step();
assert.equal(text, interests[0]); assert.equal(delay, 2600);
for (let i = 0; i < interests[0].length; i++) step();
assert.equal(text, ""); assert.equal(delay, 400);
for (let phrase = 1; phrase < interests.length; phrase++) {
  for (let i = 0; i < interests[phrase].length; i++) step();
  assert.equal(text, interests[phrase]);
  for (let i = 0; i < interests[phrase].length; i++) step();
}
step(); assert.equal(text, "S", "All five phrases loop");
const pending = jobs.values().next().value!;
writer.dispose(); assert.equal(jobs.size, 0);
pending(); assert.equal(text, "S", "Disposed callback cannot update content");
writer.pause(false); assert.equal(jobs.size, 0);
const source = readFileSync("src/components/HeroInterests.tsx", "utf8");
assert(source.includes('if (motion.matches) setText(interests[0])'));
assert(source.includes('motion.removeEventListener("change", configure)'));
assert(source.includes('document.removeEventListener("visibilitychange", update)'));
assert(source.includes('observer.disconnect()'));
assert(source.includes('aria-hidden="true"'));
const html = readFileSync("dist/index.html", "utf8").replace(/<!--.*?-->/g, "");
assert(html.includes("Technical interests: Software Engineering, AI &amp; Machine Learning"));
assert(html.includes('class="interests-typed">Software Engineering'));
console.log("PASS typewriter: natural cadence, complete five-phrase loop, pause/resume, single timer, disposal, reduced-motion guards and stable prerendered accessible text.");
