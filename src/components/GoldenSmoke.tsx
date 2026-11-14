import { useEffect, useRef } from 'react';
import { animateHero } from '../utils/heroMotion';

/**
 * Atmospheric particle sculpture, inspired by experimental WebGL portfolios.
 * Original Canvas 2D implementation: no third-party assets, no extra dependencies.
 * Existing Hero controls, project network, sound and animation loop are untouched.
 */
type MistParticle = {
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
};

const TAU = Math.PI * 2;
const MOBILE_COUNT = 560;
const DESKTOP_COUNT = 1800;

// Eight organic particle formations. Each holds for six seconds and
// interpolates over four seconds; one full loop lasts 80 seconds.
const FORM_SECONDS = 10;
const FORM_HOLD = 6;
const FORM_COUNT = 8;
const smoothstep5 = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

type Form = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
function particleForm(
  form: Form, particle: MistParticle, angle: number, radius: number,
  time: number, spreadX: number, spreadY: number, fold: number,
): [number, number] {
  const phase = particle.phase;
  const depth = particle.depth;

  if (form === 0) {
    // 0. Nebula: original, screenshot-approved warm cloud.
    return [
      Math.cos(angle) * spreadX * radius + fold,
      Math.sin(angle) * spreadY * radius
        + Math.cos(angle * 2 - time * .17 + phase) * 19 * depth,
    ];
  }

  if (form === 1) {
    // 1. Infinity: two softly overlapping, rotating dust lobes.
    const loop = angle + time * .035;
    const radiusWidth = .48 + radius * .55;
    return [
      Math.sin(loop) * spreadX * radiusWidth * 1.04
        + Math.sin(phase * 2 + time * .13) * 16 * (1 - depth * .4),
      Math.sin(loop * 2) * spreadY * radiusWidth * .64
        + Math.cos(phase * 3 + time * .16) * 18 * (1 - depth * .3),
    ];
  }

  if (form === 2) {
    // 2. Three-arm spiral: retain the existing rotating structure.
    const arm = Math.floor(phase / TAU * 3);
    const sweep = arm * TAU / 3 + radius * 4.9 - time * .13
      + Math.sin(particle.angle * 2) * .22;
    const distance = .13 + radius * .87;
    return [
      Math.cos(sweep) * spreadX * distance + Math.sin(phase * 4) * 14,
      Math.sin(sweep) * spreadY * distance + Math.cos(phase * 4) * 14,
    ];
  }

  if (form === 3) {
    // 3. Bloom: five gently breathing petals.
    const petals = .55 + .35 * Math.cos(5 * angle - time * .05);
    const bloom = petals * (.23 + radius * .84);
    return [
      Math.cos(angle) * spreadX * bloom * 1.09 + fold * .32,
      Math.sin(angle) * spreadY * bloom
        + Math.sin(phase * 2 + time * .13) * 13 * depth,
    ];
  }

  if (form === 4) {
    // 4. Torus vortex: orbit around a hollow ring with a rotating tube.
    // Perspective compression of the rear tube creates apparent 3D depth.
    const u = angle + time * .075;
    const v = phase * 2 + time * .19;
    const major = .57 + radius * .12;
    const tube = .11 + .10 * depth;
    const ring = major + tube * Math.cos(v);
    const back = .83 + .17 * Math.sin(u);
    return [
      Math.cos(u) * spreadX * ring * 1.22 + Math.sin(v) * 12,
      (Math.sin(u) * spreadY * ring * .64 + Math.sin(v) * spreadY * tube * .7) * back,
    ];
  }

  if (form === 5) {
    // 5. Double helix: two offset spirals winding around a vertical axis.
    const strand = phase < Math.PI ? 0 : Math.PI;
    const yTrack = radius * 2 - 1;
    const twist = yTrack * TAU * 1.7 + time * .18 + strand;
    const thickness = (depth - .5) * 18;
    return [
      Math.cos(twist) * spreadX * .27 + thickness,
      yTrack * spreadY * .87 + Math.sin(twist) * 13,
    ];
  }

  if (form === 6) {
    // 6. Butterfly: four soft, mirrored wings with breathing motion.
    // The body and paired antennae stay visible without drawing hard lines.
    const group = phase / TAU;
    if (group >= .975) {
      const side = group < .9875 ? -1 : 1;
      const reach = radius * .93;
      return [
        side * spreadX * (.012 + .11 * reach),
        -spreadY * (.23 + .32 * reach)
          + Math.sin(time * .6 + phase * 2) * 2,
      ];
    }
    if (group >= .92) {
      return [
        Math.sin(angle * 3 + time * .15) * (4 + depth * 5),
        (radius * 2 - 1) * spreadY * .42,
      ];
    }
    const wingIndex = Math.min(3, Math.floor(group / .23));
    const side = wingIndex % 2 === 0 ? -1 : 1;
    const upper = wingIndex < 2;
    const wingRadius = Math.sqrt(radius);
    const flutter = 1 + .07 * Math.sin(time * .85 + (upper ? 0 : 1.2));
    const width = upper ? .36 : .265;
    const height = upper ? .39 : .27;
    const centerX = upper ? .42 : .33;
    const centerY = upper ? -.34 : .30;
    return [
      side * spreadX * (centerX + Math.cos(angle) * width * wingRadius) * flutter
        + Math.sin(phase * 7 + time * .16) * 6 * depth,
      spreadY * (centerY + Math.sin(angle) * height * wingRadius)
        + Math.cos(phase * 4 + time * .18) * 5 * depth,
    ];
  }

  // 7. Fluid wave: a ribbonless, continuously undulating dust current.
  const waveX = radius * 2 - 1;
  const current = waveX * Math.PI * 1.55 + time * .16;
  return [
    waveX * spreadX * .96 + Math.sin(angle * 2 + phase) * 17,
    Math.sin(current) * spreadY * .4
      + Math.cos(angle * 2.4 + phase * 1.4) * 19 * (.45 + depth * .4),
  ];
}

