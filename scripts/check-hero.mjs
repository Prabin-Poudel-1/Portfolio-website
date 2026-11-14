import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const css = readFileSync('theme.css', 'utf8');
for (const token of ['--ink-0: #0D1117', '--text: #F6F1E8', '--accent: #3B82F6', '--paper-0: #F6F1E8', '--paper-1: #FFFCF7', '--text: #1F232B', '--editorial: #315DCC', '--particle: #3B82F6', '--particle-secondary: #7C8CFF', '--particle-glow: #DCEBFF']) assert(css.includes(token), token);
const listeners = new Map(), frames = new Map();
let id = 0, intersection, motionChange, disconnected = false, draws = 0;
const reduced = { matches: false, addEventListener: (_, fn) => { motionChange = fn; }, removeEventListener: () => { motionChange = undefined; } };
const document = { hidden: false, addEventListener: (type, fn) => listeners.set(type, fn), removeEventListener: type => listeners.delete(type) };
const context = vm.createContext({
  document, matchMedia: () => reduced,
  requestAnimationFrame: fn => { frames.set(++id, fn); return id; },
  cancelAnimationFrame: id => frames.delete(id),
  IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} disconnect() { disconnected = true; } },
});
const source = ts.transpileModule(readFileSync('src/utils/heroMotion.ts', 'utf8').replace('export function', 'function'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInContext(source, context);
context.draw = () => draws++;
vm.runInContext('var stop = animateHero({}, draw)', context);
assert.equal(frames.size, 0, 'offscreen starts suspended');
intersection([{ isIntersecting: true }]); assert.equal(frames.size, 1);
let [frameId, fn] = frames.entries().next().value; frames.delete(frameId); fn(1000); assert.equal(draws, 1); assert.equal(frames.size, 1);
document.hidden = true; listeners.get('visibilitychange')(); assert.equal(frames.size, 0);
document.hidden = false; listeners.get('visibilitychange')(); assert.equal(frames.size, 1);
reduced.matches = true; motionChange(); assert.equal(frames.size, 0);
reduced.matches = false; motionChange(); assert.equal(frames.size, 1);
intersection([{ isIntersecting: false }]); assert.equal(frames.size, 0);
vm.runInContext('stop()', context); assert(disconnected); assert.equal(listeners.size, 0); assert.equal(motionChange, undefined);
const hero = readFileSync('src/sections/Hero.tsx','utf8');
assert.equal((hero.match(/<HeroFlow /g)||[]).length,1);
assert(css.includes('pointer-events: none'));
const diagram=readFileSync('src/components/SystemDiagram.tsx','utf8');
assert(diagram.includes('cycle >= 6'));
assert(!diagram.slice(diagram.indexOf('const stop'),diagram.indexOf('const node')).includes('playSound'));
console.log('PASS: graphite/ivory/blue theme tokens; hero loop offscreen, visibility, reduced-motion and cleanup; single hero field; silent automatic node cycle. Browser visual checks remain separate.');

const flow = readFileSync('src/components/HeroFlow.tsx', 'utf8');
assert(flow.includes("getPropertyValue('--particle')"));
assert(flow.includes('ctx.lineWidth = 1.3'));
assert(flow.includes('.60 + influence'));
assert(flow.includes('const TRAIL_POINTS = 34'));
assert(flow.includes('const drawRibbon = (time: number) => {'));
assert(flow.includes('drawRibbon(time);'));
assert(flow.includes('pointer.inside'));
assert(flow.includes("getPropertyValue('--particle-secondary')"));
assert(flow.includes('new Float32Array(TRAIL_POINTS * 2)'));
assert(flow.includes('(p.head + 1) % TRAIL_POINTS'));
assert(flow.includes('(p.head - k + TRAIL_POINTS) % TRAIL_POINTS'));
const samples = Number(flow.match(/const TRAIL_POINTS = (\d+)/)[1]);
const groups = Number(flow.match(/const FADE_GROUPS = (\d+)/)[1]);
const segments = Number(flow.match(/const SEGMENTS_PER_GROUP = (\d+)/)[1]);
assert.equal(groups * segments, samples - 1, 'fade groups cover the entire trail without gaps');
assert.equal(samples, 34);
const countExpression = flow.match(/const count = (.+);/)[1];
for (let baseCount = 0; baseCount <= 115; baseCount++) {
  assert.equal(vm.runInNewContext(countExpression, { baseCount }), Math.round(baseCount * 2.5) * 2);
}
assert.equal(vm.runInNewContext(countExpression, { baseCount: 40 }), 200);
assert.equal(vm.runInNewContext(countExpression, { baseCount: 115 }), 576);
assert(flow.includes('const SPEED_MULTIPLIER = 3'));
assert(flow.includes('const travel = dt * SPEED_MULTIPLIER'));
assert(flow.includes('p.x += p.vx * travel; p.y += p.vy * travel;'));
// Every circular head position covers all 33 adjacent segments, including wraparound.
for (let head = 0; head < samples; head++) {
  const edges = [];
  for (let group = 0; group < groups; group++) {
    for (let k = group * segments; k < (group + 1) * segments; k++) {
      const a = (head - k + samples) % samples, b = (head - k - 1 + samples) % samples;
      assert.equal((a - b + samples) % samples, 1);
      edges.push(a);
    }
  }
  assert.equal(new Set(edges).size, samples - 1);
}
console.log('PASS: cursor-reactive luminous ribbons and dedicated particle palettes, 1.3px strokes, .60 leading opacity, 34-sample circular trails; exact doubled counts (200 mobile / 576 max desktop); 3× dt-scaled movement.');
