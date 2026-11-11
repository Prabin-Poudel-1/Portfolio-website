# Self-hosted portfolio typography

Space Grotesk (display) and Manrope (body) variable fonts, from the Google Fonts repository:
- https://github.com/google/fonts/tree/main/ofl/spacegrotesk
- https://github.com/google/fonts/tree/main/ofl/manrope

Retrieved 2026-11-11. Included OFL licenses apply. Locally subset to Latin, punctuation, currency and arrows and compressed to WOFF2 with fontTools. No third-party font requests are made at runtime.

Both fonts are preloaded. CSS uses swap and local Arial fallbacks adjusted using the font x-height/ascent/descent metrics. This limits fallback shifts; no zero-CLS claim is made without measurement.
