import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { animateHero } from '../utils/heroMotion';
import { createStellarVolume, globalNebulaOpacity } from '../graphics/StellarVolume';
import { sampleNamaste, type HandPoint } from '../graphics/Namaste';

/**
 * Atmospheric particle sculpture, inspired by experimental WebGL portfolios.
 * Hybrid Canvas stars and WebGL2 volumetric atmosphere; no third-party assets or dependencies.
 * Existing Hero controls, project network, sound and animation loop are untouched.
 */
type MistParticle = {
  index: number;
  namaste: HandPoint;
  shimmerClass: number; shimmerPhase: number; shimmerRate: number; shimmerRange: number;
  projectedDepth: number;
  perspective: number;
  worldX: number;
  worldY: number;
  volumeX: number;
  volumeY: number;
  volumeZ: number;
  illumination: number;
  density: number;
  fill: number;
  volumeWidth: number;
  angle: number;
  radius: number;
  depth: number;
  phase: number;
  speed: number;
  size: number;
  kind: number;
  x: number;
  y: number;
  ready: boolean;
  offsetX: number; offsetY: number; velocityX: number; velocityY: number;
};

const TAU = Math.PI * 2;
const DESKTOP_COUNT = 1800;

// Existing dwell: 6 seconds. Exactly 2.5x longer; morphs remain four seconds.
const FORM_HOLD = 6 * 2.5;
const MORPH_SECONDS = 4;
const FORM_SECONDS = FORM_HOLD + MORPH_SECONDS;
const FORM_COUNT = 8;
const smoothstep5 = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
type Form = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

function formationFrame(time: number, frame: Float64Array) {
  const intro = time < FORM_SECONDS;
  const stage = intro ? 0 : ((time - FORM_SECONDS) % (FORM_SECONDS * FORM_COUNT)) / FORM_SECONDS;
  frame[0] = intro ? 8 : Math.floor(stage);
  frame[1] = intro ? 0 : (frame[0] + 1) % FORM_COUNT;
  const local = intro ? time : (stage - Math.floor(stage)) * FORM_SECONDS;
  frame[2] = smoothstep5(Math.max(0, Math.min(1, (local - FORM_HOLD) / MORPH_SECONDS)));
}

// Exact critically damped spring integration; callers reuse the output buffer.
function springAxis(value: number, velocity: number, target: number, omega: number,
  dt: number, decay: number, out: Float64Array) {
  const error = value - target, impulse = (velocity + omega * error) * dt;
  out[0] = target + (error + impulse) * decay;
  out[1] = (velocity - omega * impulse) * decay;
}

