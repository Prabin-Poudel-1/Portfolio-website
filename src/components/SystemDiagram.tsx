import { useEffect, useRef, useState } from "react";
import { animateHero } from "../utils/heroMotion";
import { playSound } from "../utils/sound.js";

const nodes = [
  {
    code: "01", name: "AI & security", symbol: "⌘",
    project: "Sentinel AI", projectId: "sentinel-ai",
    text: "Independent authorization between an AI agent and its tools. Rust, Cedar policies, and explicit human approvals.",
    url: "sentinel-ai.html", x: 31, y: 16, narrowX: 28, narrowY: 13,
  },
  {
    code: "06", name: "Browser collaboration", symbol: "↗",
    project: "GhostCursor", projectId: "ghostcursor",
    text: "Private, page-scoped peer-to-peer cursors and annotations across Chromium and Firefox, with tested WebRTC interoperability.",
    url: "?demo=ghostcursor#portfolio", x: 72, y: 21, narrowX: 73, narrowY: 23,
  },
  {
    code: "05", name: "Satellite intelligence", symbol: "⊕",
    project: "Rakshak Satellite Intelligence", projectId: "rakshak",
    text: "Experimental Narayani satellite evidence with provenance and map inspection. Geographic QA limitations remain; no validated flood detection is claimed.",
    url: "#project-rakshak", x: 15, y: 52, narrowX: 15, narrowY: 44,
  },
  {
    code: "02", name: "Emergency communication", symbol: "↗",
    project: "Rescuer Sathi", projectId: "rescuer-sathi",
    text: "Encrypted local SOS requests, nearby store-and-forward relay, and on-device AI in an Android prototype.",
    url: "rescuer-sathi.html", x: 85, y: 49, narrowX: 83, narrowY: 57,
  },
  {
    code: "04", name: "Software engineering", symbol: "⌁",
    project: "Chitwan Care", projectId: "chitwan-care",
    text: "Connecting image capture and on-device detection to location-linked environmental reports and cleanup workflows.",
    url: "chitwan-care.html", x: 30, y: 83, narrowX: 26, narrowY: 75,
  },
  {
    code: "03", name: "Web applications", symbol: "◇",
    project: "Chitwan Plus", projectId: "chitwan-plus",
    text: "Interest-led travel planning with maps, itinerary previews, and Gemini assistance.",
    url: "#project-chitwan-plus", x: 69, y: 80, narrowX: 64, narrowY: 88,
  },
];

