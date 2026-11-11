import React, { useState } from "react";
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
export function SystemDiagram() {
  const [active, setActive] = useState(0);
  const node = nodes[active];
  return (
    <aside
      className="engineering-map"
      aria-label="Explore my engineering domains"
    >
      <div className="map-label">
        <span>FIELD NOTES / CONNECTED SYSTEMS</span>
        <span>01—05</span>
      </div>
      <div className="network-stage">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <circle cx="48" cy="48" r="35" />
          <circle cx="48" cy="48" r="22" />
          {nodes.map((n, i) => (
            <path
              key={n.code}
              className={active === i ? "selected" : ""}
              d={`M48 48 L${n.x} ${n.y}`}
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
          <small>BUILD / CONNECT</small>
        </button>
        {nodes.map((n, i) => (
          <button
            key={n.code}
            className={"domain-node node-" + i}
            style={{ left: n.x + "%", top: n.y + "%" }}
            aria-pressed={active === i}
            onClick={() => {
              setActive(i);
              playSound("select");
            }}
            onFocus={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
          >
            <span className="node-symbol">{["⌘", "↗", "◇", "⌁", "⊕"][i]}</span>
            <span className="node-name">{n.name}</span>
          </button>
        ))}
      </div>
      <div className="node-inspector" aria-live="polite">
        <span className="sr-only">Selected domain {active + 1} of 5.</span>
        <span className="inspector-number">{node.code}</span>
        <div key={active}>
          <p className="eyebrow">{node.name}</p>
          <h2>{node.project}</h2>
          <p>{node.text}</p>
          <a href={node.url}>Explore project ↗</a>
        </div>
      </div>
      <p className="map-instruction">
        SELECT A NODE TO EXPLORE · CONCEPTUAL PROJECT MAP
      </p>
    </aside>
  );
}
