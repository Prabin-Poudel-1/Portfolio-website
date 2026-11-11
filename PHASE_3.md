# Phase 3 — interactive engineering field notes

Implemented on `feat/react-portfolio-phase-1`, preserving `0ddd717` and both previous phases. No push, merge, deployment, domain change, backend change or new dependency. Ready for final production review, subject to the manual checks below.

## Delivered

The existing seven-project gallery now opens **The Lab**, an inline, keyboard-accessible demonstration panel. It uses the existing project selection and shared opt-in sound service; Escape closes it and restores trigger focus. Each flagship module and the shared lighter previews load only on demand, with real loading feedback and an error fallback. This is deliberately a small extension to the portfolio rather than another application or a replacement design.

- **Rescuer Sathi:** eight selectable communication stages, start/pause/replay/reset, simulated gateway connectivity, offline queue blocking and recovery, highlighted SVG paths, acknowledgment return path and a readable compact phone network. A cleanup-managed timer drives optional playback; hidden tabs pause it. Clearly a simulation with no emergency requests, encryption execution or delivery guarantees.
- **Sentinel AI:** configurable tool action, resource, contract validity and simulated approval. Deterministic allow/deny/require-approval outcomes, explanations, blocked/permitted enforcement presentation and an in-memory audit counter. Rules are visible. No claim that the real Rust/Cedar engine, signatures, sandbox or authenticated approvals execute in the browser.
- **Rakshak:** synthetic before/after categorical grid, layer toggle, selected-cell evidence, row/column controls and arrow-key navigation with a single grid tab stop. Explicit source/review information and no assigned geographic coordinates. No actual imagery, NISAR observations, measurements, predictions or validated disaster claims. The existing documented provenance and QA caveats remain visible.
- **Chitwan Care:** synthetic report location and selectable submission/review/assignment/evidence/completion stages. No classifier, upload or live backend call.
- **Student Management:** searchable/filterable fictional directory and sample student ID. No real records or unsupported attendance claims.
- **Chitwan Plus:** schematic destination map, category filter and location descriptions. No real routing, coordinates, booking or Gemini integration.
- **United Tech Club:** genuine desktop (1440px) and mobile (375px) homepage captures taken from the live site, compressed to WebP, viewport toggle and observed events/gallery/committee links. No iframe assumption. Neutral attribution explicitly retains the site's developer credits and unconfirmed personal contribution.

The real screenshots are 73 kB / 36 kB approximately. Other original imagery and technical case studies remain intact. Club observations reflect November 2026, not a permanent claim about event dates. Existing Phase 2 documentation supplies project-source verification; no new unsupported project capabilities were inferred.

## Files

Created:
- `src/components/DemoPanel.tsx`
- `src/demos/{Relay,Authorization,Geospatial,Previews}.tsx`, `src/demos/model.ts`
- `src/styles/demos.css`
- `assets/screenshots/{club-desktop,club-mobile}.webp`
- `scripts/check-demos.ts`, `scripts/check-production.mjs`, `PHASE_3.md`

Modified:
- `src/sections/Projects.tsx`: demo entry point, shared swipe helper, no-JavaScript explanation.
- `src/main.tsx`: demo stylesheet.
- `scripts/static.tsx`: generated sitemap/robots and correct noindex/title for the 404 document.

No new route replaces an existing case study. The three case studies continue to be separate static documents; homepage and 404 remain prerendered. Essential project content remains in the server-rendered documentation index without JavaScript. Interactive demo state is intentionally ephemeral.

## Executed validation

