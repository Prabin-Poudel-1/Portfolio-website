# Production publishing

This update adds two-layer synthesized interaction sounds with saved volume control, a horizon-clipped Nepal country label, and locally hosted Space Grotesk / Manrope variable fonts. The original CV, custom domain, project content and case studies remain preserved.

## Validation

Production build and TypeScript checks pass. The focused static preservation, contact-response mocks, sound, project demonstrations, globe projection, routes/assets, bundle budget and color-token contrast checks pass. `git diff --check` passes.

Browser checks covered the desktop globe marker and backside occlusion, mobile controls at 320px, and volume persistence across reload. Sound synthesis was checked programmatically; subjective listening and physical-device touch testing were not performed. Reduced-motion guards are covered by the existing checks; browser emulation and Lighthouse measurements were unavailable. No real contact email was sent.

Fonts total approximately 56 KB before transfer compression. Initial application JavaScript is approximately 138 KB gzip. Interactive demonstrations and globe remain separate lazy chunks.

## GitHub Pages

`.github/workflows/pages.yml` validates both development and master pushes. Only master publishes the generated `dist` artifact using GitHub Pages Actions. Repository Settings → Pages must use GitHub Actions as its source. Keep `CNAME` set to `www.poudelprabin.com.np`; Vite's default `/` base is correct for this custom domain.

## Local preview

```sh
npm ci
npm run build
npm run preview -- --port 4173
```

Open http://127.0.0.1:4173/ . To validate manually, enable sound and adjust its level, rotate the globe through the back hemisphere, navigate all projects and case studies, and test the contact form with an authorized real message.
