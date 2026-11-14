import { useEffect, useRef } from 'react';
import { animateHero } from '../utils/heroMotion';

// All sparks belong to one coherent luminous ribbon; there is no independent
// Magnetic Streamlines particle field.
const STRANDS_DESKTOP = 26;
const STRANDS_MOBILE = 15;
const STRAND_STEPS = 66;
const STARS_DESKTOP = 220;
const STARS_MOBILE = 105;

type Star = {
  u: number;
  lane: number;
  speed: number;
  phase: number;
  frequency: number;
  size: number;
  kind: 0 | 1 | 2; // ordinary star, comet, or four-point sparkle
};

type Point = { x: number; y: number };

const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));
const smoothstep = (value: number) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

/** Hero-only, non-intercepting canvas: a coherent river of moving starlight. */
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
    let stars: Star[] = [];
    let accent = '#3B82F6';
    let secondary = '#7C8CFF';
    let highlight = '#DCEBFF';
    let lightTheme = false;
    let bounds = hero.getBoundingClientRect();

    const pointer = {
      x: -1000, y: -1000,
      targetX: -1000, targetY: -1000,
      vx: 0, vy: 0, speed: 0, at: 0,
      inside: false, presence: 0,
    };

    const point: Point = { x: 0, y: 0 };
    const previous: Point = { x: 0, y: 0 };

    const colors = () => {
      const style = getComputedStyle(hero);
      accent = style.getPropertyValue('--particle').trim() || '#3B82F6';
      secondary = style.getPropertyValue('--particle-secondary').trim() || '#7C8CFF';
      highlight = style.getPropertyValue('--particle-highlight').trim() || '#DCEBFF';
      lightTheme = document.documentElement.dataset.theme === 'light';
      ctx.clearRect(0, 0, width, height);
    };

    const resize = () => {
      bounds = hero.getBoundingClientRect();
      width = Math.max(1, hero.clientWidth);
      height = Math.max(1, hero.clientHeight);
      ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      const count = width < 700 ? STARS_MOBILE : STARS_DESKTOP;
      stars = Array.from({ length: count }, (_, i): Star => ({
        u: Math.random(),
        lane: (Math.random() * 2 - 1) * (i % 4 === 0 ? .32 : .95),
        speed: .038 + Math.random() * .075,
        phase: Math.random() * Math.PI * 2,
        frequency: 1.5 + Math.random() * 3.5,
        size: .7 + Math.random() * (i % 19 === 0 ? 2.3 : 1.15),
        kind: i % 19 === 0 ? 2 : i % 6 === 0 ? 1 : 0,
      }));
      colors();
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const now = performance.now();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const delta = Math.max(8, now - pointer.at);

      if (pointer.inside) {
        pointer.vx = (x - pointer.targetX) / delta;
        pointer.vy = (y - pointer.targetY) / delta;
        pointer.speed = Math.min(2.4, Math.hypot(pointer.vx, pointer.vy));
      } else {
        pointer.x = x;
        pointer.y = y;
        pointer.vx = 0;
        pointer.vy = 0;
        pointer.speed = 0;
      }

      pointer.targetX = x;
      pointer.targetY = y;
      pointer.at = now;
      pointer.inside = true;
    };

    const leave = () => { pointer.inside = false; };
    const scroll = () => {
      bounds = hero.getBoundingClientRect();
      pointer.inside = false;
    };

    // One S-shaped trajectory: a low, luminous valley rises toward the right.
    // This composition keeps the headline largely clear, unlike the old field.
    const waveY = (u: number, time: number) => {
      const valley = .15 * Math.exp(-((u - .40) / .235) ** 2);
      const lift = .34 * smoothstep((u - .43) / .55);
      const breathing = .009 * Math.sin(u * 6.0 - time * .42)
        + .004 * Math.sin(u * 12.0 + time * .24);
      return height * (.65 + valley - lift + breathing);
    };

    // Calculates point and normal offset without allocating objects each frame.
    // The same mapping guides both ribbons and every individual star.
    const positionAt = (u: number, lane: number, time: number, out: Point) => {
      const x = width * (-.07 + 1.14 * u);
      const y = waveY(u, time);
      const gradient = (waveY(u + .004, time) - waveY(u - .004, time))
        / (width * 1.14 * .008);
      const inv = 1 / Math.sqrt(1 + gradient * gradient);
      const spread = Math.min(150, height * (width < 700 ? .10 : .145))
        * (.72 + .52 * smoothstep((u - .45) / .55));
      const offset = lane * spread;
      out.x = x - gradient * inv * offset;
      out.y = y + inv * offset
        + lane * 2.8 * Math.sin(u * 8.5 + time * .36 + lane * 3.2);

      // Real geometric bending, with smooth distance falloff and decay on leave.
      if (pointer.presence > .002) {
        const dx = out.x - pointer.x;
        const dy = out.y - pointer.y;
        const radius = width < 700 ? 135 : 205;
        const distance = Math.hypot(dx, dy);
        if (distance < radius) {
          const effect = (1 - distance / radius) ** 2 * pointer.presence;
          const push = (43 + pointer.speed * 22) * effect / Math.max(distance, 32);
          const swirl = pointer.speed * 16 * effect / Math.max(distance, 55);
          out.x += dx * push - dy * swirl + pointer.vx * effect * 24;
          out.y += dy * push + dx * swirl + pointer.vy * effect * 24;
        }
      }
    };

    const drawStrands = (time: number) => {
      const count = width < 700 ? STRANDS_MOBILE : STRANDS_DESKTOP;
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = lightTheme ? 'source-over' : 'screen';

      for (let strand = 0; strand < count; strand++) {
        const lane = (strand / (count - 1) - .5) * 2;
        const proximity = 1 - Math.abs(lane);
        ctx.beginPath();
        for (let i = 0; i <= STRAND_STEPS; i++) {
          const u = i / STRAND_STEPS;
          positionAt(u, lane, time, point);
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }

        // A few bright core filaments are surrounded by softer outer strands.
        if (proximity > .68) {
          ctx.strokeStyle = secondary;
          ctx.shadowColor = accent;
          ctx.shadowBlur = lightTheme ? 15 : 28;
          ctx.lineWidth = 8 + proximity * 6;
          ctx.globalAlpha = lightTheme ? .075 : .13;
          ctx.stroke();
        }
        ctx.shadowBlur = proximity > .55 ? (lightTheme ? 5 : 13) : 0;
        ctx.strokeStyle = strand % 4 === 0 ? secondary : accent;
        ctx.lineWidth = proximity > .68 ? 1.6 : .75;
        ctx.globalAlpha = (lightTheme ? .24 : .22) + proximity * (lightTheme ? .35 : .42);
        ctx.stroke();

        // Thin white-blue optical highlights at the heart of the stream.
        if (proximity > .70 && strand % 2 === 0) {
          ctx.strokeStyle = lightTheme ? accent : highlight;
          ctx.shadowBlur = lightTheme ? 1 : 9;
          ctx.lineWidth = .8 + proximity * .55;
          ctx.globalAlpha = lightTheme ? .54 : .66;
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawStars = (dt: number, time: number) => {
      ctx.save();
      ctx.globalCompositeOperation = lightTheme ? 'source-over' : 'screen';
      ctx.lineCap = 'round';

      for (const star of stars) {
        star.u += star.speed * dt;
        if (star.u > 1) star.u -= 1;
        positionAt(star.u, star.lane, time, point);

        const twinkle = .5 + .5 * Math.sin(time * star.frequency + star.phase);
        const opacity = (.25 + twinkle * .68) * (lightTheme ? .84 : 1);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = lightTheme ? accent : highlight;
        ctx.shadowBlur = 0;

        if (star.kind === 1) {
          // Very short comet-like streaks moving tangentially along the wave.
          positionAt(Math.max(0, star.u - .012), star.lane, time, previous);
          ctx.beginPath();
          ctx.strokeStyle = lightTheme ? accent : highlight;
          ctx.lineWidth = star.size * .65;
          ctx.moveTo(previous.x, previous.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        if (star.kind === 2) {
          const flare = Math.pow(twinkle, 5);
          ctx.shadowColor = accent;
          ctx.shadowBlur = lightTheme ? 8 : 19;
          ctx.beginPath();
          ctx.arc(point.x, point.y, star.size * (.7 + flare * .6), 0, Math.PI * 2);
          ctx.fill();
          // Rare four-point glints; smooth brightness oscillation, never flicker.
          if (flare > .14) {
            const arms = star.size * (1.4 + 2.2 * flare);
            ctx.strokeStyle = lightTheme ? accent : highlight;
            ctx.lineWidth = .7;
            ctx.globalAlpha = flare * (lightTheme ? .60 : .90);
            ctx.beginPath();
            ctx.moveTo(point.x - arms, point.y);
            ctx.lineTo(point.x + arms, point.y);
            ctx.moveTo(point.x, point.y - arms);
            ctx.lineTo(point.x, point.y + arms);
            ctx.stroke();
          }
        } else {
          ctx.beginPath();
          ctx.arc(point.x, point.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const draw = (dt: number, time: number) => {
      if (ratio !== Math.min(window.devicePixelRatio || 1, 1.6)) resize();
      ctx.clearRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-dt * 11));
      pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-dt * 11));
      pointer.presence += ((pointer.inside ? 1 : 0) - pointer.presence)
        * (1 - Math.exp(-dt * 4.2));
      pointer.speed *= Math.exp(-dt * 4);
      pointer.vx *= Math.exp(-dt * 4);
      pointer.vy *= Math.exp(-dt * 4);
      drawStrands(time);
      drawStars(dt, time);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    const theme = new MutationObserver(colors);
    theme.observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme'],
    });
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });

    const stop = paused ? () => {} : animateHero(hero, draw);
    return () => {
      stop();
      resizeObserver.disconnect();
      theme.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [paused]);

  return <canvas className="hero-flow" ref={ref} aria-hidden="true" />;
}
