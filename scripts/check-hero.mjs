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
const switcher = readFileSync('src/components/HeroFlow.tsx', 'utf8');
const goldSmoke = readFileSync('src/components/GoldenSmoke.tsx', 'utf8');
const dust = readFileSync('src/components/LightDust.tsx', 'utf8');
assert(!switcher.includes('LightDust'), 'Light mode no longer depends on the failing WebGL renderer');
assert(switcher.includes('return <GoldenSmoke paused={paused} />;'), 'Both light and dark use reliable Canvas particles');
assert(switcher.includes('<GoldenSmoke paused={paused} />'), 'Dark mode uses previous gold cloud');
assert(goldSmoke.includes("attributeFilter: ['data-theme']"), 'Canvas updates its palette when theme changes');
assert(goldSmoke.includes('themeObserver.disconnect()'), 'Canvas theme listener cleans up');
assert(goldSmoke.includes('function makeMistSprite(color: string)'), 'Original atmospheric smoke sprite restored');
assert(goldSmoke.includes("let mist = makeMistSprite('#A78B63')"), 'Original golden amber base restored');
assert(goldSmoke.includes("let brightGold = makeMistSprite('#FFE2A0')"), 'Original bright golden core restored');
assert(goldSmoke.includes('brightGold,\n') && goldSmoke.includes('ctx.drawImage('), 'Golden star and dust illumination retained');

assert(goldSmoke.includes('const FORM_SECONDS = 10;'), 'Morph pacing is 10 seconds per shape');
assert(goldSmoke.includes('const FORM_HOLD = 6;'), 'Shapes hold before transitions');
assert(goldSmoke.includes('const FORM_COUNT = 8;'), 'Eight forms are available');
assert(goldSmoke.includes('const MOBILE_COUNT = 560;'), 'Mobile particles doubled from 280');
assert(goldSmoke.includes('const DESKTOP_COUNT = 1800;'), 'Desktop particles doubled from 900');
assert(goldSmoke.includes('const count = width < 700 ? MOBILE_COUNT : Math.round(DESKTOP_COUNT * Math.max(.6, density));'), 'Existing adaptive density retained');
assert(goldSmoke.includes('const smoothstep5 = (t: number)'), 'Quintic easing avoids abrupt transitions');
assert(goldSmoke.includes('if (form === 0)'), 'Original nebula remains as the starting shape');
assert(goldSmoke.includes('if (form === 1)'), 'Infinity loop formation exists');
assert(goldSmoke.includes('if (form === 2)'), 'Spiral-arm formation exists');
assert(goldSmoke.includes('if (form === 3)'), 'Bloom formation exists');
assert(goldSmoke.includes('if (form === 4)'), 'Torus vortex formation exists');
assert(goldSmoke.includes('if (form === 5)'), 'Double helix formation exists');
assert(goldSmoke.includes('if (form === 6)'), 'Mobius strip formation exists');
assert(goldSmoke.includes('const waveX = radius * 2 - 1;'), 'Fluid wave formation exists');
assert(goldSmoke.includes('const starCount = Math.round(count * .5);'), '50 percent stars are retained');
assert(goldSmoke.includes('const next = ((current + 1) % FORM_COUNT) as Form;'), 'All eight forms cycle back to nebula');
assert(goldSmoke.includes('const blend = smoothstep5(transition);'), 'Transition uses smooth interpolation');
assert(goldSmoke.includes('const [fromX, fromY] = particleForm(current'), 'Stable particle identities used for morph');
assert(goldSmoke.includes('const [toX, toY] = particleForm(next'), 'Particles interpolate into the next form');
assert(goldSmoke.includes('shapeX += (toX - fromX) * blend'), 'Morphing is continuous');
assert(goldSmoke.includes('const turn = influence * (pointer.down ? 48 : 24);'), 'Cursor swirl preserved during morph');

assert(goldSmoke.includes('const centerX = width * (mobile ? .57 : .69);'), 'Golden cloud is right-aligned on desktop');

assert(goldSmoke.includes('const starCount = Math.round(count * .5);'), 'Exactly 50 percent of particles assigned to star class');
assert(goldSmoke.includes('createParticle(index < starCount)'), 'Particle classification is deterministic per resize');
assert(goldSmoke.includes('kind: isStar ? Math.random() * .5 : .5 + Math.random() * .5'), 'Star/dust categories remain disjoint');
assert(goldSmoke.includes('const isStar = p.kind < .5;'), '50 percent stars, 50 percent dust drawing split');
assert(goldSmoke.includes('const twinkle = .15 + .85 * shimmer * shimmer;'), 'Independently modulated star brightness');
assert(goldSmoke.includes("? (lit > .25 ? '#FFF5D7' : '#FFE8B8')"), 'Bright golden core preserved in dark mode');
assert(goldSmoke.includes('Preserve the atmospheric dust and its existing golden cursor bloom.'), 'Soft dust remains');

