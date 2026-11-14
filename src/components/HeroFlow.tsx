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

export function HeroFlow({ paused }: { paused: boolean }) {
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

    const createParticle = (): MistParticle => ({
      angle: Math.random() * TAU,
      // Several layers of a warped 3D-looking cloud; no linear wave ribbons.
      radius: Math.pow(Math.random(), .72),
      depth: Math.random(),
      phase: Math.random() * TAU,
      speed: .55 + Math.random() * .9,
      size: .45 + Math.random() * 1.4,
      kind: Math.random(),
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
      particles = Array.from({ length: count }, createParticle);
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
      // Occupy the negative space next to the headline, not the project diagram.
      // The engineering diagram has its own opaque foreground surface and must
      // never be painted over by the smoke canvas.
      const centerX = width * (mobile ? .50 : .435);
      const centerY = height * (mobile ? .41 : .52);
      const spreadX = Math.min(width * (mobile ? .40 : .19), 260);
      const spreadY = Math.min(height * (mobile ? .31 : .31), 260);
      const settle = 1 - Math.exp(-dt * (pointer.inside ? 8 : 3.5));
      const cursorRadius = pointer.down ? 300 : 255;
      ctx.globalCompositeOperation = dark ? 'screen' : 'source-over';

      for (const p of particles) {
        const spin = p.angle + time * (.085 + p.depth * .060) * p.speed;
        const r = p.radius + Math.sin(p.phase + time * .22) * .022;
        const a = spin + (1 - r) * 1.75;
        // Asymmetric wandering contours create soft volumetric folds and depth.
        const fold = Math.sin(a * 3.1 + time * .24 + p.phase) * 21 * p.depth;
        const anchorX = centerX + Math.cos(a) * spreadX * r + fold;
        const anchorY = centerY + Math.sin(a) * spreadY * r
          + Math.cos(a * 2 - time * .17 + p.phase) * 19 * p.depth;

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

        // Soft translucent dots overlap into a cloud, instead of tracing neon lines.
        const sprite = p.kind < .26 ? highlight : mist;
        const spotSize = (14 + p.size * 34) * (.55 + p.depth * .9);
        const lit = Math.min(1, influence * (1 + pointer.speed * .25));
        ctx.globalAlpha = (dark ? .245 : .16) * (.35 + p.depth * .7) * (1 + lit * .48);
        ctx.drawImage(sprite, p.x - spotSize / 2, p.y - spotSize / 2, spotSize, spotSize);

        // Golden light blooms *on* the existing cloud near the cursor.
        if (lit > .03) {
          const glowSize = spotSize * (1.10 + lit * .60);
          ctx.globalAlpha = (dark ? .46 : .32) * lit;
          ctx.drawImage(brightGold, p.x - glowSize / 2, p.y - glowSize / 2, glowSize, glowSize);
        }

        // Sparse sharp details distinguish warm dust from an empty blur.
        if (p.kind > .955) {
          const size = .55 + p.depth * 1.3;
          ctx.fillStyle = lit > .08 ? dustColor : (dark ? '#DBC8A7' : '#79694F');
          ctx.globalAlpha = (dark ? .43 : .30) + lit * .45;
          ctx.fillRect(p.x, p.y, size, size);
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
        halo.addColorStop(0, hexRGBA(dustColor, dark ? .13 : .075));
        halo.addColorStop(.5, hexRGBA(dustColor, dark ? .055 : .035));
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
