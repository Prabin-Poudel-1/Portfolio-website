import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { createStellarVolume, globalNebulaOpacity } from '../src/graphics/StellarVolume';
import { sampleNamaste } from '../src/graphics/Namaste';

// Exercise actual pure geometry/volume kernels, without a fake browser FPS claim.
const source = readFileSync('src/components/GoldenSmoke.tsx', 'utf8');
const kernels = source.slice(source.indexOf('const TAU'), source.indexOf('const hexRGBA'));
const factory = source.slice(source.indexOf('    const createParticle'), source.indexOf('    const from ='));
const api = new Function('sampleNamaste', ts.transpile(kernels + factory) +
  ';return {form:particleForm,create:createParticle,light:lightVolume,diffuse:diffuseVolume,size:GRID_SIZE,frame:formationFrame,spring:springAxis,twinkle:stellarLuminosity,exposure:stellarExposure};')(sampleNamaste);
const a = new Float64Array(4), b = new Float64Array(4);
const count = 2250;
let maxMotion = 0;
for (let form = 0; form < 9; form++) for (let i = 0; i < count; i++) {
  const p = api.create(i, i % 5 < 3);
  for (const time of [0, 2.2, 5, 9, 80.99]) {
    api.form(form, p, p.angle, .7, time, a);
    api.form(form, p, p.angle, .7, time + .001, b);
    assert(a.every(n => Number.isFinite(n) && Math.abs(n) < 2));
    assert(a[3] > 0 && a[3] <= 1);
    for (let k = 0; k < 3; k++) maxMotion = Math.max(maxMotion, Math.abs(a[k] - b[k]));
  }
}
assert(maxMotion < .001);
const left = new Float64Array(4), right = new Float64Array(4);
function morph(time: number, particle: any, out: Float64Array) {
  const frame = new Float64Array(3);
  api.frame(time, frame);
  api.form(frame[0], particle, particle.angle, .7, time, left);
  api.form(frame[1], particle, particle.angle, .7, time, right);
  const blend = frame[2];
  for (let k = 0; k < 4; k++) out[k] = left[k] + (right[k] - left[k]) * blend;
}
for (let boundary = 9; boundary <= 81; boundary += 9) for (let i = 0; i < 100; i++) {
  const p = api.create(i, i % 5 < 3);
  morph(boundary - .001, p, a); morph(boundary + .001, p, b);
  for (let k = 0; k < 4; k++) assert(Math.abs(a[k] - b[k]) < .002);
}
for (const total of [1350, 2250]) {
  let dust = 0;
  for (let i = 0; i < total; i++) dust += Number(api.create(i, i % 5 < 3).kind >= .75);
  assert.equal(dust, total * .4);
}
const field = new Float32Array(api.size ** 3), smooth = new Float32Array(field.length);
api.light(field, .1, .1, .1, 1);
api.diffuse(field, smooth); api.diffuse(smooth, field); api.diffuse(field, smooth);
assert(Math.abs(smooth.reduce((sum, n) => sum + n, 0) - 1) < 1e-6);
assert(api.light(smooth, .1, .1, .1) > api.light(smooth, 1.2, 1.2, 1.2));

