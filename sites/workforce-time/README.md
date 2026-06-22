# Workforce-Time-App

Browserbasierte Workforce-App fuer Arbeitszeiten, Schichtplanung,
spaeter MFA-Self-Service und iPad/iPhone-Terminal. Trunk-Komponente
von Cortex-Web. Generischer App-Code im Trunk; alle praxis-spezifischen
Daten kommen ueber den aktiven Tenant.

## Quick Start

```bash
# Demo-Modus (keine Tenant-Anbindung, neutrale Beispieldaten)
cd sites/workforce-time
npm install
npm run dev

# Tenant-Betrieb (echte Praxisdaten aus dem aktiven Tenant-Repo)
export CORTEX_TENANT_DIR=/Pfad/zum/Tenant-Repo
npm run dev
```

- Browser-UI: `http://127.0.0.1:5174`
- Lokale API: `http://127.0.0.1:5175`
- Lokale Subdomain mit Caddy + Mailpit: siehe `docs/LOCAL_CADDY_MAILPIT.md`

Nur die API:

```bash
npm run api
```

## Tenant-Anbindung

Der App-Code spricht keinen Praxis-Identifier hart aus. Alles
Tenant-spezifische kommt aus zwei Quellen im aktiven Tenant-Root
(per `CORTEX_TENANT_DIR` oder `~/.cortex/tenant-path`):

- `tenant.config.json -> workforce.*`
  - Standorte, Arbeitsbereiche, Aggregations-Gruppen,
    Wochen-Soll, Sprechstunden-Defaults, Display-Name-/Work-Area-
    Overrides, Schichtschema mit `location_preference_tokens`,
    Tolerances, Pfade.
- `trunk/workforce/`
  - `seed.json`: reproducibler Initialdatensatz, wird beim ersten
    Start einer leeren App-DB geladen.
  - `db/arbeitszeiten.sqlite`: Live-DB (gitignored).
  - `imports/`: Snapshot-Eingang fuer Delta-Imports (gitignored).
  - `migration-baseline.json`: Cutover-Stand des Migrations-Imports.

Resolver: `server/tenant.js` re-exportiert die Cortex-Web-Helper
`tools/lib/tenant-path.mjs` und `tools/lib/tenant-config.mjs`.

## Build

```bash
npm run build
```

Laeuft `tsc --noEmit` plus `vite build`. Output unter `dist/`.

## Tenant-Seed regenerieren

```bash
# Dry-Run zur Sichtkontrolle
npm run extract-tenant-seed -- --dry-run

# In den aktiven Tenant schreiben (CORTEX_TENANT_DIR muss gesetzt sein)
npm run extract-tenant-seed
```

Standard-Quelle ist die App-DB im aktiven Tenant. `--db <pfad>`
ueberschreibt die Quelle, `--out <pfad>` das Ziel. Read-only auf
der Quell-DB, idempotent ueber `source_id`.

## Leitplanken

- Keine Praxisnamen, Mitarbeiterlisten oder Wochen-Soll-Werte im
  Trunk-Code. Tokens leben in `tenant.config.json` und `seed.json`.
- SQLite-DB und Importartefakte werden nicht versioniert
  (Tenant-`.gitignore`).
- Kein automatischer Schreibzugriff auf das Quell-Import-System.
- UX-Regel: keine toten Planungsflaechen — siehe
  `_rules/UX_INTERACTION_CONTRACT.md`.

## Slot-Historie

Promotion-Pfad und Akzeptanz-Kriterien:
`_integration-slots/workforce-time-app/SLOT.md`.
