# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg „Cortex-Web fortsetzen"** (Lean v3, 2026-05-25, post Welle 12).
> Pflicht-Init: `Nexus/CLAUDE.md` + `Nexus/_rules/AUTONOMY_CONTRACT.md`.
> Aktive Detail-Source-of-Truth: `Nexus/specs/cortex-platform/SESSION_RESUME.md`.
> Pre-Flight: `bash tools/validate.sh` (läuft im Demo-Modus ohne CORTEX_TENANT_DIR).
> **Einmal pro Mac:** `bash tools/install-git-hooks.sh` (aktiviert Pre-Commit-Lint).

## §1 Stand (HOT)

- **Cortex-Web-HEAD:** Welle 12 — Role-Keys abstrahiert. `juvantis` →
  `shop`, `praxis` → `practice` in 4 Schemas, 5 umbenannten Renderern,
  ~20 Tools, 70 Tenant-YAMLs + 4 Demo-YAMLs. Linter strict 0, validate
  grün (1 Demo + 11 Tenant-Produkte), Build smoke OK.
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
- **Welle 13** — `sanexio` als Site-Enum-Wert abstrahieren. Der
  Astro-Brand-Hub-Adapter rendert heute `site: sanexio`. Per gleicher
  Logik wie Welle 12: `sanexio` → `hub` (oder `brand-hub`). Schema-
  Bruch, aber kleiner Scope (nur 1 Site-Enum-Wert + status_sanexio +
  sites/SANEXIO_GITHUB_IO_INDEX).
- **Doku-Cleanup** — README + Specs sprechen vielfach noch von
  „Praxis-View" / „Juvantis-View" als Konzept-Namen. Mechanisch
  durch `practice-view` / `shop-view` ersetzen. Reine Doku, kein Code.
- **OSS-History-Cleanup** auf `Sanexio/cortex-web/main`
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