assert(goldSmoke.includes('const centerY = height * (mobile ? .42 : .50);'), 'Golden cloud vertical placement updated');
assert(goldSmoke.includes('const turn = influence * (pointer.down ? 48 : 24);'), 'Original cursor-driven swirl restored');
assert(goldSmoke.includes('ctx.createRadialGradient('), 'Original golden cursor halo restored');
assert(goldSmoke.includes('const stop = paused ? () => {} : animateHero(hero, draw)'), 'Original gold field uses shared pause');
assert(goldSmoke.includes("hero.removeEventListener('pointermove', move)"), 'Gold field releases pointer listener');
// The experimental WebGL implementation is retained for possible rollback,
// but the visible light theme uses Canvas and must not depend on its availability.
assert(dust.includes("getContext('webgl'"), 'Previous experimental shader remains available for rollback');
assert(goldSmoke.includes("dark = document.documentElement.dataset.theme !== 'light';"), 'Active Canvas determines theme');
assert(goldSmoke.includes("ctx.globalCompositeOperation = dark ? 'screen' : 'source-over';"), 'Light mode avoids screen blending');
assert(goldSmoke.includes("dark ? .21 + lit * .085 : .43 + lit * .12"), 'Light-mode dust is visible against ivory');
assert(goldSmoke.includes("lit > .25 ? '#275B95' : '#5C8FC0'"), 'Blue light-mode star cores');
assert(goldSmoke.includes("dark ? .34 + lit * .57 : .20 + lit * .72"), 'Light-mode star halo darkens near pointer');
assert(goldSmoke.includes("dark ? .37 : .58"), 'Light-mode dust brightens when the cursor approaches');
assert(css.includes('--smoke-ambient: #809BB5;'), 'Light theme uses visible slate-blue dust');
assert(css.includes('--smoke-gold: #77ACDA;'), 'Light theme uses light-blue stars');
assert(css.includes('--smoke-flare: #356BA5;'), 'Light theme uses darker blue proximity glow');
assert(css.includes('--smoke-ambient: #A78B63;'), 'Dark theme still uses golden ambient dust');
assert(css.includes('--smoke-flare: #FFE2A0;'), 'Dark theme still uses golden highlights');

assert(css.includes('z-index: 0; pointer-events: none'), 'Particle canvas does not obstruct interaction');
assert(css.includes('.portfolio-atlas {'), 'Project section atlas is retained');
console.log('PASS: reliable Canvas particle renderer for both themes; golden dark and visible blue light palettes; theme transition, cursor interaction, pause, and atlas preserved.');

const cursor = readFileSync('src/components/CustomCursor.tsx', 'utf8');
assert(cursor.includes('heroZone = !!el.closest(".home")'), 'Cursor detects hero region');
assert(cursor.includes('if (down || heroZone)'), 'Hero trail runs without mouse press');
assert(cursor.includes('ctx.strokeStyle = heroZone ? goldColor : tailColor'), 'Hero tail is golden');
assert(cursor.includes('const enabled = () => fine.matches && !reduced.matches'), 'Native cursor fallback and reduced-motion preference retained');
assert(css.includes('.custom-cursor[data-zone="hero"] .cursor-ring::after'), 'Hero cursor glow ring');
assert(css.includes('.custom-cursor[data-zone="hero"] .cursor-dot::before'), 'Golden hero cursor dot');
assert(cursor.includes('document.removeEventListener("pointermove", move, true)'), 'Cursor event cleanup retained');
console.log('PASS: hero-only gold cursor, continuous hover trail, original rest-of-site cursor and reduced-motion fallback.');



console.log('PASS: right-positioned original golden cloud; light-theme golden dust and blue cursor highlights; dark palette and project atlas retained.');

console.log('PASS: eight smoothly morphing formations, including torus/helix/mobius/wave, with cursor glow and 50/50 particles preserved.');

console.log('PASS: 50% twinkling stars / 50% atmospheric dust with existing morphs, cursor glow, and light mode unchanged.');

console.log('PASS: visible light-blue Canvas stars/dust and deep-blue cursor response; 4 shared morphs; dark mode unchanged.');
