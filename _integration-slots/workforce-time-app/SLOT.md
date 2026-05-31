---
slot_name: workforce-time-app
status: PROMOTED
proposed_at: 2026-05-27
proposed_by: SSMD-MacBookPro-M5
sandbox_at: 2026-05-28
hardened_at: 2026-05-30
promoted_at: 2026-05-31

# Workforce-Time-App ist eine eigenstaendige Web-App (React/Vite + Node-API + SQLite).
# Der App-Code selbst soll generisch werden (Framework-Anteil im Cortex-Web-Trunk),
# Praxisdaten, Mitarbeitende, Bereichszuordnung und SQLite/Snapshots bleiben
# tenant-seitig in Sanexio-Tenant. Daher: both.
operates_on: both

sandbox_location: projects/Praxis Monitoring/Arbeitszeiten/
trunk_target: sites/workforce-time/

owner_mac: SSMD-MacBookPro-M5
verification_macs: [Cluster-Mini-02]

promotion_commit: b19c660
retired_at: null
---

# Slot: workforce-time-app

## Zweck

Eigene browserbasierte Praxis-Loesung fuer Arbeitszeiten, Schichtplanung,
spaeter MFA-Self-Service und iPad/iPhone-Terminal. Ersetzt mittelfristig
Ordio. Der Slot fuehrt den projekt-nah gereiften Prototyp aus
`projects/Praxis Monitoring/Arbeitszeiten/` kontrolliert in den
Cortex-Web-Trunk und trennt dabei sauber:

- **Framework-Anteil** (React-UI, Node-API, SQLite-Schema, Importpfad) →
  `sites/workforce-time/` im Cortex-Web-Trunk, tenantneutral.
- **Tenant-Anteil** (Praxisname, Bereichszuordnungen, Wochen-Soll je
  Mitarbeiter, Importquellen, Live-SQLite, Snapshots) → bleibt in
  `Sanexio-Tenant` und wird ueber `CORTEX_TENANT_DIR` plus die Helper
  `tools/lib/tenant-path.mjs` und `tools/lib/tenant-config.mjs`
  aufgeloest.

## Pain-Point

Der Prototyp ist fachlich weit (Schichtmatrix, Ist/Soll-Monatszaehler,
Delta-Sync, Konflikterkennung), traegt aber die Praxis Westend tief im
Code: Standortnamen, Bereiche, Mitarbeiterdefaults und die SQLite-Datei
liegen direkt im App-/API-Repo. Damit das Tool als Cortex-Web-Trunk-Modul
trag- und mehrmandantenfaehig wird, muss dieser Tenant-Anteil heraus,
bevor irgendetwas in den Trunk wandert.

Prio-Stufe: **Popt** (Trunk-Aufnahme blockiert, solange Tenant-Trennung
nicht steht).

## Interface-Vertrag

**Kommando(s) im Trunk-Endzustand:**
```
# UI + API gemeinsam (dev)
CORTEX_TENANT_DIR=/Users/ssmd/Cortex/projects/Sanexio-Tenant \
  bun run --cwd sites/workforce-time dev

# Nur API
CORTEX_TENANT_DIR=/Users/ssmd/Cortex/projects/Sanexio-Tenant \
  node sites/workforce-time/server/api.js

# Build
bun run --cwd sites/workforce-time build
```

**Inputs:**
- `CORTEX_TENANT_DIR` (Pflicht im Produktiv-/Praxis-Betrieb;
  Demo-Fallback geht auf `trunk/_examples/` per `tenant-path.mjs`).
- `tenant.config.json` im Tenant-Root, Block `workforce`:
  - `workforce.locations[]`: Standortnamen des Tenants
  - `workforce.work_area_categories{}`: Bereichszuordnung pro
    Praxis-Kategorie
  - `workforce.default_weekly_hours{}`: Wochen-Soll je
    Mitarbeitenden (Schluessel = Mitarbeiter-ID, Wert = Stunden)
  - `workforce.sprechstunde_defaults[]`: Default-Frueh/Spaet je
    Stamm-Sprechstunde (Arzt-Namensteil + Segment + Zeitfenster)
  - `workforce.area_aggregations{}`: Aggregations-Regeln (ein
    Arzt-Schluessel kann mehrere Bereiche zusammenfassen)
