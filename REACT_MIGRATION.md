# React portfolio — Phase 1 checkpoint

Work branch: `feat/react-portfolio-phase-1`. Production `master` is unchanged. Nothing pushed or deployed.

## Run

```sh
npm ci
npm run dev
```

Production-equivalent preview (includes static rendering):

```sh
npm run build
npm run preview -- --port 4173
node scripts/check.mjs
```

Publish only the contents of `dist` after approval. Do not point GitHub Pages at the React source directory. No deployment workflow or domain changes were made.

## Implementation

- React 19, strict TypeScript, Vite, React Router; semantic TSX, dedicated CSS, standalone contact JS.
- Editorial navy/teal and warm off-white homepage, portrait, featured projects, expertise, searchable technology categories, contact and footer.
- React navigation with Escape dismissal and active section indication; persistent theme preference.
- Interactive authorization concept diagram; scoped GSAP/ScrollTrigger entrance effects with cleanup and reduced-motion media query.
- Build-time React static rendering followed by hydration. Essential content appears without JavaScript. Native mail links remain available; mobile navigation remains exposed without JS.
- Existing case studies stay as static `.html` pages with original metadata, content, lightboxes, assets and scripts. This intentionally avoids a risky wholesale rewrite.
- Existing verified Web3Forms contract retained, with mount cleanup. No real messages sent.
- CV, CNAME and case studies checked byte-for-byte against production.

## Files

`src/App.tsx`, `src/main.tsx`; `src/components/{Header,Footer,SystemDiagram}.tsx`; `src/sections/{Hero,Projects,Expertise,Skills,About,Contact}.tsx`; `src/utils/contact.js`; `src/styles/main.css`; `scripts/static.tsx`, `scripts/check.mjs`; `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`, this report.

## Checks actually performed

- TypeScript and Vite production build pass.
- Static HTML/local asset references and unchanged CV/domain/case studies pass.
- Contact mocks: confirmed acceptance, rejection, HTTP failure, malformed JSON and timeout pass. Failed submissions retain the message.
- Browser: mobile menu expansion/Escape dismissal, light/dark toggle, skill filtering, native required-field validation, desktop contact and hero visual inspection.
- Measured no horizontal overflow at 320, 768, 1024 and 1440 CSS pixels; visually checked 375px light-mode hero and desktop dark hero/contact layout.
- No console errors observed in tested browser session. No broken loaded images observed.
- `git diff --check` pass.

## Boundaries / remaining phases

Phase 1 foundation is implemented. Full cross-browser, real-device, screen-reader and Lighthouse audits were not performed; no performance score claimed. Reduced-motion CSS/GSAP behavior is implemented but not separately emulated in this browser session. No live form delivery test was sent.

Phase 2 remains: seven-project cinematic gallery, sound system/toggle, command palette, advanced transitions. Current five projects are preserved; Rakshak needs verified source/assets, and United Tech Club needs source/visual verification before detailed claims. Do not invent missing material.

Phase 3 remains: labeled engineering demos, lab, expanded case studies, performance optimization, comprehensive accessibility/SEO and deployment preparation. Initial bundle is about 129 kB gzip; split animation/demo dependencies during that phase. Existing static case-study appearance is intentionally retained in this checkpoint.

## Reference research

Read Jiro (https://jiro.build/), Design Spells (https://designspells.com/), Josh W. Comeau (https://www.joshwcomeau.com/) and Hoverstat (https://www.hoverstat.es/). Direction: clear editorial hierarchy, intentional interaction feedback, explanatory engineering visuals. No assets/code copied. Codrops returned 403, Awwwards timed out, Godly redirected to an inaccessible destination; no repeated research.

## Phase 1 visual correction — 2026-11-10

The first checkpoint carried forward the portrait-led hero, split project cards, boxed skills and repeated section rhythm. This correction replaces that composition while retaining the React architecture.

- Hero: editorial statement, mixed serif/sans hierarchy, five-domain interactive SVG network, project inspector, small identity signature and social strip. Satellite intelligence is explicitly an interest, not a claimed verified project.
- Projects: full-width numbered visual spreads, below-image technical summaries, restrained project accents, paired device imagery and smaller secondary projects.
- Expertise: numbered capability index alongside an editorial heading. Skills: searchable technology directory. About: portrait with a personal editorial narrative.
- Files: Hero.tsx, SystemDiagram.tsx, Projects.tsx, About.tsx, main.tsx, main.css, new composition.css, this report. No dependencies added; CV, contact implementation, routing, domain and case-study content unchanged.
- Revisited Connor Hohlen (https://connorhohlen.com/), Jiro, Design Spells and Josh Comeau for engineering-oriented presentation, meaningful interactive explanation and typographic hierarchy. No layouts/assets copied. Codrops still returned 403 and Awwwards timed out.
- Compared the master snapshot in a separate local server against the rebuilt page. Captured original and redesigned desktop screenshots and a 375px light-theme mobile screenshot. Inspected desktop hero, project spread, expertise and skills. Mobile node selection, menu opening/Escape dismissal, theme persistence and skill filtering verified. No console errors observed; no horizontal overflow measured at 320/375px; no broken loaded images observed. No new real email sent.
- TypeScript/build, static references, byte-preservation checks, five contact mocks and diff whitespace checks pass. Cross-browser/physical-device and Lighthouse verification remain outside this correction. Existing reduced-motion protections retained.
- Phase 2 was not started. Work remains on feat/react-portfolio-phase-1, preserving 9b2ff65. Nothing pushed or deployed.