const PARTICLE_MEDIA = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
function subscribeParticleViewport(notify: () => void) {
  const media = window.matchMedia(PARTICLE_MEDIA);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
const particleViewportEnabled = () => window.matchMedia(PARTICLE_MEDIA).matches;
const serverParticlesDisabled = () => false;

// Stable indexed samples: changing formations never changes particle identity.
const sample = (index: number, salt: number) => {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const normalSample = (index: number, salt: number) =>
  Math.sqrt(-2 * Math.log(Math.max(.0001, sample(index, salt))))
  * Math.cos(TAU * sample(index, salt + 1));

// Stable 70/25/5 profiles. Rates are radians/second, so a 4–8 second cycle
// needs TAU / period (the old .26–.49 rates took 13–24 seconds).
function stellarLuminosity(p: MistParticle, time: number) {
  const phase = p.shimmerPhase, cycle = time * p.shimmerRate + phase;
  const warp = .18 * Math.sin(time * .17 + phase * 1.71)
    + .09 * Math.sin(cycle * 1.37 + phase * .73);
  const breathing = .5 + .5 * Math.cos(cycle + warp);
  // Smooth, occasional crests; no random frames or discontinuous thresholds.
  const envelope = p.shimmerClass === 2 ? breathing * breathing * breathing : breathing;
  return 1 - p.shimmerRange * (1 - envelope);
}

// Screen blending stacks sprite, collar and core. A linear alpha close to one
// masks variation in those overlapping passes. This response restores visible
// dimming, while exactly preserving every existing draw value at peak light.
function stellarExposure(luminosity: number) {
  return luminosity * luminosity;
}

const GRID_SIZE = 24;
const GRID_CELLS = GRID_SIZE ** 3;

// Smooth three-scale interference field: shared spatial phases produce clusters,
// wisps and fine detail instead of independently jittering each mote.
function volumeField(x: number, y: number, z: number, time: number) {
  const broad = Math.sin(x * 2.2 + z * 1.8 - time * .09) * Math.cos(y * 2.5 + time * .07);
  const wisp = Math.sin(x * 6.4 + y * 4.1 + broad * 1.2 + time * .12)
    * Math.cos(z * 5.3 - y * 2.7);
  const fine = Math.sin(x * 13.1 - y * 9.2 + z * 8.3 + time * .16);
  return broad * .55 + wisp * .32 + fine * .13;
}

// A tiny object-space light volume. Trilinear splats and sampling avoid cell edges
// and approximate overlapping nearby stellar light without pairwise searches.
function lightVolume(field: Float32Array, x: number, y: number, z: number, power = 0) {
  const gx = Math.max(0, Math.min(GRID_SIZE - 1.001, (x + 1.6) * (GRID_SIZE - 1) / 3.2));
  const gy = Math.max(0, Math.min(GRID_SIZE - 1.001, (y + 1.6) * (GRID_SIZE - 1) / 3.2));
  const gz = Math.max(0, Math.min(GRID_SIZE - 1.001, (z + 1.6) * (GRID_SIZE - 1) / 3.2));
  const ix = Math.floor(gx), iy = Math.floor(gy), iz = Math.floor(gz);
  const fx = gx - ix, fy = gy - iy, fz = gz - iz;
  let result = 0;
  for (let dz = 0; dz < 2; dz++) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
    const weight = (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy) * (dz ? fz : 1 - fz);
    const index = ix + dx + (iy + dy) * GRID_SIZE + (iz + dz) * GRID_SIZE * GRID_SIZE;
    if (power) field[index] += weight * power;
    else result += field[index] * weight;
  }
  return result;
}

// Compact 3D diffusion joins adjacent occupied cells without a fullscreen blur.
// Missing boundary neighbors contribute zero; all buffers are reused.
function diffuseVolume(source: Float32Array, target: Float32Array) {
  const plane = GRID_SIZE * GRID_SIZE;
  for (let z = 0; z < GRID_SIZE; z++) for (let y = 0; y < GRID_SIZE; y++) for (let x = 0; x < GRID_SIZE; x++) {
    const i = x + y * GRID_SIZE + z * plane;
    let neighbors = 0;
    if (x > 0) neighbors += source[i - 1];
    if (x < GRID_SIZE - 1) neighbors += source[i + 1];
    if (y > 0) neighbors += source[i - GRID_SIZE];
    if (y < GRID_SIZE - 1) neighbors += source[i + GRID_SIZE];
    if (z > 0) neighbors += source[i - plane];
    if (z < GRID_SIZE - 1) neighbors += source[i + plane];
    target[i] = source[i] * .55 + neighbors * .075;
  }
}

function particleForm(
  form: Form, p: MistParticle, angle: number, radius: number,
  time: number, out: Float64Array,
) {
  const phase = p.phase, depth = p.depth;
  let x = 0, y = 0, z = 0;
  const dust = p.kind >= .75;
  let normalX = Math.cos(angle), normalY = Math.sin(angle);
  const thickness = p.kind >= .75 ? .045 : .016;
  const tubeAngle = phase + time * .12;
  if (form === 8) {
    // Anatomical contours/surfaces are cached per particle, not rebuilt per frame.
    const entrance = smoothstep5(Math.min(1, time / 2.2));
    x = p.namaste.x * (.94 + entrance * .06);
    y = p.namaste.y + (1 - entrance) * .06;
    z = p.namaste.z;
  } else if (form === 0) {
    // 0. Nebula: preserve the asymmetric cloud, now with volumetric folds.
    x = Math.cos(angle) * radius + Math.sin(angle * 3.1 + time * .24 + phase) * .05 * depth;
    y = Math.sin(angle) * radius + Math.cos(angle * 2 - time * .17 + phase) * .055 * depth;
    z = (depth - .5) * .8 + Math.sin(angle * 2 + time * .09) * .13;
  } else if (form === 1) {
    // 1. Infinity: a continuous tubular lemniscate; crossings occupy distinct depths.
    const u = angle + time * .035, c = Math.cos(u), denominator = 1 + c * c;
    x = Math.sin(u) / denominator * .94;
    y = Math.sin(u) * c / denominator * 1.3;
    z = c * .30;
    // Cross-section is perpendicular to the local planar tangent.
    const tx = c * (3 - c * c), ty = 3 * c * c - 1;
    const length = Math.hypot(tx, ty);
    normalX = -ty / length; normalY = tx / length;
    const tube = .025 + thickness * radius;
    x -= ty / length * Math.cos(tubeAngle) * tube;
    y += tx / length * Math.cos(tubeAngle) * tube;
    z += Math.sin(tubeAngle) * tube;
  } else if (form === 2) {
    // 2. Three-arm spiral: distinct arms on a tilted galactic disk.
    const arm = p.index % 3;
    const sweep = arm * TAU / 3 + radius * 4.9 - time * .13 + Math.sin(phase) * .12
      + (dust ? (p.fill - .5) * .75 : 0);
    const distance = .08 + radius * .86;
    x = Math.cos(sweep) * distance;
    y = Math.sin(sweep) * distance * .78;
    z = Math.sin(sweep) * distance * .32 + (depth - .5) * thickness;
  } else if (form === 3) {
    // 3. Bloom: five cupped petals, with a soft raised center.
    const petals = .55 + .35 * Math.cos(5 * angle - time * .05);
    const bloom = petals * (.23 + radius * .84) * (dust ? .35 + Math.sqrt(p.fill) * .65 : 1);
    x = Math.cos(angle) * bloom;
    y = Math.sin(angle) * bloom;
    z = .22 * (1 - radius) - .16 * radius * radius + Math.sin(phase) * thickness;
  } else if (form === 4) {
    // 4. Torus vortex: a genuine torus with an open hole and rotating cross-section.
    const u = angle + time * .075, v = phase + time * .19;
    const tube = (.14 + .045 * radius) * (dust ? Math.sqrt(p.fill) : 1);
    const ring = .62 + tube * Math.cos(v);
    const ringY = Math.sin(u) * ring, tubeZ = Math.sin(v) * tube;
    const tilt = .68 + .07 * Math.sin(time * .08);
    x = Math.cos(u) * ring;
    y = ringY * Math.cos(tilt) - tubeZ * Math.sin(tilt);
    z = ringY * Math.sin(tilt) + tubeZ * Math.cos(tilt);
  } else if (form === 5) {
    // 5. Double helix: antipodal strands with evenly spaced height samples.
    const yTrack = ((Math.floor(p.index / 2) * .61803398875) % 1) * 2 - 1;
    const twist = yTrack * TAU * 1.35 + time * .18 + (p.index % 2) * Math.PI;
    const tube = thickness * (.4 + radius);
    // A minority connects the strands through the cylinder interior.
    const helixRadius = .30 * (dust && p.fill < .3 ? .4 + p.fill * 2 : 1);
    x = Math.cos(twist) * (helixRadius + Math.cos(phase) * tube);
    y = yTrack * .87 + Math.sin(phase) * tube;
    z = Math.sin(twist) * (helixRadius + Math.cos(phase) * tube);
  } else if (form === 6) {
    // 6. Butterfly: paired samples build mirrored, hinge-connected wing boundaries.
    const pair = Math.floor(p.index / 2), side = p.index % 2 ? 1 : -1;
    const region = pair % 100, u = sample(pair, 7), v = sample(pair, 8);
    if (region >= 97) {
      x = side * (.015 + .10 * u);
      y = -.33 - .28 * u;
      z = .03;
    } else if (region >= 90) {
      x = side * .018 * Math.sin(v * Math.PI);
      y = u * .78 - .36;
      z = .035 * Math.cos(v * Math.PI);
    } else {
      const upper = region < 55, t = u * TAU;
      const fill = pair % 4 === 0 ? .98 : Math.sqrt(v);
      const span = .025 + (upper ? .88 : .62) * Math.sin(t / 2) * fill;
      const flap = .25 + .12 * Math.sin(time * .85 + (upper ? 0 : .3));
      x = side * span * Math.cos(flap);
      y = (upper ? -.10 : .07) + (upper ? -.65 : .54) * Math.sin(t / 2) * fill
        + Math.sin(t) * (upper ? .27 : .22) * fill;
      z = span * Math.sin(flap) + Math.sin(t * 3) * .012 * fill;
    }
  } else {
    // 7. Fluid wave: a flowing, gently folded sheet with visible thickness.
    const waveX = radius * 2 - 1;
    const current = waveX * Math.PI * 1.55 + time * .16;
    x = waveX * .96;
    y = Math.sin(current) * .4 + Math.cos(phase) * .085;
    z = Math.sin(phase) * .17 + Math.cos(current) * .11;
  }
  let density = 1;
  if (dust && form !== 8) {
    const field = volumeField(x, y, z, time);
    // Narrow ribbons near open-loop shapes preserve their negative space.
    const width = p.volumeWidth * (form === 1 || form === 4 ? .7 : form === 6 ? .65 : 1);
    const radial = p.volumeX * width;
    const tangent = p.volumeY * width;
    x += normalX * radial - normalY * tangent + field * .045;
    y += normalY * radial + normalX * tangent + Math.sin(field * 2 + z * 3) * .025;
    z += p.volumeZ * (.75 + field * .18);
    // Shared fields deform the volume and modulate density at multiple scales.
    density = .62 + .38 * field;
  }
  const drift = form === 8 ? .0008 : p.kind >= .75 ? .008 : .003;
  if (form === 8 && dust) density = .25;
  out[0] = x + Math.sin(phase * 3 + time * .23) * drift;
  out[1] = y + Math.cos(phase * 2 + time * .19) * drift;
  out[2] = z + Math.sin(phase + time * .17) * drift;
  out[3] = density;
}

const hexRGBA = (hex: string, opacity: number) => {
  const clean = hex.trim().replace('#', '');
  const six = clean.length === 3 ? clean.split('').map(v => v + v).join('') : clean;
  if (!/^[a-f\d]{6}$/i.test(six)) return `rgba(220, 226, 245, ${opacity})`;
  const n = parseInt(six, 16);
  return `rgba(${(n >>> 16) & 255}, ${(n >>> 8) & 255}, ${n & 255}, ${opacity})`;
};

function makeMistSprite(color: string, dust = false) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, hexRGBA(color, dust ? .90 : .75));
  gradient.addColorStop(.18, hexRGBA(color, dust ? .63 : .43));
  gradient.addColorStop(.48, hexRGBA(color, dust ? .22 : .13));
  gradient.addColorStop(1, hexRGBA(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 96, 96);
  return canvas;
}

