# Final Phase 3 visual and interaction correction

Continues `feat/react-portfolio-phase-1`, preserving Phase 2 `0ddd717` and Phase 3 `781a2f6`. No branch restart, dependency installation, push, merge, backend change or deployment.

## Sentinel AI preservation

Before editing, `sentinel-ai.html` matched `master` exactly. Its original description, technology list, six-stage architecture, engineering discussion, verification links, limitations and sources were already intact. The case-study URL remains `sentinel-ai.html`; the showcase still includes its original image and technical description. Added a prominent direct live-site link to https://sentinel.poudelprabin.com.np alongside the case study and repository.

All three case-study HTML files now add only one shared stylesheet link. Preservation tests remove exactly that known line, then compare the remaining bytes to master. CV and CNAME still compare byte-for-byte without normalization. The original Sentinel architecture was read in the browser, the direct route opened, and the live website loaded successfully. Public GitHub repository was also verified accessible.

## Design and interactions

- `theme.css` centralizes graphite/ink, soft ivory, periwinkle accents, text, surfaces, borders, controls and globe material tokens. It applies after existing styles in React and all three static case studies. Supporting card surfaces, rounded geometry, typography hierarchy, navigation, buttons, project treatments, command palette and demo states were refined rather than merely changing the background.
- Retained the approved `assets/portrait.webp` in the hero identity and About section, with a restrained hover treatment and reduced-motion override. No invented avatar or facial image.
- `LocationCard` lazily loads a self-contained canvas globe near the viewport. Real Natural Earth 1:110m coastlines are projected onto a sphere with a front-hemisphere clip, shaded ocean/land, graticules and a regional Nepal marker. No Three.js/WebGL dependency or large textures.
- Globe auto-rotation, direct pointer drag/tilt, short inertia, keyboard arrows/Home, pause/resume and Locate Nepal controls. Marker hover/focus pauses rotation for reading. Pointer capture/cancellation handles interruptions; `touch-action: pan-y` preserves page scrolling. Reduced motion disables auto-rotation and inertia while retaining manual controls. Static SVG covers no-JavaScript, loading and rendering/data/module failure. The existing Bharatpur/Chitwan/Nepal identity is preserved; marker is regional, not precise personal coordinates. No geolocation API.
- Rendering is capped around 30 fps with DPR <=1.6, stops outside the viewport and in hidden tabs, and resumes when relevant. RAF, fetch, observers and listeners clean up on unmount.
- `SignalJourney` connects Skills → Expertise → About/education → Contact with an original SVG route, moving signal, completed nodes and section states. GSAP scrub follows normal scroll in both directions; resize updates the geometry. Reduced motion shows a static completed pathway. Mobile uses a narrower gutter, never over text or controls. Existing About copy supplies the verified education context; no employment history was invented.

## Files

Added `theme.css`, `src/styles/journey.css`, `src/components/{Globe,LocationCard,SignalJourney}.tsx`, `src/utils/globeMath.ts`, `assets/geo/{land.json,globe-fallback.svg,README.md}`, `scripts/{globe-fallback,check-correction}.ts`, this report.

Updated App section composition, About, project data/actions, main style imports, the three case-study stylesheet links, static copy configuration, preservation and contrast/bundle checks. Phase 3 demonstrations, audio service, contact backend/config, CV and existing assets remain intact.

## Verification actually performed

- Production build and strict TypeScript pass; no lint setup exists.
- `scripts/check.mjs`: static references, CV/CNAME preservation, all original case-study content, five mocked contact outcomes pass. No email sent.
- `scripts/check-sound.mjs` and `scripts/check-demos.ts`: existing audio and seven-project demo regressions pass.
- `scripts/check-correction.ts`: 128 land rings projected/clipped at 20 orientations, unit-sphere bounds, longitude wrap, tilt limits, pause/reduced-motion/inertia behavior, Sentinel destinations/content and map fallback assets pass.
- `scripts/check-production.mjs`: routes/assets, lazy chunks, initial JS budget and actual shared token contrast pass. Essential text/controls: dark 8.33–16.71:1, light 6.06–13.92:1. Not a complete WCAG audit.
- Browser: desktop and mobile hero/location composition; light/dark themes; actual mouse drag changed longitude and tilt; keyboard rotation, auto-rotation, pause/resume, reset and marker tooltip verified. Paused longitude remained 84.00; offscreen longitude remained 137.01 across subsequent interactions, confirming suspension in the tested session.
- Scroll signal reached 1.000 at Contact and reversed to approximately .115 at Skills with later nodes returning to pending. Command palette search/Escape, sound toggle off/on, the preserved Sentinel simulator (ALLOW outcome), and theme switching remained functional. Original Sentinel architecture and live website were inspected. No console errors observed in tested sessions.
- No horizontal document overflow at 320, 375, 768, 1024 or 1440px. Screenshots: workspace `output/final-correction/{desktop-hero,desktop-globe,mobile-globe,signal-light}.png`.
- `git diff --check` passes.

## Loading cost and limits

Final production initial JS: **411.40 kB raw / 137.64 kB gzip**; CSS **73.33 kB raw / 15.46 kB gzip**. Globe is a separate **7.83 kB raw / 3.28 kB gzip** lazy chunk, with ~75 kB coastline JSON and ~41 kB SVG fallback loaded near the location section. No new runtime dependency. Existing intentional Vite warning for separately copied contact-config.js remains harmless.

No Lighthouse/Core Web Vitals score claimed; runtime CPU/FPS profiling is not exposed by the available browser adapter. Physical touchscreen dragging, listening-based audio review, full screen-reader/cross-browser testing and browser reduced-motion emulation remain manual checks. Reduced-motion rotation/pause logic is unit-tested and CSS/GSAP media guards were reviewed, but not browser-emulated. Test on an Android phone and use DevTools reduced-motion emulation before production approval.

## Sources and preview

Design references inspected: https://jiro.build/ (Miles editorial example), https://designspells.com/, https://connorhohlen.com/#skills. Original composition, colors and path implementation; no copied reference assets or code. Coastline provenance/public-domain terms are recorded in `assets/geo/README.md`.

```sh
cd /Users/prabinpoudel/Documents/GitHub/Portfolio-website
npm run build
npm run preview -- --port 4173
```

Open http://127.0.0.1:4173/ . Final checkpoint is the commit containing this report (`git log -1 --format=%h -- FINAL_CORRECTION.md`); its exact hash is also supplied in the completion message. Nothing published.
