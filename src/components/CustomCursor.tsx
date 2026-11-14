import { useEffect, useRef } from "react";

type Point = { x: number; y: number; time: number };

export function CustomCursor() {
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = overlay.current!;
    const dot = root.querySelector<HTMLElement>(".cursor-dot")!;
    const ring = root.querySelector<HTMLElement>(".cursor-ring")!;
    const aura = root.querySelector<HTMLElement>(".cursor-aura")!;
    const label = root.querySelector<HTMLElement>(".cursor-label")!;
    const canvas = root.querySelector("canvas")!;
    const ctx = canvas.getContext("2d");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const size = 320, ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = canvas.height = size * ratio;
    ctx?.scale(ratio, ratio);
    let x = 0, y = 0, rx = 0, ry = 0, gx = 0, gy = 0, shown = false, down = false, heroZone = false;
    let frame = 0, lastFrame = 0, released = 0, speed = 0;
    let points: Point[] = [];
    let hoverLabel = "";
    let tailColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const themeObserver = new MutationObserver(() => {
      tailColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const native = "input, textarea, select, [contenteditable]:not([contenteditable='false']), iframe, video";
    const enabled = () => fine.matches && !reduced.matches;
    const position = (el: HTMLElement, px: number, py: number) => {
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    };
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      shown = down = heroZone = false;
      root.dataset.zone = "default";
      points = [];
      speed = 0;
      root.dataset.visible = "false";
      root.dataset.dragging = "false";
      document.documentElement.classList.remove("custom-cursor-active");
      ctx?.clearRect(0, 0, size, size);
    };
    const drawTail = (now: number) => {
      if (!ctx) return false;
      ctx.clearRect(0, 0, size, size);
      if (down) points = points.filter(p => now - p.time < 170);
      const fade = down ? 1 : Math.max(0, 1 - (now - released) / 250);
      if (fade <= 0) { points = []; return false; }
      if (points.length < 2) return false;
      const head = points[points.length - 1];
      canvas.style.transform = `translate3d(${head.x - size / 2}px, ${head.y - size / 2}px, 0)`;
      // A short bounded path, not particles or a blurred full-screen surface.
      const limit = 18 + Math.min(speed, 2.5) * 38;
      let distance = 0;
      ctx.lineCap = "round";
      for (let i = points.length - 1; i > 0; i--) {
        const a = points[i], b = points[i - 1];
        distance += Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > limit) break;
        const taper = Math.max(0, 1 - distance / limit);
        const age = Math.max(0, 1 - ((down ? now : released) - a.time) / 170);
        const alpha = fade * age * taper * (.45 + Math.min(speed, 2.5) * .15);
        for (const [width, opacity] of [[7, .1], [3, .3], [1.2, .85]]) {
          ctx.strokeStyle = tailColor;
          ctx.globalAlpha = alpha * opacity;
          ctx.lineWidth = width * (.45 + taper * .55);
          ctx.beginPath();
          ctx.moveTo(a.x - head.x + size / 2, a.y - head.y + size / 2);
          ctx.lineTo(b.x - head.x + size / 2, b.y - head.y + size / 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      return down || fade > 0;
    };
    const tick = (now: number) => {
      frame = 0;
      if (!shown) return;
      const step = Math.min(now - lastFrame || 16, 40);
      const ease = 1 - Math.exp(-step / 65);
      const glowEase = 1 - Math.exp(-step / 115);
      lastFrame = now;
      rx += (x - rx) * ease;
      ry += (y - ry) * ease;
      gx += (x - gx) * glowEase;
      gy += (y - gy) * glowEase;
      position(ring, rx, ry);
      position(aura, gx - 130, gy - 130);
      const tail = drawTail(now);
      if (tail || Math.hypot(x - rx, y - ry) > .1 || Math.hypot(x - gx, y - gy) > .2)
        frame = requestAnimationFrame(tick);
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(tick); };
    const move = (e: PointerEvent) => {
      if (!enabled() || e.pointerType !== "mouse") { clear(); return; }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest(native)) { clear(); return; }
      x = e.clientX; y = e.clientY;
      // Suppress the glow while hovering over the hero, without affecting
      // the normal cursor, hover labels, or the aura in the rest of the site.
      heroZone = !!el.closest(".home");
      root.dataset.zone = heroZone ? "hero" : "default";
      if (!shown) { rx = x; ry = y; gx = x; gy = y; lastFrame = performance.now(); }
      shown = true;
      root.dataset.visible = "true";
      document.documentElement.classList.add("custom-cursor-active");
      position(dot, x, y);
      position(label, x, y);
      const action = el.closest("a, button, [role='button'], summary");
      const drag = !action && !!el.closest(".globe-canvas, .cinema");
      const play = action && /demo|play|start|replay|simulation/i.test(action.getAttribute("aria-label") || action.textContent || "");
      hoverLabel = drag ? "DRAG" : play ? "PLAY" : action?.matches("a") ? "VIEW" : "";
      const nextLabel = down ? "DRAG" : hoverLabel;
      if (label.textContent !== nextLabel) label.textContent = nextLabel;
      root.dataset.hover = String(!!action || drag);
      if (down && e.buttons !== 1) release();
      // Retain only the original drag trail; no automatic hero cursor streak.
      if (down) {
        const now = performance.now(), previous = points[points.length - 1];
        if (previous) {
          const travel = Math.hypot(x - previous.x, y - previous.y);
          speed = speed * .55 + Math.min(4, travel / Math.max(8, now - previous.time)) * .45;
          // Subdivide sparse pointer samples so a quick drag still draws a smooth streak.
          const steps = Math.min(12, Math.max(1, Math.ceil(travel / 8)));
          for (let i = 1; i <= steps; i++) points.push({ x: previous.x + (x - previous.x) * i / steps, y: previous.y + (y - previous.y) * i / steps, time: now });
        } else points.push({ x, y, time: now });
        points = points.slice(-40);
      }
      request();
    };
    const press = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType !== "mouse" || !enabled() || (e.target as Element).closest(native)) return;
      move(e);
      if (!shown) return;
      down = true;
      speed = 0;
      released = 0;
      points = [{ x, y, time: performance.now() }];
      root.dataset.dragging = "true";
    };
    const release = () => {
      if (!down) return;
      down = false;
      released = performance.now();
      root.dataset.dragging = "false";
      label.textContent = hoverLabel;
      request();
    };
    const leave = (e: PointerEvent) => { if (!e.relatedTarget) clear(); };
    const visibility = () => { if (document.hidden) clear(); };
    const keyboard = (e: KeyboardEvent) => { if (e.key === "Tab") clear(); };
    document.addEventListener("pointermove", move, { passive: true, capture: true });
    document.addEventListener("pointerdown", press, { passive: true, capture: true });
    document.addEventListener("pointerup", release, true);
    document.addEventListener("pointercancel", clear, true);
    document.addEventListener("pointerout", leave);
    document.addEventListener("keydown", keyboard);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", clear);
    fine.addEventListener("change", clear);
    reduced.addEventListener("change", clear);
    return () => {
      clear();
      themeObserver.disconnect();
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerdown", press, true);
      document.removeEventListener("pointerup", release, true);
      document.removeEventListener("pointercancel", clear, true);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", clear);
      fine.removeEventListener("change", clear);
      reduced.removeEventListener("change", clear);
    };
  }, []);
  return (
    <div ref={overlay} className="custom-cursor" aria-hidden="true" data-visible="false">
      <span className="cursor-aura" />
      <canvas className="cursor-comet" />
      <span className="cursor-ring" />
      <span className="cursor-dot" />
      <span className="cursor-label" />
    </div>
  );
}