// Resource/fallback tests: these deliberately do NOT pretend to compile GLSL.
const originalDocument = globalThis.document;
const withCanvas = (canvas: any) => Object.defineProperty(globalThis, 'document', {
  configurable: true, value: { createElement: () => canvas },
});
let createdShaders = 0, deletedShaders = 0, deletedPrograms = 0, deletedTextures = 0;
let draws = 0, lost = false, compile = true, timerEnabled = false;
let pendingQueries = 0, restoredCalls = 0;
let previousUpload: unknown;
let protectedArea: number[] = [];
const events = new Map<string, () => void>();
const context: any = {
  createShader: () => (++createdShaders), shaderSource() {}, compileShader() {},
  getShaderParameter: () => compile, deleteShader: () => deletedShaders++,
  createProgram: () => ({}), attachShader() {}, linkProgram() {}, getProgramParameter: () => true,
  deleteProgram: () => deletedPrograms++, createTexture: () => ({}), deleteTexture: () => deletedTextures++,
  getUniformLocation: () => ({}), useProgram() {}, uniform1i() {}, uniform1f() {}, uniform2f() {}, uniform3f() {},
  uniform4f(_location: unknown, ...values: number[]) { protectedArea = values; },
  activeTexture() {}, bindTexture() {}, texParameteri() {}, texStorage3D() {}, viewport() {},
  QUERY_RESULT_AVAILABLE: 1, QUERY_RESULT: 2,
  isContextLost: () => lost,
  getExtension: (name: string) => timerEnabled && name === 'EXT_disjoint_timer_query_webgl2'
    ? { TIME_ELAPSED_EXT: 4, GPU_DISJOINT_EXT: 3 } : null,
  createQuery: () => { pendingQueries++; return {}; }, beginQuery() {}, endQuery() {},
  getQueryParameter: (_query: unknown, parameter: number) => parameter === 1 ? true : 15e6,
  getParameter: () => false, deleteQuery: () => pendingQueries--,
  texSubImage3D(...args: any[]) {
    const upload = args[args.length - 1];
    assert(upload instanceof Uint8Array); assert.equal(upload.length, field.length * 4);
    if (previousUpload) assert.equal(upload, previousUpload, 'voxel buffer reused');
    previousUpload = upload;
  },
  drawArrays: () => draws++,
};
const canvas: any = { width: 1, height: 1, getContext: () => context,
  addEventListener: (name: string, cb: () => void) => events.set(name, cb),
  removeEventListener: (name: string) => events.delete(name),
};
try {
  withCanvas({ getContext: () => null }); assert.equal(createStellarVolume(api.size), null);
  withCanvas({ getContext() { throw new Error('disabled'); } }); assert.equal(createStellarVolume(api.size), null);
  withCanvas(canvas); compile = false; assert.equal(createStellarVolume(api.size), null);
  assert.equal(createdShaders, deletedShaders); compile = true;
  const renderer = createStellarVolume(api.size, () => restoredCalls++)!; assert(renderer);
  renderer.resize(1440, 900); assert(canvas.width <= 560 && canvas.height <= 360);
  renderer.palette('#A78B63', '#D7AE6D', '#FFE2A0');
  const textBounds = new Float32Array([40, 180, 600, 700]);
  assert(renderer.render(smooth, field, 0, 900, 450, 460, 340, textBounds));
  assert.deepEqual(protectedArea, [40, 180, 600, 700], 'text exclusion reaches shader in CSS pixels');
  renderer.resize(768, 800); assert(canvas.width <= 308);
  renderer.palette('#809BB5', '#356BA5', '#77ACDA');
  assert(renderer.render(smooth, field, 1, 210, 330, 160, 300));
  assert.deepEqual(protectedArea, [-100000, -100000, -100000, -100000], 'no text rect disables exclusion');
  assert.equal(draws, 2);
  lost = true; events.get('webglcontextlost')?.();
  assert.equal(renderer.render(smooth, field, 2, 210, 330, 160, 300), false);
  events.get('webglcontextrestored')?.(); assert.equal(restoredCalls, 1);
  renderer.dispose(); renderer.dispose();
  assert.equal(deletedTextures, 1); assert.equal(deletedPrograms, 2);
  assert.equal(createdShaders, deletedShaders); assert.equal(events.size, 0);
  lost = false; timerEnabled = true; previousUpload = undefined;
  const adaptive = createStellarVolume(api.size)!;
  adaptive.resize(1440, 900); const fullResolution = canvas.width;
  adaptive.render(smooth, field, 0, 900, 450, 460, 340);
  assert.equal(pendingQueries, 1);
  adaptive.render(smooth, field, 1, 900, 450, 460, 340);
  assert.equal(adaptive.gpuTimeMs(), 15);
  assert(canvas.width < fullResolution, 'slow GPU timing reduces atmosphere resolution');
  adaptive.dispose(); assert.equal(pendingQueries, 0); assert.equal(events.size, 0);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
  else Reflect.deleteProperty(globalThis, 'document');
}
// Intro is one-shot; every subsequent dwell is 5 seconds and morph is 4 seconds.
const frame = new Float64Array(3);
for (const time of [0, 5]) { api.frame(time, frame); assert.deepEqual([...frame], [8, 0, 0]); }
api.frame(7, frame); assert(Math.abs(frame[2] - .5) < 1e-9);
api.frame(9, frame); assert.deepEqual([...frame], [0, 1, 0]);
api.frame(14, frame); assert.equal(frame[2], 0);
api.frame(18, frame); assert.deepEqual([...frame], [1, 2, 0]);
api.frame(81, frame); assert.deepEqual([...frame], [0, 1, 0]);
for (let time = 9; time < 600; time += .25) { api.frame(time, frame); assert(frame[0] < 8 && frame[1] < 8); }
// Reference-space landmarks: compact overlapping fingertips, front thumbs,
// contact seam and divergent wrists. No mirrored open-palm finger fan.
const landmarks = [[706,240], [824,240], [720,354], [797,380], [730,525], [798,535],
  [674,450], [839,471], [671,850], [877,860], [763,960], [765,1100],
  [353,1262], [647,1312], [1194,1232], [900,1310]];
