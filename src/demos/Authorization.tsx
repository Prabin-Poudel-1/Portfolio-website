import { useState } from "react";
import { authorize, type Request } from "./model";
import { playSound } from "../utils/sound.js";
export default function Authorization() {
  const [request, setRequest] = useState<Request>({
    action: "read",
    resource: "workspace",
    contract: "valid",
    approval: false,
  });
  const [result, setResult] = useState<ReturnType<typeof authorize> | null>(
      null,
    ),
    [audit, setAudit] = useState(0);
  function update(p: Partial<Request>) {
    setRequest({ ...request, ...p });
    setResult(null);
  }
  return (
    <div className="demo-split">
      <form
        className="demo-form"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(authorize(request));
          setAudit((n) => n + 1);
          playSound("select");
        }}
      >
        <p className="eyebrow">02 / THE AUTHORIZATION BOUNDARY</p>
        <h4>A request is not permission.</h4>
        <p>
          Change the request, then evaluate it against the visible example
          policy.
        </p>
        <label>
          Tool action
          <select
            value={request.action}
            onChange={(e) => update({ action: e.target.value })}
          >
            <option value="read">Read file</option>
            <option value="write">Write file</option>
            <option value="delete">Delete file</option>
          </select>
        </label>
        <label>
          Resource scope
          <select
            value={request.resource}
            onChange={(e) => update({ resource: e.target.value })}
          >
            <option value="workspace">/task/workspace</option>
            <option value="secrets">/private/secrets</option>
          </select>
        </label>
        <label>
          Task contract
          <select
            value={request.contract}
            onChange={(e) => update({ contract: e.target.value })}
          >
            <option value="valid">Valid</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </label>
        <label className="demo-check">
          <input
            type="checkbox"
            checked={request.approval}
            onChange={(e) => update({ approval: e.target.checked })}
          />{" "}
          Simulate authenticated approval
        </label>
        <button type="submit">Evaluate request →</button>
      </form>
      <div>
        <div className="auth-flow" aria-label="Example authorization flow">
          {[
            "Agent request",
            "Contract + scope",
            "Policy evaluation",
            "Restricted tool",
          ].map((v, i) => (
            <div
              key={v}
              className={result ? "evaluated" : ""}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span>0{i + 1}</span>
              {v}
              <small>
                {i === 3
                  ? result?.decision === "ALLOW"
                    ? "Permitted · no tool executed"
                    : "Execution blocked"
                  : ["Untrusted proposal", "Trusted boundary", "Default deny"][
                      i
                    ]}
              </small>
            </div>
          ))}
        </div>
        <div className="demo-readout" role="status">
          <strong>{result?.decision || "AWAITING EVALUATION"}</strong>
          <p>
            {result?.reason || "Nothing runs in this browser demonstration."}
          </p>
          <code>
            audit #{String(audit).padStart(3, "0")} ·{" "}
            {result ? "decision recorded in memory" : "no decision"}
          </code>
        </div>
        <details>
          <summary>Inspect the example rules</summary>
          <ol>
            <li>Reject expired or revoked contracts.</li>
            <li>Reject resources outside /task/workspace.</li>
            <li>Deny deletion, even with approval.</li>
            <li>Require approval for writes; allow scoped reads.</li>
          </ol>
        </details>
        <p className="demo-note">
          Deterministic TypeScript illustration, not the Rust/Cedar engine. No
          signatures, sandbox, real approvals or persistent audit database are
          executed here.
        </p>
      </div>
    </div>
  );
}
