import { useEffect, useRef } from 'react';
import { animateHero } from '../utils/heroMotion';

// 22 samples / 21 segments: 40% longer than the previous 15-segment trail.
const TRAIL_POINTS = 22;
const FADE_GROUPS = 7;
const SEGMENTS_PER_GROUP = 3;

type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; amber: boolean; trail: Float32Array; head: number; filled: number };

/** Decorative, hero-contained flow; no React updates, pointer capture or external assets. */
export function HeroFlow({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!, hero = canvas.parentElement!;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let width = 1, height = 1, ratio = 1, particles: Particle[] = [];
    let accent = '#60A5FA', editorial = accent;
    let bounds = hero.getBoundingClientRect();
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, speed: 0, at: 0, inside: false };
    const colors = () => {
      const style = getComputedStyle(hero);
      accent = style.getPropertyValue('--particle').trim();
      editorial = style.getPropertyValue('--editorial').trim();
      ctx.clearRect(0, 0, width, height);
    };
    const spawn = (p?: Particle): Particle => Object.assign(p || {}, {
      x: Math.random() * width, y: Math.random() * height,
      vx: 0, vy: 0, age: 0, life: 10 + Math.random() * 12, amber: Math.random() < .12,
      trail: p?.trail || new Float32Array(TRAIL_POINTS * 2), head: 0, filled: 0,
    }) as Particle;
    const resize = () => {
      bounds = hero.getBoundingClientRect();
      width = hero.clientWidth; height = hero.clientHeight;
      ratio = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const baseCount = width < 700 ? 40 : Math.min(115, Math.round(width * height / 12500));
      const count = Math.round(baseCount * 2.5);
      particles = Array.from({ length: count }, () => { const p = spawn(); p.age = Math.random() * p.life; return p; });
      colors();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now(), x = e.clientX - bounds.left, y = e.clientY - bounds.top;
      const dt = Math.max(8, now - pointer.at);
      if (pointer.inside) {
        pointer.vx = (x - pointer.x) / dt;
        pointer.vy = (y - pointer.y) / dt;
        pointer.speed = Math.min(2.8, Math.hypot(pointer.vx, pointer.vy));
      }
      Object.assign(pointer, { x, y, at: now, inside: true });
    };
    const leave = () => { pointer.inside = false; };
    const scroll = () => { bounds = hero.getBoundingClientRect(); pointer.inside = false; };
    const draw = (dt: number, time: number) => {
      if (ratio !== Math.min(devicePixelRatio || 1, 1.75)) resize();
      // Redraw bounded trails: alpha decay on an 8-bit canvas otherwise leaves persistent ghosts.
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round'; ctx.lineWidth = 1.3;
      pointer.speed *= Math.exp(-dt * 3.5);
      pointer.vx *= Math.exp(-dt * 3.5); pointer.vy *= Math.exp(-dt * 3.5);
      for (const p of particles) {
        p.age += dt;
        if (p.age >= p.life || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) spawn(p);
        const angle = .55 + Math.sin(p.x * .004 + time * .09) * 1.2 + Math.cos(p.y * .005 - time * .07) * .85;
        let vx = Math.cos(angle) * 32, vy = Math.sin(angle) * 32;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = Math.hypot(dx, dy);
        const influence = pointer.inside ? Math.max(0, 1 - distance / 165) ** 2 : 0;
        const force = influence * (38 + pointer.speed * 85);
        vx += (-dy / Math.max(12, distance)) * force + pointer.vx * influence * 10;
        vy += (dx / Math.max(12, distance)) * force + pointer.vy * influence * 10;
        const ease = 1 - Math.exp(-dt * 4);
        p.vx += (vx - p.vx) * ease; p.vy += (vy - p.vy) * ease;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const envelope = Math.min(1, p.age / 1.3, (p.life - p.age) / 1.5);
        p.head = (p.head + 1) % TRAIL_POINTS;
        p.trail[p.head * 2] = p.x; p.trail[p.head * 2 + 1] = p.y;
        p.filled = Math.min(TRAIL_POINTS, p.filled + 1);
        ctx.strokeStyle = p.amber ? editorial : accent;
        // Seven gradual fade steps, fixed storage and no per-frame allocation.
        for (let group = 0; group < FADE_GROUPS; group++) {
          ctx.globalAlpha = envelope * Math.min(.75, .60 + influence * pointer.speed * .2) * (1 - group / FADE_GROUPS);
          ctx.beginPath();
          const first = group * SEGMENTS_PER_GROUP;
          if (first >= p.filled - 1) continue;
          for (let k = first; k <= Math.min(first + SEGMENTS_PER_GROUP, p.filled - 1); k++) {
            const index = ((p.head - k + TRAIL_POINTS) % TRAIL_POINTS) * 2;
            if (k === first) ctx.moveTo(p.trail[index], p.trail[index + 1]);
            else ctx.lineTo(p.trail[index], p.trail[index + 1]);
          }
          ctx.stroke();
        }
      }
      if (pointer.inside && pointer.speed > .18) {
        ctx.strokeStyle = accent;
        ctx.globalAlpha = Math.min(.12, pointer.speed * .045);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pointer.x - pointer.vx * 23, pointer.y - pointer.vy * 23);
        ctx.quadraticCurveTo(pointer.x - pointer.vx * 9 - pointer.vy * 3, pointer.y - pointer.vy * 9 + pointer.vx * 3, pointer.x, pointer.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(hero);
    const theme = new MutationObserver(colors); theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    const stop = paused ? () => {} : animateHero(hero, draw);
    return () => {
      stop(); resizeObserver.disconnect(); theme.disconnect();
      hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, width, height);
    };
  }, [paused]);
  return <canvas className="hero-flow" ref={ref} aria-hidden="true" />;
}
