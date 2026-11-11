import { useEffect, useRef, useState } from "react";
import {
  project,
  wrapLongitude,
  clampTilt,
  advanceRotation,
  NEPAL,
  type Coordinate,
} from "../utils/globeMath";
import { createLandRenderer } from "../utils/globeRaster";
export default function Globe() {
  const canvas = useRef<HTMLCanvasElement>(null),
    marker = useRef<HTMLButtonElement>(null);
  const engine = useRef({
    lon: 84,
    tilt: 20,
    velocity: 0,
    tiltVelocity: 0,
    pointer: -1,
    movedAt: 0,
    locate: null as null | { lon: number; tilt: number; elapsed: number },
    drag: false,
    hold: false,
    auto: true,
    dirty: true,
    x: 0,
    y: 0,
  });
  const [paused, setPaused] = useState(false),
    [reduced, setReduced] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    [info, setInfo] = useState(false);
  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    const ctx = surface.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motion.matches,
      visible = false,
      alive = true,
      frame = 0,
      previous = 0,
      rings: Coordinate[][] = [],
      size = 440;
    let renderLand: ReturnType<typeof createLandRenderer> | undefined;
    let colors = {
      ocean: "#171922",
      land: "#aab5d4",
      line: "#59617d",
      accent: "#b5bcff",
      shadow: "#08090f",
    };
    const abort = new AbortController();
    const state = engine.current;
    function palette() {
      const css = getComputedStyle(surface!);
      colors = {
        ocean: css.getPropertyValue("--globe-ocean").trim(),
        land: css.getPropertyValue("--globe-land").trim(),
        line: css.getPropertyValue("--globe-grid").trim(),
        accent: css.getPropertyValue("--accent").trim(),
        shadow: css.getPropertyValue("--globe-shadow").trim(),
      };
      state.dirty = true;
      wake();
    }
    function draw() {
      if (!ctx) return;
      const dpr = surface!.width / size; // Match the allocated backing store after zoom/DPR changes.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const c = size / 2,
        r = size * 0.41;
      ctx.save();
      ctx.translate(c, c);
      const ocean = ctx.createRadialGradient(-r * 0.4, -r * 0.4, 0, 0, 0, r);
      ocean.addColorStop(0, colors.line);
      ocean.addColorStop(0.65, colors.ocean);
      ocean.addColorStop(1, colors.shadow);
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = 0.45;
      const line = (coords: Coordinate[], coastline = false) => {
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < coords.length; i++) {
          const point = coords[i], previousPoint = coords[i - 1];
          // GeoJSON closes polar rings along the dateline. Those edges are not coastlines.
          if (coastline && previousPoint &&
              ((Math.abs(point[0]) >= 179.99 && Math.abs(previousPoint[0]) >= 179.99) ||
               Math.abs(point[1]) >= 89.99 || Math.abs(previousPoint[1]) >= 89.99)) {
            pen = false;
            continue;
          }
          const [x, y, z] = project(point, state.lon, state.tilt);
          if (z < 0) {
            pen = false;
            continue;
          }
          if (!pen) {
            ctx.moveTo(x * r, -y * r);
            pen = true;
          } else ctx.lineTo(x * r, -y * r);
        }
        ctx.stroke();
      };
      for (let lat = -60; lat <= 60; lat += 30)
        line(
          Array.from(
            { length: 181 },
            (_, i) => [i * 2 - 180, lat] as Coordinate,
          ),
        );
      for (let lon = -180; lon < 180; lon += 30)
        line(
          Array.from({ length: 91 }, (_, i) => [lon, i * 2 - 90] as Coordinate),
        );
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.land;
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 0.6;
      if (renderLand) {
        ctx.drawImage(renderLand(state.lon, state.tilt, colors.land), -r, -r, r * 2, r * 2);
        // Coastlines are open front-facing segments; never close across the horizon.
        for (const ring of rings) line(ring, true);
      }
      const shade = ctx.createLinearGradient(-r, -r, r, r);
      shade.addColorStop(0, "#ffffff18");
      shade.addColorStop(0.45, "#00000000");
      shade.addColorStop(1, "#0000009c");
      ctx.fillStyle = shade;
      ctx.fillRect(-r, -r, 2 * r, 2 * r);
      ctx.restore();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.13, r * 0.28, -0.28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      const [mx, my, mz] = project(NEPAL, state.lon, state.tilt);
      if (marker.current) {
        marker.current.style.left = `${50 + mx * 41}%`;
        marker.current.style.top = `${50 - my * 41}%`;
        marker.current.hidden = mz < 0.05;
      }
      surface!.dataset.longitude = state.lon.toFixed(2);
      surface!.dataset.tilt = state.tilt.toFixed(2);
    }
    function tick(time: number) {
      frame = 0;
      if (!alive || !visible || document.hidden || !rings.length) return;
      const dt = Math.min(time - previous || 33, 60);
      if (time - previous < 32) {
        frame = requestAnimationFrame(tick);
        return;
      }
      previous = time;
      if (state.locate) {
        state.locate.elapsed += dt;
        const t = reducedMotion ? 1 : Math.min(1, state.locate.elapsed / 750);
        const ease = t * t * (3 - 2 * t);
        state.lon = wrapLongitude(state.locate.lon + wrapLongitude(NEPAL[0] - state.locate.lon) * ease);
        state.tilt = state.locate.tilt + (NEPAL[1] - state.locate.tilt) * ease;
        if (t === 1) state.locate = null;
      } else {
        const motionStep = advanceRotation(state.lon, state.velocity, dt, state.auto, reducedMotion, state.drag || state.hold);
        const tiltStep = advanceRotation(state.tilt, state.tiltVelocity, dt, false, reducedMotion, state.drag || state.hold);
        state.lon = motionStep.lon;
        state.velocity = motionStep.velocity;
        state.tilt = clampTilt(tiltStep.lon);
        state.tiltVelocity = Math.abs(state.tilt) >= 85 ? 0 : tiltStep.velocity;
      }
      draw();
      state.dirty = false;
      if (
        state.locate || state.drag ||
        (!reducedMotion && !state.hold && (state.auto || state.velocity !== 0 || state.tiltVelocity !== 0))
      )
        frame = requestAnimationFrame(tick);
    }
    function wake() {
      if (alive && visible && !document.hidden && !frame)
        frame = requestAnimationFrame(tick);
    }
    const changeMotion = () => {
      reducedMotion = motion.matches;
      setReduced(reducedMotion);
      state.velocity = 0;
      state.tiltVelocity = 0;
      state.dirty = true;
      wake();
    };
    changeMotion();
    const resize = new ResizeObserver((entries) => {
      size = Math.min(entries[0].contentRect.width, 560);
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      surface.width = Math.round(size * dpr);
      surface.height = Math.round(size * dpr);
      state.dirty = true;
      wake();
    });
    resize.observe(surface);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else {
          previous = 0;
          wake();
        }
      },
      { rootMargin: "80px" },
    );
    observer.observe(surface);
    const theme = new MutationObserver(palette);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    palette();
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        state.drag = false;
        state.velocity = 0;
        state.tiltVelocity = 0;
      } else {
        previous = 0;
        wake();
      }
    };
    const request = () => {
      state.dirty = true;
      wake();
    };
    surface.addEventListener("globe:draw", request);
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", changeMotion);
    fetch("assets/geo/land.json", { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Map unavailable");
        return r.json();
      })
      .then((data) => {
        if (!alive) return;
        rings = data;
        renderLand = createLandRenderer(rings, matchMedia("(pointer: coarse)").matches ? 256 : 384);
        setReady(true);
        wake();
      })
      .catch((e) => {
        if (e.name !== "AbortError") setFailed(true);
      });
    return () => {
      alive = false;
      abort.abort();
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      theme.disconnect();
      motion.removeEventListener("change", changeMotion);
      document.removeEventListener("visibilitychange", visibility);
      surface.removeEventListener("globe:draw", request);
    };
  }, []);
  function redraw() {
    canvas.current?.dispatchEvent(new Event("globe:draw"));
  }
  function rotate(amount: number) {
    engine.current.lon = wrapLongitude(engine.current.lon + amount);
    engine.current.velocity = 0;
    engine.current.tiltVelocity = 0;
    engine.current.locate = null;
    redraw();
  }
  function locateNepal() {
    const s = engine.current;
    s.velocity = s.tiltVelocity = 0;
    s.locate = { lon: s.lon, tilt: s.tilt, elapsed: 0 };
    redraw();
  }
  return (
    <div className="globe-interactive">
      <div className="globe-stage">
        <img
          aria-hidden={ready && !failed}
          className={
            ready && !failed ? "globe-fallback is-ready" : "globe-fallback"
          }
          src="assets/geo/globe-fallback.svg"
          width="440"
          height="440"
          alt="Globe centered on Asia, with Nepal marked approximately"
        />
        {!failed && (
          <canvas
            ref={canvas}
            className={ready ? "globe-canvas ready" : "globe-canvas"}
            aria-label="Interactive Earth. Drag horizontally or use arrow keys to rotate; use up and down to tilt."
            role="img"
            tabIndex={0}
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0) return;
              const s = engine.current;
              s.drag = true;
              s.pointer = e.pointerId;
              s.locate = null;
              s.velocity = s.tiltVelocity = 0;
              s.x = e.clientX;
              s.y = e.clientY;
              s.movedAt = performance.now();
              e.currentTarget.setPointerCapture(e.pointerId);
              redraw();
            }}
            onPointerMove={(e) => {
              const s = engine.current;
              if (!s.drag || s.pointer !== e.pointerId) return;
              const now = performance.now(), dt = Math.max(8, now - s.movedAt);
              const dx = e.clientX - s.x, dy = e.clientY - s.y;
              s.lon = wrapLongitude(s.lon - dx * .35);
              s.tilt = clampTilt(s.tilt + dy * .25);
              s.velocity = reduced ? 0 : Math.max(-4, Math.min(4, -dx * .35 * 16 / dt));
              s.tiltVelocity = reduced ? 0 : Math.max(-2, Math.min(2, dy * .25 * 16 / dt));
              s.x = e.clientX;
              s.y = e.clientY;
              s.movedAt = now;
              redraw();
            }}
            onPointerUp={(e) => {
              const s = engine.current;
              if (s.pointer !== e.pointerId) return;
              s.drag = false;
              s.pointer = -1;
              // Holding still before release must not fling using an old sample.
              if (performance.now() - s.movedAt > 90) s.velocity = s.tiltVelocity = 0;
              if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
              redraw();
            }}
            onPointerCancel={() => {
              const s = engine.current;
              s.drag = false;
              s.pointer = -1;
              s.velocity = s.tiltVelocity = 0;
              redraw();
            }}
            onLostPointerCapture={() => {
              if (!engine.current.drag) return;
              engine.current.drag = false;
              engine.current.velocity = engine.current.tiltVelocity = 0;
              redraw();
            }}
            onKeyDown={(e) => {
              if (
                [
                  "ArrowLeft",
                  "ArrowRight",
                  "ArrowUp",
                  "ArrowDown",
                  "Home",
                ].includes(e.key)
              ) {
                e.preventDefault();
                if (e.key === "Home") {
                  locateNepal();
                } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  engine.current.locate = null;
                  engine.current.velocity = engine.current.tiltVelocity = 0;
                  engine.current.tilt = clampTilt(engine.current.tilt + (e.key === "ArrowUp" ? 5 : -5));
                }
                else rotate(e.key === "ArrowRight" ? 10 : -10);
                redraw();
              }
            }}
          />
        )}
        {ready && !failed && (
          <button
            ref={marker}
            className="globe-marker"
            aria-label="Nepal: country and location information"
            aria-expanded={info}
            onClick={() => setInfo(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setInfo(false);
            }}
            onPointerEnter={() => {
              engine.current.hold = true;
              setInfo(true);
            }}
            onPointerLeave={() => {
              if (document.activeElement !== marker.current) {
                engine.current.hold = false;
                setInfo(false);
                redraw();
              }
            }}
            onFocus={() => {
              engine.current.hold = true;
              setInfo(true);
            }}
            onBlur={() => {
              engine.current.hold = false;
              setInfo(false);
              redraw();
            }}
          >
            <span className="country-pin" aria-hidden="true" />
            <span className="country-leader" aria-hidden="true" />
            <span className="country-label" aria-hidden="true">
              Nepal
            </span>
            <span className={"location-tooltip " + (info ? "shown" : "")}>
              Nepal
              <small>
                Based in Bharatpur, Chitwan. Country marker, not my precise
                location.
              </small>
            </span>
          </button>
        )}
        <span className="globe-axis axis-n" aria-hidden="true">
          N / 90°
        </span>
        <span className="globe-axis axis-s" aria-hidden="true">
          S / −90°
        </span>
      </div>
      {ready && !failed && (
        <div className="globe-controls">
          <button aria-label="Rotate globe west" onClick={() => rotate(-20)}>
            ←
          </button>
          <button
            onClick={() => {
              engine.current.auto = paused;
              engine.current.velocity = engine.current.tiltVelocity = 0;
              engine.current.locate = null;
              setPaused(!paused);
              redraw();
            }}
            disabled={reduced}
            aria-pressed={!paused && !reduced}
          >
            {reduced
              ? "Motion reduced"
              : paused
                ? "Resume rotation"
                : "Pause rotation"}
          </button>
          <button aria-label="Rotate globe east" onClick={() => rotate(20)}>
            →
          </button>
          <button
            onClick={locateNepal}
          >
            Locate Nepal
          </button>
        </div>
      )}
      <p className="globe-help">
        {failed
          ? "Static map preview. Interactive rendering is unavailable."
          : "Drag to explore · arrow keys to rotate · scroll outside the globe to move the page."}
      </p>
    </div>
  );
}