const hexRGBA = (hex: string, opacity: number) => {
  const clean = hex.trim().replace('#', '');
  const six = clean.length === 3 ? clean.split('').map(v => v + v).join('') : clean;
  if (!/^[a-f\d]{6}$/i.test(six)) return `rgba(220, 226, 245, ${opacity})`;
  const n = parseInt(six, 16);
  return `rgba(${(n >>> 16) & 255}, ${(n >>> 8) & 255}, ${n & 255}, ${opacity})`;
};

function makeMistSprite(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
  gradient.addColorStop(0, hexRGBA(color, .75));
  gradient.addColorStop(.18, hexRGBA(color, .43));
  gradient.addColorStop(.48, hexRGBA(color, .13));
  gradient.addColorStop(1, hexRGBA(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 96, 96);
  return canvas;
}

export function GoldenSmoke({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.parentElement;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !hero || !ctx) return;

    let width = 1;
    let height = 1;
    let ratio = 1;
    let dark = true;
    let particles: MistParticle[] = [];
    let mist = makeMistSprite('#A78B63');
    let highlight = makeMistSprite('#D7AE6D');
    let brightGold = makeMistSprite('#FFE2A0');
    // Star sprites are independent of dust, so light mode can use red stars.
    let starHalo = highlight;
    let starFlare = brightGold;
    let starCore = '#FFE8B8';
    let bounds = hero.getBoundingClientRect();

    const pointer = {
      x: -1000, y: -1000, vx: 0, vy: 0, speed: 0,
      at: 0, inside: false, down: false,
    };

    const updateColors = () => {
      const style = getComputedStyle(hero);
      dark = document.documentElement.dataset.theme !== 'light';
      // Dark mode remains golden; light mode keeps blue dust and red stars.
      const warm = style.getPropertyValue('--smoke-ambient').trim() || (dark ? '#A78B63' : '#988367');
      const gold = style.getPropertyValue('--smoke-gold').trim() || (dark ? '#D7AE6D' : '#AC772B');
      const flare = style.getPropertyValue('--smoke-flare').trim() || (dark ? '#FFE2A0' : '#D79A39');
      mist = makeMistSprite(warm);
      highlight = makeMistSprite(gold);
      brightGold = makeMistSprite(flare);
      starHalo = dark ? highlight : makeMistSprite(
        style.getPropertyValue('--smoke-star-halo').trim() || '#F87171',
      );
      starFlare = dark ? brightGold : makeMistSprite(
        style.getPropertyValue('--smoke-star-flare').trim() || '#DC2626',
      );
      starCore = dark ? '#FFE8B8' :
        (style.getPropertyValue('--smoke-star-core').trim() || '#B91C1C');
      ctx.clearRect(0, 0, width, height);
    };

    const createParticle = (isStar: boolean): MistParticle => ({
      angle: Math.random() * TAU,
      // Several layers of a warped 3D-looking cloud; no linear wave ribbons.
      radius: Math.pow(Math.random(), .72),
      depth: Math.random(),
      phase: Math.random() * TAU,
      speed: .55 + Math.random() * .9,
      size: .45 + Math.random() * 1.4,
      // Star/dust appearance is selected separately from the count multiplier.
      kind: isStar ? Math.random() * .5 : .5 + Math.random() * .5,
      x: 0, y: 0, ready: false,
    });

    const resize = () => {
      bounds = hero.getBoundingClientRect();
      width = Math.max(1, hero.clientWidth);
      height = Math.max(1, hero.clientHeight);
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const density = Math.min(1, width * height / 800000);
      const count = width < 700 ? MOBILE_COUNT : Math.round(DESKTOP_COUNT * Math.max(.6, density));
      // Increase stars 1.5x relative to the prior 50/50 field; keep dust fixed.
      // Desktop at full density: 1,350 stars + 900 dust = 2,250 total.
      // Mobile: 420 stars + 280 dust = 700 total.
      const oldStarCount = Math.round(count * .5);
      const dustCount = count - oldStarCount;
      const starCount = Math.round(oldStarCount * 1.5);
      particles = Array.from(
        { length: starCount + dustCount },
        (_, index) => createParticle(index < starCount),
      );
      updateColors();
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
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
      pointer.at = now;
      pointer.inside = true;
    };
    const leave = () => { pointer.inside = false; pointer.down = false; };
    const down = (event: PointerEvent) => { if (event.pointerType !== 'touch') pointer.down = true; };
    const up = () => { pointer.down = false; };
    const scroll = () => { bounds = hero.getBoundingClientRect(); pointer.inside = false; };

    const draw = (dt: number, time: number) => {
      if (ratio !== Math.min(window.devicePixelRatio || 1, 1.5)) resize();
      ctx.clearRect(0, 0, width, height);
      pointer.vx *= Math.exp(-dt * 5);
      pointer.vy *= Math.exp(-dt * 5);
      pointer.speed *= Math.exp(-dt * 4.5);

      const mobile = width < 700;
      // Position the cloud to the right of the hero headline; keep the original
      // smoke density, illumination, cursor swirl, and overall visual treatment.
      const centerX = width * (mobile ? .57 : .69);
      const centerY = height * (mobile ? .42 : .50);
      const spreadX = Math.min(width * (mobile ? .45 : .34), 460);
      const spreadY = Math.min(height * .42, 340);
      const settle = 1 - Math.exp(-dt * (pointer.inside ? 8 : 3.5));
      const cursorRadius = pointer.down ? 300 : 255;
      ctx.globalCompositeOperation = dark ? 'screen' : 'source-over';

      // One timeline for the entire sculpture rather than one per particle.
      const stage = (time % (FORM_SECONDS * FORM_COUNT)) / FORM_SECONDS;
      const current = Math.floor(stage) as Form;
      const next = ((current + 1) % FORM_COUNT) as Form;
      const local = stage - current;
      const transition = Math.max(0, Math.min(1,
        (local * FORM_SECONDS - FORM_HOLD) / (FORM_SECONDS - FORM_HOLD),
      ));
      const blend = smoothstep5(transition);

      for (const p of particles) {
        const spin = p.angle + time * (.085 + p.depth * .060) * p.speed;
        const r = p.radius + Math.sin(p.phase + time * .22) * .022;
        const a = spin + (1 - r) * 1.75;
        // Asymmetric wandering contours create soft volumetric folds and depth.
        const fold = Math.sin(a * 3.1 + time * .24 + p.phase) * 21 * p.depth;
        // Continuous movement from one formation into the next.
        const [fromX, fromY] = particleForm(current, p, a, r, time, spreadX, spreadY, fold);
        // Compute the next shape only when the blend actually begins.
        let shapeX = fromX;
        let shapeY = fromY;
        if (blend > 0) {
          const [toX, toY] = particleForm(next, p, a, r, time, spreadX, spreadY, fold);
          shapeX += (toX - fromX) * blend;
          shapeY += (toY - fromY) * blend;
        }
        const anchorX = centerX + shapeX;
        const anchorY = centerY + shapeY;

        let targetX = anchorX;
        let targetY = anchorY;
        let influence = 0;
        if (pointer.inside) {
          const dx = anchorX - pointer.x;
          const dy = anchorY - pointer.y;
          const distance = Math.hypot(dx, dy);
          influence = Math.pow(Math.max(0, 1 - distance / cursorRadius), 1.45);
          // A gentle swirl allows the gold to illuminate instead of fleeing.
          const turn = influence * (pointer.down ? 48 : 24);
          const safe = Math.max(16, distance);
          targetX += (-dy / safe) * turn + pointer.vx * influence * 12;
          targetY += (dx / safe) * turn + pointer.vy * influence * 12;
        }
        if (!p.ready) {
          p.x = anchorX;
          p.y = anchorY;
          p.ready = true;
        }
        p.x += (targetX - p.x) * settle;
        p.y += (targetY - p.y) * settle;

        // Preserve cursor-driven motion, but do not illuminate particles near it.
        const isStar = p.kind < .5;

        if (isStar) {
          // Stars retain independent twinkles; on light backgrounds they are red.
          const shimmer = .57 + .43 * Math.sin(time * (2.1 + p.speed * 1.3)
            + p.phase * 7 + p.depth * 4);
          const twinkle = .15 + .85 * shimmer * shimmer;
          const coreSize = (.7 + p.depth * 1.1) * (0.85 + twinkle * .3)
            * (dark ? 1 : 1.22);
          const haloSize = (5 + p.size * 6) * (.7 + p.depth * .75);

          ctx.globalAlpha = (dark ? .44 : .63) * twinkle;
          ctx.drawImage(
            starHalo,
            p.x - haloSize / 2, p.y - haloSize / 2,
            haloSize, haloSize,
          );

          const flareSize = haloSize * 1.6;
          ctx.globalAlpha = (dark ? .34 : .20) * twinkle;
          ctx.drawImage(
            starFlare,
            p.x - flareSize / 2, p.y - flareSize / 2,
            flareSize, flareSize,
          );

          // Crisp cores distinguish stars from the soft dust.
          ctx.fillStyle = starCore;
          ctx.globalAlpha = (dark ? .68 : .78) * twinkle;
          ctx.fillRect(
            p.x - coreSize / 2, p.y - coreSize / 2,
            coreSize, coreSize,
          );
        } else {
          // Keep the original atmospheric blue/gold dust without cursor glow.
          const spotSize = (14 + p.size * 34) * (.55 + p.depth * .9);
          const sprite = p.kind < .55 ? highlight : mist;
          // More contrast on ivory: tiny translucent GPU dust had vanished.
          ctx.globalAlpha = (dark ? .21 : .43) * (.35 + p.depth * .7);
          ctx.drawImage(
            sprite,
            p.x - spotSize / 2, p.y - spotSize / 2,
            spotSize, spotSize,
          );
         }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    const themeObserver = new MutationObserver(updateColors);
    themeObserver.observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme'],
    });
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('pointerdown', down, { passive: true });
    window.addEventListener('pointerup', up, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    const stop = paused ? () => {} : animateHero(hero, draw);
    return () => {
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      hero.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [paused]);

  return <canvas className="hero-flow" ref={ref} aria-hidden="true" />;
}