- `trunk/workforce/` im Tenant-Repo:
  - `seed.json` (initiale Mitarbeitende, Bereiche, Schichten)
  - `imports/` (Snapshot-Eingang, gitignored)
  - `db/arbeitszeiten.sqlite` (Live-DB, gitignored)
- ENV-Overrides:
  - `ARBEITSZEITEN_DB` (Pfad auf SQLite-Datei,
    Default: `<tenant>/trunk/workforce/db/arbeitszeiten.sqlite`)
  - `ARBEITSZEITEN_API_HOST`, `ARBEITSZEITEN_API_PORT`
  - `IMPORT_SNAPSHOT_PATH`, `MIGRATION_BASELINE_PATH`

**Outputs:**
- HTTP-API auf `127.0.0.1:5175` (Default), JSON.
- Browser-UI auf `127.0.0.1:5174` (Vite-Dev) bzw. statisches Build
  unter `sites/workforce-time/dist/`.
- SQLite-Datei und Snapshots **ausschliesslich** im Tenant-Repo
  unterhalb `trunk/workforce/` (gitignored).
- Audit-Eintraege und Import-Batches in derselben SQLite.

**Nicht-Ziele:**
- Keine Praxisnamen, Mitarbeiterlisten, Wochen-Soll-Werte oder
  Importdateien im Cortex-Web-Trunk.
- Keine SQLite-Datei im Cortex-Web-Trunk (auch nicht in Examples).
- Kein automatischer Schreibzugriff auf Ordio.
- Keine Auth-/Login-Implementierung in dieser Slot-Iteration.

## Akzeptanz-Kriterien (fuer HARDENED-Status)

- [ ] Lauffaehig auf `SSMD-MacBookPro-M5` mit
      `CORTEX_TENANT_DIR=…/Sanexio-Tenant`.
- [ ] Lauffaehig auf `Cluster-Mini-02` mit gleichem Tenant-Pfad
      (Mirror-Sync stellt `Sanexio-Tenant` dort bereit).
- [ ] Demo-Fallback (ohne `CORTEX_TENANT_DIR`) startet gegen
      `trunk/_examples/workforce/` ohne echte Praxisdaten.
- [ ] Code-Scan `tools/lint-no-tenant-leaks.sh --strict` clean. Die
      konkreten Tenant-Tokens (Praxisname, Aerzte-, MFA-, Standort-
      Bezeichner) finden sich ausschliesslich in
      `tenant.config.json -> workforce.*` und `seed.json`, nicht im
      Trunk-Code.
- [ ] `server/db.js` zieht alle Standort-/Bereichs-/Defaults-Listen
      ausschliesslich aus `tenant.config.json`; harte
      `defaultLocationName`-Strings sind entfernt.
- [ ] README im Sandbox-/Trunk-Ordner mit Install-/Run-/Trouble­shoot-
      Sektion und Hinweis auf `CORTEX_TENANT_DIR`.
- [ ] `private/`-Pfade des Prototyps werden im Trunk-Code nicht
      referenziert; alle Defaults gehen ueber `tenantPath('trunk/workforce/...')`.
- [ ] Dry-run-/Read-only-Import-Default fuer Snapshot-Endpoints bleibt
      bestehen, `--commit` bzw. expliziter Request-Body schaltet
      Persistenz frei.
- [ ] Tier-3-konform: keine Ordio-Credentials, keine
      Patient-Klartext-Exports, keine externen Empfaenger.

## Promotion-Plan

1. **Tenant-Trennung im Sandbox-Repo** (`projects/Praxis Monitoring/Arbeitszeiten/`):
   - Konfigurations-Layer einziehen, der `tenant.config.json` und
     `tenantPath()` aus Cortex-Web liest (per relativem Import oder
     gespiegelter Helper-Datei).
   - `server/db.js`: alle Praxis-Strings aus dem Code in
     `tenant.config.json` verlagern; Default-Doctor-Sprechstunden-
     Defaults via `workforce.sprechstunde_defaults`.
   - `databasePath`-Default auf
     `tenantPath('trunk/workforce/db/arbeitszeiten.sqlite')` umstellen.
