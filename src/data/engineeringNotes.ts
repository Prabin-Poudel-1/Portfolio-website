export const engineeringNotes: Record<
  string,
  { label: string; text: string }[]
> = {
  "rescuer-sathi": [
    {
      label: "Problem & constraints",
      text: "Emergency requests can begin without reliable internet. Nearby relays may disappear, and an assigned rescuer still needs a return path for acknowledgment.",
    },
    {
      label: "Architecture & implementation",
      text: "The Android prototype combines Flutter/Kotlin, local encrypted SOS persistence, Nearby Connections relay, a Spring Boot backend and PostgreSQL. This lab models queue transitions only.",
    },
    {
      label: "Failure handling",
      text: "Keep the origin copy until acknowledgment. Retry with the same message ID; model a backend that records one incident rather than treating every retry as a new emergency.",
    },
    {
      label: "Evidence & next questions",
      text: "The case study contains real Android captures and owner-reported physical-device testing. This simulation supplies no latency, coverage, reliability or battery measurements.",
    },
    {
      label: "Engineering takeaway",
      text: "A visible pending state is more honest than a success message before receipt. Test both the outgoing request and the return acknowledgment path.",
    },
  ],
  "sentinel-ai": [
    {
      label: "Problem & constraints",
      text: "An agent's proposed action is untrusted input. Authorization belongs outside the model and must remain restrictive when contracts expire or approvals are absent.",
    },
    {
      label: "Architecture & implementation",
      text: "The real project uses a Rust gateway, Cedar policies, signed task contracts, authenticated approvals, supported restricted execution and SQLite auditing. The browser evaluates a small, explicit example rule set.",
    },
    {
      label: "Failure handling",
      text: "Unlisted actions, invalid contracts and out-of-scope resources deny execution. Simulated approval permits a scoped write but never overrides an explicit deny.",
    },
    {
      label: "Evidence & boundaries",
      text: "The complete case study preserves documented cross-platform regression and installer validation. No browser demo here executes Cedar, verifies signatures, runs Wasmtime or provides a security certification.",
    },
    {
      label: "Engineering takeaway",
      text: "An audit should preserve the request inputs and the reason for the decision, not just a green or red result.",
    },
  ],
  rakshak: [
    {
      label: "Problem & constraints",
      text: "Disaster-response decisions need traceable observations. A changed radar signal may have multiple explanations; missing or low-quality samples should remain explicit.",
    },
    {
      label: "Architecture & implementation",
      text: "The existing project description covers GeoTIFF evidence, source provenance, authenticated map tiles and native-grid point inspection. The explorer uses generated arrays, not satellite acquisitions.",
    },
    {
      label: "Failure handling",
      text: "Quality-masked cells are excluded from interpretation. Compare before/after values, preserve provenance, and distinguish categorical evidence from a damage prediction.",
    },
    {
      label: "Evidence & relationship",
      text: "Rakshak explores evidence that could inform disaster-response review alongside systems such as Rescuer Sathi. This portfolio does not claim an operational integration; unresolved NISAR source QA remains documented.",
    },
    {
      label: "Engineering takeaway",
      text: "Observation, quality and interpretation are separate layers. A comparison slider cannot validate flooding, damage or model accuracy.",
    },
  ],
};