export function SystemDiagram({
  paused, onPause, onProjectSelect,
}: {
  paused: boolean;
  onPause: () => void;
  onProjectSelect?: (projectId: string) => void;
}) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const orbitTime = useRef(0);
  const hold = useRef({ hover: false, focus: false, until: 0 });

  const manual = (index: number) => {
    hold.current.until = performance.now() + 6000;
    setActive(index);
  };

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const stage = element.querySelector<HTMLElement>(".network-stage")!;
    const buttons = Array.from(stage.querySelectorAll<HTMLButtonElement>(".domain-node"));
    const wires = stage.querySelectorAll<SVGPathElement>(".network-wire");
    const signals = stage.querySelectorAll<SVGCircleElement>(".network-signal");
    let cycle = 0, width = 1, height = 1;
    let anchors: { x: number; y: number; half: number; iconOffset: number }[] = [];
    const render = (time: number) => {
      anchors.forEach(({ x, y, half, iconOffset }, i) => {
        const phase = time * (.17 + i * .019);
        const dx = Math.sin(phase + i) * width * (.018 + i * .001);
        const dy = Math.cos(phase * .83 + i) * height * .018;
        const px = Math.max(half + 3, Math.min(width - half - 3, x + dx));
        buttons[i].style.transform = `translate(calc(-50% + ${px - x}px), calc(-50% + ${dy}px))`;
        const sx = px / width * 100, sy = (y + dy + iconOffset) / height * 100;
        wires[i].setAttribute("d", `M50 50 L${sx} ${sy}`);
        const travel = (time * .13 + i / nodes.length) % 1;
        signals[i].setAttribute("cx", String(50 + (sx - 50) * travel));
        signals[i].setAttribute("cy", String(50 + (sy - 50) * travel));
        signals[i].style.opacity = String(Math.sin(travel * Math.PI) * .65);
      });
    };
    const measure = () => {
      width = stage.clientWidth || 1;
      height = stage.clientHeight || 1;
      anchors = buttons.map((button, i) => {
        const n = nodes[i], x = width < 440 ? n.narrowX : n.x, y = width < 440 ? n.narrowY : n.y;
        button.style.left = x + "%";
        button.style.top = y + "%";
        const icon = button.querySelector<HTMLElement>(".node-symbol")!;
        return { x: width*x/100, y: height*y/100, half: button.offsetWidth/2,
          iconOffset: icon.offsetTop + icon.offsetHeight/2 - button.offsetHeight/2 };
      });
      render(orbitTime.current);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    buttons.forEach(button => resize.observe(button));
    measure();
    const stop = paused ? () => {} : animateHero(element, dt => {
      orbitTime.current += dt;
      render(orbitTime.current);
      if (hold.current.hover || hold.current.focus || performance.now() < hold.current.until) {
        cycle = 0;
        return;
      }
      cycle += dt;
      if (cycle >= 6) {
        cycle = 0;
        setActive(index => (index + 1) % nodes.length);
      }
    });

    return () => {
      stop();
      resize.disconnect();
    };
  }, [paused]);

  const node = nodes[active];

  return (
    <aside
      ref={root}
      className="engineering-map"
      aria-label="Explore my engineering domains"
      onPointerEnter={() => { hold.current.hover = true; }}
      onPointerLeave={() => { hold.current.hover = false; hold.current.until = performance.now() + 6000; }}
      onFocusCapture={() => { hold.current.focus = true; }}
      onBlurCapture={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          hold.current.focus = false;
          hold.current.until = performance.now() + 6000;
        }
      }}
    >
      <div className="map-label">
        <span className="atlas-label">SELECT A DOMAIN <span aria-hidden="true">/</span> 06 NODES</span>
        <button
          className="hero-motion-toggle" type="button" aria-pressed={paused} onClick={onPause}
          aria-label={paused ? "Resume atlas motion" : "Pause atlas motion"}
        >{paused ? "▶" : "Ⅱ"} Motion</button>
      </div>
      <div className="network-stage">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nodes.map((n, i) => (
            <path
              key={n.code}
              className={"network-wire " + (active === i ? "selected" : "")}
              d={`M50 50 L${n.x} ${n.y}`}
            />
          ))}
          {nodes.map(n => (
            <circle
              key={n.code} className="network-signal" r=".45" cx="50" cy="50"
              style={{ opacity: 0 }}
            />
          ))}
        </svg>
        <button
          type="button"
          className="network-core"
          aria-label="Play connection tone"
          onClick={() => playSound("secret")}
        >
          <span>PP</span>
        </button>
        {nodes.map((n, i) => (
          <button
            key={n.code}
            type="button"
            className={"domain-node node-" + i}
            style={{ left: n.x + "%", top: n.y + "%" }}
            aria-label={n.project + " — " + n.name}
            aria-pressed={active === i}
            onClick={() => {
              manual(i);
              onProjectSelect?.(n.projectId);
              playSound("select");
            }}
            onFocus={() => manual(i)}
            onMouseEnter={() => manual(i)}
          >
            <span className="node-symbol" aria-hidden="true">{n.symbol}</span>
            <span className="node-name">{n.name}</span>
          </button>
        ))}
      </div>
      <div className="node-inspector" aria-live="off">
        <span className="sr-only">Selected domain {active + 1} of {nodes.length}.</span>
        {nodes.map((detail, i) => (
          <div
            key={detail.code}
            className={"inspector-content" + (i === active ? " is-active" : "")}
            style={{ visibility: i === active ? "visible" : "hidden" }}
            aria-hidden={i !== active}
          >
            <p className="node-inspector-meta">DOMAIN {detail.code} / {detail.name}</p>
            <h2>{detail.project}</h2>
            <p>{detail.text}</p>
            <a href={detail.url} tabIndex={i === active ? 0 : -1}>Explore project ↗</a>
          </div>
        ))}
      </div>
    </aside>
  );
}
