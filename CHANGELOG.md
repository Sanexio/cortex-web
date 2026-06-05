# CHANGELOG — Cortex-Web

Alle nennenswerten Änderungen an diesem Projekt. Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/). Versionierung: SemVer.

## Unreleased

### Workforce-Time OSS-Isolation nach adversarialer Review (Stufe 4, 2026-06-05)

- **C6 — echte Praxis-Domain entfernt**: die produktive Subdomain war in
  5 getrackten Dateien der OSS-App hartcodiert
  (`deploy/proxy/arbeitszeiten.conf` + `.nginx.conf`,
  `deploy/systemd/workforce-time.service`, `docs/openapi.yaml`,
  `tools/deploy-to-subdomain.sh`). Durch neutralen Platzhalter
  `arbeitszeiten.example.com` ersetzt; die echte Domain kommt zur
  Deploy-Zeit aus Env/Tenant-Config (`ARBEITSZEITEN_HOST`,
  `WORKFORCE_PUBLIC_BASE_URL`, certbot-Args).
- **H12 — Leak-Lint deckt die App ab** (`tools/lint-no-tenant-leaks.sh`):
  `sites/` war komplett ausgenommen, wodurch die OSS-App ungeprueft blieb
  („0 Treffer" war fuer sie wertlos). `sites/workforce-time` jetzt explizit
  in FRAMEWORK_PATHS (restliches `sites/` = Tenant-Hoheit bleibt
  ausgenommen), `dist/`-Build-Artefakte gefiltert. Verifiziert: Lint wird
  rot bei eingebautem Leak, gruen nach Bereinigung.

> Hinweis: Git-Historie und repo-uebergreifende Meta-Dateien (CLAUDE.md,
> PROJECT.md u.a.) nennen die Referenz-Praxis weiterhin — separate
> Entscheidung (siehe Debrief), kein versehentliches Code-Leck.

### Workforce-Time Ops/Deployment-Haertung nach adversarialer Review (Stufe 3, 2026-06-05)

`sites/workforce-time/`:

- **C5 — WAL** (`server/db.js`): `journal_mode=WAL`, `synchronous=NORMAL`,
  `wal_autocheckpoint=1000`, `busy_timeout=10000`. Gleichzeitige
  Leser/Schreiber (8 MA + Kiosk) ohne `SQLITE_BUSY`/Event-Loop-Freeze.
  Verifiziert: `PRAGMA journal_mode` ⇒ `wal`, Sidecars angelegt.
- **H9 — echter SMTP-Client** (`server/auth.js`): ersetzt die naive
  Plain-Socket-Variante durch einen zeilenbasierten Client mit
  mehrzeiligem-Reply-Reader, implizitem TLS (:465), opportunistischem
  STARTTLS und AUTH LOGIN. Prod-Default-Relay `127.0.0.1:25`. Login per
  Magic-Link ist damit produktiv zustellbar. Kern als `deliverViaSmtp`
  exportiert; `server/smtp.test.mjs` (Mock-Server: plain + AUTH + fehlendes
  Passwort) gruen.
- **H10 — TOTP-Key fail-fast** (`server/auth.js`): in Produktion bricht der
  Boot hart ab, wenn `WORKFORCE_TOTP_KEY` fehlt (vorher lazy, Login brach
  erst beim ersten 2FA still). Verifiziert: ohne Key exit 1, mit Key
  bootet die API (health 200).
- **C4 — systemd** (`deploy/systemd/workforce-time.service`): `ARBEITSZEITEN_DB`
  fest unter den schreibbaren `ReadWritePaths`-Pfad gepinnt (vorher Risiko,
  dass der via `CORTEX_TENANT_DIR` aufgeloeste DB-Pfad read-only war).
- **Node-Pin** (`package.json`): `engines.node >=24` — `node:sqlite` ist erst
  ab Node 24 ohne Flag verfuegbar.
- Neue Ops-Doku `docs/DEPLOYMENT.md` (Env-Pflichtvariablen, SMTP-Pfade,
  WAL, Reverse-Proxy, verifizierter Boot-Smoke).

**Offen (separate Stufe):** C6/H12 OSS-Domain-Leak + Lint-Scope; Offsite-Backup
automatisieren (H11, Stracke); H2-H4 (TOTP-Rate-Limit, Token-Logging);
DSGVO Art. 9/17.

### Workforce-Time Security- & Korrektheits-Fixes nach adversarialer Review (2026-06-05)

Behebt die blockierenden Funde der 4-Achsen-Review (Stufe 1+2). Alle gegen
die Staging-DB end-to-end verifiziert; Tests ergaenzt.

`sites/workforce-time/` — **Sicherheit/Integritaet:**

- **C1 — Serverseitige Admin-Durchsetzung** (`server/api.js`): neues
  `requireAdmin`-Gate vor allen Admin-/Lohn-/Mutations-Routen (Payroll,
  admin/users + Rollen-Change, Employee-CRUD, Shift-CRUD, Imports,
  Approvals, Corrections, Reports, Absence-Status, Quota-Gesamt). Ein
  eingeloggter Mitarbeiter erhaelt jetzt 403 statt Vollzugriff und kann
  sich nicht mehr selbst zum Admin machen (DB-Beleg: Rolle unveraendert).
- **C2 — Auth fail-closed** (`server/auth.js`): `authEnforcementEnabled()`
  erzwingt das Session-Gate per Default; nur ein NICHT-Produktions-Prozess
  mit explizitem `WORKFORCE_AUTH_DISABLE=1` schaltet ab (in Produktion
  ignoriert). `server/dev.js` setzt das Flag fuer lokale Entwicklung.
- **H1 — Identitaet aus der Session** (`server/api.js`): Stempeln,
  Schichttausch-Annahme/Ablehnung/Storno, Korrektur-Reviewer und
  Rollen-Actor stammen jetzt aus der authentifizierten Session, nicht aus
  dem Client-Body (DB-Beleg: gefaelschte employeeId wird ignoriert).

`sites/workforce-time/` — **Lohn-/Zeit-Korrektheit:**

- **C3 — LODAS bricht hart ab** (`server/db.js`, `tools/export-datev.mjs`,
  `server/api.js`): Mitarbeiter ohne Personalnummer werden nicht mehr
  still aus dem DATEV-Export geloescht — der Renderer wirft
  `MISSING_PERSONNEL_NUMBERS`, die API liefert 409, das CLI bricht mit
  Exit 4 ab.
- **H5 — DST-feste Dauer** (`server/db.js`): `diffMinutes` rechnet
  Wanduhr-Differenz ueber UTC-Anker; Nachtschichten ueber die
  Zeitumstellung bleiben 8h (vorher 7h/9h).
- **H6 — Pausen-Clamp-Maskierung** (`server/db.js`): `unpaidBreak > gross`
  wird als `warnings.breakExceedsWork` gemeldet statt still auf 0 geklemmt.
- **H7 — CSV-Formel-Injection** (`server/db.js`): `escapeCsvField`
  entschaerft fuehrende `= + - @`/Tab mit Apostroph-Prefix.
- **H8 — ArbZG-Pausenschwelle** (`src/App.tsx`, `server/db.js`):
  Mindestpause >9h auf 45 min korrigiert (war 60); freigegebene
  Unterschreitungen werden als `warnings.arbzgBreakViolations` ausgewiesen.
- Tests: `server/payroll-export.test.mjs` um DST, CSV-Injection und
  LODAS-Hard-Fail erweitert (7 Tests gruen).

**Offen (separate Stufen):** C4/C5 Ops (ReadWritePaths, WAL), C6/H12
OSS-Domain-Leak + Lint-Scope, H2-H4/H9-H11 sowie DSGVO Art. 9/17.

### Workforce-Time Backup-Konzept + DATEV-Probelauf-Fixes (2026-06-05)

`sites/workforce-time/`:

- **Backup:** Neues `tools/backup-db.sh` (SQLite-Online-Backup mit
  `PRAGMA integrity_check`-Verifikation, gzip, Retention via
  `WORKFORCE_BACKUP_KEEP`, `--verify-only`-Modus), systemd-Pair
  `deploy/systemd/workforce-time-backup.{service,timer}` (taeglich
  02:30, Persistent=true) und Konzept-Doku `docs/BACKUP.md`
  (3 Schichten: lokal taeglich / Offsite-Pull / Restore-Probe).
  Voller Lebenszyklus gegen Staging-DB getestet (Backup, Verify,
  Retention, Restore mit Zeilenzahl-Abgleich).
- **Bugfix Payroll-CSV:** Brutto-Stunden-Spalte enthielt netHours
  statt grossHours (Copy-Paste in `renderPayrollExportCsv`).
  Regressionstest mit synthetischem Report ergaenzt
  (`server/payroll-export.test.mjs`).
- **Security-Hardening systemd:** `workforce-time.service` setzt jetzt
  `NODE_ENV=production` + `WORKFORCE_AUTH_ENFORCE=1` fest in der Unit —
  vorher hing das Session-Gate der API am optionalen EnvironmentFile;
  fehlte die Datei, lief die API ungeschuetzt. Auth-Enforcement
  end-to-end verifiziert (401 ohne Session, Login inkl. TOTP, 200 mit
  Session).

### Workforce-Time Handbuch + In-App-Hilfe (2026-06-05)

`sites/workforce-time/`:

- Neues Benutzerhandbuch als 14 Markdown-Kapitel unter
  `src/help/content/` (Mitarbeiter- + Admin-Teil, tenant-neutral).
  Single-Source: dieselben Dateien speisen die In-App-Hilfe und das
  generierte Druck-Handbuch `docs/HANDBUCH.md`
  (`bun run build:handbuch` / `tools/build-handbuch.mjs`).
- In-App-Hilfe-Panel `src/views/help.tsx`: Kapitel-Navigation
  (rollengefiltert, Admin-Badge), kontextsensitiver `?`-Button in der
  Topbar (oeffnet das zum aktiven View passende Kapitel via
  `helpChapterForView`), „Hilfe zur Anmeldung"-Link im AuthShell,
  Esc schliesst. Markdown-Rendering als kleiner In-House-Parser
  (Headings, Listen, Tabellen, Blockquotes, Bold/Code) — bewusst ohne
  neue Dependency.
- `src/help/index.ts` Registry (Kapitel, Rollen, View-Mapping),
  `src/help/raw-md.d.ts` fuer Vite-`?raw`-Importe, Help-Styles in
  `src/styles.css` (Designsystem-Variablen, responsive).

### task-3100b6ea5164 (2026-06-05) — Workforce-Time Subdomain-Deploy + Auth-Seed

`sites/workforce-time/`:

- `server/auth.js` liest jetzt `workforce.auth.users[]` aus der
  Tenant-Config als bevorzugte Quelle; Legacy-Pfad
  `workforce.team_members` bleibt als Fallback. E-Mail-Duplikate werden
  zugunsten von `workforce.auth.users` aufgeloest.
- Neues Deployment-Skript `tools/deploy-to-subdomain.sh`. Default
  `--dry-run`; `--commit` schaltet realen SFTP-Upload (via lftp) auf das
  Hosting der Subdomain frei. Credentials kommen ausschliesslich aus
  `.env` (`SFTP_WORKFORCE_HOST`, `SFTP_WORKFORCE_USERNAME`,
  `SFTP_WORKFORCE_PASSWORD`, `SFTP_WORKFORCE_REMOTE_PATH`,
  optional `SFTP_WORKFORCE_PORT`). Whitelist statt rekursivem rsync:
  `dist/`, `server/`, `deploy/`, `package.json`, `package-lock.json`.
- Reverse-Proxy-Templates `deploy/proxy/arbeitszeiten.conf` (Caddy v2,
  Default) und `deploy/proxy/arbeitszeiten.nginx.conf` (Alternative).
  Beide routen statisches SPA-Build + `/api/*` an `127.0.0.1:5175`,
  Security-Header (HSTS, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy).
- Process-Supervision: `deploy/systemd/workforce-time.service`
  (Hardened: NoNewPrivileges, ProtectSystem=strict, ProtectHome,
  RestrictAddressFamilies, MemoryDenyWriteExecute) +
  `deploy/pm2.config.cjs` als Fallback fuer Hoster ohne systemd.

Folge-Voraussetzungen (Stracke-Owner, vor Live):

1. DNS A-Record `arbeitszeiten.westend-hausarzt.com` → Server-IP.
2. SSL-Zertifikat (Caddy ACME automatisch oder certbot fuer nginx).
3. SFTP/SSH-Zugang als `SFTP_WORKFORCE_*`-Werte im `.env`.
4. Initial-Mitarbeiterliste (weitere `users[]`-Eintraege im Tenant-Repo).

## [0.7.1] — 2026-05-31

### Welle 1.3+1.5b — Tenant-Migration-Konsolidierung (nach §10.9-Entscheidung)

Cortex-Plattform-§10-Entscheidungen (`Nexus/specs/cortex-platform/02_OPEN_DECISIONS_RECOMMENDATIONS.md`)
am 2026-05-31 final. §10.9 → Option A: Stracke-Sites bleiben nicht im OSS-Repo.
Diese Welle finalisiert + verankert den bereits durch den OSS-Launch-Filter
(2026-05-26) durchgeführten Migrations-Zustand.

#### Hinzugefuegt
- `sites/_examples/README.md` — Demo-Tenant-Slot-Stub (Befüllung in eigener
  Demo-Tenant-Welle).
- `tools/oss-launch-filter.sh` — Status-Banner: Skript ist historisch
  (gelaufen 2026-05-26), nicht erneut ausführen.

#### Stand
- `sites/praxis-webseite/` ✅ migriert nach `Sanexio/sanexio-tenant/sites/praxis-webseite/`
  (46 MB tracked Content).
- `sites/juvantis-webseite/` ✅ migriert nach `Sanexio/sanexio-tenant/sites/juvantis-webseite/`
  (1.7 MB tracked Content).
- `tools/lint-no-tenant-leaks.sh` ✅ 0 Tenant-Spuren in Framework-Verzeichnissen
  (adapters/, tools/, _config/, _rules/, specs/, _integration-slots/, trunk/schema/).
- Verbleibende Doku-Referenzen auf alte Pfade (CLAUDE.md, AGENTS.md,
  _rules/, specs/phase-4/+5/, docs/cross-site-transfer.md) sind historischer
  Kontext — Sweep in eigener Doku-Welle, nicht akut.

#### Memory-Anker
- `feedback_framework_tenant_split.md` — universelles Cortex-Layer-Aufnahme-
  Kriterium (Skills/Hooks/Regeln/Schablonen OSS, Rest privat).

## [0.7.0] — 2026-05-31

### Promotion — Workforce-Time-App in den Trunk (Slot `workforce-time-app`)

Erste Promotion ueber die `_integration-slots/`-Pipeline (CW-009).
React/Vite/Node-App fuer Arbeitszeiten + Schichtplanung wandert aus
der projekt-nahen Sandbox (`~/Cortex/projects/Praxis Monitoring/Arbeitszeiten/`)
in `sites/workforce-time/`. Operates_on `both`: App-Code generisch im
Trunk, Praxisdaten via Tenant.

#### Hinzugefuegt
- `sites/workforce-time/` — komplette App (React + Vite + Node/SQLite-API
  + Tooling). Eintrittspunkte: `npm run dev`, `npm run api`,
  `npm run build`, `npm run extract-tenant-seed`.
- `sites/workforce-time/server/tenant.js` — Wrapper, der die
  Cortex-Web-Helper aus `tools/lib/tenant-{path,config}.mjs` re-exportiert
  und die API-Bruecke (`tenantIsDemo`, `tenantSource`) zur Sandbox-Variante
  haelt.

#### Aenderungen am Vertrag
- `_integration-slots/workforce-time-app/SLOT.md`: Status
  `HARDENED → PROMOTED`, `promoted_at` + `promotion_commit` gesetzt.
- `_integration-slots/README.md`: Slot-Tabelle aktualisiert.

#### Tenant-Anteil
- `Sanexio-Tenant/tenant.config.json -> workforce.*` und
  `Sanexio-Tenant/trunk/workforce/{seed.json,migration-baseline.json,db/,imports/}`
  (Tenant-Commit `970b2f8`, separat gepusht).
- App-Code im Trunk traegt keine Praxis-Identifier mehr;
  `tools/lint-no-tenant-leaks.sh --strict` clean fuer alle Framework-
  Pfade.

#### Verify
- SSMD-MacBookPro-M5: `npm run build` + API-Smoke aus dem Trunk gegen
  Tenant-DB → 8 Stamm-Mitarbeitende, 1.150 Shifts, 1.227 TimeEntries.
- Cluster-Mini-02 (HARDENED-Bedingung): App startete aus
  `Praxis Monitoring/Arbeitszeiten/`-Sandbox mit gleichem Tenant-Repo
  und Tenant-Seed → identische Counts.

## [0.6.0] — 2026-04-19 (Session 7)

### Phase 5 abgeschlossen — Subsumierung Juvantis-Web-Docs → sites/juvantis-webseite/ (12/12 AKs grün)

**Cortex-Web-Aufbau (Phase 0–5) damit vollständig.** Beide Site-Ökosysteme
(Praxis-WP, Juvantis-Shopify) sind unter dem Dach sichtbar, mit jeweils
externem Theme-Repo via Pointer-Datei.

#### Entscheidung (Dr. Stracke 2026-04-19, „Ich folge deiner Entscheidung")
- **E1a** — Alles außer `theme/` wandert (Docs-Schicht)
- **E2a** — Shopify-Theme-Klon bleibt am Juvantis-Pfad
- **E3a** — Einfacher `mv` + `git commit` (kein Subtree, da Source kein Git hat)
- **E4a** — `Juvantis/juvantis-web/` bleibt als Theme-Halter (nur `theme/`)

#### Hinzugefügt
- `sites/juvantis-webseite/shopify-sync.sh` — Deploy-Wrapper, `THEME_DIR` auf
  absoluten Pfad über `$HOME` umgestellt (geräte-portabel)
- `sites/juvantis-webseite/shopify_export/` — Theme-Backup-ZIPs (transferiert)
- `sites/juvantis-webseite/knowledge-graph/` — Medical-Knowledge-Graph
  (Content-Referenz für Avatar-/DHT-Pages, transferiert)
- `sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md` — Remote-Repo-Pointer-
  Variante des Phase-4-Patterns: GitHub-URL, Branch `shopify-theme`, Store
  `medzpoint`, Theme-ID `181128757515`, HEAD `1fbc35b`, Auto-Sync-Charakter
- `sites/juvantis-webseite/README.md` + `SESSION_RESUME.md` — Sub-Site-
  Dokumentation nach SESSION_LIFECYCLE §3-Pflichtformat
- `specs/phase-5/SUBSUMPTION.md` — Architekten-Modus-Spec (Phase 1+2+3):
  4 Entscheidungspunkte E1/E2/E3/E4, 7-Schritte-Plan T0–T9, 12 AKs,
  5 Risiken-Matrix, 7 Out-of-Scope-Punkte
- `specs/phase-5/evidence/2026-04-19_self-check.md` — Self-Check 12/12 grün
  + 5 Lessons Learned (PH5-LL-1…5)

#### Geändert (Pfad-Updates)
- Nexus: `CLAUDE.md` Cortex-Web-Sektion + Phasen-Plan (Phase 5 ✅),
  `_memory/MEMORY.md` Aktive-Projekte-Tabelle + Pfad-Referenz-Tabelle
  (Shopify-Theme-Klon als operativer Pfad, Docs-Schicht als Cortex-Web-Pfad),
  `SYSTEM_MAP.md` §3.5 UP1 + Tools-Tabelle + Baum
- Cortex-Web: `CLAUDE.md` Verbundene-Projekte (Site + Theme-Klon getrennt
  ausgewiesen), `PROJECT.md` + `_rules/ARCHITECTURE.md` Phase 5 ✅,
  `SESSION_RESUME.md` Phasen-Status-Tabelle + Inhalt für v0.6.0
- Juvantis: `PROJECT.md` §Cortex-Web-Integration auf „Status seit Phase 5"
  umgeschrieben, `CLAUDE.md` UP1-Sektion um Cortex-Web-Docs-Split ergänzt,
  `_config/RULES.md` Ordnerstruktur + Theme-Klon-Notiz aktualisiert

#### Verifiziert (12/12 Akzeptanzkriterien)
- AK-1 `sites/juvantis-webseite/` enthält alle 6 Einträge
- AK-2 `shopify-sync.sh` THEME_DIR = `$HOME/Cortex/projects/Juvantis/juvantis-web/theme`
- AK-3 `SHOPIFY_THEME_POINTER.md` referenziert HEAD + Remote + Branch + Store + Theme-ID (21 grep-Treffer)
- AK-4 `Juvantis/juvantis-web/` enthält nur `theme/`
- AK-5 Theme-Repo unverändert: HEAD `1fbc35b313f52beb00da850491277edcabf86be0`, status clean
- AK-6 `tools/validate.sh` + `CHECK_SHOPIFY=1 validate.sh` beide Exit 0
- AK-7 Nexus-Pfad-Referenzen korrekt (11 Treffer, alle zeigen auf Theme-Klon-Pfad oder enthalten narrativen Kontext)
- AK-8 Juvantis-Doku (PROJECT/CLAUDE/RULES) weist Subsumierung aus
- AK-9 Cortex-Web-Doku Phase 5 ✅ durchgezogen
- AK-10 `CHANGELOG.md` v0.6.0-Eintrag (diese Datei)
- AK-11 Self-Check-Datei vorhanden
- AK-12 `git status --short` clean in Cortex-Web

#### Nexus-Architektur-Updates
- `Nexus/_memory/patterns/cross-repo-subsumption.md` erweitert um
  **Variante B — Container ohne Git + Remote-Repo-Pointer** (aus Phase 5),
  inkl. Entscheidungs-Matrix Variante-A-vs-B und Remote-Pointer-Struktur
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/08-cross-repo-subsumption-mit-git-subtree.md`
  erweitert um §7 Variante B mit 5 PH5-Lessons und Entscheidungs-Flowchart

#### Entfernt
- Aus `Juvantis/juvantis-web/` transferiert: `shopify-sync.sh`, `shopify_export/`,
  `knowledge-graph/`. Theme-Klon bleibt unverändert.

#### Commits Session 7 (in Reihenfolge)
- `799d674` — `docs(phase-5): add SUBSUMPTION spec for Juvantis-web` (T1)
- `2d67a06` — `feat(phase-5): transfer juvantis-web docs to sites/juvantis-webseite (T2)`
- `2b0d1ba` — `docs(phase-5): add SHOPIFY_THEME_POINTER for Juvantis-web (T3)`
- `304859e` — `docs(phase-5): add README + SESSION_RESUME for sites/juvantis-webseite (T4)`
- `cad5a70` — `docs(phase-5): path refs + phase-5 green across Cortex-Web docs (T5)`
- `cb04976` — `docs(phase-5): self-check 10/12 green at T8 (AK-10/12 pending T9)`
- (weitere Commits aus Session-Ende-Workflow T9)

---

## [0.5.0] — 2026-04-19 (Session 6)

### Phase 4 abgeschlossen — Subsumierung praxis-redesign → sites/praxis-webseite/ (12/12 AKs grün)

#### Hinzugefügt
- `sites/praxis-webseite/` — komplette Subsumierung von `~/Cortex/projects/praxis-redesign/` per `git subtree add` (E1a). Alle 13 praxis-Commits via `git log <hash>` erreichbar (Caveat: pfad-gefilterter `git log <pfad>` funktioniert nicht, siehe PH4-LL-2)
- `sites/praxis-webseite/THEME_POINTER.md` — dokumentiert das WordPress-Theme, das physisch am Local-by-Flywheel-Pfad bleibt (Entscheidung 2a). Enthält absoluten Pfad, aktuellen Theme-HEAD `257304e` (PXZ_VERSION 2.7.5), Versionskette, Wiederherstellungs-Anleitung
- `specs/phase-4/SUBSUMPTION.md` — Architekten-Modus-Spec (Phase 1+2): 8-Punkt-Zielzustand, 8-Punkt-Constraints, 6 implizite Annahmen, 4 Pre-Audit-Befunde, 3 Entscheidungspunkte E1/E2/E3, 7-Schritte-Plan T0–T7, 12 AKs, 7-Risiken-Matrix, Rollback-Plan
- `specs/phase-4/evidence/2026-04-19_self-check.md` — Self-Check 12/12 grün mit objektiver Evidenz pro AK + 5 Lessons Learned (PH4-LL-1…5) für Phase 5
- `specs/bridge-strategy/` — Promotion der drei Strategie-Dokumente aus `praxis-redesign/specs/bridge-strategy/` ins Dach (Entscheidung 3b): `00_BRAINSTORMING_KONZEPT.md`, `01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md`, `02_ENTSCHEIDUNGEN_FINAL.md`

#### Geändert (Pfad-Updates)
- `CLAUDE.md`, `PROJECT.md`, `README.md`, `SESSION_RESUME.md` — Pfad-Verweise von `projects/praxis-redesign/...` auf `sites/praxis-webseite/...`
- `_rules/ARCHITECTURE.md` — Phase-4-Status auf ✅ 2026-04-19, §5 bridge-strategy-Pfade auf Cortex-Web
- `_rules/WORKING_MODE.md`, `_rules/PRE_FLIGHT_CHECKLIST.md` — Pointer auf neuen Praxis-Site-Pfad mit historischem Klammer-Hinweis
- `specs/phase-1/POC_WP_ADAPTER.md` — Vorgänger-Entscheidungs-Pfad aktualisiert
- Nexus (Auto-Sync): `_memory/MEMORY.md`, `CLAUDE.md`, `SYSTEM_MAP.md`, `.config/devices.json` — Praxis als `praxis-webseite`-Sub-Site eingetragen, alte praxis-redesign-Einträge umbenannt/entfernt

#### Verifiziert (12/12 Akzeptanzkriterien)
- AK-1 `sites/praxis-webseite/` enthält 123 tracked files (≥118 erwartet)
- AK-2 `specs/bridge-strategy/` hat 3 Dokumente
- AK-3 THEME_POINTER referenziert Theme-Commit `257304e`
- AK-4 13 praxis-Commits erreichbar via `git log c519852 --oneline | wc -l = 13`
- AK-5 `sites/praxis-webseite/tools/verify.sh` → §3 Computed-Style 54/54 + §4 Alignment 10/10 grün
- AK-6 `tools/validate.sh` basic + CHECK_SHOPIFY beide Exit 0
- AK-6b `tools/review.sh` → 11/11 AKs (Phase-3-Funktionalität unberührt durch Subsumierung)
- AK-7 PXZ_VERSION 2.7.5 weiterhin live (Computed-Style-Probe-Beweis)
- AK-8 Keine aktiven `projects/praxis-redesign`-Pfade mehr (34 historische Verweise klassifiziert: 19 in SUBSUMPTION-Spec selbst, Rest in Logs/Tutorials/Strategie-Docs)
- AK-9 `~/Cortex/projects/praxis-redesign/` existiert nicht mehr (E3a, `rm -rf`)
- AK-10 Working Trees clean vor Subsumierung (T1: 3 Cleanup-Commits)
- AK-11 Theme-Repo HEAD `257304e7e9...` unverändert, working tree clean
- AK-12 Self-Check vorhanden

#### Pre-Subsumierungs-Sicherheit
- `.env.sprint1.local` (gitignored, 13 echte Werte) per `cp` + `chmod 600` nach `sites/praxis-webseite/` migriert. MD5-Beweis: beide Dateien `1c2675e95c423784cf5b9b04f8a65c9c`. `git check-ignore` bestätigt: durch `.env.*` abgedeckt
- Erkenntnis: gitignored-Daten-Sicherheits-Check ist ab jetzt Pflicht-Bestandteil des `rm -rf`-Schritts (PH4-LL-1)

#### Entfernt
- `~/Cortex/projects/praxis-redesign/` komplett (E3a). Historie ist über die 13 Commits in Cortex-Web erhalten.
- Pflicht-Init: praxis-redesign hat kein eigenes `„Projekt fortsetzen"` mehr — Einstieg läuft über `„Projekt fortsetzen Cortex-Web"`, dann zu `sites/praxis-webseite/SESSION_RESUME.md`.

#### Nexus-Architektur-Updates
- `Nexus/_memory/patterns/cross-repo-subsumption.md` — neuer wiederverwendbarer Pattern aus PH4-LL-1…5 (7-Schritte-Plan, gitignored-Sicherheits-Check, Subtree-Log-Caveat, Externer-Repo-Pointer-Pattern)
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/08-cross-repo-subsumption-mit-git-subtree.md` — Tutorial für Dr. Stracke (Live-Beispiel Phase 4, Mentalmodell, 6 Schritte mit konkreten Befehlen, AK-Liste, Caveats)

#### Commits (in Reihenfolge)
- `c350b05` — `docs(phase-4): promote bridge-strategy from praxis-redesign` (T1)
- `94e6e91` — `Add 'sites/praxis-webseite/' from commit 'c5198525...'` (T2 Subtree-Add)
- `77adfc7` — `docs(phase-4): add THEME_POINTER for Local-WP theme repo` (T3)
- `dd38922` — `docs(phase-4): path refs + SUBSUMPTION spec + post-subsumption verify shots` (T4 + T6)
- `61b5187` — `chore(phase-3): refresh review evidence after phase-4 (still 11/11 green)` (T6 evidence-Refresh)
- `b7266ab` — `docs(phase-4): self-check 12/12 green` (T7)

---

## [0.4.0] — 2026-04-19 (Session 5)

### Phase 3 abgeschlossen — Review-Pipeline 12/12 AKs grün

#### Hinzugefügt
- `specs/phase-3/REVIEW.md` — Architekten-Modus-Spec mit 6 Review-Dimensionen, 12 AKs, 7 Entscheidungen (E-1…E-7)
- `specs/phase-3/evidence/2026-04-19_self-check.md` — Self-Check 12/12 grün, 2 FK-Fixes dokumentiert
- `specs/phase-3/evidence/*.json` — Maschinen-lesbare Evidenz pro Dimension (`content-parity`, `hwg-scan`, `commerce-check`, `idempotency-wp`, `idempotency-shopify`, `roundtrip`, `screenshots`, `summary`)
- `specs/phase-3/evidence/wp-page-9668.png` + `shopify-body-preview.png` + `side-by-side.html` + `side-by-side.png` — visuelle Evidenz
- `tools/review.sh` — Bash-Orchestrator, lädt `.env.local`, exec-t `bun review/run.mjs`
- `tools/review/run.mjs` — JS-Orchestrator, sequenziert alle 6 Module, aggregiert in `summary.json`
- `tools/review/content-parity.mjs` — Trunk ↔ WP ↔ Shopify Content-Diff (AK-2, AK-3)
- `tools/review/hwg-scan.mjs` — Token-Scan für `€`, `EUR`, `Kaufen`, `Warenkorb`, `Bestellen`, `Jetzt buchen` + Pflicht-CTA-Check (AK-4)
- `tools/review/commerce-check.mjs` — Shopify-Produkt-Vollständigkeit (Preis, SKU, Variant, Tags, Vendor, Draft) (AK-5)
- `tools/review/idempotency.mjs` — 2× sync-wp.sh + 2× sync-shopify.sh, Zeilen-basierter JSON-Parser (AK-6, AK-7)
- `tools/review/roundtrip.mjs` — Admin-API flip status=active → sync-shopify → GET status=draft, finally-Safety-Net (AK-8, CW-001 empirisch)
- `tools/review/screenshots.mjs` — Puppeteer: WP live (mit `acceptInsecureCerts`), Shopify body_html in Shell, Side-by-Side HTML+PNG (AK-9, AK-10, AK-11)

#### Verifiziert (End-to-End, 12/12 Akzeptanzkriterien)
- `bash tools/review.sh` → `AK automatisch: 11/11 grün (AK-12 Self-Check manuell)` → Self-Check macht AK-12 = 12/12
- Content-Parität: alle 6 WP-Checks + 6 Shopify-Checks grün
- HWG-Compliance: alle 6 verbotenen Tokens `found: false`, erlaubter CTA + URL präsent
- Commerce-Check: alle 7 Shopify-Felder (Variant/Preis/SKU/product_type/Tags/Vendor/Draft-Status) OK
- Idempotenz: 2. Lauf beider Pipelines = `action: "update"`, gleiche IDs, gleiche Handles
- Trunk-Master-Roundtrip: `draft → active (Admin) → sync-shopify → draft (Trunk wins)` bewiesen
- Alle Screenshots > 10 KB, Side-by-Side-Montage lesbar
- Working Tree clean nach Commit `98d1f67`

#### Nexus-Updates (außerhalb des Projekt-Repos, LL-042 Schritt 2–4)
- `Nexus/CLAUDE.md`: Cortex-Web-Abschnitt um Session-5 + Phasen-Plan (Phase 3 ✅, Phase 4 🔜 freigegeben) ergänzt
- `Nexus/_memory/MEMORY.md`: Aktive-Projekte-Zeile, Cortex-Web-Pfad-Referenz (Review-Pipeline), Pattern-Katalog, Letzte-Aktualisierung
- `Nexus/_memory/patterns/cross-platform-review-pipeline.md` — **neues Pattern** (Review-Pipeline-Struktur + 2 Fallstricke + Trunk-Master-Roundtrip)
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/07-review-pipeline-und-local-wp-tests.md`

#### Lessons Learned
- **Sync-Script-Output ist nicht atomar:** `sync-wp.sh`/`sync-shopify.sh` printen Progress + JSON + `OK`-Marker. Zeilen-basierter Parser statt Trailing-JSON-Regex ist Pflicht (FK-2-Pattern aus Session-Bug).
- **Local-by-Flywheel nutzt selbstsigniertes HTTPS:** Puppeteer braucht `acceptInsecureCerts: true` + `--ignore-certificate-errors`. Gilt auch für mkcert-/MAMP-Setups (FK-5 durch Kontext-Verlust aus Phase-1/2-Sessions).
- **Trunk-Master ist beweisbar:** Admin-API-Flip → Adapter-Lauf → GET zeigt trunk-Wert zurück. `finally`-Safety-Net Pflicht — abgebrochener Test darf Plattform nicht in schlechtem Zustand hinterlassen.
- **HWG-Compliance 2-stufig:** Schema-Gate (Build-Time) + Runtime-Token-Scan (auf gerendertem HTML) fangen unterschiedliche Failure-Modes.

#### Commits
- `98d1f67 — feat(phase-3): review pipeline + 12/12 AKs green`

---

## [0.3.0] — 2026-04-19 (Session 4)

### Phase 2 abgeschlossen — POC Shopify-Adapter End-to-End

#### Hinzugefügt
- `specs/phase-2/POC_SHOPIFY_ADAPTER.md` — Architekten-Modus-Spec (Verständnis + Lösungsdesign + 12 Akzeptanzkriterien + Selbstprüfungs-Plan + Phase-2b-Hooks)
- `specs/phase-2/evidence/2026-04-19_self-check.md` — Self-Check 12/12 grün, FK-2-Bug (Handle-Position) dokumentiert
- `adapters/shopify/build.mjs` — CLI: YAML → AJV-Validation → Renderer → Payload-JSON auf stdout
- `adapters/shopify/products-to-shopify.mjs` — CLI: REST-Push mit handle-basierter Idempotenz (GET → POST/PUT), `ALLOW_OVERWRITE=1`-Safeguard für published Produkte
- `adapters/shopify/lib/shopify-rest-client.mjs` — Fetch-Wrapper mit `X-Shopify-Access-Token`-Header + Token-Mask, API-Version `2026-04` gepinnt, Store-Handle-Validierung
- `adapters/shopify/lib/renderers/product-juvantis.mjs` — Renderer für `views.juvantis`: body_html (Tagline + Beschreibung + Laborparameter-Tabelle), Default-Variant mit `requires_shipping=false`, `status:"draft"` hartcodiert (C-1)
- `tools/sync-shopify.sh` — Pipeline: validate → build → push, lädt `.env.local`

#### Geändert
- `tools/validate.sh` — optionaler Shopify-Connectivity-Check via ENV-Flag `CHECK_SHOPIFY=1` (curl gegen `/shop.json` mit Token)
- `adapters/shopify/README.md` — Pipeline-Beschreibung + View-Logik aktualisiert, Store-Handle korrigiert

#### Verifiziert
- Test-Produkt `id=10940942844171, handle=basic-check, status=draft, published_at=null` im Store `juvantis.myshopify.com`
- Idempotent: 2. Lauf = `update`, gleiche ID, neueres `updated_at` (+5s)
- CW-001 (Trunk-Master) per Roundtrip: Adapter setzt manuell auf `active` gesetzten Status zurück auf `draft`, sobald `ALLOW_OVERWRITE=1` gesetzt
- HWG-Trennung: `body_html` enthält keinen Preis, keinen `Jetzt-buchen`-CTA, keine sanexio.eu-URL
- Storefront-Schutz: `https://sanexio.eu/products/basic-check` → HTTP 302 → `/password` (Store passwortgeschützt + Draft-Status doppelt geschützt)
- Theme-Repo `juvantis-web/theme` weiterhin unangetastet (HEAD `1fbc35b`, working tree clean)
- `.env.local` weiterhin git-ignoriert, `chmod 600`

#### Lessons Learned (vollständig in Tutorial `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/06-shopify-admin-rest-product-sync.md`)
- **`handle` MUSS im Product-Body stehen** — Top-Level oder Wrapper-Position wird ignoriert, Shopify generiert dann eigenen Handle aus `title`. Erkannt in AK-3 (1. Lauf), gefixt, 2. Lauf grün.
- Tags werden alphabetisch normalisiert (`cortex-web, bluttests` → `bluttests, cortex-web`); für Set-Vergleich egal, für Audit dokumentieren.
- Shopify-Storefront ist standardmäßig passwortgeschützt — auch ohne Password-Wall wäre Draft-Produkt 404.
- Pattern „CW-001 Trunk-Master per Roundtrip nachgewiesen" — Admin-Edits werden bei nächstem Adapter-Lauf zurückgesetzt; das ist nicht Theorie, sondern verifiziert.

## [0.2.1-setup] — 2026-04-18 (Session 3)

### Phase 2 Infrastruktur — Shopify Admin-API-Token provisioniert

#### Hinzugefügt
- `tools/shopify-oauth-catcher.mjs` — Node-HTTP-Server auf `localhost:53682/callback`, tauscht OAuth-Code gegen Admin-API-Token, schreibt `SHOPIFY_STORE` + `SHOPIFY_ADMIN_TOKEN` in `.env.local` (chmod 600, Token niemals auf stdout)
- `tools/shopify-authorize.sh` — Bash-Script, baut OAuth-Authorize-URL sauber per URL-Encode und öffnet sie per `open` (umgeht Copy-Paste-Zeilenumbrüche)
- `shopify.app.cortex-web-adapter.toml` — Shopify CLI App-Konfiguration (Client-ID, Scopes, App-URL, redirect_urls; nur öffentliche Metadaten)

#### Geändert
- `.env.local.template` — Shopify-Abschnitt ergänzt: `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_STORE`, `SHOPIFY_ADMIN_TOKEN` mit Kommentaren zur Herkunft

#### Verifiziert
- `GET /admin/api/2026-04/shop.json` mit neuem Token → HTTP 200, Shop-Identität korrekt (`juvantis.myshopify.com`, `sanexio.eu`, Dr. Stracke als Owner)
- `.env.local` weiterhin git-ignoriert, `chmod 600`
- `tools/validate.sh` weiterhin grün (`validate: OK (1 file(s))`)
- Theme-Repo `praxiszentrum` weiterhin unangetastet (kein Touch)

#### Lessons Learned (ausführlich in Tutorial `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/05-admin-api-token-custom-app.md`)
- Shopify Dev Dashboard „App installieren" triggert **keinen** OAuth-Authorize — Custom-App-Token benötigt manuellen `/admin/oauth/authorize`-Aufruf
- `shopify app dev` erfordert Dev- oder Plus-Sandbox-Store, nicht für Production-Stores nutzbar
- URL-Copy-Paste aus Chat riskiert Zeilenumbruch-Korruption (`redirect_ur%0A%20i` statt `redirect_uri`); Shell-Script mit `open` ist robuster
- Shopify `access_token`-Response kollabiert `read_*` + `write_*` Paare zu `write_*` (Lesezugriff implizit)
- Store-Handle `juvantis.myshopify.com` korrigiert MEMORY-Eintrag (`medzpoint` war falsch)

## [0.2.0] — 2026-04-18

### Phase 1 abgeschlossen — POC WordPress-Adapter End-to-End

#### Hinzugefügt
- `specs/phase-1/POC_WP_ADAPTER.md` — Architekten-Modus-Spec (Verständnis + Lösungsdesign + 10 Akzeptanzkriterien + Selbstprüfungs-Plan)
- `trunk/schema/product.schema.json` — konkretisiert (I-2 hybrid, HWG-Gate via `const: false`, cta_url-Regex)
- `trunk/content/products/bluttests/basic-check.yaml` — Beispielprodukt mit 15 Laborparametern und 4 Locales
- `adapters/wordpress/build.mjs` — CLI: YAML → AJV-Validation → Renderer → Payload-JSON auf stdout
- `adapters/wordpress/content-to-wp-pages.mjs` — CLI: REST-Push mit slug-basierter Idempotenz (GET → POST/PUT)
- `adapters/wordpress/lib/rest-client.mjs` — Fetch-Wrapper mit Basic-Auth + Password-Masking
- `adapters/wordpress/lib/renderers/product-praxis.mjs` — Gutenberg-HTML-Renderer (paragraph / heading / table / buttons)
- `tools/validate.sh` — AJV-Build-Gate (CW-002), find-basiert für macOS-Bash-3.2-Kompatibilität
- `tools/sync-wp.sh` — Pipeline validate → build → push mit `.env.local`-Loading
- `tools/local-wp-setup/cortex-dev-auth.php` — mu-plugin-Quelle für lokale Setups (PHP_AUTH_*-Rebuild + App-Passwords-HTTP-Override)
- `tools/local-wp-setup/README.md` — Setup-Anleitung für Local-by-Flywheel-WP-Sites
- `.env.local.template` — Schema für `.env.local` (git-ignoriert)

#### Verifiziert (End-to-End, 10/10 Akzeptanzkriterien)
- Validate grün, Sync-Pipeline grün, Page `basic-check` live auf Local-WP
- HWG-konform: kein Preis, kein Kauf-CTA, nur Partnerinfo-CTA zu sanexio.eu
- Idempotenz bewiesen durch wiederholte Läufe (gleiche Page-ID, neuer `modified_gmt`)
- `wp-config.php` mtime unverändert
- `praxis-redesign`-Theme-Repo (`praxiszentrum`) working tree clean (HEAD 257304e)
- `.env.local` außerhalb von Git

#### Nexus-Updates (außerhalb des Projekt-Repos, LL-042 Schritt 2–4)
- `Nexus/_memory/MEMORY.md`: Cortex-Web-Status auf Phase 0 + 1, Local-WP-Setup-Pfad-Referenz, Pattern-Katalog-Ergänzung
- `Nexus/CLAUDE.md`: Phasen-Plan 1 ⏳ → ✅, Phase-2-Einstieg
- `Nexus/SYSTEM_MAP.md`: Cortex-Web-Zeile auf Phase 0 + 1 aktualisiert
- `Nexus/_memory/patterns/local-wp-rest-auth-bootstrap.md`: **neues Pattern** (3-Layer-Auth-Bootstrap für Local-WP-Adapter)
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/06-wp-rest-api-adapter-mit-application-passwords.md`

#### Lokale Setup-Änderungen an Dr. Strackes Local-WP-Site (außerhalb Repo)
- `conf/nginx/site.conf.hbs`: +1 Zeile `fastcgi_param HTTP_AUTHORIZATION $http_authorization;`
- `wp-content/mu-plugins/cortex-dev-auth.php`: Kopie aus `tools/local-wp-setup/`
- 1 Application-Password `cortex-web-adapter` für User `sstracke`

#### Commits
- `778635c — feat(phase-1): POC WP adapter — schema, content, adapter, tooling`

---

## [0.1.0] — 2026-04-18

### Phase 0 abgeschlossen — Skelett

#### Hinzugefügt
- Projekt-Ordnerstruktur (`trunk/`, `adapters/`, `tools/`, `sites/`, `_config/`, `_rules/`, `_media-source/`)
- `PROJECT.md` (Container-Manifest nach Nexus-Standard)
- `CLAUDE.md` (Projekt-Kontext, Pflicht-Lesung)
- `README.md` (Kurzbeschreibung)
- `SESSION_RESUME.md` (LL-043-Format, Phase-0-Abschluss-Stand)
- `_config/RULES.md` (CW-001 bis CW-005 definiert)
- `_config/FEHLERPROTOKOLL.md` (leer, wartet auf erste CW-E-Einträge)
- `_config/WORKFLOW_CHECKLIST.md`
- `_rules/ARCHITECTURE.md` (Phasen-Roadmap 0–5 + Sprint-Anschluss)
- `_rules/WORKING_MODE.md` (Referenz auf praxis-redesign Architekten-Modus)
- `_rules/PRE_FLIGHT_CHECKLIST.md` (Platzhalter, wächst mit Adaptern)
- `_rules/FEHLERPROTOKOLL.md`
- `trunk/schema/*.schema.json` (leere Schema-Gerüste: page, product, team-member, component, media)
- `trunk/media/registry.yaml` (leer)
- `adapters/{wordpress,shopify,ios}/README.md` (Platzhalter)
- `tools/README.md`
- `.gitignore` (ignoriert `_media-source/`, `node_modules/`, `bun.lock`-Konflikte)
- `package.json` (Bun, puppeteer-core)

#### Nexus-Updates (außerhalb des Projekt-Repos)
- `Nexus/_memory/MEMORY.md`: Cortex-Web als aktives Projekt ergänzt
- `Nexus/CLAUDE.md`: Cortex-Web-Abschnitt hinzugefügt
- `Nexus/.config/devices.json`: Cortex-Web unter Cluster-Mini-02 ergänzt
- `projects/praxis-redesign/_rules/ARCHITECTURE.md`: Sprint T0–T5 + Parallelität dokumentiert
- `projects/Juvantis/PROJECT.md`: Vermerk über spätere Subsumierung

#### Initial-Commit
- Git-Repo initialisiert
- Erster Commit: `6178d2f — chore: phase 0 – skeleton, rules, nexus integration`