- `npm run build` includes strict TypeScript checking and production/static generation: pass.
- `node scripts/check.mjs`: local references, original CV/CNAME/case-study byte equality and accepted/rejected/HTTP/malformed/timeout contact mocks: pass. No real message sent.
- `node scripts/check-sound.mjs`: default silence, saved preference, throttle, replacement voice, mute and hidden-tab suppression/suspension with an AudioContext double: pass. Source guards for reduced motion present.
- `npx --no-install tsx scripts/check-demos.ts`: relay offline/reconnection boundaries, 36 policy combinations, unsupported-action denial, 192 categorical cases, swipe thresholds, seven project assets/routes and SEO outputs: pass.
- `node scripts/check-production.mjs`: references across all five generated HTML pages, lazy chunk separation, initial JavaScript size budget and essential demo text contrast: pass.
- `git diff --check`: pass. No lint configuration exists; no lint result is claimed.
- Browser production preview: Sentinel allow/approval/deny, SOS offline blocking/reconnection/acknowledgment and start/pause/automatic completion/replay, grid comparison/layer/selection/arrow controls, report stage selection, student filtering/selection, travel category selection and club capture toggle verified.
- Fifteen rapid gallery changes, Escape/trigger focus restoration, command palette search/Escape/focus restoration, mobile menu Escape, saved audio toggle across reload, theme switching, static case-study navigation and browser back/forward verified. Native empty-form validation checked without sending. No console errors observed in tested sessions.
- No horizontal document overflow measured at **320, 375, 768, 1024, 1440px**. Desktop dark, mobile light and light-theme demo layouts visually inspected. Compact SOS labels were improved after the narrow-phone inspection. No broken loaded images observed in the inspected homepage; all declared project/image paths also checked from disk.
- Captures outside the repo: `/Users/prabinpoudel/Documents/Codex/2026-10-11/c/output/phase3/desktop.png` and `mobile.png`.

## Performance and accessibility evidence

Production Vite output, local build, no network/CPU throttling: initial JS **406.39 kB raw / 137.90 kB gzip**, CSS **59.22 kB raw / 12.79 kB gzip**. Deferred modules: Sentinel 1.33 kB, Rakshak 1.46 kB, SOS 1.59 kB, lighter previews 2.79 kB gzip. Budget check caps initial JS at 150,000 gzip bytes. No new fonts, libraries, live maps or third-party demo services. Lazy images have dimensions; timers and animation contexts have cleanup; new motion uses finite transform/opacity/stroke animations and reduced-motion CSS guards.

Calculated primary/muted/accent text contrast against demo surfaces: dark **14.94 / 9.18 / 10.73:1**; light **13.11 / 6.25 / 6.13:1**. All exceed AA text contrast. Focus outlines, visible labels, status regions, 44px main controls and text descriptions accompany visual information. Small grid cells have equivalent full-size row/column controls and roving keyboard navigation. This is not a complete WCAG certification or screen-reader audit.

Lighthouse is not installed/exposed in the available tools; the browser adapter does not expose Performance APIs or reduced-motion emulation. Consequently **no Lighthouse score, LCP, CLS or INP result is claimed**. Bundle/asset measurements are loading-cost evidence, not substitutes for runtime performance metrics. Vite retains its existing harmless warning about the intentionally unbundled `contact-config.js`, which is copied to production output and verified.

## Remaining manual release checks

1. On Android/iOS, swipe horizontally between projects and scroll vertically through open demos; ensure scrolling is not intercepted. Automated directional threshold tests do not substitute for physical touch testing.
2. Enable audio at low device volume. Listen while changing projects, selecting nodes and evaluating policies; verify restrained levels/no audible clutter, then background the tab and mute again. Browser preference and mocked audio behavior passed; subjective sound quality was not assessed by listening.
3. In browser DevTools Rendering, emulate `prefers-reduced-motion: reduce`, reload, and exercise gallery, hero and all demos. Controls and text should work with decorative animation suppressed. Browser emulation was unavailable here; only source guards were checked.
4. Run a throttled Lighthouse audit on the built preview and a screen-reader/cross-browser pass before release. Runtime performance targets remain unmeasured. Review real deployment headers and 404 behavior on the eventual hosting platform.
5. Replace Rakshak synthetic evidence only with verified, publishable assets and provenance. Confirm individual club contribution before adding authorship claims. Private Rakshak repository access requires authentication.

## Preview / checkpoint

```sh
cd /Users/prabinpoudel/Documents/GitHub/Portfolio-website
npm run build
npm run preview -- --port 4173
```

Open http://127.0.0.1:4173/ and choose **Explore interactive demo** in the project gallery. For source development use `npm run dev`.

The final Phase 3 checkpoint is the commit containing this report; obtain its exact hash with `git log -1 --format=%h -- PHASE_3.md`. The completion message records that hash. Deploy only built `dist/` after explicit approval; no publication was performed.
