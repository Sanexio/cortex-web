# Adapter — Shopify

> Implementierung in **Phase 2**. Bun-basiert, rendert Trunk-Content zu Shopify-Sections,
> -Pages und -Products.

## Ziel-Store

`medzpoint` auf `sanexio.eu` — Theme-ID `181128757515` (Taste 8.0.1 + Custom Sections).

## Adapter-Pipeline (geplant)

1. `validate.sh` — Schema-Check
2. `build.mjs` — Trunk-Content → Shopify-JSON-Templates + Liquid-Sections
3. `tokens-to-liquid.mjs` — `trunk/design/tokens.css` → `assets/tokens.css` + `config/settings_data.json`
4. `products-to-shopify.mjs` — YAML → Shopify Admin API (Products, Variants)
5. `pages-to-shopify.mjs` — MD → Shopify Pages (Admin API)
6. `components-to-sections.mjs` — Component-Specs → Liquid-Snippets
7. `media-upload-to-shopify.mjs` — Medien aus `_media-source/` → Shopify Files

## Views-Logik (CW-005)

Bei Produkt-Rendering greift der Shopify-Adapter auf `views.juvantis`:
- `show_price: true` → Preis wird gerendert
- `cta_label` → Kauf-/Buchungs-Button

## Status

Phase 0: nur dieser Platzhalter. Implementierung: Phase 2.
