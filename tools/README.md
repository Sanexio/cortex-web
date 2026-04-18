# tools/ — Cortex-Web Build-/Validate-/Sync-Skripte

> Phase 0: Platzhalter. Skripte werden in Phasen 1/2 implementiert.

## Geplante Skripte

| Skript | Funktion | Phase |
|--------|----------|:-----:|
| `validate.sh` | AJV-Schema-Check auf `trunk/content/` | 1 |
| `verify.sh` | Visuelle Regression (Puppeteer), analog praxis-redesign | 1–2 |
| `sync-wp.sh` | WP-Adapter-Build + Deploy | 1 |
| `sync-shopify.sh` | Shopify-Adapter-Build + Push | 2 |
| `sync-all.sh` | Beide Plattformen in einem Rutsch | 2 |
| `watch.sh` | Auto-Rebuild bei Trunk-Änderung | optional |
| `media/register.mjs` | Medium in `_media-source/` + Upload zu Shopify Files + Registry-Eintrag | 1–2 |
| `media/migrate-to-nas.mjs` | Später: M-3c → M-3d Migration | Post-POC |

## Konventionen

- Bun-first, `.mjs` für Skripte (ESM)
- `.sh`-Wrapper für CLI-Aufrufe (`tools/sync-wp.sh` → `bun run tools/sync-wp.mjs`)
- Logs nach `logs/YYYY-MM-DD_<tool>.log`
- Fehler sind rot, Erfolg grün (Terminal-Farben), strukturierte JSON-Logs optional