const distances = landmarks.map(() => Infinity);
let surfaces = 0, thumbs = 0, wrists = 0, fingers = 0;
for (let i = 0; i < 2250; i++) {
  const kind = i % 5 < 3 ? (i % 3 === 0 ? .6 : .2) : .9;
  const p = sampleNamaste(i, kind);
  assert.deepEqual(p, sampleNamaste(i, kind), 'stable anatomical particle identity');
  const x = p.x * (650 * 460 / 340) + 768, y = p.y * 650 + 775;
  assert(x >= 344 && x <= 1201 && y >= 230 && y <= 1316, 'reference contour bounds');
  if (y > 1210) assert(Math.abs(x - 771) > 20, 'negative space between the wrists');
  if (p.feature === 'surface') { surfaces++; assert(Math.abs(x - 765) > 10, 'dust avoids the joining seam'); }
  if (p.feature === 'thumb') { thumbs++; assert(y >= 519 && y <= 866); }
  if (p.feature === 'finger') fingers++;
  if (y > 1180) wrists++;
  if (kind < .75) for (let j = 0; j < landmarks.length; j++)
    distances[j] = Math.min(distances[j], Math.hypot(x - landmarks[j][0], y - landmarks[j][1]));
}
assert(distances.every(d => d < 24), `reference landmarks not resolved: ${distances}`);
assert(thumbs > 100 && fingers > 150 && surfaces > 900 && wrists > 100);
const groups = [0, 0, 0], ranges = [[1,0], [1,0], [1,0]];
for (let i = 0; i < 2250; i++) {
  const p = api.create(i, true); groups[p.shimmerClass]++;
  assert.equal(p.shimmerPhase, api.create(i, true).shimmerPhase);
  const period = Math.PI * 2 / p.shimmerRate;
  assert(p.shimmerClass === 0 ? period >= 4 && period <= 8
    : p.shimmerClass === 1 ? period >= 2.5 && period <= 5 : period >= 6 && period <= 10);
  let low = 1, high = 0;
  for (let time = 0; time < 12; time += .05) {
    const brightness = api.twinkle(p, time), exposure = api.exposure(brightness);
    assert(brightness >= .459 && brightness <= 1 && exposure > .21 && exposure <= 1);
    assert.equal(brightness, api.twinkle(p, time));
    assert(Math.abs(exposure - api.exposure(api.twinkle(p, time + .001))) < .002);
    low = Math.min(low, exposure); high = Math.max(high, exposure);
  }
  assert(high - low > .29, 'final compositing exposure must vary during a few visible cycles');
  ranges[p.shimmerClass][0] = Math.min(ranges[p.shimmerClass][0], low);
  ranges[p.shimmerClass][1] = Math.max(ranges[p.shimmerClass][1], high);
}
assert.equal(api.exposure(1), 1, 'existing peak draw intensity is preserved');
assert(Math.abs(groups[0] / 2250 - .70) < .035);
assert(Math.abs(groups[1] / 2250 - .25) < .035);
assert(Math.abs(groups[2] / 2250 - .05) < .02);
// Execute the production star draw block. This checks actual draw alpha values,
// including cached halos, collars and hot cores, rather than an unused equation.
const starDraw = source.slice(source.indexOf('          const luminosity ='), source.indexOf('          } else {\n            const spot = (1.2')) + '\n}';
const draw = new Function('p', 'time', 'dark', 'ctx', 'stellarLuminosity', 'stellarExposure',
  ts.transpile('const size = 1, radiantStar = {}, starHalo = {}, starFlare = {}, starCore = "#FFE8B8", hotCore = "#FFF9E8";'+starDraw));
