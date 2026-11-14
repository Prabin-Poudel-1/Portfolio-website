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
assert(flow.includes("getPropertyValue('--text')"), 'Mist uses theme-aware monochrome ink');
assert(flow.includes("getPropertyValue('--particle')"), 'Theme accent read');
assert(flow.includes("getPropertyValue('--particle-secondary')"), 'Theme secondary accent read');
assert(flow.includes('const MOBILE_COUNT = 280'), 'Bounded mobile density');
assert(flow.includes('const DESKTOP_COUNT = 900'), 'Bounded desktop density');
assert(flow.includes('createRadialGradient'), 'Soft cloud sprites');
assert(flow.includes("ctx.globalCompositeOperation = dark ? 'screen' : 'source-over'"), 'Light/dark compositing');
assert(flow.includes('pointer.vx * influence'), 'Cursor velocity response');
assert(flow.includes('pointer.down ? 155 : 75'), 'Pointer press amplifies vortex');
assert(flow.includes("hero.addEventListener('pointermove'"), 'Cursor movement tracked');
assert(flow.includes("hero.addEventListener('pointerdown'"), 'Mouse press tracked');
assert(flow.includes('new ResizeObserver(resize)'), 'Resize supported');
assert(flow.includes("new MutationObserver(updateColors)"), 'Palette updates on theme toggle');
assert(flow.includes("const stop = paused ? () => {} : animateHero(hero, draw)"), 'Existing pause control honored');
assert(!flow.includes('drawRibbon('), 'Luminous streamlines remain removed');
assert(!flow.includes('fetch('), 'No external textures or remote assets');
const subscriptions = ['pointermove', 'pointerleave', 'pointerdown'];
for (const kind of subscriptions) {
  assert(flow.includes("hero.addEventListener('" + kind + "'"), kind + ' listener');
  assert(flow.includes("hero.removeEventListener('" + kind + "'"), kind + ' cleanup');
}
assert(flow.includes("window.removeEventListener('pointerup', up)"), 'Release listener cleanup');
console.log('PASS: theme-aware smoke particle field, cursor vortex, retained hero loop and pause controls, bounded particle counts, listener cleanup.');
