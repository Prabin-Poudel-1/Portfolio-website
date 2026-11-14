import React, { useState, useEffect, useRef } from "react";
import { animateHero } from "../utils/heroMotion";
import { playSound } from "../utils/sound.js";
const nodes = [
  {
    name: "AI & security",
    project: "Sentinel AI",
    text: "Independent authorization between an AI agent and its tools. Rust, Cedar policies, and explicit human approvals.",
    url: "sentinel-ai.html",
    x: 52,
    y: 15,
    code: "01",
  },
  {
    name: "Emergency communication",
    project: "Rescuer Sathi",
    text: "Encrypted local SOS requests, nearby store-and-forward relay, and on-device AI in an Android prototype.",
    url: "rescuer-sathi.html",
    x: 78,
    y: 48,
    code: "02",
  },
  {
    name: "Web applications",
    project: "Chitwan Plus",
    text: "Interest-led travel planning with maps, itinerary previews, and Gemini assistance.",
    url: "#project-chitwan-plus",
    x: 54,
    y: 82,
    code: "03",
  },
  {
    name: "Software engineering",
    project: "Chitwan Care",
    text: "Connecting image capture and on-device detection to location-linked environmental reports and cleanup workflows.",
    url: "chitwan-care.html",
    x: 19,
    y: 64,
    code: "04",
  },
  {
    name: "Satellite intelligence",
    project: "Rakshak Satellite Intelligence",
    text: "Experimental Narayani satellite evidence with provenance and map inspection. Geographic QA limitations remain; no validated flood detection is claimed.",
    url: "#project-rakshak",
    x: 18,
    y: 26,
    code: "05",
  },
];
export function SystemDiagram({ paused, onPause }: { paused: boolean; onPause: () => void }) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const orbitTime = useRef(0);
  const hold = useRef({ hover: false, focus: false, until: 0 });
  const manual = (index: number) => {
    hold.current.until = performance.now() + 6000;
    setActive(index);
  };
  useEffect(() => {
    const element = root.current!;
    const stage = element.querySelector<HTMLElement>(".network-stage")!;
    const buttons = [...stage.querySelectorAll<HTMLElement>(".domain-node")];
    const wires = [...stage.querySelectorAll<SVGPathElement>(".network-wire")];
    const signals = [...stage.querySelectorAll<SVGCircleElement>(".network-signal")];
    let width = 1, height = 1, cycle = 0;
    let geometry: { half: number; symbolOffset: number }[] = [];
    const measure = () => {
      width = stage.clientWidth; height = stage.clientHeight;
      geometry = buttons.map(b => ({ half: b.offsetWidth / 2, symbolOffset: 20 - b.offsetHeight / 2 }));
      render(orbitTime.current);
    };
    const render = (time: number) => {
      nodes.forEach((n, i) => {
        const phase = time * (.17 + i * .019);
        // Start exactly at the established positions; bounded, seamless independent orbits.
        const dx = Math.sin(phase) * width * (.018 + i * .002);
        const dy = (Math.cos(phase * .83 + i) - Math.cos(i)) * height * .014;
        const x = Math.max(geometry[i].half + 2, Math.min(width - geometry[i].half - 2, width * n.x / 100 + dx));
        const y = height * n.y / 100 + dy;
        buttons[i].style.transform = `translate(calc(-50% + ${x - width * n.x / 100}px), calc(-50% + ${dy}px))`;
        const sx = x / width * 100, sy = (y + geometry[i].symbolOffset) / height * 100;
        wires[i].setAttribute('d', `M48 48 L${sx} ${sy}`);
        const travel = (time * .13 + i / 5) % 1;
        signals[i].setAttribute('cx', String(48 + (sx - 48) * travel));
        signals[i].setAttribute('cy', String(48 + (sy - 48) * travel));
        signals[i].style.opacity = String(Math.sin(travel * Math.PI) * .5);
      });
    };
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    measure();
    const stop = paused ? () => {} : animateHero(element, (dt) => {
      orbitTime.current += dt;
      render(orbitTime.current);
      if (hold.current.hover || hold.current.focus || performance.now() < hold.current.until) { cycle = 0; return; }
      cycle += dt;
      if (cycle >= 6) { cycle = 0; setActive(index => (index + 1) % nodes.length); }
    });
    return () => { stop(); resize.disconnect(); };
  }, [paused]);
  const node = nodes[active];
  return (
    <aside
      ref={root}
      onPointerEnter={() => { hold.current.hover = true; }}
      onPointerLeave={() => { hold.current.hover = false; hold.current.until = performance.now() + 6000; }}
      onFocusCapture={() => { hold.current.focus = true; }}
      onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { hold.current.focus = false; hold.current.until = performance.now() + 6000; } }}
      className="engineering-map"
      aria-label="Explore my engineering domains"
    >
      <div className="map-label">
        <button className="hero-motion-toggle" type="button" aria-pressed={paused} onClick={onPause}
          aria-label={paused ? "Resume hero motion" : "Pause hero motion"}>{paused ? "▶" : "Ⅱ"} Motion</button>
      </div>
      <div className="network-stage">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {nodes.map((n, i) => (
            <path
              key={n.code}
              className={"network-wire " + (active === i ? "selected" : "")}
              d={`M48 48 L${n.x} ${n.y}`}
            />
          ))}
          {nodes.map(n => <circle key={n.code} className="network-signal" r=".55" cx="48" cy="48" />)}
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
            className={"domain-node node-" + i}
            style={{ left: n.x + "%", top: n.y + "%" }}
            aria-label={n.project + " — " + n.name}
            aria-pressed={active === i}
            onClick={() => {
              manual(i);
              playSound("select");
            }}
            onFocus={() => manual(i)}
            onMouseEnter={() => manual(i)}
          >
            <span className="node-symbol">{["⌘", "↗", "◇", "⌁", "⊕"][i]}</span>
            <span className="node-name">{n.name}</span>
          </button>
        ))}
      </div>
      <div className="node-inspector">
        <span className="sr-only">Selected domain {active + 1} of 5.</span>
        {nodes.map((detail, i) => (
          <div key={detail.code} className={"inspector-content" + (i === active ? " is-active" : "")}
            style={{ visibility: i === active ? "visible" : "hidden" }} aria-hidden={i !== active}>
            <h2>{detail.project}</h2>
            <p>{detail.text}</p>
            <a href={detail.url} tabIndex={i === active ? 0 : -1}>Explore project ↗</a>
          </div>
        ))}
      </div>
    </aside>
  );
}
