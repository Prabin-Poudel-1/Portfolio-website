# Portfolio evolution — 12 November 2026

Implemented in the existing `feat/react-portfolio-phase-1` working tree, starting from clean checkpoint `0edd285`. No commits, pushes, merges, branch switches, or deployments.

## Improvements

- Extended the existing Rescuer Sathi demonstration into **Signal Lost Lab**: three scenarios, five connectivity controls, local/relay queues, carrier failover, retry attempts, backend receipt, simulated assignment, returning acknowledgment, replay/reset and bounded event history. A lost acknowledgment retains pending copies without creating another backend incident. Mobile includes the network diagram and a readable node key.
- Enhanced Sentinel's existing example policy evaluator with four scenarios and an audit history containing request inputs, decisions and explanations. It does not execute Rust, Cedar or tools.
- Enhanced Rakshak's synthetic grid with before/after surface signals, differences, QA masks and selected-cell inspection. Values are illustrative, not radar measurements or satellite acquisitions. No unverified timestamps or geolocation are assigned.
- Added compact engineering notes for the three flagship projects, covering constraints, architecture, failure handling, evidence boundaries and lessons.
- Strengthened the existing hero message and added a direct lab entry. Retained the established layout, fonts and palette.
- Fixed cursor trail history retention and hover-label restoration; refined gallery easing, canceled-touch cleanup and demonstration remounting.
- Optimized the existing scroll circuit using cached path samples instead of repeated layout reads and binary path calculations on every frame. Kept reversible progression and added current-stage semantics.
- Refined typewriter cadence and a secure-systems interest phrase. Added a restrained, separately throttled hover cue to the existing opt-in audio system; hover cannot unlock audio or interrupt another cue.
- Preserved the already-corrected interactive globe. Replaced the old polygon-closing static fallback with a geographically projected mask to avoid reintroducing the diagonal artifact before hydration or without JavaScript.

## Changed files

- Demonstrations: `src/demos/Relay.tsx`, new `src/demos/relayModel.ts`, `src/demos/Authorization.tsx`, `src/demos/Geospatial.tsx`, `src/demos/model.ts`.
- Content/integration: new `src/data/engineeringNotes.ts`, `src/components/DemoPanel.tsx`, `src/sections/Hero.tsx`, `src/sections/Projects.tsx`.
- Interactions: `src/components/CustomCursor.tsx`, `src/components/InteractionEffects.tsx`, `src/components/SignalJourney.tsx`, `src/utils/sound.js`, `src/utils/typewriter.ts`.
- Styling: `src/styles/demos.css`, `src/styles/interactions.css`, `theme.css`.
- Fallback: `scripts/globe-fallback.ts`, `assets/geo/globe-fallback.svg`.
- Verification: new `scripts/check-evolution.ts`, `scripts/check-sound.mjs`, this report.

## Preserved

All seven project records, smaller previews, project links, original technical case studies, portrait, CV, contact implementation, theme persistence, command palette, interactive globe and Nepal marker, gallery, network hero, sound settings and scroll circuit remain. No package/dependency, CNAME, Google verification, sitemap/robots, deployment workflow, original HTML case study, or protected globe implementation changes. Preservation checks validate original CV/domain bytes and original case-study content.

## Executed checks

Passed:

```sh
npm run build
node scripts/check.mjs
node scripts/check-sound.mjs
npx --no-install tsx scripts/check-typewriter.ts
npx --no-install tsx scripts/check-demos.ts
npx --no-install tsx scripts/check-correction.ts
npx --no-install tsx scripts/check-evolution.ts
node scripts/check-production.mjs
git diff --check
```

Build includes `tsc --noEmit`. No lint task is configured. After the final mobile diagram correction, build/typecheck, evolution tests, production checks and diff whitespace checks passed again. Vite retains its existing informational warning about the intentionally external classic `contact-config.js` script; contact response mocks pass.

Browser verification used the local production preview in the in-app browser:

- Signal Lost Lab: offline retention, relay A failure, failover to B, restored uplink, backend receipt, assignment, lost return path and recovered acknowledgment with one backend incident.
- Sentinel: DENY, REQUIRE APPROVAL and ALLOW scenarios with immutable audit entries.
- Rakshak: layer selection, before/after control, masked-cell inspection and synthetic difference rendering.
- No horizontal overflow at 320, 375, 768, 1024 and 1440px in checked homepage/demo layouts. Final 375px light-theme inspection caught and corrected an inherited rule hiding the network graphic.
- Scroll circuit advanced to Contact and reversed to Skills; current-stage state updated.
- Native mouse drag rotated the globe and produced a comet tail. Nepal marker remained attached to the globe.
- Command palette focused its input, filtered results, closed on Escape and restored focus to its trigger.
- Dark desktop and light mobile screenshots captured. No captured browser console errors in tested tabs.

## Performance and accessibility

Final gzip sizes: main JavaScript **142,410 bytes**, CSS **18,403 bytes**. Baseline main JS was 140,554 bytes: growth **1,856 bytes**. Lazy chunks: Relay 4,078 bytes, Authorization 1,839 bytes, Geospatial 2,286 bytes, Globe 4,286 bytes. No dependencies added. Timers/listeners clean up; relay autoplay pauses in a background document.

Essential checked text/control token contrast: dark 8.33–16.71:1, light 6.06–13.92:1. Native controls, named regions, text status alternatives, bounded non-live event history, reduced-motion CSS/logic and audio-disabled operation are retained. This is not a full WCAG audit.

## Limits

- Lighthouse/Core Web Vitals were not measured; bundle sizes are not a Lighthouse score.
- Physical-device touch, acoustic listening and browser-emulated reduced motion were not tested. Reduced-motion guards and audio behavior were checked in automated/source tests.
- No real email was sent. Contact acceptance, rejection, malformed response, HTTP failure and timeout were tested with mocks.
- The flagship demonstrations use local educational models, not live rescue, real authorization execution or acquired satellite imagery. Owner-reported physical-device evidence remains clearly separate.
- No production deployment or live end-to-end service verification was performed. Unchanged smaller demos were covered by preservation/asset checks rather than a new exhaustive browser audit.

## Preview

```sh
cd /Users/prabinpoudel/Documents/GitHub/Portfolio-website
npm run dev
```

Or preview the generated production output with `npm run preview -- --port 4173`. Open `http://127.0.0.1:4173/?demo=rescuer-sathi#portfolio` for Signal Lost Lab.
