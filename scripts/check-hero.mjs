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
assert(hero.includes('<HeroFlow paused={motionPaused} />'), 'Shared particle canvas restored to hero');
assert(css.includes('.hero-flow { position: absolute;'), 'Particle canvas stays behind content');
assert(css.includes('pointer-events: none'), 'Particle canvas never intercepts clicks');
const diagram=readFileSync('src/components/SystemDiagram.tsx','utf8');
assert(diagram.includes('cycle >= 6'));
assert(!diagram.slice(diagram.indexOf('const stop'),diagram.indexOf('const node')).includes('playSound'));
assert(!diagram.includes('FIELD NOTES / CONNECTED SYSTEMS'));
assert(!diagram.includes('SELECT A NODE TO EXPLORE'));
assert(!diagram.includes('<circle cx="48" cy="48" r="35"'));
assert(diagram.includes('onProjectSelect?.(n.projectId);'), 'Selecting a map node focuses its project');
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


const app = readFileSync('src/App.tsx', 'utf8');
const flow = readFileSync('src/components/HeroFlow.tsx', 'utf8');
const smoke = readFileSync('src/components/GoldenSmoke.tsx', 'utf8');
assert(app.includes('<Hero motionPaused={motionPaused} />'), 'Hero and Projects share motion controls');
assert(app.includes('onMotionToggle={() => setMotionPaused'), 'Shared motion toggle preserved');
assert(flow.includes('return <GoldenSmoke paused={paused} />;'), 'Both themes use the Canvas renderer');
assert(projectPage.includes('className="portfolio-atlas"'), 'Project atlas moved below the hero');
assert(projectPage.includes('if (match >= 0) select(match)'), 'Atlas selection changes gallery slide');
assert(!hero.includes('<SystemDiagram'), 'Removed original map from Hero');
assert(smoke.includes('const FORM_COUNT = 8;'), 'Eight smooth particle formations retained');
for (const form of [0,1,2,3,4,5,6]) assert(smoke.includes('if (form === ' + form + ')'), 'Particle form missing: ' + form);
assert(smoke.includes('// 6. Butterfly'), 'Butterfly replaces Möbius strip');
assert(smoke.includes('const waveX = radius * 2 - 1;'), 'Fluid wave closes the sequence');
assert(smoke.includes('const starCount = Math.round(oldStarCount * 1.5);'), 'Stars 1.5x baseline');
assert(smoke.includes('const dustCount = count - oldStarCount;'), 'Original dust amount retained');
assert(smoke.includes('const MOBILE_COUNT = 560;'), '560 baseline mobile particles');
assert(smoke.includes('const DESKTOP_COUNT = 1800;'), '1,800 baseline full desktop particles');
assert(smoke.includes('const stop = paused ? () => {} : animateHero(hero, draw)'), 'Reduced-motion/pause loop stays intact');
assert(css.includes('--smoke-gold: #D7AE6D;'), 'Dark mode golden smoke');
assert(css.includes('--smoke-gold: #77ACDA;'), 'Light mode blue smoke');
assert(css.includes('--smoke-flare: #356BA5;'), 'Light-mode blue dust remains unchanged');
assert(css.includes('--smoke-star-halo: #F87171;'), 'Light-mode stars have a red halo');
assert(css.includes('--smoke-star-flare: #DC2626;'), 'Light-mode stars have red flares');
assert(css.includes('--smoke-star-core: #B91C1C;'), 'Light-mode stars have a red center');
assert(smoke.includes('starHalo = dark ? highlight : makeMistSprite('), 'Star halo uses its own sprite');
assert(smoke.includes('starFlare = dark ? brightGold : makeMistSprite('), 'Red stars do not recolor the dust');
assert(smoke.includes('ctx.fillStyle = starCore;'), 'Star cores are red in light mode');
assert(!smoke.includes('halo.addColorStop'), 'Pointer-following Canvas halo removed');
assert(!smoke.includes('const lit ='), 'Pointer-driven particle illumination removed');
assert(!cursor.includes('particleColor'), 'Hero-colored cursor trail removed');
assert(!cursor.includes('down || heroZone'), 'No automatic trail when hovering the hero');
assert(css.includes('.custom-cursor[data-zone="hero"] .cursor-aura { display: none !important; }'), 'Cursor glow is hidden in the hero');
assert(css.includes('.portfolio-atlas {'), 'Atlas layout is styled');
assert(cursor.includes('root.dataset.zone = heroZone ? "hero" : "default"'), 'Hero zone disables cursor glow without altering other sections');
assert(cursor.includes('const glowEase = 1 - Math.exp(-step / 115)'), 'Newest master cursor aura survives');
console.log('PASS: master layout, no hero cursor glow, red light-mode stars and blue dust, eight particle forms, 1.5x stars, and project atlas.');
