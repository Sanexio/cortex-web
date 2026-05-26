# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg „Cortex-Web fortsetzen"** (Lean v3, 2026-05-26, post Welle 15).
> Pflicht-Init: `Nexus/CLAUDE.md` + `Nexus/_rules/AUTONOMY_CONTRACT.md`.
> Aktive Detail-Source-of-Truth: `Nexus/specs/cortex-platform/SESSION_RESUME.md`.
> Pre-Flight: `bash tools/validate.sh` (läuft im Demo-Modus ohne CORTEX_TENANT_DIR).
> **Einmal pro Mac:** `bash tools/install-git-hooks.sh` (aktiviert Pre-Commit-Lint).

## §1 Stand (HOT)

- **Cortex-Web-HEAD:** Welle 15 — Letzte zwei `Sanexio`-Hardcodes aus
  dem Framework gezogen. Astro-Adapter (`adapters/astro/lib/astro-writer.mjs`)
  und Shopify-Renderer (`adapters/shopify/lib/renderers/product-shop.mjs`)
  lesen ihren Tenant-Wert jetzt via `tenant.config.json` (neue Keys
  `astro.repo_path` + `shop.vendor`, in beiden Tenants gepflegt:
  Sanexio-Tenant real, trunk/_examples Demo). `SANEXIO_REPO`/`sanexioPath`
  → `ASTRO_REPO`/`astroPath`; `tools/build-sanexio.sh` →
  `tools/build-astro.sh` (git-mv, neuer Inhalt liest astro.repo_path).
  Stale TS-Interface `profile_urls: {praxis|juvantis|sanexio}` →
  `{practice|shop}` (Welle-12-Nachzug). Verifikation: shopify build dry
  liefert `vendor: "Sanexio"` aus Config; team-to-astro schreibt nach
  resolvtem Pfad ohne Diff (idempotent). Lockstep-Commit:
  Sanexio-Tenant zuerst, dann Cortex-Web.
- **Cortex-Web-HEAD vorher:** Welle 14 — Doku-Cleanup: Konzept-Namen
  „Praxis-View" / „Juvantis-View" / „Sanexio-Source" mechanisch auf
  Role-Begriffe gezogen; Code-Key-Drift in berührten Files
  synchronisiert.
- **Cortex-Web-HEAD davor:** Welle 13 — `sanexio` als letztes
  Brand-Token in Schemas/Drift-Sync abstrahiert (`sanexio_source` →
  `upstream_source`, `site: sanexio` → `site: hub`, `status_sanexio`
  → `status_hub`).
- **Cortex-Web-HEAD davor:** Welle 12 — Role-Keys `juvantis`→`shop`,
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
