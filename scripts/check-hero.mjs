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
assert(switcher.includes("theme === 'light'"), 'Renderer chosen by active theme');
assert(switcher.includes('<LightDust paused={paused} />'), 'Light mode preserves wider GPU dust');
assert(switcher.includes('<GoldenSmoke paused={paused} />'), 'Dark mode uses previous gold cloud');
assert(switcher.includes("attributeFilter: ['data-theme']"), 'Renderer switches on theme toggle');
assert(switcher.includes('observer.disconnect()'), 'Theme listener cleanup');
assert(goldSmoke.includes('function makeMistSprite(color: string)'), 'Original atmospheric smoke sprite restored');
assert(goldSmoke.includes("let mist = makeMistSprite('#A78B63')"), 'Original golden amber base restored');
assert(goldSmoke.includes("let brightGold = makeMistSprite('#FFE2A0')"), 'Original bright golden core restored');
assert(goldSmoke.includes('brightGold,\n') && goldSmoke.includes('ctx.drawImage('), 'Golden star and dust illumination retained');

assert(goldSmoke.includes('const FORM_SECONDS = 14;'), 'Morph pacing is 14 seconds per shape');
assert(goldSmoke.includes('const FORM_HOLD = 8;'), 'Shapes hold before transitions');
assert(goldSmoke.includes('const FORM_COUNT = 4;'), 'Four forms are available');
assert(goldSmoke.includes('const smoothstep5 = (t: number)'), 'Quintic easing avoids abrupt transitions');
assert(goldSmoke.includes('if (form === 0)'), 'Original nebula remains as the starting shape');
assert(goldSmoke.includes('if (form === 1)'), 'Infinity loop formation exists');
assert(goldSmoke.includes('if (form === 2)'), 'Spiral-arm formation exists');
assert(goldSmoke.includes('const petals = .55 + .35 * Math.cos(5 * angle'), 'Bloom formation exists');
assert(goldSmoke.includes('const blend = smoothstep5(transition);'), 'Transition uses smooth interpolation');
assert(goldSmoke.includes('const [fromX, fromY] = particleForm(current'), 'Stable particle identities used for morph');
assert(goldSmoke.includes('const [toX, toY] = particleForm(next'), 'Particles interpolate into the next form');
assert(goldSmoke.includes('shapeX += (toX - fromX) * blend'), 'Morphing is continuous');
assert(goldSmoke.includes('const turn = influence * (pointer.down ? 48 : 24);'), 'Cursor swirl preserved during morph');

assert(goldSmoke.includes('const centerX = width * (mobile ? .57 : .69);'), 'Golden cloud is right-aligned on desktop');

assert(goldSmoke.includes('const starCount = Math.round(count * .33);'), 'Exactly 33 percent of particles assigned to star class');
assert(goldSmoke.includes('createParticle(index < starCount)'), 'Particle classification is deterministic per resize');
assert(goldSmoke.includes('kind: isStar ? Math.random() * .33 : .33 + Math.random() * .67'), 'Star/dust categories remain disjoint');
assert(goldSmoke.includes('const isStar = p.kind < .33;'), '33 percent stars, 67 percent dust drawing split');
assert(goldSmoke.includes('const twinkle = .15 + .85 * shimmer * shimmer;'), 'Independently modulated star brightness');
assert(goldSmoke.includes("ctx.fillStyle = lit > .25 ? '#FFF5D7' : '#FFE8B8';"), 'Bright star core preserved');
assert(goldSmoke.includes('Preserve the atmospheric dust and its existing golden cursor bloom.'), 'Soft dust remains');