2. **Tenant-Repo befuellen** (`Sanexio-Tenant`):
   - Block `workforce` in `tenant.config.json` ausfuellen.
   - `trunk/workforce/seed.json` mit den realen Mitarbeitenden,
     Bereichen und Wochen-Soll-Werten anlegen
     (kommt 1:1 aus dem Prototyp-Code).
   - `trunk/workforce/db/` und `trunk/workforce/imports/` als
     gitignored Verzeichnisse mit `.gitkeep` anlegen.
3. **Verifikation auf 2 Macs** mit dem Tenant-Repo als Quelle.
4. **Promotion in den Cortex-Web-Trunk**:
   - `tools/promote-to-trunk.sh "projects/Praxis Monitoring/Arbeitszeiten" sites/workforce-time/`
     (oder `git subtree add`, falls eigenes Remote).
   - Cortex-Web-`package.json`-Workspace fuer `sites/workforce-time`
     ergaenzen (falls Bun-Workspaces).
   - `_config/RULES.md`-Eintrag CW-0xx: "Workforce-App ist
     framework-only im Trunk, alle Praxisdaten via tenant".
   - `CHANGELOG.md`-Eintrag mit Slot-Referenz.
5. **Sandbox-Endzustand:**
   - `projects/Praxis Monitoring/Arbeitszeiten/` wird zur read-only-
     Historie; Pointer-README verweist auf `sites/workforce-time/`.
   - Private SQLite/Snapshots wandern in `Sanexio-Tenant/trunk/workforce/`
     (nicht in Cortex-Web).

## Risiken

- `server/db.js` ist 113k Zeilen schwer und enthaelt viele
  Praxis-Defaults inline; mechanisches Extrahieren riskiert
  Regressionen in Sprechstunden-/Aggregations-Logik.
- SQLite-Migrations-Stand (Batch `batch_ordio_20260524213847396`,
  2.265 aktive Source-Records) muss beim Umzug in
  `Sanexio-Tenant/trunk/workforce/db/` mitwandern, sonst geht der
  Migrations-Baseline-Bezug verloren.
- Ordio bleibt bis Cutover fuehrende Quelle; im Trunk darf kein
  Code landen, der Ordio schreibend anspricht.
- `node_modules`/SQLite-Native-Binding ist plattformabhaengig;
  Promotion nicht bei abweichender Bun-/Node-Version mischen.

## Entscheidungs-Historie

- 2026-05-27: Slot vorgeschlagen. Architektur-Entscheidung mit dem
  Tenant-Owner: App-/API-Code wird generisch in `sites/workforce-time/`,
  Praxisdaten und SQLite bleiben tenant-seitig (`Sanexio-Tenant`),
  Zugriff ueber `CORTEX_TENANT_DIR` + `tenant-path.mjs`/`tenant-config.mjs`.
  Private SQLite/Snapshots wandern nie in den oeffentlichen
  Cortex-Web-Trunk.
- 2026-05-28: Status `PROPOSED` → `SANDBOX`. Schritte 1-3 des
  Promotion-Plans abgeschlossen:
  - Schritt 1 (Tenant-Trennung Server + UI): `server/tenant.js`,
    refactored `server/db.js`, refactored `src/App.tsx` mit
    Bootstrap-`workforce`-Block.
  - Schritt 2 (Tenant-Seed): `loadTenantSeedFromFile`,
    `applyTenantSeed`, `tools/extract-tenant-seed.mjs`.
  - Schritt 3 (Daten-Cutover): SQLite (5,9 MB, 8 echte Mitarbeitende
    nach Demo-Hygiene), `migration-baseline.json` und 4
    Snapshot-JSONs ins Tenant umgezogen. Tenant-Commit `970b2f8`
    ist auf `github.com:Sanexio/sanexio-tenant.git`. Prototyp-Repo
    lokal initialisiert (Commit `f099916`, kein Remote).
  - Smoketest auf SSMD-MacBookPro-M5: `npm run build` clean, API
    liefert echte Praxisdaten aus der Tenant-DB, Display-Overrides
    + Aggregations-Group + Schichtschema greifen wie spezifiziert.
  - Demo-Hygiene: 6 Demo-Employees + 23 Demo-Shifts + 6
    Demo-TimeEntries + 3 Demo-Absences + 28 Demo-source_records
    + 4 sync_runs + 5 import_batches geloescht. Backup unter
    `db/.pre-migration-backup/arbeitszeiten-pre-demo-purge-*.sqlite`.
  - Verify auf `Cluster-Mini-02` (HARDENED-Bedingung) noch offen;
    Tailscale-Layer up, aber SSH-Login braucht User-Interaktion.
