# Portfolio upgrade handoff — 11 October 2026

Repository: `/Users/prabinpoudel/Documents/GitHub/Portfolio-website`

## What changed

Preserved the existing static HTML/CSS/JavaScript architecture and navy/teal identity. Refined the hero with internship availability, clear project/CV actions, and prominent GitHub/LinkedIn links. Moved projects immediately after the introduction. Added consistent featured cards, Engineering Expertise, six technology categories, and detailed Rescuer Sathi and Chitwan Care case studies.

Consolidated overlapping styling; added responsive layouts, keyboard focus, skip navigation, accessible mobile navigation, reduced-motion support, persistent light/dark themes, descriptive metadata, favicon, and social preview. Removed unnecessary third-party animation/style runtimes. The contact form retains its existing Google Apps Script endpoint and fields, with clearer loading, success, timeout, and error handling.

Corrected social profile URLs throughout the three pages. Preserved the four project repositories and existing verified contact information. Project descriptions distinguish implemented workflows from experiments and unvalidated capabilities. Rescuer Sathi includes its three bundled injury-model assets without implying that these represent all of Prabin's AI work. Chitwan Care describes bundled on-device classification without claiming custom model training.

## Files

Modified:
- `index.html`
- `style.css`
- `script.js`

Added pages:
- `rescuer-sathi.html`
- `chitwan-care.html`

Added assets:
- `assets/favicon.svg`
- `assets/portrait.webp`
- `assets/social-preview.jpg`
- `assets/projects/rescuer-sathi.webp`
- `assets/projects/chitwan-care.webp`
- `assets/projects/smart-university.webp`
- `assets/projects/chitwan-plus.webp`

Added this handoff as `PORTFOLIO.md`. No framework components or dependencies were added. Shared styling and interaction logic remain in the existing CSS and JS files.

## Assets and screenshots

The portrait is optimized from the existing real photo. Project covers are optimized versions of the existing concept artwork, explicitly labeled as such. Original images remain available. Four project covers total approximately 568 KB versus 9.4 MB for the original PNGs.

Actual application screenshots were not found in the inspected local project folders or featured repository trees. Please provide:
- Rescuer Sathi: SOS screen, rescuer dashboard, rescue map, Guardian Mode, injury assessment.
- Chitwan Care: waste detection, report submission, tourist report history, admin dashboard, department cleanup/evidence workflow.

Suggested destinations are `docs/screenshots/rescuer-sathi/` and `docs/screenshots/chitwan-care/`. Remove private user/location/medical information before publishing screenshots. Existing concept art is not presented as application screenshots.

## Verification

Passed:
- JavaScript syntax check (`node --check script.js`).
- Prettier formatting checks on the three HTML pages and shared CSS/JS.
- `git diff --check`.
- Static checks for local assets, fragment destinations, unique IDs, single page H1, image alt text/dimensions, and external-link protection.
- HTTP checks for all three local pages and CV download.
- Four project GitHub repository URLs returned HTTP 200.
- Browser layouts at 390, 768, and 1280 px with no horizontal overflow.
- Mobile case-study layouts, menu open/close and Escape handling, focus indicators, and theme persistence.
- Fresh homepage preview showed no browser console errors.
- Mocked contact-form success, rejected response, HTTP failure, network error, and blocked localStorage paths.

There is no package-managed build, lint, or type-check pipeline in this static repository. No Lighthouse score was measured. No real contact message was sent; actual Apps Script delivery remains unverified. Project testing mentioned in the case studies is attributed to historical project documentation, not represented as tests performed in this portfolio task. Full assistive-technology and cross-browser audits were not performed.

## CV preserved

`cv.pdf` was not edited, replaced, or regenerated. Its download links remain functional, and served bytes match the original file.

SHA-256: `ed2470d7e91c884f040876b7656fb9cfe901f17fb424ae2041772820f368411e`

Backend services and other project repositories were not modified.

## Preview locally

The preview server was left running at http://127.0.0.1:8765/.

To start it again:

