import { useEffect, useRef, useState } from "react";
import { sosStages } from "./model";
import {
  advanceRelay,
  initialNetwork,
  initialRelay,
  type Network,
} from "./relayModel";
import { playSound } from "../utils/sound.js";

const scenarios = [
  {
    name: "Signal lost",
    detail:
      "No direct internet. Keep a copy, discover a relay, then restore its uplink.",
    network: initialNetwork,
  },
  {
    name: "Direct route",
    detail:
      "Compare direct delivery with the same local-first persistence rule.",
    network: { ...initialNetwork, internet: true, uplink: true },
  },
  {
    name: "Backend outage",
    detail:
      "The network works, but the server does not. Recover without creating a second incident.",
    network: { ...initialNetwork, uplink: true, backend: false },
  },
];
export default function Relay() {
  const [state, setState] = useState(() => initialRelay());
  const [network, setNetwork] = useState<Network>({ ...initialNetwork });
  const [running, setRunning] = useState(false),
    [scenario, setScenario] = useState(0),
    [inspect, setInspect] = useState<number | null>(null);
  const serial = useRef(1);
  const next = advanceRelay(state, network);
  const waiting = state.stage >= 0 && !state.ack && next.stage === state.stage;
  useEffect(() => {
    if (!running || state.ack) return;
    const timer = window.setTimeout(
      () => setState((s) => advanceRelay(s, network)),
      waiting ? 2800 : 1500,
    );
    return () => clearTimeout(timer);
  }, [running, state, network, waiting]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);
  function reset(which = scenario, replay = false) {
    const fresh = initialRelay(
      `SIM-SOS-${String(++serial.current).padStart(3, "0")}`,
    );
    setState(replay ? advanceRelay(fresh, scenarios[which].network) : fresh);
    setNetwork({ ...scenarios[which].network });
    setScenario(which);
    setRunning(replay);
    setInspect(null);
    playSound("select");
  }
  function step() {
    setRunning(false);
    setInspect(null);
    setState(next);
    playSound(next.ack ? "success" : "select");
  }
  const stage = Math.max(0, state.stage),
    detail = inspect ?? stage;
  const relayY = state.carrier === "B" ? 270 : 90;
  const packet = state.ack
    ? state.carrier === "direct"
      ? "M520 90 L80 180"
      : `M520 90 L380 180 L230 ${relayY} L80 180`
    : stage === 3
      ? `M80 180 L230 ${relayY}`
      : stage === 4
        ? state.carrier === "direct"
          ? "M80 180 L520 90"
          : `M230 ${relayY} L380 180 L520 90`
        : stage === 6
          ? "M520 90 L520 270"
          : "";
  const queues = [
    ["Origin", state.stage >= 1 && !state.ack ? 1 : 0],
    ["Relay A", state.copies.includes("A") && !state.ack ? 1 : 0],
    ["Relay B", state.copies.includes("B") && !state.ack ? 1 : 0],
    ["Backend records", state.received ? 1 : 0],
  ];
  return (
    <div className="signal-lab">
      <div className="lab-intro">
        <p className="eyebrow">SIGNAL LOST / AN ENGINEERING EXPERIMENT</p>
        <h4>
          Break the connection.
          <br />
          Keep the message.
        </h4>
        <p>
          Control the conditions, follow the queues, and recover a simulated
          emergency request. Nothing here contacts a rescue service.
        </p>
      </div>
      <div className="lab-presets" aria-label="Network scenarios">
        {scenarios.map((s, i) => (
          <button
            key={s.name}
            aria-pressed={scenario === i}
            onClick={() => reset(i)}
          >
            <span>0{i + 1}</span>
            {s.name}
          </button>
        ))}
      </div>
      <p className="demo-note">{scenarios[scenario].detail}</p>
      <div className="lab-workbench">
        <div className="lab-network">
          <div className="demo-topline">
            <span>{state.id}</span>
            <span>
              {state.ack
                ? "ACKNOWLEDGED"
                : waiting
                  ? "WAITING / RETAINED"
                  : "EDUCATIONAL SIMULATION"}
            </span>
          </div>
          <svg
            className="relay-map"
            viewBox="0 0 600 360"
            role="img"
            aria-label={`Simulated network: ${state.stage < 0 ? "ready" : sosStages[stage][0]}. ${waiting ? "Delivery waiting; copies retained." : ""} Network controls and queue counts follow.`}
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
              [80, 180, 230, 90, network.relayA],
              [80, 180, 230, 270, network.relayB],
              [230, 90, 380, 180, network.relayA],
              [230, 270, 380, 180, network.relayB],
              [380, 180, 520, 90, network.uplink && network.backend],
              [520, 90, 520, 270, network.backend],
            ].map((p, i) => (
              <path
                key={i}
                d={`M${p[0]} ${p[1]}L${p[2]} ${p[3]}`}
                className={`relay-wire ${p[4] ? "lit" : "waiting"}`}
              />
            ))}
            {network.internet && (
              <path d="M80 180 L520 90" className="relay-wire lit" />
            )}
            {[
              [80, 180, "SOS phone", true],
              [230, 90, "Relay A", network.relayA],
              [230, 270, "Relay B", network.relayB],
              [380, 180, "Uplink", network.uplink],
              [520, 90, "Backend", network.backend],
              [520, 270, "Rescuer", stage >= 6],
            ].map((p, i) => (
              <g key={i} className={p[3] ? "node-lit" : "node-offline"}>
                <circle cx={Number(p[0])} cy={Number(p[1])} r="27" />
                <text x={Number(p[0])} y={Number(p[1]) + 5} textAnchor="middle">
                  {i === 0 ? "SOS" : String(i).padStart(2, "0")}
                </text>
                <text
                  className="node-label"
                  x={Number(p[0])}
                  y={Number(p[1]) + 48}
                  textAnchor="middle"
                >
                  {p[2]}
                </text>
              </g>
            ))}
            {packet && state.events.at(-1)?.kind !== "wait" && (
              <path
                key={`${state.stage}-${state.events.length}`}
                d={packet}
                pathLength="1"
                className="relay-packet"
              />
            )}
          </svg>
          <ul className="lab-mobile-key" aria-label="Network node key">
            {["SOS phone", "Relay A", "Relay B", "Uplink", "Backend", "Rescuer"].map((name, i) => (
              <li key={name}><span>{i === 0 ? "SOS" : String(i).padStart(2, "0")}</span> {name}</li>
            ))}
          </ul>
          <dl className="queue-strip">
            {queues.map(([name, count]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>
                  {count}
                  <small>
                    {name === "Backend records" ? " incident" : " queued"}
                  </small>
                </dd>
              </div>
            ))}
          </dl>
          <div className="responder-status">
            <span>SIMULATED RESCUER DASHBOARD</span>
            <strong>
              {stage >= 6 ? `Assigned · ${state.id}` : "Awaiting assignment"}
            </strong>
            <small>
              {state.ack
                ? "Origin acknowledgment confirmed."
                : stage >= 6
                  ? "Responder assigned; origin acknowledgment is still pending."
                  : "No responder is dispatched by this browser demonstration."}
            </small>
          </div>
          <div className="demo-controls">
            <button
              onClick={() => {
                if (state.ack) reset(scenario, true);
                else {
                  if (state.stage < 0) setState(next);
                  setRunning(!running);
                }
                playSound("select");
              }}
            >
              {state.ack
                ? "Replay simulation"
                : running
                  ? "Pause simulation"
                  : state.stage < 0
                    ? "Send simulated SOS"
                    : "Resume simulation"}
            </button>
            <button disabled={state.stage < 0 || state.ack} onClick={step}>
              {waiting ? "Retry now" : "Next stage →"}
            </button>
            <button onClick={() => reset()}>Reset</button>
          </div>
          <div className="demo-readout" role="status">
            <strong>
              {state.stage < 0
                ? "Ready for a simulated SOS"
                : state.ack
                  ? "Acknowledgment received"
                  : waiting
                    ? "Connection unavailable · message retained"
                    : sosStages[stage][0]}
            </strong>
            <p>
              {state.events.at(-1)?.text ||
                "Start with no direct internet. Enable or disable devices at any stage."}
            </p>
            <small>
              Retry attempts: {state.attempts} · no timing or reliability
              benchmark implied
            </small>
          </div>
        </div>
        <aside
          className="lab-console"
          aria-label="Network controls and event timeline"
        >
          <h5>Change the conditions</h5>
          {(
            Object.entries({
              internet: "Origin internet",
              relayA: "Nearby Relay A",
              relayB: "Nearby Relay B",
              uplink: "Relay internet uplink",
              backend: "Backend available",
            }) as [keyof Network, string][]
          ).map(([key, label]) => (
            <label className="demo-check" key={key}>
              <input
                type="checkbox"
                aria-label={label}
                checked={network[key]}
                onChange={(e) => {
                  setNetwork((n) => ({ ...n, [key]: e.target.checked }));
                  playSound("select");
                }}
              />
              <span>
                {label}
                <small>{network[key] ? "Available" : "Disconnected"}</small>
              </span>
            </label>
          ))}
          <h5>
            Event timeline <span>Local session only</span>
          </h5>
          <ol className="lab-events" aria-label="Simulated delivery events">
            {state.events.length ? (
              [...state.events].reverse().map((e) => (
                <li key={e.number} data-kind={e.kind}>
                  <code>{String(e.number).padStart(2, "0")}</code>
                  <span>{e.text}</span>
                </li>
              ))
            ) : (
              <li>No events yet. Send a simulated SOS to begin.</li>
            )}
          </ol>
        </aside>
      </div>
      <details className="lab-stage-guide">
        <summary>Inspect the eight communication stages</summary>
        <div className="stage-guide-buttons">
          {sosStages.map(([title], i) => (
            <button
              key={title}
              aria-pressed={detail === i}
              onClick={() => setInspect(i)}
            >
              {String(i + 1).padStart(2, "0")} {title}
            </button>
          ))}
        </div>
        <p>
          <strong>{sosStages[detail][0]}:</strong> {sosStages[detail][1]}
        </p>
      </details>
      <p className="demo-note">
        Browser simulation: queues and logs exist only in memory; no Bluetooth,
        encryption, network service or dispatch is executed. The project owner
        reports physical Android testing; actual application screenshots are in
        the <a href="rescuer-sathi.html#screenshots">case study</a>. This lab is
        not evidence of delivery guarantees or certified rescue capability.
      </p>
    </div>
  );
}
