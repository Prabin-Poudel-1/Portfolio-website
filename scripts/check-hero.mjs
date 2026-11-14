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

const app = readFileSync('src/App.tsx', 'utf8');
const projectsPage = readFileSync('src/sections/Projects.tsx', 'utf8');
assert(app.includes('<Hero motionPaused={motionPaused} />'), 'Hero receives shared motion setting');
assert(app.includes('<Projects motionPaused={motionPaused}'), 'Projects receives shared motion setting');
assert(!hero.includes('<SystemDiagram'), 'Domain diagram moved out of the hero');
assert(projectsPage.includes('className="portfolio-atlas"'), 'Projects now contains the atlas');
assert(projectsPage.includes('<SystemDiagram'), 'Original diagram is preserved');
assert(projectsPage.includes('if (match >= 0) select(match)'), 'Domain selection synchronizes gallery');
assert(diagram.includes('FIELD NOTES / CONNECTED SYSTEMS'), 'Original atlas label preserved');
assert((diagram.match(/projectId: "[^"]+"/g) || []).length === 5, 'All five interactive domains preserved');
assert(css.includes('.portfolio-atlas {'), 'Atlas layout is responsive');
const flow = readFileSync('src/components/HeroFlow.tsx', 'utf8');
assert(flow.includes("getContext('webgl'"), 'GPU particle renderer initialized');
assert(flow.includes('gl.drawArrays(gl.POINTS'), 'Points rendered via GPU');
assert(flow.includes('p.x = p.x * 1.28'), 'Light particle cloud is wider');
assert(flow.includes('size = mix(.9 + aDetail.x * 1.9'), 'Light particle sprites are finer');
assert(flow.includes('float fleck = pow(max(0., 1. - r2), 4.8)'), 'Light mode renders crisp dust');
assert(flow.includes('if (uDark < .5)'), 'New particle modifications are limited to light mode');
assert(flow.includes('const vertexSource'), 'Particle vertex shader present');
assert(flow.includes('const fragmentSource'), 'Particle fragment shader present');
assert(flow.includes('getPropertyValue(\'--sculpture-base\')'), 'Theme-aware neutral sculpture');
assert(flow.includes('getPropertyValue(\'--sculpture-gold\')'), 'Theme-aware golden illumination');
assert(flow.includes('getPropertyValue(\'--sculpture-flare\')'), 'Pointer highlights');
assert(flow.includes('uniform float uTime'), 'Time-based shader deformation');
assert(flow.includes('uniform float uActive'), 'Pointer-driven shader illumination');
assert(flow.includes('gl.blendFunc'), 'Light/dark rendering modes');
assert(flow.includes('const stop = paused ? () => {} : animateHero(hero, draw)'), 'Pause and lifecycle preserved');
assert(flow.includes('new ResizeObserver(resize)'), 'Responsive canvas');
assert(flow.includes('new MutationObserver(palette)'), 'Theme switches');
assert(flow.includes('gl.deleteProgram(program)'), 'GPU cleanup');
assert(flow.includes('gl.deleteBuffer(buffer)'), 'GPU buffer cleanup');
assert(!flow.includes('drawRibbon('), 'No luminous line ribbons');
assert(!flow.includes('makeMistSprite('), 'Flat 2D smoke replaced');
assert(css.includes('z-index: 0; pointer-events: none'), 'Particles kept behind diagram');
assert(css.includes('.home > .engineering-map { position: relative; z-index: 2; }'), 'Project nodes in foreground');
for (const token of ['--sculpture-base: #C4C5C8', '--sculpture-gold: #E3BC7B', '--sculpture-flare: #FFE4A3', '--sculpture-base: #64626A', '--sculpture-gold: #B57B2F', '--sculpture-flare: #E7AB4B']) assert(css.includes(token), token);
console.log('PASS: GPU particle field, gold proximity lighting, foreground nodes, existing animation lifecycle and light/dark tokens.');

console.log('PASS: light-only dust rendering, project atlas relocation, node-to-gallery synchronization, shared pause control.');
