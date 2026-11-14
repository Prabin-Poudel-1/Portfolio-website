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
const MOBILE_COUNT = 280;
const DESKTOP_COUNT = 900;

// Four dust sculptures, not hard-edged line drawings.
// An extended hold and quintic easing make transitions feel fluid.
const FORM_SECONDS = 14;
const FORM_HOLD = 8;
const FORM_COUNT = 4;
const smoothstep5 = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

type Form = 0 | 1 | 2 | 3;
function particleForm(
  form: Form, particle: MistParticle, angle: number, radius: number,
  time: number, spreadX: number, spreadY: number, fold: number,
): [number, number] {
  const phase = particle.phase;
  const depth = particle.depth;
  if (form === 0) {
    // Original, screenshot-approved atmospheric nebula.
    return [
      Math.cos(angle) * spreadX * radius + fold,
      Math.sin(angle) * spreadY * radius
        + Math.cos(angle * 2 - time * .17 + phase) * 19 * depth,
    ];
  }
  if (form === 1) {
    // Infinity: two loose lobes with a scattered soft-volume cross section.
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
    // Three rotating spiral arms. Independent phases keep the shape dusty.
    const arm = Math.floor(phase / TAU * 3);
    const sweep = arm * TAU / 3 + radius * 4.9 - time * .13
      + Math.sin(particle.angle * 2) * .22;
    const distance = .13 + radius * .87;
    return [
      Math.cos(sweep) * spreadX * distance + Math.sin(phase * 4) * 14,
      Math.sin(sweep) * spreadY * distance + Math.cos(phase * 4) * 14,
    ];
  }
  // A slowly breathing, five-petal nebula bloom.
  const petals = .55 + .35 * Math.cos(5 * angle - time * .05);
  const bloom = petals * (.23 + radius * .84);
  return [
    Math.cos(angle) * spreadX * bloom * 1.09 + fold * .32,
    Math.sin(angle) * spreadY * bloom
      + Math.sin(phase * 2 + time * .13) * 13 * depth,
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
    let dustColor = '#E1C999';
    let bounds = hero.getBoundingClientRect();

    const pointer = {
      x: -1000, y: -1000, vx: 0, vy: 0, speed: 0,
      at: 0, inside: false, down: false,
    };

    const updateColors = () => {
      const style = getComputedStyle(hero);
      dark = document.documentElement.dataset.theme !== 'light';
      // A warm golden mist is intentionally independent of blue UI accents.
      // Dark: illuminated honey / champagne. Light: antique gold on ivory.
      const warm = style.getPropertyValue('--smoke-ambient').trim() || (dark ? '#A78B63' : '#988367');
      const gold = style.getPropertyValue('--smoke-gold').trim() || (dark ? '#D7AE6D' : '#AC772B');
      const flare = style.getPropertyValue('--smoke-flare').trim() || (dark ? '#FFE2A0' : '#D79A39');
      dustColor = flare;
      mist = makeMistSprite(warm);
      highlight = makeMistSprite(gold);
      brightGold = makeMistSprite(flare);
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
      // Exactly half bright stars and half soft dust (rounded for odd counts).
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
      const starCount = Math.round(count * .5);
      particles = Array.from({ length: count }, (_, index) => createParticle(index < starCount));
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

        const lit = Math.min(1, influence * (1 + pointer.speed * .25));
        const isStar = p.kind < .5;

        if (isStar) {
          // Bright golden stars shimmer independently while sharing the cloud's
          // existing shape morphing and cursor-responsive movement.
          const shimmer = .57 + .43 * Math.sin(time * (2.1 + p.speed * 1.3)
            + p.phase * 7 + p.depth * 4);
          const twinkle = .15 + .85 * shimmer * shimmer;
          const coreSize = (.7 + p.depth * 1.1) * (0.85 + twinkle * .3)
            * (dark ? 1 : 1.22);
          const haloSize = (5 + p.size * 6) * (.7 + p.depth * .75);

          ctx.globalAlpha = Math.min(1,
            (dark ? .44 + lit * .36 : .63 + lit * .24) * twinkle);
          ctx.drawImage(
            highlight,
            p.x - haloSize / 2, p.y - haloSize / 2,
            haloSize, haloSize,
          );

          const flareSize = haloSize * (1.6 + lit * .6);
          // At rest light mode stays pale blue; near the cursor deep blue blooms.
          ctx.globalAlpha = Math.min(1,
            (dark ? .34 + lit * .57 : .20 + lit * .72) * twinkle);
          ctx.drawImage(
            brightGold,
            p.x - flareSize / 2, p.y - flareSize / 2,
            flareSize, flareSize,
          );

          // Crisp bright cores distinguish the stars from the 50% soft dust.
          ctx.fillStyle = dark
            ? (lit > .25 ? '#FFF5D7' : '#FFE8B8')
            : (lit > .25 ? '#275B95' : '#5C8FC0');
          ctx.globalAlpha = Math.min(1,
            (dark ? .68 + lit * .25 : .78 + lit * .18) * twinkle);
          ctx.fillRect(
            p.x - coreSize / 2, p.y - coreSize / 2,
            coreSize, coreSize,
          );
        } else {
          // Preserve the atmospheric dust and its existing golden cursor bloom.
          const spotSize = (14 + p.size * 34) * (.55 + p.depth * .9);
          const sprite = p.kind < .55 ? highlight : mist;
          // More contrast on ivory: tiny translucent GPU dust had vanished.
          ctx.globalAlpha = (dark ? .21 + lit * .085 : .43 + lit * .12)
            * (.35 + p.depth * .7);
          ctx.drawImage(
            sprite,
            p.x - spotSize / 2, p.y - spotSize / 2,
            spotSize, spotSize,
          );
          if (lit > .03) {
            const glowSize = spotSize * (1.08 + lit * .48);
            ctx.globalAlpha = (dark ? .37 : .58) * lit;
            ctx.drawImage(
              brightGold,
              p.x - glowSize / 2, p.y - glowSize / 2,
              glowSize, glowSize,
            );
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      // A subtle localized golden aura tracks the pointer without hiding content.
      if (pointer.inside) {
        const haloRadius = pointer.down ? 170 : 125;
        const halo = ctx.createRadialGradient(
          pointer.x, pointer.y, 3,
          pointer.x, pointer.y, haloRadius,
        );
        halo.addColorStop(0, hexRGBA(dustColor, dark ? .13 : .115));
        halo.addColorStop(.5, hexRGBA(dustColor, dark ? .055 : .055));
        halo.addColorStop(1, hexRGBA(dustColor, 0));
        ctx.globalAlpha = 1;
        ctx.fillStyle = halo;
        ctx.fillRect(pointer.x - haloRadius, pointer.y - haloRadius, haloRadius * 2, haloRadius * 2);
      }
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