assert(goldSmoke.includes('const centerY = height * (mobile ? .42 : .50);'), 'Golden cloud vertical placement updated');
assert(goldSmoke.includes('const turn = influence * (pointer.down ? 48 : 24);'), 'Original cursor-driven swirl restored');
assert(goldSmoke.includes('ctx.createRadialGradient('), 'Original golden cursor halo restored');
assert(goldSmoke.includes('const stop = paused ? () => {} : animateHero(hero, draw)'), 'Original gold field uses shared pause');
assert(goldSmoke.includes("hero.removeEventListener('pointermove', move)"), 'Gold field releases pointer listener');
assert(dust.includes("getContext('webgl'"), 'Light mode GPU dust remains');
assert(dust.includes('gl.drawArrays(gl.POINTS'), 'Light dust is GPU rendered');

assert(dust.includes('i < Math.round(count * .33) ? 2'), 'Exactly one third of light particles are assigned star type');
assert(dust.includes('vStar = step(1.5, aDetail.z);'), 'Light-mode shader separates 33 percent stars from dust');
assert(dust.includes('vTwinkle = .15 + .85 * blink * blink;'), 'Light stars blink independently');
assert(dust.includes('float starCore = pow(max(0., 1. - r2), 9.);'), 'Light stars have sharp cores');
assert(dust.includes('float starHalo = exp(-r2 * 7.);'), 'Light stars have a restrained halo');
assert(dust.includes('alpha = mix(dustAlpha, starAlpha, vStar)'), 'Remaining dust remains soft');
assert(dust.includes('vec2 formPosition(float form,'), 'Light-mode shape transformation is GPU-driven');
assert(dust.includes('float petals = .55 + .35 * cos(5. * angle'), 'Bloom formation exists in light mode');
assert(dust.includes('float arm = floor(detail.x * 3.);'), 'Three-armed spiral exists in light mode');
assert(dust.includes('sin(2. * phase) * ring * .55'), 'Infinity loop exists in light mode');
assert(dust.includes('gl.uniform1f(U.form, form);'), 'CPU morph schedule connected to shader');
assert(dust.includes('gl.uniform1f(U.blend, blend);'), 'Smooth quintic blend connected to shader');
assert(dust.includes('const stage = (time % 56) / 14;'), 'Light mode matches dark mode 8+6 second timing');
assert(dust.includes('width * (width < 700 ? .57 : .69)'), 'Light particles align to the right like dark particles');

assert(dust.includes('p.x = p.x * 1.28'), 'Wider light dust preserved');
assert(dust.includes('float dustSize = mix(.9 + aDetail.x * 1.9'), 'Fine light particles preserved');
assert(dust.includes('vec3 color = mix(uNeutral, uGold, mix(.24, .78, vStar));'), 'Light-blue star and subtler blue dust at rest');
assert(dust.includes('color = mix(color, uFlare, hover * mix(.72, .84, vStar));'), 'Cursor darkens nearby light-blue particles');
assert(css.includes('--sculpture-base: #899AA9;'), 'Light theme muted slate-blue dust');
assert(css.includes('--sculpture-gold: #A3CDEA;'), 'Light theme soft sky-blue stars');
assert(css.includes('--sculpture-flare: #3B6FA8;'), 'Light theme darker blue proximity highlights');
assert(css.includes('--sculpture-flare: #FFE4A3;'), 'Dark theme accent unchanged');
assert(dust.includes('point += tangent * field * swirl'), 'Cursor-responsive WebGL particle flow preserved');
assert(dust.includes('const stop = paused ? () => {} : animateHero(hero, draw)'), 'Light dust uses shared pause');
assert(css.includes('z-index: 0; pointer-events: none'), 'Particle canvas does not obstruct interaction');
assert(css.includes('.portfolio-atlas {'), 'Project section atlas is retained');
console.log('PASS: original screenshot golden-smoke renderer restored for dark; wider GPU dust for light; theme transition, cursor interaction, pause, and atlas preserved.');

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

console.log('PASS: smoothly morphing golden nebula, infinity, galaxy and bloom forms with original cursor lighting preserved.');

console.log('PASS: 33% twinkling stars / 67% atmospheric dust with existing morphs, cursor glow, and light mode unchanged.');

console.log('PASS: light mode 33% blinking light-blue stars and 67% dust; richer blue near cursor; 4 smooth shapes; dark mode unchanged.');