// A compact radiant star: hot center, saturated inner light, feathered outer halo.
// Cached per theme; the draw loop only scales/composites the resulting bitmap.
function makeRadiantStar(color: string, core: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  glow.addColorStop(0, core);
  glow.addColorStop(.045, core);
  glow.addColorStop(.09, hexRGBA(color, 1));
  glow.addColorStop(.18, hexRGBA(color, .78));
  glow.addColorStop(.34, hexRGBA(color, .25));
  glow.addColorStop(.62, hexRGBA(color, .055));
  glow.addColorStop(1, hexRGBA(color, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 128, 128);
  return canvas;
}

// Rasterize delicate four-point glints once per theme, never inside the draw loop.
function makeStarGlint(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  gradient.addColorStop(0, hexRGBA(color, .95));
  gradient.addColorStop(.25, hexRGBA(color, .55));
  gradient.addColorStop(1, hexRGBA(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(32, 2);
  ctx.lineTo(34, 29);
  ctx.lineTo(57, 32);
  ctx.lineTo(34, 35);
  ctx.lineTo(32, 62);
  ctx.lineTo(30, 35);
  ctx.lineTo(7, 32);
  ctx.lineTo(30, 29);
  ctx.closePath();
  ctx.fill();
  return canvas;
}

export function GoldenSmoke({ paused }: { paused: boolean }) {
  // No canvas element, context, sprite or GPU allocation exists below 768px.
  const enabled = useSyncExternalStore(subscribeParticleViewport, particleViewportEnabled, serverParticlesDisabled);
  const elapsedRef = useRef(0);
  return enabled ? <DesktopSculpture paused={paused} elapsedRef={elapsedRef} /> : null;
}

function DesktopSculpture({ paused, elapsedRef }: { paused: boolean; elapsedRef: RefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !hero || !ctx) return;

    let disposed = false;
    let volume = createStellarVolume(GRID_SIZE, recoverVolume);
    const timeOrigin = elapsedRef.current;
    const textBounds = new Float32Array(4).fill(-100000);
    const heroContent = hero.querySelector<HTMLElement>('.home-content');
    const atmosphere = document.createElement('canvas');
    const atmosphereCtx = atmosphere.getContext('2d', { alpha: true });
    const lighting = new Float32Array(GRID_CELLS);
    const softLighting = new Float32Array(GRID_CELLS);
    const densityVolume = new Float32Array(GRID_CELLS);
    const softDensity = new Float32Array(GRID_CELLS);
    let atmosphereScale = .35;
    let width = 1;
    let height = 1;
    let ratio = 1;
    let dark = true;
    let particles: MistParticle[] = [];
    let mist = makeMistSprite('#A78B63', true);
    let highlight = makeMistSprite('#D7AE6D');
    let brightGold = makeStarGlint('#FFE2A0');
    // Star sprites are independent of dust, so light mode can use red stars.
    let starHalo = highlight;
    let starFlare = brightGold;
    let starCore = '#FFE8B8';
    let radiantStar = makeRadiantStar('#FFC45C', '#FFF9E8');
    let hotCore = '#FFF9E8';
    let bounds = hero.getBoundingClientRect();

    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const camera = { x: 0, y: 0, vx: 0, vy: 0 };
    const spring = new Float64Array(2), frame = new Float64Array(3);
    const pointer = {
      nx: 0, ny: 0,
      x: -1000, y: -1000, vx: 0, vy: 0, speed: 0,
      at: 0, inside: false, down: false,
    };

    const updateColors = () => {
      const style = getComputedStyle(hero);
      dark = document.documentElement.dataset.theme !== 'light';
      // Dark mode remains golden; light mode keeps blue dust and red stars.
      const warm = style.getPropertyValue('--smoke-ambient').trim() || (dark ? '#A78B63' : '#809BB5');
      const gold = style.getPropertyValue('--smoke-gold').trim() || (dark ? '#D7AE6D' : '#77ACDA');
      const flare = style.getPropertyValue('--smoke-flare').trim() || (dark ? '#FFE2A0' : '#356BA5');
      mist = makeMistSprite(warm, true);
      volume?.palette(warm, dark ? gold : flare, dark ? flare : gold);
      highlight = makeMistSprite(gold);
      brightGold = makeStarGlint(flare);
      starHalo = dark ? highlight : makeMistSprite(
        style.getPropertyValue('--smoke-star-halo').trim() || '#F87171',
      );
      starFlare = dark ? brightGold : makeStarGlint(
        style.getPropertyValue('--smoke-star-flare').trim() || '#DC2626',
      );
      starCore = dark ? '#FFE8B8' :
        (style.getPropertyValue('--smoke-star-core').trim() || '#B91C1C');
      hotCore = dark ? '#FFF9E8' : '#FFF1E9';
      radiantStar = makeRadiantStar(dark ? '#FFBD4A' : '#C51632', hotCore);
      ctx.clearRect(0, 0, width, height);
    };

    const createParticle = (index: number, isStar: boolean): MistParticle => ({
      index,
      namaste: sampleNamaste(index, isStar ? (index % 3 === 0 ? .6 : .2) : .9),
      shimmerClass: sample(index, 34) < .70 ? 0 : sample(index, 34) < .95 ? 1 : 2,
      shimmerPhase: sample(index, 35) * TAU,
      shimmerRate: TAU / (sample(index, 34) < .70 ? 4 + sample(index, 36) * 4
        : sample(index, 34) < .95 ? 2.5 + sample(index, 36) * 2.5 : 6 + sample(index, 36) * 4),
      shimmerRange: sample(index, 34) < .70 ? .18 + sample(index, 37) * .10
        : sample(index, 34) < .95 ? .32 + sample(index, 37) * .12 : .46 + sample(index, 37) * .08,
      projectedDepth: 0, perspective: 1, worldX: 0, worldY: 0,
      volumeX: Math.tanh(normalSample(index, 10) * .595) * .17,
      volumeY: Math.tanh(normalSample(index, 12) * .595) * .11,
      volumeZ: normalSample(index, 14) * .19,
      illumination: 0, density: 1, fill: sample(index, 17),
      volumeWidth: .7 + 1.4 * Math.pow(sample(index, 16), 3),
      angle: sample(index, 1) * TAU,
      radius: Math.pow(sample(index, 2), .72),
      depth: sample(index, 3), phase: sample(index, 4) * TAU,
      speed: .55 + sample(index, 5) * .9, size: .45 + sample(index, 6) * 1.4,
      // Existing population: crisp stars, luminous structure, then atmospheric dust.
      kind: isStar ? (index % 3 === 0 ? .6 : .2) : .9,
      x: 0, y: 0, ready: false, offsetX: 0, offsetY: 0, velocityX: 0, velocityY: 0,
    });
    const from = new Float64Array(4), to = new Float64Array(4);
    const bucketHeads = new Int32Array(64);
    let bucketNext = new Int32Array(0);

    const resize = () => {
      bounds = hero.getBoundingClientRect();
      if (heroContent) {
        const text = heroContent.getBoundingClientRect();
        textBounds[0] = text.left - bounds.left;
        textBounds[1] = text.top - bounds.top;
        textBounds[2] = text.right - bounds.left;
        textBounds[3] = text.bottom - bounds.top;
      }
      width = Math.max(1, hero.clientWidth);
      height = Math.max(1, hero.clientHeight);
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Diffuse radiance does not need device-pixel resolution.
      atmosphereScale = Math.min(.4, 512 / width);
      atmosphere.width = Math.ceil(width * atmosphereScale);
      atmosphere.height = Math.ceil(height * atmosphereScale);
      atmosphereCtx?.setTransform(atmosphereScale, 0, 0, atmosphereScale, 0, 0);
      volume?.resize(width, height);
      const density = Math.min(1, width * height / 800000);
      const count = Math.round(DESKTOP_COUNT * Math.max(.6, density));
      // Increase stars 1.5x relative to the prior 50/50 field; keep dust fixed.
      // Desktop at full density: 1,350 stars + 900 dust = 2,250 total.
      // Phone viewports never mount this renderer.
      const oldStarCount = Math.round(count * .5);
      const dustCount = count - oldStarCount;
      const starCount = Math.round(oldStarCount * 1.5);
      particles = Array.from(
        { length: starCount + dustCount },
        // Interleave a fixed 3:2 star/dust mix so truncating at a mobile
        // viewport cannot discard every dust particle. Indices keep their roles.
        (_, index) => particles[index] || createParticle(index, index % 5 < 3),
      );
      bucketNext = new Int32Array(particles.length);
      updateColors();
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !finePointer.matches || paused) return;
      const now = performance.now();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const dt = Math.max(8, now - pointer.at);
      if (pointer.inside) {
        pointer.vx = (x - pointer.x) / dt;
        pointer.vy = (y - pointer.y) / dt;
        pointer.speed = Math.min(2.6, Math.hypot(pointer.vx, pointer.vy));
      }
      pointer.x = x;
      pointer.y = y;
      pointer.nx = Math.max(-1, Math.min(1, x / width * 2 - 1));
      pointer.ny = Math.max(-1, Math.min(1, y / height * 2 - 1));
      pointer.at = now;
      pointer.inside = true;
    };
    const leave = () => { pointer.inside = false; pointer.down = false; };
    const down = (event: PointerEvent) => { if (event.pointerType !== 'touch' && finePointer.matches && !paused) pointer.down = true; };
    const up = () => { pointer.down = false; };
    const scroll = () => { bounds = hero.getBoundingClientRect(); pointer.inside = false; };

    const draw = (dt: number, elapsed: number) => {
      const time = timeOrigin + elapsed;
      elapsedRef.current = time;
      if (ratio !== Math.min(window.devicePixelRatio || 1, 1.5)) resize();
      ctx.clearRect(0, 0, width, height);
      pointer.vx *= Math.exp(-dt * 5);
      pointer.vy *= Math.exp(-dt * 5);
      pointer.speed *= Math.exp(-dt * 4.5);

      const cameraDecay = Math.exp(-6 * dt), localDecay = Math.exp(-12 * dt);
      springAxis(camera.x, camera.vx, pointer.inside ? pointer.nx : 0, 6, dt, cameraDecay, spring);
      camera.x = spring[0]; camera.vx = spring[1];
      springAxis(camera.y, camera.vy, pointer.inside ? pointer.ny : 0, 6, dt, cameraDecay, spring);
      camera.y = spring[0]; camera.vy = spring[1];
      // Position the cloud to the right of the hero headline; keep the original
      // smoke density, illumination, cursor swirl, and overall visual treatment.
      const centerX = width * .69 + camera.x * 8;
      const centerY = height * .50 + camera.y * 6;
      const spreadX = Math.min(width * .34, 460);
      const spreadY = Math.min(height * .42, 340);
      const cursorRadius = pointer.down ? 160 : 130;
      ctx.globalCompositeOperation = dark ? 'screen' : 'source-over';

      // One clock: Namaste once, then the original eight-form loop forever.
      formationFrame(time, frame);
      const current = frame[0] as Form, next = frame[1] as Form, blend = frame[2];

      bucketHeads.fill(-1);
      lighting.fill(0);
      densityVolume.fill(0);
      const orientationWeight = current === 8 ? .30 + blend * .70 : 1;
      const yaw = (Math.sin(time * .07) * .23 + camera.x * .24) * orientationWeight;
      const pitch = (Math.sin(time * .045) * .10 - camera.y * .16) * orientationWeight;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      for (const p of particles) {
        const spin = p.angle + time * (.085 + p.depth * .060) * p.speed;
        const r = p.radius + Math.sin(p.phase + time * .22) * .012;
        const a = spin + (1 - r) * 1.75;
        particleForm(current, p, a, r, time, from);
        if (blend > 0) {
          particleForm(next, p, a, r, time, to);
          for (let axis = 0; axis < 4; axis++) from[axis] += (to[axis] - from[axis]) * blend;
        }
        const worldX = from[0] * cy + from[2] * sy;
        const yawZ = from[2] * cy - from[0] * sy;
        const worldY = from[1] * cp - yawZ * sp;
        const worldZ = yawZ * cp + from[1] * sp;
        const perspective = 1 / (1 - worldZ * .32);
        p.density = from[3];
        p.worldX = worldX;
        p.worldY = worldY;
        p.projectedDepth = worldZ;
        p.perspective = perspective;
        const anchorX = centerX + worldX * spreadX * perspective;
        const anchorY = centerY + worldY * spreadY * perspective;

        let targetX = 0, targetY = 0;
        if (pointer.inside) {
          const dx = anchorX - pointer.x, dy = anchorY - pointer.y;
          const distance = Math.hypot(dx, dy), safe = Math.max(16, distance);
          const falloff = Math.max(0, 1 - distance / cursorRadius);
          const displacement = falloff * falloff * (pointer.down ? 20 : 12);
          targetX = -dy / safe * displacement;
          targetY = dx / safe * displacement;
        }
        springAxis(p.offsetX, p.velocityX, targetX, 12, dt, localDecay, spring);
        p.offsetX = spring[0]; p.velocityX = spring[1];
        springAxis(p.offsetY, p.velocityY, targetY, 12, dt, localDecay, spring);
        p.offsetY = spring[0]; p.velocityY = spring[1];
        p.x = anchorX + p.offsetX;
        p.y = anchorY + p.offsetY;
        p.ready = true;

        const bucket = Math.max(0, Math.min(63, Math.floor((worldZ + 1.6) * 20)));
        bucketNext[p.index] = bucketHeads[bucket];
        bucketHeads[bucket] = p.index;
      }
      // Normalize splat power by population so mobile keeps the same illumination.
      const lightPower = 2250 / particles.length * (GRID_SIZE / 16) ** 3;
      for (const p of particles) {
        if (p.kind < .5 && p.index % 11 < 2)
          lightVolume(lighting, p.worldX, p.worldY, p.projectedDepth, (.8 + p.size * .2) * lightPower);
        if (p.kind >= .5)
          lightVolume(densityVolume, p.worldX, p.worldY, p.projectedDepth,
            (p.kind >= .75 ? p.density : .35) * lightPower);
      }
      diffuseVolume(lighting, softLighting);
      diffuseVolume(densityVolume, softDensity);
      diffuseVolume(softLighting, lighting);
      diffuseVolume(lighting, softLighting);
      // Keep density close to geometry (one pass); light alone spreads farther.
      const volumeRendered = volume?.render(softDensity, softLighting, time,
        centerX, centerY, spreadX, spreadY, textBounds) ?? false;
      canvas.dataset.renderer = volumeRendered ? 'webgl2-volume' : 'canvas-fallback';
      if (atmosphereCtx && !volumeRendered) {
        atmosphereCtx.clearRect(0, 0, width, height);
        atmosphereCtx.globalCompositeOperation = 'source-over';
        // Low-cost full-hero counterpart when WebGL is unavailable.
        for (let row = 0; row < 7; row++) for (let col = 0; col < 12; col++) {
          const x = (col + .5) / 12 * width, y = (row + .5) / 7 * height;
          const field = volumeField(col * .4, row * .45, .3, time);
          const ribbon = Math.exp(-(Math.sin(row * .6 + Math.sin(col * .35 + time * .025)) ** 2) * 8);
          const distance = Math.hypot(Math.max(textBounds[0] - x, x - textBounds[2], 0),
            Math.max(textBounds[1] - y, y - textBounds[3], 0));
          const optical = .20 + .35 * Math.max(0, .5 + field * .5) + ribbon * .55;
          atmosphereCtx.globalAlpha = globalNebulaOpacity(optical, x / width, distance) * .65;
          atmosphereCtx.drawImage(mist, x - width / 10, y - height / 6, width / 5, height / 3);
        }
      }
      // Both atmospheric and fine passes share the same continuous density field.
      for (let bucket = 0; bucket < bucketHeads.length; bucket++) {
        for (let index = bucketHeads[bucket]; index !== -1; index = bucketNext[index]) {
          const p = particles[index];
          if (p.kind < .75) continue;
          const light = lightVolume(softLighting, p.worldX, p.worldY, p.projectedDepth);
          const density = lightVolume(softDensity, p.worldX, p.worldY, p.projectedDepth);
          p.illumination = 1 - Math.exp(-light * 3);
          const body = 1 - Math.exp(-density * .9);
          if (atmosphereCtx && !volumeRendered) {
            // Broad low-energy support overlaps along clusters; the fine pass
            // retains distinct motes. No radiance is drawn outside actual dust.
            const diameter = (22 + body * 12 + p.size * 3) * p.perspective;
            const outsideX = Math.max(textBounds[0] - p.x, p.x - textBounds[2], 0);
            const outsideY = Math.max(textBounds[1] - p.y, p.y - textBounds[3], 0);
            const edge = Math.min(1, Math.hypot(outsideX, outsideY) / 80);
            const readability = .08 + .92 * edge * edge * (3 - 2 * edge);
            atmosphereCtx.globalAlpha = (dark ? .038 : .046) * p.density
              * body * (.10 + p.illumination * p.illumination * .90)
              * Math.max(.3, .7 + p.projectedDepth * .35) * readability;
            atmosphereCtx.drawImage(mist, p.x - diameter / 2, p.y - diameter / 2, diameter, diameter);
          }
        }
      }
      // Resolve diffuse light behind the sharp, depth-ordered particle pass.
      ctx.globalAlpha = 1;
      if (volumeRendered && volume) {
        ctx.drawImage(volume.canvas, 0, 0, volume.canvas.width, volume.canvas.height, 0, 0, width, height);
      } else if (atmosphereCtx) {
        ctx.drawImage(atmosphere, 0, 0, atmosphere.width, atmosphere.height, 0, 0, width, height);
      }
      // Far-to-near traversal without per-frame sorting, objects or coordinate arrays.
      for (let bucket = 0; bucket < bucketHeads.length; bucket++) {
        for (let index = bucketHeads[bucket]; index !== -1; index = bucketNext[index]) {
          const p = particles[index];
          const depthLight = Math.max(.35, Math.min(1, .66 + p.projectedDepth * .4));
          const variation = .92 + .08 * Math.sin(time * .6 + p.phase);
          const size = p.perspective * (1 + Math.max(0, p.projectedDepth) * .20);
          const luminosity = p.kind < .75 ? stellarLuminosity(p, time) : 1;
          const twinkle = stellarExposure(luminosity);
          const starLight = Math.max(.48, Math.min(1, .80 + p.projectedDepth * .38 + Math.max(0, p.projectedDepth) * .10));
          if (p.kind < .5) {
            // Roughly 18% are hero stars, without changing population or geometry.
            const prominent = p.index % 11 < 2;
            const glint = p.index % 61 === 1; // ~1.6% of sharp stars.
            const sparkle = glint ? luminosity : 0;
            const energy = .94 * twinkle;
            const coreSize = (prominent ? 1.8 + p.size * .55 : 1.05 + p.size * .43) * size;
            const haloSize = (prominent ? 26 + p.size * 7 : 8 + p.size * 2.5) * size
              * (.90 + luminosity * .10);
            ctx.globalAlpha = starLight * (prominent ? energy : .76 * twinkle);
            ctx.drawImage(prominent ? radiantStar : starHalo,
              p.x - haloSize / 2, p.y - haloSize / 2, haloSize, haloSize);
            if (glint) {
              const flare = (18 + p.size * 5) * size;
              ctx.globalAlpha = starLight * (.12 + sparkle * .30) * twinkle;
              ctx.drawImage(starFlare, p.x - flare / 2, p.y - flare / 2, flare, flare);
            }
            // In light mode a deep-red collar keeps the hot center legible on white.
            ctx.fillStyle = starCore;
            ctx.globalAlpha = starLight * twinkle;
            const collar = coreSize + (prominent ? 1.4 : 0);
            ctx.fillRect(p.x - collar / 2, p.y - collar / 2, collar, collar);
            if (prominent) {
              ctx.fillStyle = hotCore;
              ctx.globalAlpha = starLight * twinkle;
              ctx.fillRect(p.x - coreSize / 2, p.y - coreSize / 2, coreSize, coreSize);
            }
          } else if (p.kind < .75) {
            const spot = (7 + p.size * 4) * size;
            ctx.globalAlpha = (dark ? .72 : .68) * starLight * twinkle;
            ctx.drawImage(starHalo, p.x - spot / 2, p.y - spot / 2, spot, spot);
            const coreSize = (.65 + p.size * .25) * size;
            ctx.fillStyle = starCore;
            ctx.globalAlpha = .65 * starLight * twinkle;
            ctx.fillRect(p.x - coreSize / 2, p.y - coreSize / 2, coreSize, coreSize);
          } else {
            const spot = (1.2 + p.size * 2.1) * size;
            // Fine motes sit inside the diffuse pass; local light reveals clusters.
            ctx.globalAlpha = (dark ? .68 : .70) * depthLight * variation
              * (.5 + p.illumination * .5) * (.65 + p.density * .35);
            ctx.drawImage(mist, p.x - spot / 2, p.y - spot / 2, spot, spot);
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    function recoverVolume() {
      if (disposed) return;
      volume?.dispose();
      volume = createStellarVolume(GRID_SIZE, recoverVolume);
      volume?.resize(width, height);
      updateColors();
      draw(0, elapsedRef.current - timeOrigin);
    }
    resize();
    draw(0, 0); // Stable paused/reduced-motion fallback, with no artificial time advance.
    const redraw = () => draw(0, elapsedRef.current - timeOrigin);
    const onResize = () => {
      resize();
      for (const p of particles) p.ready = false;
      redraw();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(hero);
    if (heroContent) resizeObserver.observe(heroContent);
    const themeObserver = new MutationObserver(() => { updateColors(); redraw(); });
    themeObserver.observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme'],
    });
    finePointer.addEventListener('change', leave);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const stop = paused ? () => {} : animateHero(hero, draw);
    return () => {
      disposed = true;
      finePointer.removeEventListener('change', leave);
      stop();
      volume?.dispose();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      hero.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', onResize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [paused]);

  return <canvas className="hero-flow" ref={ref} aria-hidden="true" />;
}
