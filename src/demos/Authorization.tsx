import { useState } from "react";
import { authorize, type Request } from "./model";
import { playSound } from "../utils/sound.js";
const presets: { name: string; request: Request }[] = [
  {
    name: "Scoped read",
    request: {
      action: "read",
      resource: "workspace",
      contract: "valid",
      approval: false,
    },
  },
  {
    name: "Private file",
    request: {
      action: "read",
      resource: "secrets",
      contract: "valid",
      approval: false,
    },
  },
  {
    name: "Restricted tool",
    request: {
      action: "execute",
      resource: "workspace",
      contract: "valid",
      approval: false,
    },
  },
  {
    name: "Approval required",
    request: {
      action: "write",
      resource: "workspace",
      contract: "valid",
      approval: false,
    },
  },
];
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
    [audit, setAudit] = useState<
      { id: number; request: Request; decision: string; reason: string }[]
    >([]);
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
          const decision = authorize(request);
          setResult(decision);
          setAudit((rows) =>
            [
              {
                id: (rows[0]?.id || 0) + 1,
                request: { ...request },
                ...decision,
              },
              ...rows,
            ].slice(0, 6),
          );
          playSound(decision.decision === "ALLOW" ? "success" : "select");
        }}
      >
        <p className="eyebrow">02 / THE AUTHORIZATION BOUNDARY</p>
        <h4>A request is not permission.</h4>
        <p>
          Change the request, then evaluate it against the visible example
          policy.
        </p>
        <div className="auth-presets" aria-label="Example agent actions">
          {presets.map((p) => (
            <button
              type="button"
              key={p.name}
              onClick={() => update(p.request)}
              aria-pressed={Object.entries(p.request).every(
                ([key, value]) => request[key as keyof Request] === value,
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <label>
          Tool action
          <select
            value={request.action}
            onChange={(e) => update({ action: e.target.value })}
          >
            <option value="read">Read file</option>
            <option value="write">Write file</option>
            <option value="delete">Delete file</option>
            <option value="execute">Execute restricted tool</option>
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
        <div
          className="demo-readout"
          role="status"
          data-decision={result?.decision}
        >
          <strong>{result?.decision || "AWAITING EVALUATION"}</strong>
          <p>
            {result?.reason || "Nothing runs in this browser demonstration."}
          </p>
          <code>
            audit #{String(audit[0]?.id || 0).padStart(3, "0")} ·{" "}
            {result ? "decision recorded in memory" : "no decision"}
          </code>
        </div>
        <details open>
          <summary>Simulated audit trail · last six evaluations</summary>
          {audit.length ? (
            <ol className="audit-list">
              {audit.map((entry) => (
                <li key={entry.id}>
                  <code>
                    #{String(entry.id).padStart(3, "0")} / {entry.decision}
                  </code>
                  <strong>
                    {entry.request.action} · {entry.request.resource}
                  </strong>
                  <small>
                    Contract: {entry.request.contract} · approval:{" "}
                    {entry.request.approval ? "simulated" : "absent"}
                  </small>
                  <p>{entry.reason}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p>No decisions yet. Select an action, then evaluate.</p>
          )}
        </details>
        <details>
          <summary>Inspect the example rules</summary>
          <ol>
            <li>Reject expired or revoked contracts.</li>
            <li>Reject resources outside /task/workspace.</li>
            <li>
              Deny deletion and unlisted tool execution, even with approval.
            </li>
            <li>Require approval for writes; allow scoped reads.</li>
          </ol>
        </details>
        <p className="demo-note">
          Deterministic TypeScript illustration, not the Rust/Cedar engine. No
          signatures, sandbox, real approvals or persistent audit database are
          executed here. The real project uses Rust and Cedar for authorization,
          Wasmtime for supported restricted execution, and SQLite for its audit
          trail.
        </p>
      </div>
    </div>
  );
}