```sh
cd /Users/prabinpoudel/Documents/GitHub/Portfolio-website
python3 -m http.server 8765 --bind 127.0.0.1
```

Open:
- http://127.0.0.1:8765/
- http://127.0.0.1:8765/rescuer-sathi.html
- http://127.0.0.1:8765/chitwan-care.html

If port 8765 is already in use by the existing preview, reuse that server or choose another free port.

## Manual deployment

No commit, push, or deployment was performed.

After reviewing and approving the changes:
1. Open the portfolio repository in GitHub Desktop or your preferred Git client and review the changed files above. Keep `cv.pdf` and `CNAME` unchanged.
2. Commit the reviewed portfolio changes on the intended publishing branch (current checkout: `master`) and push to the existing remote.
3. Check GitHub Settings → Pages to confirm the configured publishing branch/folder or Actions workflow. Follow the repository's existing publishing configuration; these settings were not changed or verified here.
4. Wait for the Pages deployment to complete. Check the live homepage, both case-study URLs, mobile menu, CV download, and contact delivery.
5. Preserve the existing custom-domain configuration (`CNAME`: `www.poudelprabin.com.np`).


## Physical-device and UI refinement update

The project developer confirmed completed Rescuer Sathi physical-device relay and power testing, plus Chitwan Care device permissions, report-to-cleanup flow, and local-image detector evaluation. Chitwan Care uses a deployed backend and Neon PostgreSQL; it does not require a laptop-hosted backend. Case studies now reflect these updates and distinguish developer-confirmed testing from historical repository records. No numerical results were invented and no Android tests were rerun in this portfolio task.

Added three unchanged user-provided JPEG screenshots under `assets/screenshots/`: `rescuer-dashboard.jpg`, `rescue-map.jpg`, and `guardian-mode.jpg`. These supersede the previous Rescuer Sathi screenshot availability note. Clickable device frames preserve the full image, and the homepage uses actual app previews. Chitwan Care screenshots are still needed. Original concept assets remain available, clearly labeled wherever used.

Refined mobile hero proportions, portrait presentation, featured-card copy/badges, shared radius/spacing tokens, 44px navigation controls, and control-border contrast. Checked all three pages for overflow at 320, 375, 768, 1024, and 1440px. Inspected light/dark views and the screenshot gallery. Menu open/Escape dismissal passed. Essential text color pairs meet 4.5:1 and control boundaries exceed 3:1 in both palettes (calculated); this is not a full accessibility certification. Fresh browser console had no errors. Local links, assets, CV checksum/download, and existing mocked contact behavior checks passed. CV, backend services, and deployment remain untouched.

## Final interaction polish

Preserved resting appearance, content, social links, CV, screenshots, and form endpoint. Refined existing card/button effects instead of duplicating them; shortened image hover timing to 350ms. Added 360ms one-time section reveals with IntersectionObserver and native Web Animations, 180–220ms control transitions, active section indicators with `aria-current`, focusable section destinations, and an overlay mobile menu that does not shift content. Added a native dialog screenshot viewer with full-size fallback links, previous/next buttons, arrow keys, Escape, Tab wrapping, and focus/scroll restoration. No dependencies added.

Changed `script.js`, `style.css`, and shared asset version references in the three HTML files. The gallery viewer is created progressively in JavaScript; original screenshot links still work without it. Motion-sensitive CSS disables animation and transitions; reveal logic skips and cancels animations when reduced motion is enabled. Content is never hidden while waiting for an observer.

Verification: JavaScript syntax, formatting, static link/asset checks, unchanged CV checksum and download, mocked form paths, and isolated reveal/reduced-motion tests passed. Browser checks covered mobile and desktop viewer behavior, Escape/arrow keys/Tab wrapping, focus restoration, section focus and active state, both theme controls, and no horizontal overflow at 320/375/768/1024/1440px. Mobile menu opening kept the main content position unchanged. Reduced-motion behavior was tested through the code harness and CSS inspection, not an OS preference change. No Lighthouse run or real contact message was performed. No commit, push, or deployment.
