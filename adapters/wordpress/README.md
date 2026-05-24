# Adapter — WordPress

> Implementierung in **Phase 1**. Bun-basiert, rendert Trunk-Content zu WP-Pages
> und Theme-Assets.

## Ziel-Site

WordPress-Site des konfigurierten Tenants (typisch: lokal via Local-by-Flywheel
oder vergleichbares Dev-WP, später Production). Tenant- und Theme-Pfad werden
zur Laufzeit über `tools/lib/tenant-path.mjs` und `tools/lib/theme-path.mjs`
aufgelöst — keine Mac- oder Domain-Hartcodes in den Adaptern.

## Adapter-Pipeline (geplant)

1. `validate.sh` — Schema-Check
2. `build.mjs` — Trunk-Content → WP-Page-JSON + Theme-Assets
3. `tokens-to-wp-css.mjs` — `trunk/design/tokens.css` → `<theme>/assets/css/tokens.css`
4. `content-to-wp-pages.mjs` — YAML/MD → WP-CLI-Imports (`wp page update ...`)
5. `components-to-partials.mjs` — Component-Specs → Theme-Partials (`template-parts/`)
6. `media-upload-to-wp.mjs` — Medien aus Registry → WP-Media-Library

## Views-Logik (CW-005)

Bei Produkt-Rendering greift der WP-Adapter IMMER auf `views.praxis`:
- `show_price: false` → Preis wird NICHT gerendert
- `cta_url` → externer Link (z. B. zur Shop-Domain des Tenants), keine Kauf-Buttons im Praxis-Output

## Status

Phase 0: nur dieser Platzhalter. Implementierung: Phase 1.
