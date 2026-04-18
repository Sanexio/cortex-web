# Adapter — WordPress

> Implementierung in **Phase 1**. Bun-basiert, rendert Trunk-Content zu WP-Pages
> und Theme-Assets.

## Ziel-Site

`westend-hausarzt.com` (Local by Flywheel auf Cluster-Mini-02) bzw. später Prod bei domainfactory.

## Adapter-Pipeline (geplant)

1. `validate.sh` — Schema-Check
2. `build.mjs` — Trunk-Content → WP-Page-JSON + Theme-Assets
3. `tokens-to-wp-css.mjs` — `trunk/design/tokens.css` → `praxiszentrum/assets/css/tokens.css`
4. `content-to-wp-pages.mjs` — YAML/MD → WP-CLI-Imports (`wp page update ...`)
5. `components-to-partials.mjs` — Component-Specs → Theme-Partials (`template-parts/`)
6. `media-upload-to-wp.mjs` — Medien aus Registry → WP-Media-Library

## Views-Logik (CW-005)

Bei Produkt-Rendering greift der WP-Adapter IMMER auf `views.praxis`:
- `show_price: false` → Preis wird NICHT gerendert
- `cta_url` → Link zu sanexio.eu, keine Kauf-Buttons

## Status

Phase 0: nur dieser Platzhalter. Implementierung: Phase 1.
