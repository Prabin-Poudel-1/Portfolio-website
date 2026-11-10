import React, { useState } from "react";
const nodes = [
  ["Request", "An agent proposes an operation."],
  ["Policy", "An independent authorization boundary evaluates the request."],
  ["Execution", "Only permitted operations proceed to restricted tools."],
];
export function SystemDiagram() {
  const [active, setActive] = useState(1);
  return (
    <aside
      className="system-diagram"
      aria-label="Explore an authorization system"
    >
      <div className="diagram-caption">
        <span>ENGINEERING NOTE / 001</span>
        <span>Trust is a boundary.</span>
      </div>
      <div className="node-row">
        {nodes.map(([name], i) => (
          <React.Fragment key={name}>
            {i > 0 && (
              <span className="connector" aria-hidden="true">
                →
              </span>
            )}
            <button aria-pressed={active === i} onClick={() => setActive(i)}>
              {name}
              <span>0{i + 1}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <p aria-live="polite">{nodes[active][1]}</p>
      <a href="sentinel-ai.html">Explore Sentinel AI ↗</a>
    </aside>
  );
}
