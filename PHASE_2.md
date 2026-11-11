# Phase 2 — interactive exhibition

Branch: feat/react-portfolio-phase-1. Phase 1 commits remain in history. No push, merge, deployment, dependency installation or Phase 3 simulation work.

## Implemented

- Seven-entry, user-controlled project gallery with coordinated GSAP image, copy and number entrances; project colors, numbered progress controls, previous/next controls, wrapping keyboard arrows, Home/End and directional touch detection. No autoplay or scroll hijacking. Timelines and media-query contexts are cleaned up during rapid switching/unmount.
- Dedicated stacked mobile layout and semantic controls. Full existing five-project documentation remains in an expandable, server-rendered index (open without JavaScript). Existing case-study URLs and content remain intact.
- Central Web Audio service with six original synthesized tone contours: project, selection, open, close, success and discoverable connection tone. Default off; opt-in preference stored locally; context created on interaction; one voice at a time, 110ms throttle, 180ms effects, low gain, suspension when hidden. No downloaded sounds, background music or scroll audio. Clipboard/form success emits sound only after confirmed success.
- Searchable native-dialog command palette (button or Ctrl/Cmd+K), arrows/Enter, Escape, modal focus containment and focus restoration. Sections, projects and external profiles included.
- Fine-pointer magnetic hero buttons, tactile controls, selected node transitions, section introductions, subtle theme changes, progressive browser-native cross-document fades and interactive reconnect-themed 404.

## Content verification

- Five existing projects retain original claims and assets. Student Management System is explicitly described as Smart University Management System.
- Rakshak: owner supplied private repository https://github.com/Prabin-Poudel-1/rakshak. Read README.md and docs/SATELLITE_INTEGRATION.md through authenticated GitHub connector. The latter documents experimental Narayani evidence tiles, authenticated Spring routes, native-grid point queries and Flutter map integration. It also reports unresolved NISAR identification-group QA failures. No validated flooding, damage, operational disaster prediction or satellite SOS claims made. Private repository is labeled. Typographic cover is explicitly conceptual, not satellite imagery. Screenshot still needed.
- United Tech Club: https://www.unitedtechclub.com/ inspected. Actual captured screenshot stored under assets/screenshots/united-tech-club.png, showing the site's hackathon announcement. Public events/notices/committee/gallery features verified. Live site credits other developers; personal development contribution remains unconfirmed and is not claimed. No repository URL or stack invented.

## Files

Created: src/data/projects.ts; src/components/{SoundToggle,CommandPalette,InteractionEffects,NotFound}.tsx; src/sections/ProjectArchive.tsx; src/utils/sound.js; src/styles/interactions.css; scripts/check-sound.mjs; assets/screenshots/united-tech-club.png; this report.
Modified: src/sections/Projects.tsx, src/components/Header.tsx, src/components/SystemDiagram.tsx, src/App.tsx, src/main.tsx, src/utils/contact.js, scripts/check.mjs, style.css.

## Verification performed

- TypeScript and Vite production build pass. No new dependencies.
- scripts/check.mjs: local references, static output, unchanged CV/CNAME/case-study HTML bytes and five contact mock cases pass. No real emails sent.
- scripts/check-sound.mjs: default silence, preference, throttle, replacement voice, mute, hidden-tab suppression and suspension pass using an AudioContext test double. Reduced-motion CSS and GSAP guards checked in source.
- Browser: desktop gallery and 375px mobile visually inspected/captured; rapid 15-step switching, Home/left wraparound, project command search/selection, dialog Escape/focus restoration, audio toggle and preference persistence tested. Interactive 404 reconnect tested. No console errors observed in these sessions. Mobile measured width equals document width at 375px.
- Browser screenshots: workspace output/phase2/desktop.png and mobile.png (outside repository).

## Limits

No listening-based acoustic assessment, physical Android/iOS touch test, browser reduced-motion emulation, cross-browser suite, Lighthouse measurement or production deployment performed. Touch handlers are implemented but physical swipes remain unverified. Cross-document view transitions progressively enhance supporting browsers; others use ordinary navigation. Rakshak imagery and United Tech Club contribution confirmation remain content gaps, not fabricated accomplishments. Phase 3 remains untouched.

## Preview

```sh
cd /Users/prabinpoudel/Documents/GitHub/Portfolio-website
npm run build
npm run preview -- --port 4173
node scripts/check.mjs
node scripts/check-sound.mjs
```
