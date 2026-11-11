export type Network = {
  internet: boolean;
  relayA: boolean;
  relayB: boolean;
  uplink: boolean;
  backend: boolean;
};
export type Carrier = "direct" | "A" | "B";
export type LabEvent = {
  number: number;
  text: string;
  kind: "event" | "wait" | "success";
};
export type RelayState = {
  id: string;
  stage: number;
  carrier: Carrier | null;
  copies: Carrier[];
  attempts: number;
  received: boolean;
  ack: boolean;
  events: LabEvent[];
};
export const initialNetwork: Network = {
  internet: false,
  relayA: true,
  relayB: true,
  uplink: false,
  backend: true,
};
export function initialRelay(id = "SIM-SOS-001"): RelayState {
  return {
    id,
    stage: -1,
    carrier: null,
    copies: [],
    attempts: 0,
    received: false,
    ack: false,
    events: [],
  };
}
const online = (n: Network, c: Carrier) =>
  c === "direct" ? n.internet : c === "A" ? n.relayA : n.relayB;
export function advanceRelay(state: RelayState, n: Network): RelayState {
  if (state.ack) return state;
  const s = { ...state, copies: [...state.copies] };
  function event(text: string, kind: LabEvent["kind"] = "event") {
    s.events = [
      ...s.events,
      { number: (s.events.at(-1)?.number || 0) + 1, text, kind },
    ].slice(-18);
    return s;
  }
  function wait(text: string) {
    s.attempts++;
    return event(text, "wait");
  }
  if (s.stage === -1) {
    s.stage = 0;
    return event(`${s.id} created by the simulated SOS device.`);
  }
  if (s.stage === 0) {
    s.stage = 1;
    return event(
      "Request retained in the local queue before any transport attempt.",
    );
  }
  if (s.stage === 1) {
    s.stage = 2;
    return event(
      n.internet
        ? "Direct internet route available; checking delivery path."
        : "Direct delivery unavailable. Local request retained; discovering nearby relays.",
    );
  }
  const choose = (): Carrier | null =>
    n.internet ? "direct" : n.relayA ? "A" : n.relayB ? "B" : null;
  if (s.stage === 2) {
    const c = choose();
    if (!c)
      return wait(
        "No nearby relay or direct connection. Keep the local copy and retry discovery.",
      );
    s.carrier = c;
    s.stage = 3;
    if (!s.copies.includes(c)) s.copies.push(c);
    return event(
      c === "direct"
        ? "Direct route selected; local copy remains queued."
        : `Relay ${c} accepted a queued copy. The originating device keeps its copy too.`,
    );
  }
  if (s.stage === 3 || s.stage === 4) {
    if (!s.carrier || !online(n, s.carrier)) {
      const next = choose();
      if (!next)
        return wait(
          "Carrier disconnected. Queued copies remain; waiting for an available path.",
        );
      s.carrier = next;
      s.stage = 3;
      if (!s.copies.includes(next)) s.copies.push(next);
      return event(
        `Path recovered through ${next === "direct" ? "direct internet" : `Relay ${next}`}. Message ID is unchanged.`,
      );
    }
    if (s.carrier !== "direct" && !n.uplink)
      return wait(
        `Relay ${s.carrier} has no internet uplink. Store now; forward when connectivity returns.`,
      );
    if (!n.backend)
      return wait(
        "Backend unavailable. No receipt confirmed; retain the request for retry.",
      );
    if (s.stage === 3) {
      s.stage = 4;
      return event("Queued message forwarded toward the simulated backend.");
    }
    s.stage = 5;
    s.received = true;
    return event(
      "Backend recorded one request by message ID. Repeated attempts must not create another incident.",
      "success",
    );
  }
  if (s.stage === 5) {
    if (!n.backend)
      return wait(
        "Backend offline before assignment. Request remains received; waiting to continue.",
      );
    s.stage = 6;
    return event("A simulated available responder accepts the assignment.");
  }
  if (s.stage === 6) {
    const returnPath =
      n.internet ||
      (n.uplink && s.copies.some((c) => c !== "direct" && online(n, c)));
    if (!n.backend || !returnPath)
      return wait(
        "Assignment exists, but the return path is offline. Origin still shows a pending acknowledgment.",
      );
    s.carrier = n.internet
      ? "direct"
      : s.copies.find((c) => c !== "direct" && online(n, c))!;
    s.stage = 7;
    s.ack = true;
    return event(
      "Acknowledgment returned to the origin. Pending copies can now be cleared.",
      "success",
    );
  }
  return s;
}
