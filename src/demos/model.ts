export const sosStages = [
  [
    "SOS activated",
    "The person requests help. This demo sends no emergency message.",
  ],
  [
    "Stored locally",
    "An encrypted queue preserves the request on the device. Persistence here is simulated in memory.",
  ],
  [
    "Nearby discovery",
    "Compatible nearby devices are discovered with permission. Availability is not guaranteed.",
  ],
  [
    "Store-and-forward relay",
    "A nearby device accepts the encrypted payload for forwarding.",
  ],
  [
    "Internet forwarding",
    "A connected relay forwards the queued request to the service.",
  ],
  [
    "Backend received",
    "The service records the request. Retries require deduplication.",
  ],
  [
    "Rescuer assigned",
    "An available responder is matched and accepts the request in this example.",
  ],
  [
    "Acknowledgment returned",
    "Receipt travels back to the originating device. Real delivery depends on connectivity.",
  ],
];
export function nextStage(stage: number, connected: boolean) {
  return stage === 3 && !connected ? stage : Math.min(stage + 1, 7);
}
export type Request = {
  action: string;
  resource: string;
  contract: string;
  approval: boolean;
};
export function authorize(r: Request) {
  if (!["read", "write", "delete"].includes(r.action))
    return {
      decision: "DENY",
      reason: "No example policy grants this tool action.",
    };
  if (r.contract !== "valid")
    return {
      decision: "DENY",
      reason: "A current, non-revoked task contract is required.",
    };
  if (r.resource !== "workspace")
    return {
      decision: "DENY",
      reason: "The example contract only permits the task workspace.",
    };
  if (r.action === "delete")
    return {
      decision: "DENY",
      reason:
        "Deletion is not granted by this example policy. Approval cannot override this deny.",
    };
  if (r.action === "write" && !r.approval)
    return {
      decision: "REQUIRE APPROVAL",
      reason:
        "Writing needs an authenticated approval. This checkbox only simulates one.",
    };
  return {
    decision: "ALLOW",
    reason:
      r.action === "read"
        ? "Reading inside the workspace satisfies the example contract."
        : "Workspace write and simulated approval satisfy the example rules.",
  };
}
export const evidenceLabels = [
  "Outside candidates",
  "Supporting",
  "Contradictory",
  "Inconclusive",
  "Unobserved",
];
export function evidenceCell(row: number, col: number, after: boolean) {
  return (row * 7 + col * 3 + (after ? row + col : 0)) % 5;
}
export function swipeDirection(dx: number, dy: number) {
  return Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5
    ? dx < 0
      ? 1
      : -1
    : 0;
}
