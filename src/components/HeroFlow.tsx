import { useEffect, useRef } from 'react';
import { animateHero } from '../utils/heroMotion';

// 34 samples / 33 segments, fully covered by eleven fading groups.
const TRAIL_POINTS = 34;
const FADE_GROUPS = 11;
const SPEED_MULTIPLIER = 3;
const SEGMENTS_PER_GROUP = 3;
const STREAMLINE_COUNT_DESKTOP = 22;
const STREAMLINE_COUNT_MOBILE = 13;
const STREAMLINE_STEPS = 52;

type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; amber: boolean; trail: Float32Array; head: number; filled: number };

/** Decorative, hero-contained flow; no React updates, pointer capture or external assets. */
export function HeroFlow({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!, hero = canvas.parentElement!;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let width = 1, height = 1, ratio = 1, particles: Particle[] = [];
    let accent = '#3B82F6', secondary = '#7C8CFF', highlight = '#DCEBFF', lightTheme = false;
    let bounds = hero.getBoundingClientRect();
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, speed: 0, at: 0, inside: false };
    const colors = () => {
      const style = getComputedStyle(hero);
      accent = style.getPropertyValue('--particle').trim();
      secondary = style.getPropertyValue('--particle-secondary').trim() || '#7C8CFF';
      highlight = style.getPropertyValue('--particle-highlight').trim() || '#DCEBFF';
      lightTheme = document.documentElement.dataset.theme === 'light';
      ctx.clearRect(0, 0, width, height);
    };
    const spawn = (existing?: Particle): Particle => {
      // Recycling reuses both the particle and its buffer; allocations occur only at resize.
      const p = existing || { x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0, amber: false,
        trail: new Float32Array(TRAIL_POINTS * 2), head: 0, filled: 0 };
      p.x = Math.random() * width; p.y = Math.random() * height;
      p.vx = 0; p.vy = 0; p.age = 0;
      p.life = 10 + Math.random() * 12; p.amber = Math.random() < .12;
      p.head = 0; p.filled = 0;
      return p;
    };
    const resize = () => {
      bounds = hero.getBoundingClientRect();
      width = hero.clientWidth; height = hero.clientHeight;
      ratio = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const baseCount = width < 700 ? 40 : Math.min(115, Math.round(width * height / 12500));
      const count = Math.round(baseCount * 2.5) * 2;
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
    // Connected, luminous ribbons complement the existing fast particle field.
    // The pointer displaces actual curve geometry, not merely its brightness.
    const drawStreamlines = (time: number) => {
      const count = width < 700 ? STREAMLINE_COUNT_MOBILE : STREAMLINE_COUNT_DESKTOP;
      const xStart = -width * 0.10, xEnd = width * 1.10;
      const span = xEnd - xStart;
      const phase = time * 0.62;
      const centerY = height * (width < 700 ? 0.72 : 0.70);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let strand = 0; strand < count; strand++) {
        const lane = strand / (count - 1) - 0.5;
        let previousX = 0, previousY = 0, moteX = 0, moteY = 0;
        const moteAt = (time * 0.095 + strand * 0.137) % 1;
        ctx.beginPath();
        for (let step = 0; step <= STREAMLINE_STEPS; step++) {
          const along = step / STREAMLINE_STEPS;
          const x = xStart + span * along;
          const wave =
            Math.sin(along * 7.4 - phase + lane * 1.6) * (23 + Math.abs(lane) * 28) +
            Math.sin(along * 12.8 + phase * 0.54 + lane * 2) * 11;
          let px = x;
          let py = centerY + lane * Math.min(150, height * 0.22) + wave;
          if (pointer.inside) {
            const dx = px - pointer.x, dy = py - pointer.y;
            const distance = Math.hypot(dx, dy);
            const radius = width < 700 ? 145 : 205;
            if (distance < radius) {
              const falloff = (1 - distance / radius) ** 2;
              const inv = 1 / Math.max(28, distance);
              const disturbance = (54 + pointer.speed * 52) * falloff;
              px += dx * inv * disturbance - dy * inv * pointer.speed * 23 * falloff;
              py += dy * inv * disturbance + dx * inv * pointer.speed * 23 * falloff;
              px += pointer.vx * 45 * falloff;
              py += pointer.vy * 45 * falloff;
            }
          }
          if (step === 0) ctx.moveTo(px, py);
          else {
            const midX = (previousX + px) * 0.5;
            const midY = (previousY + py) * 0.5;
            ctx.quadraticCurveTo(previousX, previousY, midX, midY);
            if (moteAt >= (step - 1) / STREAMLINE_STEPS && moteAt < along) {
              const fraction = moteAt * STREAMLINE_STEPS - (step - 1);
              moteX = previousX + (px - previousX) * fraction;
              moteY = previousY + (py - previousY) * fraction;
            }
          }
          previousX = px;
          previousY = py;
        }
        ctx.lineTo(previousX, previousY);
        const prominence = 1 - Math.abs(lane) * 0.55;
        // Three intentionally distinct passes: atmospheric light, tinted
        // luminous glass, and an optically sharp filament.
        ctx.strokeStyle = secondary;
        ctx.shadowColor = secondary;
        ctx.shadowBlur = lightTheme ? 7 : 17;
        ctx.lineWidth = lightTheme ? 3.5 : 4.5;
        ctx.globalAlpha = prominence * (lightTheme ? 0.12 : 0.17);
        ctx.stroke();
        ctx.shadowBlur = lightTheme ? 3 : 7;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.55;
        ctx.globalAlpha = prominence * (lightTheme ? 0.34 : 0.40);
        ctx.stroke();
        ctx.shadowBlur = lightTheme ? 0 : 3;
        ctx.strokeStyle = strand % 4 === 0 && !lightTheme ? highlight : accent;
        ctx.lineWidth = strand % 4 === 0 ? 0.9 : 0.72;
        ctx.globalAlpha = prominence * (lightTheme ? 0.65 : 0.68);
        ctx.stroke();
        if (strand % 2 === 0) {
          ctx.beginPath();
          ctx.arc(moteX, moteY, strand % 4 === 0 ? 1.8 : 1.25, 0, Math.PI * 2);
          ctx.fillStyle = lightTheme ? accent : highlight;
          ctx.shadowColor = lightTheme ? accent : highlight;
          ctx.shadowBlur = lightTheme ? 5 : 12;
          ctx.globalAlpha = lightTheme ? 0.78 : 0.91;
          ctx.fill();
        }
      }
      ctx.restore();
    };
    const draw = (dt: number, time: number) => {
      if (ratio !== Math.min(devicePixelRatio || 1, 1.75)) resize();
      // Redraw bounded trails: alpha decay on an 8-bit canvas otherwise leaves persistent ghosts.
      ctx.clearRect(0, 0, width, height);
      drawStreamlines(time);
      ctx.lineCap = 'round'; ctx.lineWidth = 1.3;
      pointer.speed *= Math.exp(-dt * 3.5);
      pointer.vx *= Math.exp(-dt * 3.5); pointer.vy *= Math.exp(-dt * 3.5);
      const travel = dt * SPEED_MULTIPLIER;
      for (const p of particles) {
        p.age += dt;
        if (p.age >= p.life || p.x < -20 || p.x > width + 20 || p.y < -20 || p.y > height + 20) spawn(p);
        const angle = .55 + Math.sin(p.x * .004 + time * .09) * 1.2 + Math.cos(p.y * .005 - time * .07) * .85;
        let vx = Math.cos(angle) * 32, vy = Math.sin(angle) * 32;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = pointer.inside ? Math.hypot(dx, dy) : 0;
        const influence = pointer.inside ? Math.max(0, 1 - distance / 165) ** 2 : 0;
        const force = influence * (38 + pointer.speed * 85);
        vx += (-dy / Math.max(12, distance)) * force + pointer.vx * influence * 10;
        vy += (dx / Math.max(12, distance)) * force + pointer.vy * influence * 10;
        const ease = 1 - Math.exp(-dt * 4);
        p.vx += (vx - p.vx) * ease; p.vy += (vy - p.vy) * ease;
        p.x += p.vx * travel; p.y += p.vy * travel;
        const envelope = Math.min(1, p.age / 1.3, (p.life - p.age) / 1.5);
        p.head = (p.head + 1) % TRAIL_POINTS;
        p.trail[p.head * 2] = p.x; p.trail[p.head * 2 + 1] = p.y;
        p.filled = Math.min(TRAIL_POINTS, p.filled + 1);
        ctx.strokeStyle = p.amber ? secondary : accent;
        // Cache per-particle brightness; skip invisible/newborn trails at the higher count.
        const opacity = envelope * Math.min(.75, .60 + influence * pointer.speed * .2);
        if (opacity < .001 || p.filled < 2) continue;
        for (let group = 0; group < FADE_GROUPS; group++) {
          const first = group * SEGMENTS_PER_GROUP;
          if (first >= p.filled - 1) break;
          ctx.globalAlpha = opacity * (1 - group / FADE_GROUPS);
          ctx.beginPath();
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
