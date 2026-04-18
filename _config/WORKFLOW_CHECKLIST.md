# Cortex-Web — Workflow-Checklist

## Content-Änderung (Standard-Ablauf)

1. `git pull` (auf beiden Geräten Cluster-Mini-02 / SSMD-MacBookPro, falls Multi-Device)
2. Editiere `trunk/<pfad>` (YAML/MD)
3. `bun tools/validate.sh` — Schema-Check
4. `bun tools/sync-wp.sh` oder `bun tools/sync-shopify.sh` oder `bun tools/sync-all.sh`
5. Verify im Browser (Local WP oder Shopify-Preview)
6. `git add trunk/ && git commit -m "content: …"`
7. Nach Verify grün: Deploy (GitHub-Actions WP, Shopify-GitHub-Sync)

## Neues Produkt anlegen

1. Kopiere `trunk/content/products/bluttests/basic-check.yaml` als Template
2. Fülle alle Pflichtfelder (siehe `trunk/schema/product.schema.json`)
3. Lege Medien in `_media-source/produkte/<produkt>/` ab
4. `bun tools/media/register.mjs <medien>` — lädt zu Shopify Files, trägt in Registry ein
5. Referenziere `media://<key>` im Produkt-YAML
6. Validate + Sync wie oben

## Neue Komponente (Maximal-Trunk)

1. Lege `trunk/design/components/<name>/` an mit:
   - `spec.md` — Props, States, A11y
   - `reference.html` — Browser-testbare Referenz
   - `tokens.json` — Komponenten-lokale Tokens
2. Adapter-Mapping ergänzen:
   - `adapters/wordpress/components-to-partials.mjs` → PHP-Partial
   - `adapters/shopify/components-to-sections.mjs` → Liquid-Snippet
3. Sync + visuelle Abnahme

## Session-Start („Projekt fortsetzen")

Siehe `Nexus/_rules/SESSION_LIFECYCLE.md` §1 — der LL-043-Workflow läuft standardisiert.

## Session-Ende („Session beenden")

Siehe `Nexus/_rules/SESSION_LIFECYCLE.md` §2 — 5-Schritte-Workflow ist Pflicht.
