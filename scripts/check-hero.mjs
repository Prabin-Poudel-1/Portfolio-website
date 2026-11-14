import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const css = readFileSync('theme.css', 'utf8');
for (const token of ['--ink-0: #0D1117', '--ink-1: #111827', '--ink-2: #1F2937', '--text: #F6F1E8', '--accent: #3B82F6', '--paper-0: #F6F1E8', '--paper-1: #EDE6DA', '--text: #1F232B', '--particle: #3B82F6', '--particle-secondary: #7C8CFF', '--particle-highlight: #DCEBFF', '--glass-surface: rgba(', '--glass-strong: rgba(', 'backdrop-filter: blur(']) assert(css.includes(token), token);
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
console.log('PASS: graphite/ivory blue palette, glass tokens, offscreen suspension, reduced motion, and single hero field. Browser visual checks remain separate.');

const flow = readFileSync('src/components/HeroFlow.tsx', 'utf8');
assert(flow.includes("getPropertyValue('--particle')"));
assert(flow.includes("getPropertyValue('--particle-secondary')"));
assert(flow.includes("getPropertyValue('--particle-highlight')"));
assert(flow.includes('const STREAMLINE_COUNT_DESKTOP = 22'));
assert(flow.includes('const STREAMLINE_COUNT_MOBILE = 13'));
assert(flow.includes('const drawStreamlines = (time: number) => {'));
assert(flow.includes('drawStreamlines(time)'));
assert(flow.includes('ctx.quadraticCurveTo(previousX, previousY, midX, midY)'));
assert(flow.includes('const falloff = (1 - distance / radius) ** 2'));
assert(flow.includes('ctx.shadowBlur = lightTheme ? 7 : 17'));
// The original freely moving magnetic particles are deliberately removed.
for (const removed of [
  'const TRAIL_POINTS',
  'const SPEED_MULTIPLIER',
  'const baseCount',
  'const count = Math.round',
  'for (const p of particles)',
  'const spawn =',
  'new Float32Array(TRAIL_POINTS * 2)',
]) assert(!flow.includes(removed), 'Removed magnetic particle system must stay absent: ' + removed);
assert(flow.includes('drawStreamlines(time)'), 'The luminous ribbon remains active');
assert(flow.includes('const moteAt = (time * 0.095 + strand * 0.137) % 1'), 'Star motes continue to move along the ribbon');
assert(flow.includes('ctx.arc(moteX, moteY'), 'The ribbon retains its star highlights');
assert(flow.includes('const falloff = (1 - distance / radius) ** 2'), 'Ribbon geometry responds to the cursor');
console.log('PASS: independent magnetic particles removed; luminous ribbons, moving star motes, cursor bending, and theme-aware glow retained.');
