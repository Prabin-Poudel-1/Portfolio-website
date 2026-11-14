import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const css = readFileSync('theme.css', 'utf8');
for (const token of [
  '--ink-0: #090A10',
  '--ink-1: #12141D',
  '--text: #EEF0F7',
  '--paper-0: #FFFFFF',
  '--paper-1: #FFFFFF',
  '--bg: #FFFFFF',
  '--text: #111827',
  '--muted: #4B5563',
  '--accent: #1D4ED8',
  '--border: #E5E7EB',
  '--glass-strong: #FFFFFF',
  '--font-display: ui-sans-serif',
  '--font-body: ui-sans-serif',
]) assert(css.includes(token), 'Missing theme token: ' + token);
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
assert(!hero.includes('HeroFlow'), 'No luminous canvas should be mounted');
assert(!css.includes('.hero-flow'), 'Remove obsolete luminous canvas styling');
const diagram=readFileSync('src/components/SystemDiagram.tsx','utf8');
assert(diagram.includes('cycle >= 6'));
assert(!diagram.slice(diagram.indexOf('const stop'),diagram.indexOf('const node')).includes('playSound'));
assert(!diagram.includes('FIELD NOTES / CONNECTED SYSTEMS'));
assert(!diagram.includes('SELECT A NODE TO EXPLORE'));
assert(!diagram.includes('<circle cx="48" cy="48" r="35"'));
const projectPage = readFileSync('src/sections/Projects.tsx', 'utf8');
const composition = readFileSync('src/styles/composition.css', 'utf8');
const interactionStyle = readFileSync('src/styles/interactions.css', 'utf8');
const cursor = readFileSync('src/components/CustomCursor.tsx', 'utf8');
assert(!hero.includes('Try the Signal Lost Lab'));
assert(!projectPage.includes('Technical detail, sources, and project boundaries'));
assert(!projectPage.includes('From independent AI authorization to offline emergency communication.'));
assert(projectPage.includes('Browse project documentation'));
assert(interactionStyle.includes('.project-index > summary::after'));
assert(!composition.includes('background-size: 28px 28px'));
assert(cursor.includes('className="cursor-aura"'));
assert(cursor.includes('const glowEase = 1 - Math.exp(-step / 115)'));
assert(interactionStyle.includes('.custom-cursor[data-visible="true"] .cursor-aura'));
assert(interactionStyle.includes('opacity: .585'), 'Cursor aura reduced by 35%');
assert(interactionStyle.includes(':root[data-theme="light"] .cursor-aura'), 'Light-mode cursor glow visible');
assert(css.includes('--cursor-glow-soft: rgba(29, 78, 216, .065)'), 'Light-mode blue glow');
const about = readFileSync('src/sections/About.tsx', 'utf8');
const header = readFileSync('src/components/Header.tsx', 'utf8');
assert(about.includes('className="button cv-download"'), 'CV link styled as a button');
assert(header.includes('className="theme-switch"'), 'Header theme control tagged');
assert(header.includes('className="theme-switch-label"'), 'Mobile theme control labelled');
assert(css.includes('.header .nav-wrap .navbar a'), 'Consistent navigation styling');
assert(css.includes('.react-ready .header .nav-wrap .navbar.active'), 'Responsive menu preserved');
console.log('PASS: CV download button, responsive header, 35% softer glow in both themes, and simplified portfolio content.');
