# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg „Cortex-Web fortsetzen"** (Lean v3, 2026-05-25, post Welle 9).
> Pflicht-Init: `Nexus/CLAUDE.md` + `Nexus/_rules/AUTONOMY_CONTRACT.md`.
> Aktive Detail-Source-of-Truth: `Nexus/specs/cortex-platform/SESSION_RESUME.md`.
> Pre-Flight: `bash tools/validate.sh` (läuft im Demo-Modus ohne CORTEX_TENANT_DIR).

## §1 Stand (HOT)

- **Cortex-Web-HEAD:** Welle 9 — cta_url-Schema parametrisiert, Linter 67→0,
  Strict-Modus lokal grün.
- **Repo-Rolle:** Framework + Adapter + Schema. Tenant-Daten leben in
  `Sanexio-Tenant/` (separates Repo, via `CORTEX_TENANT_DIR` oder
  `~/.cortex/tenant-path`).
- **Helper-Trio in `tools/lib/`:** `tenant-path.{sh,mjs}` (Datenpfad),
  `theme-path.mjs` (Local-WP-Theme), `tenant-config.mjs` (funktionale
  Konstanten aus `<tenant>/tenant.config.json`).
- **Linter:** `tools/lint-no-tenant-leaks.sh` strict-clean. Pre-Commit-
  Aktivierung steht als nächste kleine Welle aus.

## §2 Pre-Flight

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
bash tools/lint-no-tenant-leaks.sh --strict
```

Im Demo-Modus (kein `CORTEX_TENANT_DIR` gesetzt) liest validate.sh aus
`trunk/_examples/`. Mit `CORTEX_TENANT_DIR=$HOME/Cortex/projects/Sanexio-Tenant`
gegen den Stracke-Tenant.

## §3 Direkter Einstieg in die nächste Welle

Welle 10 — Pre-Commit-Hook für `lint-no-tenant-leaks.sh --strict`. Damit
ein versehentliches Re-Einschleusen von Tenant-Spuren ins Framework
beim Commit geblockt wird.

Größere Backlog-Items (eigenständige Wellen):
- `adapters/shopify/lib/renderers/page-juvantis.mjs` → `page-tenant-shop.mjs`
  (Schema-Bruch, juvantis-Site-Enum tief im Trunk-Schema verwoben).
- History-Cleanup auf `Sanexio/cortex-web/main` vor OSS-Launch
  (filter-repo + Force-Push + Re-Clone aller 5 Macs, Backup-Branch
  `pre-tenant-split-2026-05-24` bleibt).

## §4 Harte Verbote

- Linter strict bleibt grün. Neue Tenant-Spuren im Framework-Pfad
  (`adapters/`, `tools/`, `_config/`, `_rules/`, `specs/`,
  `_integration-slots/`, `trunk/schema/`) werden vor Commit gefixt oder
  in Tenant-Pfad verschoben.
- Adapter dürfen NICHT mehr hartcodiert `trunk/content/` oder
  `trunk/media/` lesen — immer via Helper-Trio.
- Schema-Validation vor Build (CW-002).
- I-2 hybrid i18n (CW-004).
- Plattform-Trennung zwischen Tenant-Sites bleibt bestehen (CW-005).

## §5 Detail-Quelle

Vollständige Welle-Historie + Backlog: `~/Cortex/Nexus/specs/cortex-platform/SESSION_RESUME.md`.
Die ist auch der „letzter Stand"-Master, wenn dieses HOT-File und der
Plattform-Resume divergieren.
