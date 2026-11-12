import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const css = readFileSync('theme.css', 'utf8');
for (const token of ['--ink-0: #0F1420', '--text: #E8ECF3', '--accent: #60A5FA', '--paper-0: #F7F6F2', '--paper-1: #FFFFFF', '--text: #12171F', '--editorial: #B45309', '--accent: #15803D', '--particle: #60A5FA', '--particle: #1D4ED8']) assert(css.includes(token), token);
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
console.log('PASS: exact theme tokens; hero loop offscreen, visibility, reduced-motion and cleanup; single hero field; silent automatic node cycle. Browser visual checks remain separate.');

const flow = readFileSync('src/components/HeroFlow.tsx', 'utf8');
assert(flow.includes("getPropertyValue('--particle')"));
assert(flow.includes('ctx.lineWidth = 1.3'));
assert(flow.includes('.60 + influence'));
assert(flow.includes('const TRAIL_POINTS = 22'));
assert(flow.includes('new Float32Array(TRAIL_POINTS * 2)'));
assert(flow.includes('(p.head + 1) % TRAIL_POINTS'));
assert(flow.includes('(p.head - k + TRAIL_POINTS) % TRAIL_POINTS'));
const samples = Number(flow.match(/const TRAIL_POINTS = (\d+)/)[1]);
const groups = Number(flow.match(/const FADE_GROUPS = (\d+)/)[1]);
const segments = Number(flow.match(/const SEGMENTS_PER_GROUP = (\d+)/)[1]);
assert.equal(groups * segments, samples - 1, 'fade groups cover the entire trail without gaps');
assert((samples - 1) / 15 >= 1.3 && (samples - 1) / 15 <= 1.5);
console.log('PASS: dedicated particle palettes, 1.3px strokes, .60 leading opacity, 40% longer complete circular trails.');
