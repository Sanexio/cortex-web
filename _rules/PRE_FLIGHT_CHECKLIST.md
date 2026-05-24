# PRE_FLIGHT_CHECKLIST — Cortex-Web

> Pflicht-Checks VOR jedem Sync / Deploy. Wachsen mit den Adaptern.

## Phase 0 (heute)

Noch kein aktiver Pre-Flight — keine Adapter implementiert.

## Geplant ab Phase 1

### §1 Validate — Schema-Check

- `bun tools/validate.sh`
- Prüft alle YAML/MD in `trunk/content/` gegen `trunk/schema/*.schema.json`
- Muss grün sein, sonst Abbruch

### §2 Media-Registry-Konsistenz

- Jede `media://<key>`-Referenz in Content hat einen Eintrag in `trunk/media/registry.yaml`
- Jede Registry-URL liefert HTTP 200 (Head-Request)
- Lokale Originale in `_media-source/` existieren laut Registry-`backup_local`

### §3 Adapter-Dry-Run

- WP-Adapter: generiert Output in `adapters/wordpress/dist/` ohne Deploy
- Shopify-Adapter: generiert Liquid-Sections in `adapters/shopify/dist/` ohne Push
- Visuelle Diff gegen letzten akzeptierten Stand (Puppeteer, wie `praxis-redesign`)

### §4 AB-Diff (vor Live-Deploy)

- Vorher-Screenshot vs. Nachher-Screenshot (wie praxis-redesign `tools/ab-diff.mjs`)
- Bei > 2% pixel-delta: Selbstprüfung + Rückfrage an den Tenant-Operator

## Referenz

Vorbild: `Cortex-Web/sites/praxis-webseite/_rules/PRE_FLIGHT_CHECKLIST.md` (vor
2026-04-19: `projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md`). Viele
Checks werden von dort übernommen, sobald Adapter existieren.
