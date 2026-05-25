# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg „Cortex-Web fortsetzen"** (Lean v3, 2026-05-25, post Welle 13).
> Pflicht-Init: `Nexus/CLAUDE.md` + `Nexus/_rules/AUTONOMY_CONTRACT.md`.
> Aktive Detail-Source-of-Truth: `Nexus/specs/cortex-platform/SESSION_RESUME.md`.
> Pre-Flight: `bash tools/validate.sh` (läuft im Demo-Modus ohne CORTEX_TENANT_DIR).
> **Einmal pro Mac:** `bash tools/install-git-hooks.sh` (aktiviert Pre-Commit-Lint).

## §1 Stand (HOT)

- **Cortex-Web-HEAD:** Welle 13 — `sanexio` als letztes Brand-Token
  in Schemas/Drift-Sync abstrahiert. `sanexio_source` →
  `upstream_source`, `site: sanexio` → `site: hub`, `status_sanexio`
  → `status_hub`. 40 Tenant-YAMLs + 1 Demo-YAML, beide Schemas, 7
  Drift-Sync-Files. Linter strict 0, validate grün.
- **Cortex-Web-HEAD vorher:** Welle 12 — Role-Keys `juvantis`→`shop`,
  `praxis`→`practice` (4 Schemas, 6 Renderer git-mv, 70 Tenant-YAMLs).
- **Repo-Rolle:** Framework + Adapter + Schema. Tenant-Daten leben in
  `Sanexio-Tenant/` (separates Repo, via `CORTEX_TENANT_DIR` oder
  `~/.cortex/tenant-path`).
- **Helper-Trio in `tools/lib/`:** `tenant-path.{sh,mjs}` (Datenpfad),
  `theme-path.mjs` (Local-WP-Theme), `tenant-config.mjs` (funktionale
  Konstanten aus `<tenant>/tenant.config.json`).
- **Linter:** `tools/lint-no-tenant-leaks.sh` strict-clean +
  Pre-Commit-Hook in `tools/git-hooks/pre-commit`. Installer:
  `tools/install-git-hooks.sh` (setzt `core.hooksPath`).

## §2 Pre-Flight

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
bash tools/lint-no-tenant-leaks.sh --strict
```

Im Demo-Modus (kein `CORTEX_TENANT_DIR` gesetzt) liest validate.sh aus
`trunk/_examples/`. Mit `CORTEX_TENANT_DIR=$HOME/Cortex/projects/Sanexio-Tenant`
gegen den Stracke-Tenant.

## §3 Direkter Einstieg in die nächste Welle

Größere Backlog-Items (eigenständige Wellen):
- **Welle 14 — Doku-Cleanup** (mittel, kein Risiko): README + Specs
  sprechen vielfach noch von „Praxis-View" / „Juvantis-View" /
  „Sanexio-Source" als Konzept-Namen. Mechanisch durch Role-Begriffe
  ersetzen. Pure-Doku, keine Code-Risiken.
- **Welle 15 — `SANEXIO_REPO`-Pfad + `vendor: "Sanexio"`** (klein):
  `adapters/astro/lib/astro-writer.mjs` hardcodiert
  `sites/sanexio-github-io/repo` — sollte via
  `tenant.config.astro.repo_path` gelesen werden. Analog
  `adapters/shopify/lib/renderers/product-shop.mjs` mit hardcoded
  `vendor: "Sanexio"` — sollte via `tenant.config.shop.vendor` lesen.
- **OSS-Launch-Vorlauf** (groß, koordiniert): History-Cleanup auf
  `Sanexio/cortex-web/main` mit filter-repo + Force-Push + Re-Clone
  aller 5 Macs, Backup-Branch `pre-tenant-split-2026-05-24` als Anker.

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
