import { useEffect, useState } from "react";
import { nextStage, sosStages } from "./model";
import { playSound } from "../utils/sound.js";
export default function Relay() {
  const [step, setStep] = useState(0),
    [running, setRunning] = useState(false),
    [connected, setConnected] = useState(true);
  const waiting = step === 3 && !connected;
  useEffect(() => {
    if (!running || step === 7 || waiting) return;
    const timer = window.setTimeout(
      () => setStep((s) => nextStage(s, connected)),
      1600,
    );
    return () => window.clearTimeout(timer);
  }, [running, step, connected, waiting]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);
  function move(n: number) {
    setRunning(false);
    setStep(n);
    playSound("select");
  }
  return (
    <div className="demo-split">
      <div>
        <div className="demo-topline">
          <span>01 / RESILIENT COMMUNICATION</span>
          <span>
            {waiting ? "QUEUED" : step === 7 ? "ACKNOWLEDGED" : "SIMULATION"}
          </span>
        </div>
        <svg
          className="relay-map"
          viewBox="0 0 600 360"
          role="img"
          aria-label={`SOS simulation: ${sosStages[step][0]}. Device, two relays, gateway, backend and rescuer connected in sequence.`}
        >
          <defs>
            <pattern
              id="relay-grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M30 0H0V30"
                fill="none"
                stroke="currentColor"
                opacity=".08"
              />
            </pattern>
          </defs>
          <rect width="600" height="360" fill="url(#relay-grid)" />
          {[
            [80, 180, 230, 90],
            [80, 180, 230, 270],
            [230, 90, 380, 180],
            [230, 270, 380, 180],
            [380, 180, 520, 90],
            [520, 90, 520, 270],
          ].map((p, i) => (
            <path
              key={i}
              d={`M${p[0]} ${p[1]}L${p[2]} ${p[3]}`}
              className={`relay-wire ${step >= [2, 2, 3, 3, 4, 6][i] ? "lit" : ""} ${waiting && i === 4 ? "waiting" : ""}`}
            />
          ))}
          {[
            [80, 180, "SOS device"],
            [230, 90, "Relay A"],
            [230, 270, "Relay B"],
            [380, 180, "Gateway"],
            [520, 90, "Backend"],
            [520, 270, "Rescuer"],
          ].map((p, i) => (
            <g
              key={i}
              className={step >= [0, 2, 2, 3, 5, 6][i] ? "node-lit" : ""}
            >
              <circle cx={p[0]} cy={p[1]} r="27" />
              <text x={p[0]} y={Number(p[1]) + 5} textAnchor="middle">
                {i === 0 ? "SOS" : String(i).padStart(2, "0")}
              </text>
              <text
                className="node-label"
                x={p[0]}
                y={Number(p[1]) + 48}
                textAnchor="middle"
              >
                {p[2]}
              </text>
            </g>
          ))}
          {step === 7 && (
            <g>
              <path d="M520 290 Q350 390 80 210" className="relay-wire lit" />
              <text x="350" y="345" textAnchor="middle">
                ← ACK returned
              </text>
            </g>
          )}
        </svg>
        <div
          className="relay-compact"
          aria-label="Compact simulated relay network"
        >
          {[
            "SOS device",
            "Nearby relay",
            "Internet gateway",
            "Backend",
            "Rescuer",
            "Acknowledgment",
          ].map((name, i) => (
            <div
              key={name}
              className={step >= [0, 2, 4, 5, 6, 7][i] ? "reached" : ""}
            >
              <span>0{i + 1}</span>
              <strong>{name}</strong>
              <small>
                {step >= [0, 2, 4, 5, 6, 7][i] ? "Reached" : "Pending"}
              </small>
            </div>
          ))}
        </div>
        <div className="demo-controls">
          <button
            onClick={() => {
              if (step === 7) setStep(0);
              setRunning(step === 7 ? true : !running);
              playSound("select");
            }}
          >
            {running && step < 7
              ? "Pause"
              : step === 7
                ? "Replay"
                : "Start simulation"}
          </button>
          <button
            disabled={step === 7 || waiting}
            onClick={() => move(nextStage(step, connected))}
          >
            Next stage →
          </button>
          <button
            onClick={() => {
              move(0);
            }}
          >
            Reset
          </button>
        </div>
        <label className="demo-check">
          <input
            type="checkbox"
            checked={connected}
            onChange={(e) => {
              setConnected(e.target.checked);
              playSound("select");
            }}
          />{" "}
          Simulated gateway internet
        </label>
        <div className="demo-readout" role="status">
          <strong>
            {waiting
              ? "Offline · request retained at relay"
              : sosStages[step][0]}
          </strong>
          <p>
            {waiting
              ? "Enable gateway internet to resume forwarding. No delivery guarantee is implied."
              : sosStages[step][1]}
          </p>
        </div>
      </div>
      <ol className="stage-list" aria-label="Communication stages">
        {sosStages.map(([title, body], i) => (
          <li key={title}>
            <button
              disabled={i > step && !connected && i > 3}
              aria-current={step === i ? "step" : undefined}
              onClick={() => move(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{title}</strong>
                <small>{body}</small>
              </div>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