for (const dark of [true,false]) for (const index of [0,1,10,11]) {
  const p = api.create(index, true), outputs: number[][] = [];
  for (const time of [0,.5,1,1.5,2,3,4,5,6,7,8]) {
    const alphas: number[] = [];
    const ctx = { globalAlpha: 1, fillStyle: '', drawImage() { alphas.push(this.globalAlpha); }, fillRect() { alphas.push(this.globalAlpha); } };
    draw(p,time,dark,ctx,api.twinkle,api.exposure); outputs.push(alphas);
  }
  for (let layer = 0; layer < outputs[0].length; layer++) {
    const values = outputs.map(a => a[layer]);
    assert(Math.max(...values) - Math.min(...values) > .025, 'every actual stellar draw layer brightens and dims');
  }
}
console.log('Twinkle profile counts:', groups, 'final exposure ranges:', ranges.map(r => r.map(v => +v.toFixed(3))));
for (const u of [.05, .35, .65, .95]) {
  const behind = globalNebulaOpacity(.6, u, 0), outside = globalNebulaOpacity(.6, u, 200);
  assert(behind > .02 && behind < outside && outside < .075, 'faint coverage in every hero region');
  assert(Math.abs(behind / outside - .68) < 1e-9, 'text keeps a continuous ambient presence');
  for (let d = 0; d < 200; d++) assert(Math.abs(globalNebulaOpacity(.6, u, d + .001) - globalNebulaOpacity(.6, u, d)) < .00001);
  assert.equal(globalNebulaOpacity(0, u, 0), 0, 'no density means no flat fog');
}
assert(globalNebulaOpacity(.6,.1,0) < globalNebulaOpacity(.6,.9,0), 'gradual left-to-right emphasis');
const spring = new Float64Array(2);
let x = 0, velocity = 0;
for (let i = 0; i < 120; i++) {
  api.spring(x, velocity, 1, 6, 1 / 60, Math.exp(-6 / 60), spring);
  [x, velocity] = spring; assert(x >= 0 && x <= 1);
}
assert(x > .999);
for (let i = 0; i < 180; i++) { api.spring(x, velocity, 0, 6, 1 / 60, Math.exp(-6 / 60), spring); [x, velocity] = spring; }
assert(Math.abs(x) < .00001 && Math.abs(velocity) < .0001, 'spring returns gently on pointer exit');

// Evaluate the real React gating boundary with hook stubs: no DOM or GPU mock
// is reachable at phone widths, and the shared clock survives unmount/remount.
let notify: (() => void) | undefined;
const media = { matches: false, addEventListener(_name: string, fn: () => void) { notify = fn; }, removeEventListener() { notify = undefined; } };
const clock = { current: 0 };
const componentCode = ts.transpile(source.replace(/^import .*;$/gm, '').replace('export function GoldenSmoke', 'function GoldenSmoke'), { jsx: ts.JsxEmit.React });
const component = new Function('window', 'useEffect', 'useRef', 'useSyncExternalStore', 'React', componentCode + ';return {render:GoldenSmoke,subscribe:subscribeParticleViewport,server:serverParticlesDisabled};')(
  { matchMedia: (query: string) => { assert(query.includes('min-width: 768px')); return media; } },
  () => { throw new Error('Renderer must not mount during gate test'); }, () => clock,
  (_subscribe: unknown, snapshot: () => boolean) => snapshot(),
  { createElement: (type: unknown, props: unknown) => ({ type, props }) },
);
assert.equal(component.server(), false);
assert.equal(component.render({ paused: false }), null, 'mobile creates no canvas/renderer');
let notifications = 0; const unsubscribe = component.subscribe(() => notifications++);
media.matches = true; notify?.(); const desktop = component.render({ paused: false });
assert.equal(desktop.type.name, 'DesktopSculpture'); clock.current = 50;
media.matches = false; notify?.(); assert.equal(component.render({ paused: false }), null);
media.matches = true; notify?.(); assert.equal(component.render({ paused: false }).props.elapsedRef.current, 50);
assert.equal(notifications, 3); unsubscribe(); assert.equal(notify, undefined);
console.log('PASS: 101,250 geometry samples; reference anatomy/seam; deterministic shimmer and production draw alpha; nebula/text opacity; one-shot intro; 5s dwell/4s morph; spring recovery; phone/desktop gate and clock; fallback/resource cleanup; density diffusion. Browser shader compilation and GPU timings were not tested.');