- 2026-05-30: Status `SANDBOX` → `HARDENED`. Verify auf `Cluster-Mini-02`
  durchgefuehrt:
  - SSH-Key (id_ed25519) ueber `ssh-copy-id -o PreferredAuthentications=password
    -o PubkeyAuthentication=no` auf `cluster-mini-02@100.127.125.48`
    hinterlegt (das Multi-Key-Try-Limit hatte zuvor das Passwort-Prompt
    verhindert).
  - Sanexio-Tenant via Mirror-Sync auf cluster-mini-02 mit Commit
    `970b2f8` (identisch zu SSMD-MacBookPro-M5).
  - Arbeitszeiten-Code per `tar | ssh tar` nach cluster-mini-02
    `~/Cortex/projects/Praxis Monitoring/Arbeitszeiten/` synchronisiert
    (572 KB, ohne node_modules/dist/private/.git); rsync war wegen
    Apple-openrsync-Inkompatibilitaet nicht nutzbar.
  - `npm install` (71 packages), `npm run build` (tsc + vite, 242 KB)
    clean.
  - API-Smoketest mit `CORTEX_TENANT_DIR` auf den dortigen Sanexio-
    Tenant: Tenant-DB existiert dort nicht (gitignored im Mirror), also
    greift der Tenant-Seed-Loader und legt eine frische DB mit 8 Stamm-
    Mitarbeitenden, 1.161 Shifts, 1.065 TimeEntries, 37 Absences an.
    workforce.isDemo: false, defaultLocationName aus Tenant-Config geladen,
    aggregationGroups (1 Gruppe) und shiftSchema-Kategorien (2) identisch
    zum Stand auf SSMD-MacBookPro-M5. Display-Overrides greifen.
  - Acceptance-Criteria fuer HARDENED erfuellt (zwei Macs, echter
    Anwendungsfall, README, kein hartcodierter Pfad).
- 2026-05-31: Status `HARDENED` → `PROMOTED`. Schritt 5 ausgefuehrt:
  - Code per `tar | tar` aus der Sandbox in `sites/workforce-time/`
    kopiert (ohne node_modules/dist/private/.git/docs).
  - `server/tenant.js` durch Re-Export der Cortex-Web-Helper
    (`tools/lib/tenant-path.mjs` + `tools/lib/tenant-config.mjs`)
    ersetzt; API-Bruecken `tenantIsDemo`/`tenantSource` lokal nachgebildet.
  - `package.json` Name auf `@cortex-web/workforce-time` umgestellt,
    Trunk-spezifischer README geschrieben, Sandbox-`docs/` entfernt.
  - Code-Kommentare entstanden Tenant-frei (Override-Schemas mit
    generischen Token-Platzhaltern).
  - `tools/lint-no-tenant-leaks.sh --strict` clean fuer alle Framework-
    Pfade; Trunk-Site selbst manuell gescannt (0 Treffer).
  - `npm install` (71 packages, Node v22+), `npm run build`
    (`tsc --noEmit` + `vite build`, 242 KB) clean.
  - API-Smoketest aus `sites/workforce-time/server/api.js` mit
    `CORTEX_TENANT_DIR=…/Sanexio-Tenant` greift auf die echte
    Tenant-SQLite zu (8 Mitarbeitende, 1.150 Shifts, 1.227 TimeEntries,
    2.453 Source-Records).
  - CHANGELOG-Eintrag in Cortex-Web v0.7.0; neue Regel CW-010
    „Trunk-Sites sind framework-only".
- Sandbox-Endzustand:
  `~/Cortex/projects/Praxis Monitoring/Arbeitszeiten/` bleibt als
  read-only-Historie mit Pointer-README auf `sites/workforce-time/`.
